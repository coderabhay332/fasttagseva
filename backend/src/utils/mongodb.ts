// MongoDB Data API Client for Cloudflare Workers
// Uses MongoDB Atlas Data API (HTTP/REST) instead of native driver

import type { Env } from '../types/env';

const MONGODB_DATA_API_VERSION = 'v1';

interface MongoDBRequest {
  dataSource: string;
  database: string;
  collection: string;
  [key: string]: any;
}

class MongoDBClient {
  private baseUrl: string;
  private apiKey: string;
  private dataSource: string;
  private database: string;

  constructor(env: Env) {
    // Extract from MONGODB_URI or use separate env vars
    // Format: https://data.mongodb-api.com/app/{APP_ID}/endpoint/data/v1
    this.baseUrl = env.MONGODB_DATA_API_URL || 'https://data.mongodb-api.com/app/YOUR_APP_ID/endpoint/data/v1';
    this.apiKey = env.MONGODB_DATA_API_KEY || '';
    this.dataSource = env.MONGODB_DATA_SOURCE || 'Cluster0';
    this.database = env.MONGODB_DATABASE || 'fasttag';
  }

  private async request(action: string, body: Omit<MongoDBRequest, 'dataSource' | 'database'>): Promise<any> {
    const url = `${this.baseUrl}/action/${action}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Request-Headers': '*',
        'api-key': this.apiKey,
      },
      body: JSON.stringify({
        dataSource: this.dataSource,
        database: this.database,
        ...body,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`MongoDB Data API error: ${response.status} - ${error}`);
    }

    return await response.json();
  }

  // Find one document
  async findOne(collection: string, filter: Record<string, any>, projection?: Record<string, any>): Promise<any> {
    const result = await this.request('findOne', {
      collection,
      filter,
      projection,
    });
    return result.document;
  }

  // Find many documents
  async find(collection: string, filter: Record<string, any>, options: { sort?: Record<string, any>; limit?: number; skip?: number } = {}): Promise<any[]> {
    const result = await this.request('find', {
      collection,
      filter,
      sort: options.sort,
      limit: options.limit,
      skip: options.skip,
    });
    return result.documents || [];
  }

  // Insert one document
  async insertOne(collection: string, document: Record<string, any>): Promise<any> {
    const result = await this.request('insertOne', {
      collection,
      document,
    });
    return { insertedId: result.insertedId };
  }

  // Insert many documents
  async insertMany(collection: string, documents: Record<string, any>[]): Promise<any> {
    const result = await this.request('insertMany', {
      collection,
      documents,
    });
    return { insertedIds: result.insertedIds };
  }

  // Update one document
  async updateOne(collection: string, filter: Record<string, any>, update: Record<string, any>, upsert: boolean = false): Promise<any> {
    const result = await this.request('updateOne', {
      collection,
      filter,
      update,
      upsert,
    });
    return {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedId: result.upsertedId,
    };
  }

  // Update many documents
  async updateMany(collection: string, filter: Record<string, any>, update: Record<string, any>): Promise<any> {
    const result = await this.request('updateMany', {
      collection,
      filter,
      update,
    });
    return {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    };
  }

  // Delete one document
  async deleteOne(collection: string, filter: Record<string, any>): Promise<any> {
    const result = await this.request('deleteOne', {
      collection,
      filter,
    });
    return { deletedCount: result.deletedCount };
  }

  // Delete many documents
  async deleteMany(collection: string, filter: Record<string, any>): Promise<any> {
    const result = await this.request('deleteMany', {
      collection,
      filter,
    });
    return { deletedCount: result.deletedCount };
  }

  // Aggregate pipeline
  async aggregate(collection: string, pipeline: any[]): Promise<any[]> {
    const result = await this.request('aggregate', {
      collection,
      pipeline,
    });
    return result.documents || [];
  }

  // Count documents
  async count(collection: string, filter: Record<string, any> = {}): Promise<number> {
    const result = await this.request('count', {
      collection,
      filter,
    });
    return result.count;
  }
}

// Factory function to create client
export function createMongoDBClient(env: Env): MongoDBClient {
  return new MongoDBClient(env);
}

// Helper to convert _id string to ObjectId format for MongoDB
export function toObjectId(id: string): { $oid: string } {
  return { $oid: id };
}

// Helper to convert ObjectId from MongoDB response
export function fromObjectId(obj: any): string {
  if (obj && obj.$oid) return obj.$oid;
  return obj;
}
