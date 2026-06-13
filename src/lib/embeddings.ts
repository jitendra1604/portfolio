import { portfolioDocuments } from "@/lib/portfolio";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_EMBEDDING_MODEL =
  process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small";
const documentEmbeddingCache = new Map<string, number[]>();

type EmbeddingResponse = {
  data: Array<{ embedding: number[] }>;
};

function normalize(vector: number[]) {
  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  if (!magnitude) return vector;
  return vector.map((value) => value / magnitude);
}

function cosineSimilarity(a: number[], b: number[]) {
  let score = 0;
  for (let index = 0; index < Math.min(a.length, b.length); index += 1) {
    score += a[index] * b[index];
  }
  return score;
}

function tokenize(input: string) {
  return input
    .toLowerCase()
    .split(/[^a-z0-9+#.-]+/i)
    .filter(Boolean);
}

function keywordScore(query: string, text: string, tags: string[]) {
  const queryTokens = tokenize(query);
  const haystack = `${text} ${tags.join(" ")}`.toLowerCase();

  return queryTokens.reduce((score, token) => {
    if (haystack.includes(token)) return score + 1;
    return score;
  }, 0);
}

async function createEmbedding(input: string) {
  if (!OPENAI_API_KEY) return null;

  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_EMBEDDING_MODEL,
      input,
    }),
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as EmbeddingResponse;
  return payload.data[0]?.embedding ?? null;
}

async function getDocumentEmbedding(id: string, text: string) {
  const cached = documentEmbeddingCache.get(id);
  if (cached) return cached;

  const embedding = await createEmbedding(text);
  if (embedding) {
    documentEmbeddingCache.set(id, embedding);
  }

  return embedding;
}

export async function findRelevantPortfolioContext(query: string, limit = 3) {
  const queryEmbedding = await createEmbedding(query);

  if (!queryEmbedding) {
    return [...portfolioDocuments]
      .map((doc) => ({
        ...doc,
        score: keywordScore(query, doc.text, doc.tags),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  const normalizedQuery = normalize(queryEmbedding);

  const embeddedDocs = await Promise.all(
    portfolioDocuments.map(async (doc) => {
      const embedding = await getDocumentEmbedding(doc.id, doc.text);
      if (!embedding) {
        return {
          ...doc,
          score: keywordScore(query, doc.text, doc.tags),
        };
      }

      return {
        ...doc,
        score: cosineSimilarity(normalizedQuery, normalize(embedding)),
      };
    })
  );

  return embeddedDocs.sort((a, b) => b.score - a.score).slice(0, limit);
}
