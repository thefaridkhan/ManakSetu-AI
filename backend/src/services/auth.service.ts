import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  role?: 'CONSUMER' | 'INDUSTRY_USER' | 'ADMIN';
  organization?: string;
  industryType?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase().trim() }
    });

    if (existing) {
      throw new Error('An account with this email address already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase().trim(),
        passwordHash,
        name: input.name.trim(),
        role: input.role || 'CONSUMER',
        organization: input.organization,
        industryType: input.industryType
      }
    });

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization: user.organization,
        industryType: user.industryType
      },
      token
    };
  }

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase().trim() }
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization: user.organization,
        industryType: user.industryType
      },
      token
    };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organization: true,
        industryType: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  private generateToken(user: { id: string; email: string; name: string; role: string }) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }
}

export const authService = new AuthService();
