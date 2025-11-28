import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { QdrantVectorStore } from "@langchain/qdrant";
import path from "path";
import { fileURLToPath } from "url";
import { vectorDb } from "./vector-db";
import { Model } from "~/server/agent/model";


export async function embedDocuments(
  sourcePath: string,
  collectionName: string,
  metadataExtractor?: (content: string) => Record<string, any>,
) {
  const filePath = path.join(
    process.cwd(),
    `src/server/db/embeded/source/${sourcePath}`,
  );

  console.log(`Loading CSV from: ${filePath}`);

  const loader = new CSVLoader(filePath, {
    
  });
  const docs = await loader.load();

  console.log(`Loaded ${docs.length} documents (rows).`);

  if (metadataExtractor) {
    console.log("Extracting metadata...");
    for (const doc of docs) {
      const extracted = metadataExtractor(doc.pageContent);
      doc.metadata = { ...doc.metadata, ...extracted };
    }
  }

 
  const vectorStore = new QdrantVectorStore(Model.embeddings, {
    client: vectorDb,
    collectionName,
  });

  const batchSize = 1000;
  const startIndex = 0;

  for (let i = startIndex; i < docs.length; i += batchSize) {
    const batch = docs.slice(i, i + batchSize);
    console.log(`Processing items ${i} to ${i + batch.length} (${batch.length} docs)...`);
    await vectorStore.addDocuments(batch);
  }

  console.log("Remaining documents embedded and stored in Qdrant.");
}

// Allow running directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
//   embedDocuments("area_history_final.csv", "area_history", (content) => {
//     const crisisIdMatch = content.match(/['"]?crisis_id['"]?:\s*(\d+)/);
//     const diseaseIdMatch = content.match(/['"]?disease_id['"]?:\s*(\d+)/);
//     return {
//       crisis_id: crisisIdMatch?.[1] ? parseInt(crisisIdMatch[1]) : undefined,
//       disease_id: diseaseIdMatch?.[1] ? parseInt(diseaseIdMatch[1]) : undefined,
//     };
//   }).catch(console.error);
    // embedDocuments("Crisis-table.csv", "crisis").catch(console.error);
}
