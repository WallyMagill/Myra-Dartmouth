import { z } from 'zod';

export const testSessionSchema = z.object({
  date: z.date(),
  notes: z.string().optional(),
  protocolId: z.string(),
  athleteId: z.string(),
  conductedById: z.string(),
  data: z.record(z.any()),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  feedback: z.string().optional(),
  scheduleId: z.string().optional(),
});

export const updateTestSessionSchema = testSessionSchema.partial();

export type TestSessionInput = z.infer<typeof testSessionSchema>;
export type UpdateTestSessionInput = z.infer<typeof updateTestSessionSchema>; 