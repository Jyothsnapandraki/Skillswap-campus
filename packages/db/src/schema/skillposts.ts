import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { usersTable } from "./users";

export const skillPostsTable = pgTable("skill_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  skillLevel: text("skill_level").notNull(),
  type: text("type").notNull(),
  availability: text("availability").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSkillPostSchema = createInsertSchema(skillPostsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertSkillPost = z.infer<typeof insertSkillPostSchema>;
export type SkillPost = typeof skillPostsTable.$inferSelect;
