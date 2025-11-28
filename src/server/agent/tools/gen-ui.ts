import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { Model } from "../model";
import { UI_SYSTEM_PROMPT, componentInfo } from "../prompt/ui";

export const getShadcnDocumentation = new DynamicStructuredTool({
	name: "get_shadcn_documentation",
	description: "Get documentation and usage examples for Shadcn UI components.",
	schema: z.object({
		componentName: z.string().describe("Name of the Shadcn component"),
	}),
	func: async ({ componentName }) => {
		const normalizedName = componentName.toLowerCase().trim();
		const matchedKey = Object.keys(componentInfo).find((key) =>
			new RegExp(key, "i").test(normalizedName),
		);

		if (matchedKey) {
			return JSON.stringify(
				componentInfo[matchedKey as keyof typeof componentInfo],
			);
		}

		return JSON.stringify({
			error: true,
			message: `Component "${componentName}" not found. Available: ${Object.keys(componentInfo).join(", ")}`,
		});
	},
});

export const generateShadcnComponent = new DynamicStructuredTool({
	name: "generate_shadcn_component",
	description:
		"Generate Shadcn-based React component code based on user query and payload.",
	schema: z.object({
		query: z
			.string()
			.describe("Clear description of the UI component to generate"),
		payload: z
			.object(z.string())
			.describe("Additional configuration and data for the component"),
	}),
	func: async ({ query, payload }) => {
		try {
			const prompt = `${UI_SYSTEM_PROMPT}

User Query: ${query}
Payload: ${JSON.stringify(payload, null, 2)}

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
			console.error("Error in generate_shadcn_component tool:", error);
			return JSON.stringify({
				error: true,
				message: "Failed to generate component.",
			});
		}
	},
});
