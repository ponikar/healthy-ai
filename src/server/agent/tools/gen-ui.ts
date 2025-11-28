import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { Model } from "../model";
import fs from "node:fs";
import path from "node:path";

const markdown = fs.readFileSync(path.join(__dirname, "./ui.md"), {
	encoding: "utf-8",
});

export const generateUI = new DynamicStructuredTool({
	name: "generate_ui",
	description: "Generate dynamic UI components to visualize data",
	schema: z.object({
		query: z.string().describe("User's UI generation request"),
		data_summary: z
			.string()
			.describe("The complete data/summary to visualize from previous tool"),
	}),
	func: async (input) => {
		const { query, data_summary } = generateUI.schema.parse(input);

		console.log("GENERATING UI FOR:", query);

		const prompt = `You are a generative UI generator. Create React component code to visualize the provided data.

Available UI Components:
${markdown}

Task: Generate a React functional component that displays the following data in a clear, visual way.

User Query: ${query}

Data to Visualize:
${data_summary}

Output Requirements:
- Return ONLY the React component code
- Use appropriate UI components from the list above
- Make it visually appealing and easy to understand
- Include proper imports at the top
- GIVE OUTPUT IN THE PLAIN CODE, NO FORMAT NEEDED
- DO NOT ADD IMPORTANT STATEMENT

Example Output Format:
const Component = () => {
  return <Card>...</Card>
}`;

		const response = await Model.llm.invoke(prompt);
		const content =
			typeof response.content === "string"
				? response.content
				: JSON.stringify(response.content);
		return content;
	},
});
