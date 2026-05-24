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
  try {
    if (!hasRedis()) return [];
    const redis = getRedis();
    const res = await redis.get("messages");
    if (!res) return [];
    return JSON.parse(res as string) as Message[];
  } catch {
    return [];
  }
}

async function writeMessages(msgs: Message[]) {
  if (!hasRedis()) return;
  const redis = getRedis();
  await redis.set("messages", JSON.stringify(msgs));
}

// GET /api/messages — fetch all messages (for her mailbox)
export async function GET() {
  const msgs = await readMessages();
  return NextResponse.json(msgs);
}

// POST /api/messages — send a new message (requires secret)
export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.secret !== SENDER_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const msgs = await readMessages();
  const newMsg: Message = {
    id: Date.now().toString(),
    text: body.text?.trim() ?? "",
    sentAt: new Date().toISOString(),
    read: false,
  };
  if (!newMsg.text) return NextResponse.json({ error: "Empty message" }, { status: 400 });
  msgs.unshift(newMsg);
  await writeMessages(msgs);
  return NextResponse.json({ ok: true, message: newMsg });
}

// PATCH /api/messages — mark a message as read
export async function PATCH(req: NextRequest) {
  const { id } = await req.json();
  const msgs = await readMessages();
  const msg = msgs.find((m) => m.id === id);
  if (msg) {
    msg.read = true;
    await writeMessages(msgs);
  }
  return NextResponse.json({ ok: true });
}
