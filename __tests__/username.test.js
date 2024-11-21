// __tests__/username.test.js
import { jest } from '@jest/globals';

// Setup mocks
const mockPrismaClient = {
  $queryRaw: jest.fn(),
  user: {
    findUnique: jest.fn(),
    upsert: jest.fn()
  }
};

// Use top-level await pattern
const setupTest = async () => {
  // Mock modules
  await jest.unstable_mockModule('server-only', () => ({}));
  await jest.unstable_mockModule('@clerk/nextjs/server', () => ({
    auth: () => ({ userId: 'test-user-id' }),
    clerkClient: {
      users: {
        updateUser: jest.fn()
      }
    }
  }));
  await jest.unstable_mockModule('../lib/prisma.js', () => ({
    db: mockPrismaClient
  }));

  // Import after mocks are setup
  const { updateUsername } = await import('../actions/users.js');
  return { updateUsername };
};

let updateUsername;

beforeAll(async () => {
  const module = await setupTest();
  updateUsername = module.updateUsername;
});

describe('Username Update Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrismaClient.$queryRaw.mockResolvedValue([{ now: new Date() }]);
  });

  test('successfully updates username', async () => {
    mockPrismaClient.user.findUnique.mockResolvedValue(null);
    mockPrismaClient.user.upsert.mockResolvedValue({
      username: 'testuser',
      clerkUserId: 'test-user-id'
    });

    const result = await updateUsername('testuser');
    expect(result).toEqual({
      success: true,
      username: 'testuser'
    });
  });

  test('throws error when username is taken', async () => {
    mockPrismaClient.user.findUnique.mockResolvedValue({
      clerkUserId: 'other-user-id'
    });

    await expect(updateUsername('taken-username'))
      .rejects
      .toThrow('Username already taken');
  });

  test('throws error for invalid username', async () => {
    await expect(updateUsername(''))
      .rejects
      .toThrow('Invalid username provided');
  });

  test('throws error when database connection fails', async () => {
    mockPrismaClient.$queryRaw.mockRejectedValue(new Error('Database connection failed'));

    await expect(updateUsername('testuser'))
      .rejects
      .toThrow('Database connection failed');
  });
});