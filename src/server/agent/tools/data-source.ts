import { DynamicStructuredTool } from "@langchain/core/tools";
import { QdrantVectorStore } from "@langchain/qdrant";
import { z } from "zod";
import {
	vectorDb,
	VECTOR_COLLECTION_NAME,
} from "~/server/db/embeded/vector-db";
import { Model } from "../model";
import { UI } from "./ui";

export const searchCrisisDataTool = new DynamicStructuredTool({
	name: "search_crisis_data",
	description:
		"Search for crisis and relevant area history based on user query.",
	schema: z.object({
		query: z.string().describe("User query about a crisis"),
	}),
	func: async (input) => {
		const { query } = searchCrisisDataTool.schema.parse(input);
		try {
			// 1. finding a crisis information here
			const crisisStore = new QdrantVectorStore(Model.embeddings, {
				client: vectorDb,
				collectionName: VECTOR_COLLECTION_NAME.CRISIS,
			});

			const crisisResults = await crisisStore.similaritySearch(query, 3);
			if (!crisisResults.length) {
				return JSON.stringify({ message: "No relevant crisis found." });
			}

			// 2. finding area history for each crisis
			const areaStore = new QdrantVectorStore(Model.embeddings, {
				client: vectorDb,
				collectionName: VECTOR_COLLECTION_NAME.AREA_HISTORY,
			});

			const allData = await Promise.all(
				crisisResults.map(async (crisis) => {
					const areaResults = await areaStore.similaritySearch(
						crisis.pageContent,
						3,
					);
					return {
						crisis: crisis.metadata,
						area_history: areaResults.map((r) => ({
							content: r.pageContent,
							metadata: r.metadata,
						})),
					};
				}),
			);

			// 3. Analyze threats and suggest supplements using LLM
			const analysisPrompt = `You are a Hospital Preparedness Strategist. Your goal is to help hospital staff prepare for an upcoming crisis by observing patterns in historical data.

Data Context:
${allData
	.map(
		(d, i) => `
Crisis Event ${i + 1}:
${JSON.stringify(d.crisis, null, 2)}

Historical Impact & Area Data:
${d.area_history.map((h) => `- ${h.content} (Meta: ${JSON.stringify(h.metadata)})`).join("\n")}
`,
	)
	.join("\n---\n")}

Instructions:
1. Observe the data above for patterns in patient surges and resource shortages.
2. CRITICAL: If the provided data is sparse, irrelevant to the user's specific request, or mismatched, YOU MUST use your own medical reasoning and general crisis management knowledge to provide a relevant answer. Do not say "data is missing"—just provide the solution.
3. Keep the response SHORT, DIRECT, and actionable. Avoid long paragraphs.

Provide a concise Hospital Action Plan:
1. **Expected Clinical Impact**: Briefly list the specific diseases or injuries to expect (e.g., "Surge in Dengue and Gastro cases").
2. **Inventory Priorities**: A bulleted checklist of must-have supplies (Drugs, Equipment, PPE) based on the specific threats.
3. **Step-by-Step Management Strategy**: A clear 3-5 step plan for hospital operations (e.g., Triage setup -> Staff allocation -> Supply chain).
`;

			const llmResponse = await Model.llm.invoke(analysisPrompt);

			const prompt = `You are a generative UI generator. Create React component code to visualize the provided data.

Available UI Components:
${UI}

Task: Generate a React functional component that displays the following data in a clear, visual way.

UI QUERY: ${query}

Data to Visualize:
${llmResponse.content}

Output Requirements:
- Return ONLY the React component code
- Use appropriate UI components from the list above
- Make it visually appealing and easy to understand
- GIVE OUTPUT IN THE PLAIN CODE, NO FORMAT NEEDED
- DO NOT ADD IMPORT STATEMENT.

FUNCTION NAME MUST BE Component

Example Output Format:

function Component() {
  return <Card>...</Card>
}`;

			const response = await Model.llm.invoke(prompt);

			console.log("UI RESPONSE", response.content);

			return JSON.stringify({
				output: response.content,
			});
		} catch (error) {
			console.error("Error in search_crisis_data tool:", error);
			return JSON.stringify({
				error: true,
				message: "Failed to search crisis data.",
			});
		}
	},
});
