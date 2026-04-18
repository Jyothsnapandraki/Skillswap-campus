import { Router } from "express";
import { db } from "@workspace/db";
import { skillPostsTable, swapRequestsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router = Router();

router.get("/stats/dashboard", requireAuth, async (req, res) => {
  const userId = req.user!.userId;

  const posts = await db
    .select()
    .from(skillPostsTable)
    .where(eq(skillPostsTable.userId, userId));

  const totalPosts = posts.length;
  const offeredSkills = posts.filter((p) => p.type === "offer").length;
  const requestedSkills = posts.filter((p) => p.type === "request").length;

  const allRequests = await db
    .select()
    .from(swapRequestsTable)
    .where(sql`${swapRequestsTable.senderId} = ${userId} OR ${swapRequestsTable.receiverId} = ${userId}`);

  const sentRequests = allRequests.filter((r) => r.senderId === userId).length;
  const receivedRequests = allRequests.filter((r) => r.receiverId === userId).length;
  const pendingRequests = allRequests.filter((r) => r.status === "pending" && r.receiverId === userId).length;
  const acceptedRequests = allRequests.filter((r) => r.status === "accepted").length;

  res.json({
    totalPosts,
    offeredSkills,
    requestedSkills,
    sentRequests,
    receivedRequests,
    pendingRequests,
    acceptedRequests,
  });
});

router.get("/stats/categories", async (_req, res) => {
  const posts = await db.select().from(skillPostsTable);

  const counts: Record<string, number> = {};
  for (const post of posts) {
    counts[post.category] = (counts[post.category] || 0) + 1;
  }

  const result = Object.entries(counts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  res.json(result);
});

export default router;
