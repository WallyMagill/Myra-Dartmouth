import { z } from 'zod';
import { TestSessionInput, UpdateTestSessionInput } from './validations/test-session';
import { ScheduleInput, UpdateScheduleInput } from './validations/schedule';

// Types
export const AthleteSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  height: z.number().nullable(),
  weight: z.number().nullable(),
  dateOfBirth: z.string().nullable(),
  gender: z.string().nullable(),
});

export type Athlete = z.infer<typeof AthleteSchema>;

export const CreateAthleteSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  height: z.number().optional(),
  weight: z.number().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
});

export type CreateAthleteInput = z.infer<typeof CreateAthleteSchema>;

export const UpdateAthleteSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
});

export type UpdateAthleteInput = z.infer<typeof UpdateAthleteSchema>;

// Protocol Types
export const ProtocolStageSchema = z.object({
  duration: z.number().min(1),
  intensity: z.number().min(0).max(100),
  targetHeartRate: z.number().optional(),
  targetLactate: z.number().optional(),
  notes: z.string().optional(),
});

export const ProtocolSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  testType: z.enum(['TREADMILL', 'SKI_ERG', 'BIKE_ERG']),
  stages: z.array(ProtocolStageSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
  createdBy: z.string(),
  creator: z.object({
    name: z.string(),
    email: z.string(),
  }),
});

export type Protocol = z.infer<typeof ProtocolSchema>;

export const CreateProtocolSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  testType: z.enum(['TREADMILL', 'SKI_ERG', 'BIKE_ERG']),
  stages: z.array(ProtocolStageSchema),
});

export type CreateProtocolInput = z.infer<typeof CreateProtocolSchema>;

export const UpdateProtocolSchema = CreateProtocolSchema.partial();

export type UpdateProtocolInput = z.infer<typeof UpdateProtocolSchema>;

// API Functions
export async function getAthletes(): Promise<Athlete[]> {
  const response = await fetch('/api/athletes');
  if (!response.ok) {
    throw new Error('Failed to fetch athletes');
  }
  return response.json();
}

export async function getAthlete(id: string): Promise<Athlete> {
  const response = await fetch(`/api/athletes/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch athlete');
  }
  return response.json();
}

export async function createAthlete(data: CreateAthleteInput): Promise<Athlete> {
  const response = await fetch('/api/athletes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create athlete');
  }
  return response.json();
}

export async function updateAthlete(
  id: string,
  data: UpdateAthleteInput
): Promise<Athlete> {
  const response = await fetch(`/api/athletes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update athlete');
  }
  return response.json();
}

export async function deleteAthlete(id: string): Promise<void> {
  const response = await fetch(`/api/athletes/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete athlete');
  }
}

// Protocol API Functions
export async function getProtocols(): Promise<Protocol[]> {
  const response = await fetch('/api/protocols');
  if (!response.ok) {
    throw new Error('Failed to fetch protocols');
  }
  return response.json();
}

export async function getProtocol(id: string): Promise<Protocol> {
  const response = await fetch(`/api/protocols/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch protocol');
  }
  return response.json();
}

export async function createProtocol(data: CreateProtocolInput): Promise<Protocol> {
  const response = await fetch('/api/protocols', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create protocol');
  }
  return response.json();
}

export async function updateProtocol(
  id: string,
  data: UpdateProtocolInput
): Promise<Protocol> {
  const response = await fetch(`/api/protocols/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update protocol');
  }
  return response.json();
}

export async function deleteProtocol(id: string): Promise<void> {
  const response = await fetch(`/api/protocols/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete protocol');
  }
}

// Test Session API
export const testSessionApi = {
  getAll: async () => {
    const response = await fetch('/api/test-sessions');
    if (!response.ok) throw new Error('Failed to fetch test sessions');
    return response.json();
  },

  getById: async (id: string) => {
    const response = await fetch(`/api/test-sessions/${id}`);
    if (!response.ok) throw new Error('Failed to fetch test session');
    return response.json();
  },

  create: async (data: TestSessionInput) => {
    const response = await fetch('/api/test-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create test session');
    return response.json();
  },

  update: async (id: string, data: UpdateTestSessionInput) => {
    const response = await fetch(`/api/test-sessions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update test session');
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`/api/test-sessions/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete test session');
    return response.json();
  },
};

// Schedule API
export const scheduleApi = {
  getAll: async () => {
    const response = await fetch('/api/schedules');
    if (!response.ok) throw new Error('Failed to fetch schedules');
    return response.json();
  },

  getById: async (id: string) => {
    const response = await fetch(`/api/schedules/${id}`);
    if (!response.ok) throw new Error('Failed to fetch schedule');
    return response.json();
  },

  create: async (data: ScheduleInput) => {
    const response = await fetch('/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create schedule');
    return response.json();
  },

  update: async (id: string, data: UpdateScheduleInput) => {
    const response = await fetch(`/api/schedules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update schedule');
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`/api/schedules/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete schedule');
    return response.json();
  },
}; 