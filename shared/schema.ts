import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  type: text("type", { enum: ["entrepreneur", "investor"] }).notNull(),
  name: text("name").notNull(),
  bio: text("bio"),
  interests: text("interests").array(),
  expertise: text("expertise").array(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type", { enum: ["blog", "forum"] }).notNull(),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  type: true,
  name: true,
  bio: true,
  interests: true,
  expertise: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  receiverId: true,
  content: true,
});

export const insertPostSchema = createInsertSchema(posts).pick({
  title: true,
  content: true,
  type: true,
  tags: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type User = typeof users.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Post = typeof posts.$inferSelect;
