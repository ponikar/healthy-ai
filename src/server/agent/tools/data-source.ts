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

			const crisisResults = await crisisStore.similaritySearch(query, 1);
			if (!crisisResults.length) {
				return JSON.stringify({ message: "No relevant crisis found." });
			}

			const crisisData = crisisResults[0];
			if (!crisisData) {
				return JSON.stringify({ message: "No relevant crisis found." });
			}
			const crisisId = crisisData.metadata.crisis_id;
			console.log("Found crisis_id:", crisisId);

			// 2. finding area history here
			const areaStore = new QdrantVectorStore(Model.embeddings, {
				client: vectorDb,
				collectionName: VECTOR_COLLECTION_NAME.AREA_HISTORY,
			});

			const areaResults = await areaStore.similaritySearch(query, 8, {
				must: [
					{
						key: "crisis_id",
						match: {
							value: crisisId,
						},
					},
				],
			});

			// 3. Analyze threats and suggest supplements using LLM
			const analysisPrompt = `You are a healthcare crisis analyst. Analyze the following historical crisis data and provide actionable insights.

Crisis Information:
${JSON.stringify(crisisData.metadata, null, 2)}

Historical Area Data:
${areaResults.map((r, i) => `${i + 1}. ${r.pageContent}\nMetadata: ${JSON.stringify(r.metadata)}`).join("\n\n")}

Based on this historical data, analyze and provide:
1. Potential health threats and diseases that could occur
2. Risk factors and vulnerable populations
3. Recommended medical supplies and supplements needed

Return ONLY a JSON object with this structure:
{
  "threats": ["threat1", "threat2"],
  "risk_factors": ["factor1", "factor2"],
  "recommended_supplies": ["supply1", "supply2"]
}`;

			const llmResponse = await Model.llm.invoke(analysisPrompt);
			const analysisContent =
				typeof llmResponse.content === "string"
					? llmResponse.content
					: JSON.stringify(llmResponse.content);

			let analysis = {
				threats: [],
				risk_factors: [],
				recommended_supplies: [],
			};

			try {
				const jsonMatch = analysisContent.match(/\{[\s\S]*\}/);
				if (jsonMatch) {
					analysis = JSON.parse(jsonMatch[0]);
				}
			} catch (e) {
				console.error("Failed to parse LLM analysis:", e);
			}

			return JSON.stringify({
				crisis: crisisData.metadata,
				area_history: areaResults.map((r) => ({
					content: r.pageContent,
					metadata: r.metadata,
				})),
				analysis,
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
