import { DynamoDB } from 'aws-sdk';
import { User } from '../types/user';

export class UserRepository {
  private dynamoDB: DynamoDB.DocumentClient;
  private readonly tableName = 'users';

  constructor() {
    this.dynamoDB = new DynamoDB.DocumentClient();
  }

  async findById(userId: string): Promise<User | null> {
    try {
      const result = await this.dynamoDB.get({
        TableName: this.tableName,
        Key: { userId },
      }).promise();

      return result.Item as User || null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw new Error('Failed to find user');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const result = await this.dynamoDB.query({
        TableName: this.tableName,
        IndexName: 'email-index',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':email': email,
        },
      }).promise();

      return result.Items?.[0] as User || null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw new Error('Failed to find user');
    }
  }

  async create(user: User): Promise<User> {
    try {
      await this.dynamoDB.put({
        TableName: this.tableName,
        Item: user,
        ConditionExpression: 'attribute_not_exists(userId)',
      }).promise();

      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  async update(user: User): Promise<User> {
    try {
      await this.dynamoDB.update({
        TableName: this.tableName,
        Key: { userId: user.userId },
        UpdateExpression: 'set #name = :name, email = :email, updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#name': 'name',
        },
        ExpressionAttributeValues: {
          ':name': user.name,
          ':email': user.email,
          ':updatedAt': new Date().toISOString(),
        },
      }).promise();

      return user;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  async delete(userId: string): Promise<void> {
    try {
      await this.dynamoDB.delete({
        TableName: this.tableName,
        Key: { userId },
      }).promise();
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }
} 