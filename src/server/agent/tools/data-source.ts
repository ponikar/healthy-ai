import { DynamicStructuredTool } from "@langchain/core/tools";
import { QdrantVectorStore } from "@langchain/qdrant";
import { z } from "zod";
import { vectorDb, VECTOR_COLLECTION_NAME } from "~/server/db/embeded/vector-db";
import { Model } from "../model";

export const searchCrisisDataTool = new DynamicStructuredTool({
  name: "search_crisis_data",
  description: "Search for crisis and relevant area history based on user query.",
  schema: z.object({
    query: z.string().describe("User query about a crisis"),
  }),
  func: async ({ query }) => {
    try {
      // 1. Search Crisis
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

      // 2. Search Area History with filter
      const areaStore = new QdrantVectorStore(Model.embeddings, {
        client: vectorDb,
        collectionName: VECTOR_COLLECTION_NAME.AREA_HISTORY,
      });

      // Qdrant filter for metadata
      // Note: passing raw Qdrant filter structure

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

      return JSON.stringify({
        crisis: crisisData.metadata,
        area_history: areaResults.map((r) => ({
          content: r.pageContent,
          metadata: r.metadata,
        })),
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
