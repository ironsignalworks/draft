import { z } from 'zod';

export const ExportOptionsSchema = z.object({
  title: z.string().optional(),
  quality: z.number(),
  compression: z.boolean(),
  includeMetadata: z.boolean(),
  watermark: z.boolean(),
  fontSize: z.number().optional(),
});

export const ExportSharePayloadSchema = z.object({
  title: z.string(),
  content: z.string(),
  options: ExportOptionsSchema,
  createdAt: z.string(),
});
