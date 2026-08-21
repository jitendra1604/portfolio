import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content", "blog");

export type BlogSource = "local" | "notion" | "external";

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  description: string;
  content: string;
  readingTime: number;
  source: BlogSource;
  /** Only set for external posts — link to the original platform. */
  url?: string;
  /** Only set for external posts — e.g. "Medium", "Dev.to". */
  platform?: string;
};

function getReadingTime(content: string) {
  return Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200));
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ---------------------------------------------------------------------------
// Local MDX posts — files in content/blog, committed to git. Always available,
// no setup required. New files show up after the next deploy.
// ---------------------------------------------------------------------------

// Accepts either `tags: [Foo, Bar]` or the legacy singular `tag: Foo` in frontmatter.
function parseFrontmatterTags(data: Record<string, unknown>): string[] {
  if (Array.isArray(data.tags)) return data.tags.map(String).filter(Boolean);
  if (typeof data.tags === "string") return data.tags.split(",").map((t) => t.trim()).filter(Boolean);
  if (data.tag) return [String(data.tag)];
  return [];
}

function parseLocalPost(fileName: string): BlogPost {
  const slug = fileName.replace(/\.mdx?$/, "");
  const source = fs.readFileSync(path.join(postsDirectory, fileName), "utf8");
  const { data, content } = matter(source);
  return {
    slug,
    title: String(data.title),
    date: String(data.date),
    tags: parseFrontmatterTags(data),
    description: String(data.description),
    content,
    readingTime: getReadingTime(content),
    source: "local",
  };
}

function getLocalPosts(): BlogPost[] {
  if (!fs.existsSync(postsDirectory)) return [];
  return fs
    .readdirSync(postsDirectory)
    .filter((file) => /\.mdx?$/.test(file))
    .map(parseLocalPost);
}

// ---------------------------------------------------------------------------
// Notion posts — write in a Notion database, they appear on the site within
// the ISR revalidate window with no redeploy. Opt-in via NOTION_TOKEN +
// NOTION_DATABASE_ID; silently disabled when unset.
//
// Expected database properties: Title (title), Slug (rich text), Description
// (rich text), Tag (multi_select, select, or rich text), Date (date), Published (checkbox).
// ---------------------------------------------------------------------------

async function getNotionClient() {
  if (!process.env.NOTION_TOKEN) return null;
  const { Client } = await import("@notionhq/client");
  return new Client({ auth: process.env.NOTION_TOKEN });
}

// The Notion API now nests a database's rows behind a "data source" — a
// plain database created in the UI has exactly one, so resolve it once here
// rather than making every call site deal with the indirection.
async function resolveDataSourceId(client: any, databaseId: string): Promise<string | null> {
  const database = await client.databases.retrieve({ database_id: databaseId });
  return database.data_sources?.[0]?.id ?? null;
}

function extractText(prop: any): string {
  const items = prop?.title ?? prop?.rich_text ?? [];
  return items.map((item: any) => item.plain_text).join("");
}

type NotionMeta = {
  pageId: string;
  slug: string;
  title: string;
  date: string;
  tags: string[];
  description: string;
};

// The Tag property may be configured as multi_select, select, or rich_text —
// support all three rather than assuming one shape.
function extractTags(prop: any): string[] {
  if (Array.isArray(prop?.multi_select)) return prop.multi_select.map((t: any) => t.name).filter(Boolean);
  if (prop?.select?.name) return [prop.select.name];
  const text = extractText(prop);
  return text ? text.split(",").map((t: string) => t.trim()).filter(Boolean) : [];
}

function mapNotionPage(page: any): NotionMeta {
  const props = page.properties ?? {};
  const title = extractText(props.Title) || "Untitled";
  return {
    pageId: page.id,
    slug: extractText(props.Slug) || slugify(title),
    title,
    date: props.Date?.date?.start ?? "",
    tags: extractTags(props.Tag),
    description: extractText(props.Description),
  };
}

async function fetchNotionPostContent(pageId: string): Promise<string> {
  const client = await getNotionClient();
  if (!client) return "";
  const { NotionToMarkdown } = await import("notion-to-md");
  const n2m = new NotionToMarkdown({ notionClient: client as any });
  const blocks = await n2m.pageToMarkdown(pageId);
  return n2m.toMarkdownString(blocks).parent ?? "";
}

async function hydrateNotionPost(meta: NotionMeta): Promise<BlogPost> {
  const content = await fetchNotionPostContent(meta.pageId);
  return {
    slug: meta.slug,
    title: meta.title,
    date: meta.date,
    tags: meta.tags,
    description: meta.description,
    content,
    readingTime: getReadingTime(content),
    source: "notion",
  };
}

async function fetchNotionPosts(): Promise<BlogPost[]> {
  const databaseId = process.env.NOTION_DATABASE_ID;
  const client = await getNotionClient();
  if (!client || !databaseId) return [];
  const dataSourceId = await resolveDataSourceId(client, databaseId);
  if (!dataSourceId) return [];

  const response = await client.dataSources.query({
    data_source_id: dataSourceId,
    filter: { property: "Published", checkbox: { equals: true } },
    sorts: [{ property: "Date", direction: "descending" }],
  });

  const metas = response.results.filter((page: any) => "properties" in page).map(mapNotionPage);
  return Promise.all(metas.map(hydrateNotionPost));
}

async function fetchNotionPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const databaseId = process.env.NOTION_DATABASE_ID;
  const client = await getNotionClient();
  if (!client || !databaseId) return undefined;
  const dataSourceId = await resolveDataSourceId(client, databaseId);
  if (!dataSourceId) return undefined;

  const response = await client.dataSources.query({
    data_source_id: dataSourceId,
    filter: {
      and: [
        { property: "Published", checkbox: { equals: true } },
        { property: "Slug", rich_text: { equals: slug } },
      ],
    },
  });

  const page = response.results.find((result: any) => "properties" in result) as any;
  return page ? hydrateNotionPost(mapNotionPage(page)) : undefined;
}

// ---------------------------------------------------------------------------
// External posts — syndicated via RSS from platforms like Medium, Dev.to or
// Hashnode. Configure BLOG_RSS_FEEDS as "Platform=https://feed/url,..." to
// enable; these link out to the original post rather than rendering here.
// ---------------------------------------------------------------------------

function getFeedConfigs(): { platform: string; url: string }[] {
  const raw = process.env.BLOG_RSS_FEEDS;
  if (!raw) return [];
  return raw
    .split(",")
    .map((entry) => {
      const [platform, url] = entry.split("=").map((part) => part?.trim());
      return { platform, url };
    })
    .filter((feed): feed is { platform: string; url: string } => Boolean(feed.platform && feed.url));
}

async function fetchExternalPosts(): Promise<BlogPost[]> {
  const feeds = getFeedConfigs();
  if (feeds.length === 0) return [];

  const { default: Parser } = await import("rss-parser");
  const parser = new Parser();

  const results = await Promise.allSettled(
    feeds.map(async ({ platform, url }) => {
      const feed = await parser.parseURL(url);
      return (feed.items ?? []).map((item): BlogPost => ({
        slug: slugify(`${platform}-${item.title ?? item.guid ?? item.link ?? ""}`),
        title: item.title ?? "Untitled",
        date: item.isoDate ?? item.pubDate ?? "",
        tags: [platform],
        description: (item.contentSnippet ?? "").slice(0, 220),
        content: "",
        readingTime: getReadingTime(item.contentSnippet ?? item.title ?? ""),
        source: "external",
        url: item.link,
        platform,
      }));
    })
  );

  return results.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getAllPosts(): Promise<BlogPost[]> {
  const [local, notion, external] = await Promise.all([
    Promise.resolve(getLocalPosts()),
    fetchNotionPosts().catch(() => []),
    fetchExternalPosts().catch(() => []),
  ]);
  return [...local, ...notion, ...external].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const local = getLocalPosts().find((post) => post.slug === slug);
  if (local) return local;
  return fetchNotionPostBySlug(slug).catch(() => undefined);
}
