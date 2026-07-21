import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string().max(120),
    description: z.string().max(200),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default("Equipe Skedoole"),
    tags: z.array(z.string()).default([]),
    cover: z.string().optional(),
    readingTime: z.number().int().positive().optional(),
    noindex: z.boolean().default(false),
  }),
});

export const collections = { blog };