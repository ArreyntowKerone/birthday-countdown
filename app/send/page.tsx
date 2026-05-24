"use client";

import { useState } from "react";

export default function SendPage() {
  const [secret, setSecret] = useState("");
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const send = async () => {
    if (!text.trim() || !secret.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), secret: secret.trim() }),
      });
      if (!res.ok) {
        const d = await res.json();
        setErrorMsg(d.error ?? "Something went wrong");
        setStatus("error");
        return;
      }
      setStatus("sent");
      setText("");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setErrorMsg("Network error");
      setStatus("error");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #06050f 0%, #0d0820 50%, #10061a 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
      fontFamily: "'Jost', sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: 480 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(201,169,110,0.5)", marginBottom: 12 }}>
            your private mailbox
          </p>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 42, fontStyle: "italic", fontWeight: 300,
            color: "#f0e8d8", lineHeight: 1.1,
          }}>
            Send her a letter
          </h1>
          <p style={{ marginTop: 12, fontSize: 13, fontWeight: 200, color: "rgba(240,232,216,0.35)", letterSpacing: "0.05em" }}>
            She&apos;ll see a red dot and open an envelope
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(240,232,216,0.03)",
          border: "0.5px solid rgba(201,169,110,0.2)",
          borderRadius: 16, padding: "32px 28px",
          display: "flex", flexDirection: "column", gap: 16,
        }}>
          {/* Secret */}
          <div>
            <label style={{ display: "block", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(201,169,110,0.6)", marginBottom: 8 }}>
              Secret key
            </label>
            <input
              type="password"
              value={secret}
              onChange={e => setSecret(e.target.value)}
              placeholder="Your SENDER_SECRET from .env"
              style={inputStyle}
            />
          </div>

          {/* Message */}
          <div>
            <label style={{ display: "block", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(201,169,110,0.6)", marginBottom: 8 }}>
              Your message
            </label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Write her something beautiful..."
              rows={7}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.8, fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic", fontSize: 16 }}
            />
            <p style={{ marginTop: 6, fontSize: 11, color: "rgba(240,232,216,0.25)", textAlign: "right" }}>
              {text.length} characters
            </p>
          </div>

          {/* Send button */}
          <button
            onClick={send}
            disabled={status === "sending" || !text.trim() || !secret.trim()}
            style={{
              background: status === "sent" ? "rgba(100,180,120,0.15)" : "rgba(201,169,110,0.12)",
              border: `0.5px solid ${status === "sent" ? "rgba(100,200,130,0.4)" : "rgba(201,169,110,0.4)"}`,
              borderRadius: 8, padding: "14px 24px",
              color: status === "sent" ? "#88d4a0" : "#e8d5a3",
              fontFamily: "'Jost', sans-serif", fontWeight: 300,
              fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase",
              cursor: status === "sending" || !text.trim() || !secret.trim() ? "default" : "pointer",
              opacity: !text.trim() || !secret.trim() ? 0.4 : 1,
              transition: "all 0.3s",
            }}
          >
            {status === "sending" ? "Sending..." : status === "sent" ? "✓ Letter sent" : "Send letter →"}
          </button>

          {status === "error" && (
            <p style={{ fontSize: 12, color: "#e07070", textAlign: "center" }}>
              {errorMsg}
            </p>
          )}
        </div>

        {/* Tips */}
        <div style={{ marginTop: 32, padding: "20px 24px", background: "rgba(201,169,110,0.04)", border: "0.5px solid rgba(201,169,110,0.1)", borderRadius: 12 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(201,169,110,0.4)", marginBottom: 12 }}>
            Setup notes
          </p>
          <ul style={{ fontSize: 12, fontWeight: 200, color: "rgba(240,232,216,0.4)", lineHeight: 2, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
            <li>→ Set <code style={{ color: "rgba(201,169,110,0.7)", fontSize: 11 }}>SENDER_SECRET</code> in your Vercel env vars</li>
            <li>→ Share only <code style={{ color: "rgba(201,169,110,0.7)", fontSize: 11 }}>/</code> and <code style={{ color: "rgba(201,169,110,0.7)", fontSize: 11 }}>/mailbox</code> with her</li>
            <li>→ Keep <code style={{ color: "rgba(201,169,110,0.7)", fontSize: 11 }}>/send</code> your secret</li>
            <li>→ For persistence: add Vercel KV or Supabase</li>
          </ul>
        </div>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 11, color: "rgba(240,232,216,0.15)", letterSpacing: "0.1em" }}>
          she doesn&apos;t know this page exists ✦
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,300;1,400&family=Jost:wght@200;300&display=swap');
        input::placeholder, textarea::placeholder { color: rgba(240,232,216,0.2) !important; }
        input:focus, textarea:focus { border-color: rgba(201,169,110,0.5) !important; outline: none; }
      `}</style>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(240,232,216,0.04)",
  border: "0.5px solid rgba(201,169,110,0.2)",
  borderRadius: 8, padding: "12px 16px",
  color: "#f0e8d8", fontSize: 14,
  fontFamily: "'Jost', sans-serif", fontWeight: 300,
  outline: "none", transition: "border-color 0.2s",
};
