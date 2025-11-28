import { DynamicStructuredTool } from "@langchain/core/tools";
import { QdrantVectorStore } from "@langchain/qdrant";
import { z } from "zod";
import {
	vectorDb,
	VECTOR_COLLECTION_NAME,
} from "~/server/db/embeded/vector-db";
import { Model } from "../model";

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

			console.log("CRISIS RESULTS", crisisResults);

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
			const analysisPrompt = `You are a healthcare crisis analyst. Analyze the following historical crisis data and provide actionable insights.

Data Context:
${allData
	.map(
		(d, i) => `
Crisis ${i + 1}:
${JSON.stringify(d.crisis, null, 2)}

Related Area History:
${d.area_history.map((h) => `- ${h.content} (Meta: ${JSON.stringify(h.metadata)})`).join("\n")}
`,
	)
	.join("\n---\n")}

Based on this historical data, analyze and provide:
1. Potential health threats and diseases that could occur
2. Risk factors and vulnerable populations
3. Recommended medical supplies and supplements needed
`;

			const llmResponse = await Model.llm.invoke(analysisPrompt);

			console.log("LLM RESPONSE", llmResponse.content);

			return JSON.stringify({
				output: llmResponse.content,
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

// 5. check inventory.
