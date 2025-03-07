import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertMessageSchema, insertPostSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Users
  app.get("/api/users", async (req, res) => {
    const type = req.query.type as string | undefined;
    const users = await storage.getUsers({ type });
    res.json(users);
  });

  app.patch("/api/users/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.id !== parseInt(req.params.id)) {
      return res.sendStatus(403);
    }
    const user = await storage.updateUser(req.user.id, req.body);
    res.json(user);
  });

  // Messages
  app.post("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const result = insertMessageSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json(result.error);
    }

    const message = await storage.createMessage(req.user.id, result.data);
    res.status(201).json(message);
  });

  app.get("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const messages = await storage.getMessages(req.user.id);
    res.json(messages);
  });

  // Posts
  app.post("/api/posts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const result = insertPostSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json(result.error);
    }

    const post = await storage.createPost(req.user.id, result.data);
    res.status(201).json(post);
  });

  app.get("/api/posts", async (req, res) => {
    const type = req.query.type as string;
    if (!type) return res.status(400).send("Type is required");
    
    const posts = await storage.getPosts(type);
    res.json(posts);
  });

  app.get("/api/posts/:id", async (req, res) => {
    const post = await storage.getPost(parseInt(req.params.id));
    if (!post) return res.status(404).send("Post not found");
    res.json(post);
  });

  const httpServer = createServer(app);
  return httpServer;
}
