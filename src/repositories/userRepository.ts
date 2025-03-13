import { User } from '../types/user';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database';

export class UserRepository {
  async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const now = new Date().toISOString();
    const newUser: User = {
      id: uuidv4(),
      ...user,
      createdAt: now,
      updatedAt: now
    };

    await db('users').insert(newUser);
    return newUser;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await db('users').where({ email }).first();
    return user || null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await db('users').where({ id }).first();
    return user || null;
  }
}

export const userRepository = new UserRepository(); 