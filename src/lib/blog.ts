import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content", "blog");

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  tag: string;
  description: string;
  content: string;
  readingTime: number;
};

function getReadingTime(content: string) {
  return Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200));
}

function parsePost(fileName: string): BlogPost {
  const slug = fileName.replace(/\.mdx?$/, "");
  const source = fs.readFileSync(path.join(postsDirectory, fileName), "utf8");
  const { data, content } = matter(source);
  return {
    slug,
    title: String(data.title),
    date: String(data.date),
    tag: String(data.tag),
    description: String(data.description),
    content,
    readingTime: getReadingTime(content),
  };
}

export function getAllPosts() {
  if (!fs.existsSync(postsDirectory)) return [];
  return fs.readdirSync(postsDirectory)
    .filter((file) => /\.mdx?$/.test(file))
    .map(parsePost)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPostBySlug(slug: string) {
  const file = [".mdx", ".md"].map((extension) => `${slug}${extension}`)
    .find((fileName) => fs.existsSync(path.join(postsDirectory, fileName)));
  return file ? parsePost(file) : undefined;
}
