import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { Model } from "../model";
import { UI_SYSTEM_PROMPT, componentInfo } from "../prompt/ui";

export const decideComponents = new DynamicStructuredTool({
	name: "decide_components",
	description: "Analyze user query and decide which Shadcn components to use.",
	schema: z.object({
		query: z.string().describe("User's UI generation request"),
		payload: z.object(z.string()).describe("Additional data/configuration"),
	}),
	func: async (input) => {
		const { query, payload } = decideComponents.schema.parse(input);

		const prompt = `Based on this user request, decide which Shadcn UI components to use.

User Query: ${query}
Payload: ${JSON.stringify(payload, null, 2)}

Available components: ${UI_SYSTEM_PROMPT}

Return ONLY a JSON array of component names to use. Example: ["button", "input", "form"]`;

		const response = await Model.llm.invoke(prompt);
		const content =
			typeof response.content === "string"
				? response.content
				: JSON.stringify(response.content);

		const jsonMatch = content.match(/\[[\s\S]*\]/);
		if (jsonMatch) {
			return jsonMatch[0];
		}

		return JSON.stringify([]);
	},
});

export const getComponentDocs = new DynamicStructuredTool({
	name: "get_component_docs",
	description: "Get documentation for a list of component names.",
	schema: z.object({
		components: z
			.array(z.string())
			.describe("Array of component names to get docs for"),
	}),
	func: async (input) => {
		const { components } = getComponentDocs.schema.parse(input);

		const docs: Record<string, unknown> = {};

		for (const componentName of components) {
			const normalizedName = componentName.toLowerCase().trim();
			const matchedKey = Object.keys(componentInfo).find((key) =>
				new RegExp(key, "i").test(normalizedName),
			);

			if (matchedKey) {
				docs[matchedKey] =
					componentInfo[matchedKey as keyof typeof componentInfo];
			}
		}

		return JSON.stringify(docs);
	},
});

export const generateComponent = new DynamicStructuredTool({
	name: "generate_component",
	description:
		"Generate React component code using user query, payload, and component documentation.",
	schema: z.object({
		query: z.string().describe("Original user query"),
		payload: z.object(z.string()).describe("Additional data/configuration"),
		documentation: z
			.object(z.any())
			.describe("Component documentation from previous step"),
	}),
	func: async (input) => {
		const { query, payload, documentation } =
			generateComponent.schema.parse(input);

		try {
			const prompt = `${UI_SYSTEM_PROMPT}

User Query: ${query}
Payload: ${JSON.stringify(payload, null, 2)}
Component Documentation: ${JSON.stringify(documentation, null, 2)}

Return ONLY a JSON object with this exact structure:
{
  "type": "component-type-name",
  "code": "full-component-code-here"
}

The code should be a complete, ready-to-use React component.`;

			const response = await Model.llm.invoke(prompt);

			const content =
				typeof response.content === "string"
					? response.content
					: JSON.stringify(response.content);

			const jsonMatch = content.match(/\{[\s\S]*\}/);
			if (jsonMatch) {
				const parsed = JSON.parse(jsonMatch[0]);
				return JSON.stringify(parsed);
			}

			return JSON.stringify({
				type: "generated-component",
				code: content,
			});
		} catch (error) {
			console.error("Error in generate_component tool:", error);
			return JSON.stringify({
				error: true,
				message: "Failed to generate component.",
			});
		}
	},
});
