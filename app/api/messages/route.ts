import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

// For Vercel: use /tmp for ephemeral storage
// For persistence, swap with a DB (e.g. Vercel KV, PlanetScale, Supabase)
const DATA_PATH = join("/tmp", "messages.json");
const SENDER_SECRET = process.env.SENDER_SECRET ?? "change-this-secret";

interface Message {
  id: string;
  text: string;
  sentAt: string;
  read: boolean;
}

function readMessages(): Message[] {
  try {
    if (!existsSync(DATA_PATH)) return [];
    return JSON.parse(readFileSync(DATA_PATH, "utf-8"));
  } catch {
    return [];
  }
}

function writeMessages(msgs: Message[]) {
  writeFileSync(DATA_PATH, JSON.stringify(msgs, null, 2));
}

// GET /api/messages — fetch all messages (for her mailbox)
export async function GET() {
  const msgs = readMessages();
  return NextResponse.json(msgs);
}

// POST /api/messages — send a new message (requires secret)
export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.secret !== SENDER_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const msgs = readMessages();
  const newMsg: Message = {
    id: Date.now().toString(),
    text: body.text?.trim() ?? "",
    sentAt: new Date().toISOString(),
    read: false,
  };
  if (!newMsg.text) return NextResponse.json({ error: "Empty message" }, { status: 400 });
  msgs.unshift(newMsg);
  writeMessages(msgs);
  return NextResponse.json({ ok: true, message: newMsg });
}

// PATCH /api/messages — mark a message as read
export async function PATCH(req: NextRequest) {
  const { id } = await req.json();
  const msgs = readMessages();
  const msg = msgs.find(m => m.id === id);
  if (msg) { msg.read = true; writeMessages(msgs); }
  return NextResponse.json({ ok: true });
}
