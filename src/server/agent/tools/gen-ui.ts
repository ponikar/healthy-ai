import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { Model } from "../model";

export const getShadcnDocumentation = new DynamicStructuredTool({
	name: "get_shadcn_documentation",
	description: "Get documentation and usage examples for Shadcn UI components.",
	schema: z.object({
		componentName: z.string().describe("Name of the Shadcn component"),
	}),
	func: async ({ componentName }) => {
		const placeholderDocs = {
			componentName,
			description: `Shadcn ${componentName} component - A reusable UI component built with Radix UI and Tailwind CSS`,
			usage: `import { ${componentName} } from "~/components/ui/${componentName.toLowerCase()}";\n\nexport default function Example() {\n  return <${componentName}>Content</${componentName}>;\n}`,
			commonProps: [
				"className: string - Additional CSS classes",
				"children: ReactNode - Component content",
			],
			note: "Full documentation will be available in iteration 2",
		};

		return JSON.stringify(placeholderDocs);
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
			const prompt = `You are a React/TypeScript expert specializing in Shadcn UI components.

User Query: ${query}
Payload: ${JSON.stringify(payload, null, 2)}

Available Shadcn components: button, card, input, dialog, dropdown-menu, select, table, form, badge, alert, avatar, checkbox, radio-group, switch, tabs, accordion, sheet, drawer, popover, toast, calendar, command, and more.

Generate a production-ready React component that:
1. Uses Shadcn UI components from ~/components/ui/*
2. Follows TypeScript best practices
3. Includes proper imports
4. Uses the payload data appropriately
5. Is clean, minimal, and follows modern React patterns

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
