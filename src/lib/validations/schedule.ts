import { z } from 'zod';

export const scheduleSchema = z.object({
  startTime: z.date(),
  endTime: z.date(),
  title: z.string().min(1),
  description: z.string().optional(),
  location: z.string().optional(),
  type: z.enum(['TEST_SESSION', 'MEETING', 'TRAINING', 'OTHER']),
  status: z.enum(['ACTIVE', 'CANCELLED', 'COMPLETED']),
  createdBy: z.string(),
});

export const updateScheduleSchema = scheduleSchema.partial();

export type ScheduleInput = z.infer<typeof scheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>; 