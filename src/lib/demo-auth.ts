// Demo users for testing
const DEMO_USERS = [
  {
    id: 'demo-user-1',
    email: 'test@demo.com',
    password: 'password123',
    credits: 1000
  },
  {
    id: 'demo-user-2', 
    email: 'admin@demo.com',
    password: 'admin123',
    credits: 5000
  },
  {
    id: 'demo-user-3',
    email: 'user@studius.test',
    password: 'testing123', 
    credits: 500
  }
];

// Mock database in memory
let demoDatabase = {
  users: [...DEMO_USERS],
  creditLogs: [] as any[],
  tutorSessions: [] as any[]
};

export const isDemoMode = () => {
  return process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
};

export const demoAuth = {
  async login(email: string, password: string) {
    const user = demoDatabase.users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const token = `demo-token-${user.id}-${Date.now()}`;
    
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        credits: user.credits
      },
      token
    };
  },

  async register(email: string, password: string) {
    // Check if user exists
    const existingUser = demoDatabase.users.find(u => u.email === email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const newUser = {
      id: `demo-user-${Date.now()}`,
      email,
      password,
      credits: 100 // Starting credits
    };

    demoDatabase.users.push(newUser);

    const token = `demo-token-${newUser.id}-${Date.now()}`;

    return {
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        credits: newUser.credits
      },
      token
    };
  },

  async verifyToken(token: string) {
    if (!token.startsWith('demo-token-')) {
      throw new Error('Invalid token');
    }

    // Extract user ID from token
    const parts = token.split('-');
    const userId = parts.slice(2, -1).join('-'); // Everything except 'demo', 'token', and timestamp

    const user = demoDatabase.users.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      credits: user.credits
    };
  },

  async checkCredits(userId: string, requiredCredits: number) {
    const user = demoDatabase.users.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      canProceed: user.credits >= requiredCredits,
      currentCredits: user.credits,
      requiredCredits
    };
  },

  async deductCredits(userId: string, creditsToDeduct: number, operation: string) {
    const user = demoDatabase.users.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.credits < creditsToDeduct) {
      throw new Error('Insufficient credits');
    }

    user.credits -= creditsToDeduct;

    // Log the transaction
    demoDatabase.creditLogs.push({
      id: `log-${Date.now()}`,
      user_id: userId,
      type: operation,
      credits_used: creditsToDeduct,
      timestamp: new Date().toISOString()
    });

    return { newCreditBalance: user.credits };
  },

  async addCredits(userId: string, creditsToAdd: number) {
    const user = demoDatabase.users.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.credits += creditsToAdd;

    // Log the transaction  
    demoDatabase.creditLogs.push({
      id: `log-${Date.now()}`,
      user_id: userId,
      type: 'purchase',
      credits_used: -creditsToAdd, // Negative for addition
      timestamp: new Date().toISOString()
    });

    return { newCreditBalance: user.credits };
  },

  async createTutorSession(userId: string, sessionData: any) {
    const sessionId = `demo-session-${Date.now()}`;
    
    const session = {
      id: sessionId,
      user_id: userId,
      ...sessionData,
      created_at: new Date().toISOString()
    };

    demoDatabase.tutorSessions.push(session);

    return { sessionId, session };
  },

  async getTutorSession(sessionId: string, userId: string) {
    const session = demoDatabase.tutorSessions.find(
      s => s.id === sessionId && s.user_id === userId
    );

    if (!session) {
      throw new Error('Session not found or access denied');
    }

    return { session };
  },

  async getTutorSessions(userId: string) {
    const sessions = demoDatabase.tutorSessions
      .filter(s => s.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map(s => ({
        id: s.id,
        created_at: s.created_at
      }));

    return { sessions };
  },

  // Reset demo data (useful for testing)
  reset() {
    demoDatabase = {
      users: [...DEMO_USERS],
      creditLogs: [],
      tutorSessions: []
    };
  }
};