import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE } from "@config/site";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const posts = (await getCollection("blog", ({ data }) => !data.noindex)).sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
  );
  return rss({
    title: `Blog · ${SITE.name}`,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      categories: post.data.tags,
      author: post.data.author,
      link: `/blog/${post.slug}/`,
    })),
    customData: `<language>pt-BR</language>`,
    stylesheet: false,
  });
}