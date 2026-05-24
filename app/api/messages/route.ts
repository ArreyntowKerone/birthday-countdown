import { NextRequest, NextResponse } from "next/server";
import { getRedis, hasRedis } from "../../lib/redis";

const SENDER_SECRET = process.env.SENDER_SECRET ?? "change-this-secret";

interface Message {
  id: string;
  text: string;
  sentAt: string;
  read: boolean;
}

async function readMessages(): Promise<Message[]> {
  if (!hasRedis()) throw new Error("Redis not configured");
  try {
    const redis = getRedis();
    const res = await redis.get("messages");
    if (!res) return [];
    return JSON.parse(res as string) as Message[];
  } catch (err) {
    console.error("readMessages error:", err);
    throw err;
  }
}

async function writeMessages(msgs: Message[]) {
  if (!hasRedis()) throw new Error("Redis not configured");
  try {
    const redis = getRedis();
    await redis.set("messages", JSON.stringify(msgs));
  } catch (err) {
    console.error("writeMessages error:", err);
    throw err;
  }
}

// GET /api/messages — fetch all messages (for her mailbox)
export async function GET() {
  try {
    const msgs = await readMessages();
    return NextResponse.json(msgs);
  } catch (err) {
    console.error("GET /api/messages failed:", err);
    return NextResponse.json({ error: "Failed to read messages", detail: String(err) }, { status: 500 });
  }
}

// POST /api/messages — send a new message (requires secret)
export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.secret !== SENDER_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let msgs: Message[];
  try {
    msgs = await readMessages();
  } catch (err) {
    console.error("POST readMessages failed:", err);
    return NextResponse.json({ error: "Failed to read messages", detail: String(err) }, { status: 500 });
  }
  const newMsg: Message = {
    id: Date.now().toString(),
    text: body.text?.trim() ?? "",
    sentAt: new Date().toISOString(),
    read: false,
  };
  if (!newMsg.text) return NextResponse.json({ error: "Empty message" }, { status: 400 });
  msgs.unshift(newMsg);
  try {
    await writeMessages(msgs);
    return NextResponse.json({ ok: true, message: newMsg });
  } catch (err) {
    console.error("POST writeMessages failed:", err);
    return NextResponse.json({ error: "Failed to write message", detail: String(err) }, { status: 500 });
  }
}

// PATCH /api/messages — mark a message as read
export async function PATCH(req: NextRequest) {
  const { id } = await req.json();
  try {
    const msgs = await readMessages();
    const msg = msgs.find((m) => m.id === id);
    if (msg) {
      msg.read = true;
      await writeMessages(msgs);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/messages failed:", err);
    return NextResponse.json({ error: "Failed to update message", detail: String(err) }, { status: 500 });
  }
}
