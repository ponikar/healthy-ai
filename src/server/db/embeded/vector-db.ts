import { QdrantClient } from "@qdrant/js-client-rest";

export const vectorDb = new QdrantClient({
  url: process.env.VECTOR_DB_URL,
  apiKey: process.env.VECTOR_DB_API_TOKEN,
});



export const VECTOR_COLLECTION_NAME = {
    CRISIS: "crisis",
    AREA_HISTORY: "area_history",
    SUPPLEMENT: "supplement",
}