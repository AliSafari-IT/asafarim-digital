import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createMocks } from 'node-mocks-http';
import { prisma } from '@asafarim/db';
import { POST as createInquiry } from '@/app/api/inquiries/route';

describe('Inquiries API', () => {
  beforeAll(async () => {
    // Seed test data
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create an inquiry with valid data', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        subject: 'Mathematics',
        gradeLevel: 'K12',
        description: 'Help with algebra',
      },
    });

    // Mock auth
    req.auth = { userId: 'test-user-id', role: 'student' };

    const response = await createInquiry(req as any);
    expect(response.status).toBe(201);
  });

  it('should return 400 for missing subject', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: {
        gradeLevel: 'K12',
        description: 'Help with algebra',
      },
    });

    const response = await createInquiry(req as any);
    expect(response.status).toBe(400);
  });

  it('should return 401 for unauthenticated users', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: {
        subject: 'Mathematics',
        gradeLevel: 'K12',
        description: 'Help',
      },
    });

    const response = await createInquiry(req as any);
    expect(response.status).toBe(401);
  });
});
