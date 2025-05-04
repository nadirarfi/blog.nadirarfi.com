import { glob } from 'astro/loaders'
import { defineCollection, z } from 'astro:content'

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      image: image().optional(),
      tags: z.array(z.string()).optional(),
      authors: z.array(z.string()).optional(),
      draft: z.boolean().optional(),
    }),
})

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      description: z.string(),
      tags: z.array(z.string()),
      image: image(),
      link: z.string().url(),
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
    }),
})

// const certifications = defineCollection({
//   loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/certifications' }),
//   schema: ({ image }) =>
//     z.object({
//       name: z.string(),
//       description: z.string(),
//       tags: z.array(z.string()),
//       image: image(),
//       link: z.string().url(),
//       startDate: z.coerce.date().optional(),
//       endDate: z.coerce.date().optional(),
//       references: z.array(z.string()).optional(),
//     }),
// })

const certifications = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      // Type discriminator - defaults to 'content' if not specified
      type: z.enum(['main', 'content']).default('content'),
      
      // Fields required for main certifications, optional for content files
      name: z.string().optional(),
      description: z.string().optional(),
      tags: z.array(z.string()).optional().default([]),
      image: z.union([image(), z.string(), z.null()]).optional(),
      link: z.string().optional().default(''), // No URL validation
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
      references: z.array(z.string()).optional().default([]),
    }),
});


export const collections = { blog, projects, certifications }
