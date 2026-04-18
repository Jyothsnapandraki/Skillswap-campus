import { Router } from "express";
import { db } from "@workspace/db";
import { swapRequestsTable, usersTable, skillPostsTable } from "@workspace/db";
import { eq, or, and } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { CreateSwapRequestBody, UpdateSwapRequestStatusBody } from "@workspace/api-zod";

const router = Router();

async function formatRequest(req_: typeof swapRequestsTable.$inferSelect) {
  const [sender] = await db.select().from(usersTable).where(eq(usersTable.id, req_.senderId)).limit(1);
  const [receiver] = await db.select().from(usersTable).where(eq(usersTable.id, req_.receiverId)).limit(1);
  const [post] = await db.select().from(skillPostsTable).where(eq(skillPostsTable.id, req_.skillPostId)).limit(1);
  const [postUser] = await db.select().from(usersTable).where(eq(usersTable.id, post!.userId)).limit(1);

  const { passwordHash: _s, ...safeSender } = sender!;
  const { passwordHash: _r, ...safeReceiver } = receiver!;
  const { passwordHash: _p, ...safePostUser } = postUser!;

  return {
    ...req_,
    sender: safeSender,
    receiver: safeReceiver,
    skillPost: { ...post!, user: safePostUser },
  };
}

router.get("/swaprequests", requireAuth, async (req, res) => {
  const { direction } = req.query as { direction?: string };
  const userId = req.user!.userId;

  let condition;
  if (direction === "sent") {
    condition = eq(swapRequestsTable.senderId, userId);
  } else if (direction === "received") {
    condition = eq(swapRequestsTable.receiverId, userId);
  } else {
    condition = or(
      eq(swapRequestsTable.senderId, userId),
      eq(swapRequestsTable.receiverId, userId)
    );
  }

  const requests = await db
    .select()
    .from(swapRequestsTable)
    .where(condition)
    .orderBy(swapRequestsTable.createdAt);

  const result = await Promise.all(requests.map(formatRequest));
  res.json(result);
});

router.post("/swaprequests", requireAuth, async (req, res) => {
  const parsed = CreateSwapRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }

  const { receiverId, skillPostId, message } = parsed.data;
  const senderId = req.user!.userId;

  if (senderId === receiverId) {
    res.status(400).json({ error: "Bad request", message: "Cannot send request to yourself" });
    return;
  }

  const existing = await db
    .select()
    .from(swapRequestsTable)
    .where(
      and(
        eq(swapRequestsTable.senderId, senderId),
        eq(swapRequestsTable.skillPostId, skillPostId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    res.status(409).json({ error: "Conflict", message: "Request already sent for this post" });
    return;
  }

  const [created] = await db
    .insert(swapRequestsTable)
    .values({ senderId, receiverId, skillPostId, message: message || null })
    .returning();

  const result = await formatRequest(created);
  res.status(201).json(result);
});

router.put("/swaprequests/:id/status", requireAuth, async (req, res) => {
  const id = parseInt(req.params["id"]!);
  if (isNaN(id)) {
    res.status(400).json({ error: "Bad request", message: "Invalid request ID" });
    return;
  }

  const parsed = UpdateSwapRequestStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(swapRequestsTable)
    .where(eq(swapRequestsTable.id, id))
    .limit(1);

  if (!existing) {
    res.status(404).json({ error: "Not found", message: "Swap request not found" });
    return;
  }

  if (existing.receiverId !== req.user!.userId) {
    res.status(403).json({ error: "Forbidden", message: "Only the receiver can update status" });
    return;
  }

  const [updated] = await db
    .update(swapRequestsTable)
    .set({ status: parsed.data.status })
    .where(eq(swapRequestsTable.id, id))
    .returning();

  const result = await formatRequest(updated);
  res.json(result);
});

export default router;
