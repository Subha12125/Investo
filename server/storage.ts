import { InsertUser, InsertMessage, InsertPost, User, Message, Post } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User>;
  getUsers(filter?: { type?: string }): Promise<User[]>;
  
  createMessage(senderId: number, message: InsertMessage): Promise<Message>;
  getMessages(userId: number): Promise<Message[]>;
  
  createPost(authorId: number, post: InsertPost): Promise<Post>;
  getPosts(type: string): Promise<Post[]>;
  getPost(id: number): Promise<Post | undefined>;
  
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private messages: Map<number, Message>;
  private posts: Map<number, Post>;
  sessionStore: session.Store;
  private currentId: { users: number; messages: number; posts: number };

  constructor() {
    this.users = new Map();
    this.messages = new Map();
    this.posts = new Map();
    this.currentId = { users: 1, messages: 1, posts: 1 };
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, update: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");
    const updated = { ...user, ...update };
    this.users.set(id, updated);
    return updated;
  }

  async getUsers(filter?: { type?: string }): Promise<User[]> {
    let users = Array.from(this.users.values());
    if (filter?.type) {
      users = users.filter(user => user.type === filter.type);
    }
    return users;
  }

  async createMessage(senderId: number, message: InsertMessage): Promise<Message> {
    const id = this.currentId.messages++;
    const newMessage: Message = {
      id,
      senderId,
      content: message.content,
      receiverId: message.receiverId,
      createdAt: new Date(),
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async getMessages(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (msg) => msg.senderId === userId || msg.receiverId === userId,
    );
  }

  async createPost(authorId: number, post: InsertPost): Promise<Post> {
    const id = this.currentId.posts++;
    const newPost: Post = {
      id,
      authorId,
      title: post.title,
      content: post.content,
      type: post.type,
      tags: post.tags,
      createdAt: new Date(),
    };
    this.posts.set(id, newPost);
    return newPost;
  }

  async getPosts(type: string): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter((post) => post.type === type)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getPost(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }
}

export const storage = new MemStorage();
