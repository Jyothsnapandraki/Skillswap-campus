import { Router } from "express";
import { db } from "@workspace/db";
import { skillPostsTable, usersTable } from "@workspace/db";
import { eq, ilike, and, sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { CreateSkillPostBody, UpdateSkillPostBody } from "@workspace/api-zod";

const router = Router();

async function formatPost(post: typeof skillPostsTable.$inferSelect) {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, post.userId))
    .limit(1);

  const { passwordHash: _, ...safeUser } = user!;
  return { ...post, user: safeUser };
}

router.get("/skillposts", async (req, res) => {
  const { search, category, type, userId } = req.query as Record<string, string | undefined>;

  const conditions = [];

  if (search) {
    conditions.push(
      sql`(${ilike(skillPostsTable.title, `%${search}%`)} OR ${ilike(skillPostsTable.description, `%${search}%`)})`
    );
  }
  if (category) {
    conditions.push(eq(skillPostsTable.category, category));
  }
  if (type) {
    conditions.push(eq(skillPostsTable.type, type));
  }
  if (userId) {
    const uid = parseInt(userId);
    if (!isNaN(uid)) {
      conditions.push(eq(skillPostsTable.userId, uid));
    }
  }

  const posts = await db
    .select()
    .from(skillPostsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(sql`${skillPostsTable.createdAt} DESC`);

  const result = await Promise.all(posts.map(formatPost));
  res.json(result);
});

router.post("/skillposts", requireAuth, async (req, res) => {
  const parsed = CreateSkillPostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }

  const [post] = await db
    .insert(skillPostsTable)
    .values({ ...parsed.data, userId: req.user!.userId })
    .returning();

  const result = await formatPost(post);
  res.status(201).json(result);
});

router.get("/skillposts/:id", async (req, res) => {
  const id = parseInt(req.params["id"]!);
  if (isNaN(id)) {
    res.status(400).json({ error: "Bad request", message: "Invalid post ID" });
    return;
  }

  const [post] = await db.select().from(skillPostsTable).where(eq(skillPostsTable.id, id)).limit(1);
  if (!post) {
    res.status(404).json({ error: "Not found", message: "Skill post not found" });
    return;
  }

  const result = await formatPost(post);
  res.json(result);
});

router.put("/skillposts/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params["id"]!);
  if (isNaN(id)) {
    res.status(400).json({ error: "Bad request", message: "Invalid post ID" });
    return;
  }

  const [existing] = await db
    .select()
    .from(skillPostsTable)
    .where(eq(skillPostsTable.id, id))
    .limit(1);
  if (!existing) {
    res.status(404).json({ error: "Not found", message: "Skill post not found" });
    return;
  }

  if (existing.userId !== req.user!.userId) {
    res.status(403).json({ error: "Forbidden", message: "Cannot edit another user's post" });
    return;
  }

  const parsed = UpdateSkillPostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }

  const [updated] = await db
    .update(skillPostsTable)
    .set(parsed.data)
    .where(eq(skillPostsTable.id, id))
    .returning();

  const result = await formatPost(updated);
  res.json(result);
});

router.delete("/skillposts/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params["id"]!);
  if (isNaN(id)) {
    res.status(400).json({ error: "Bad request", message: "Invalid post ID" });
    return;
  }

  const [existing] = await db
    .select()
    .from(skillPostsTable)
    .where(eq(skillPostsTable.id, id))
    .limit(1);
  if (!existing) {
    res.status(404).json({ error: "Not found", message: "Skill post not found" });
    return;
  }

  if (existing.userId !== req.user!.userId) {
    res.status(403).json({ error: "Forbidden", message: "Cannot delete another user's post" });
    return;
  }

  await db.delete(skillPostsTable).where(eq(skillPostsTable.id, id));
  res.status(204).send();
});

export default router;
