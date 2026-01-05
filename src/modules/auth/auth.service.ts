import { eq } from 'drizzle-orm';
import { Database } from '../../db';
import { users } from '../../db/schema';
import { hashPassword, verifyPassword } from '../../utils/hash';
import { generateToken } from '../../utils/jwt';
import { RegisterRequest, LoginRequest, LoginResponse } from '../../types/auth';

export class AuthService {
  constructor(
    private db: Database,
    private jwtSecret: string,
    private jwtExpiry: string
  ) {}

  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<LoginResponse> {
    // Check if user already exists
    const [existingUser] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, data.email));

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const [newUser] = await this.db
      .insert(users)
      .values({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: 'user',
        balance: 0,
      })
      .returning();

    // Generate token
    const token = await generateToken(
      {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
      this.jwtSecret,
      this.jwtExpiry
    );

    return {
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        balance: newUser.balance,
      },
    };
  }

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    // Find user by email
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, data.email));

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await verifyPassword(data.password, user.password);

    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate token
    const token = await generateToken(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      this.jwtSecret,
      this.jwtExpiry
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        balance: user.balance,
      },
    };
  }

  /**
   * Get current user by ID
   */
  async getCurrentUser(userId: number) {
    const [user] = await this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        balance: users.balance,
        created_at: users.created_at,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}