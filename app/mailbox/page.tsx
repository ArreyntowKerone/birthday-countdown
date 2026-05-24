"use client";

import { useEffect, useState, useRef } from "react";

interface Message {
  id: string;
  text: string;
  sentAt: string;
  read: boolean;
}

type Stage = "list" | "envelope" | "opening" | "letter";

// ── Floating heart component
function FloatingHeart({ style }: { style: React.CSSProperties }) {
  return (
    <div style={{
      position: "absolute", pointerEvents: "none",
      animation: "floatHeart 2.5s ease-out forwards",
      fontSize: 18,
      ...style,
    }}>
      ♥
    </div>
  );
}

// ── Envelope SVG (animated open)
function EnvelopeSVG({ stage, onClick }: { stage: Stage; onClick: () => void }) {
  const isOpening = stage === "opening" || stage === "letter";

  return (
    <div
      onClick={onClick}
      style={{
        cursor: stage === "envelope" ? "pointer" : "default",
        position: "relative",
        width: 320, height: 220,
        margin: "0 auto",
        filter: stage === "envelope" ? "drop-shadow(0 0 30px rgba(201,169,110,0.25))" : "drop-shadow(0 0 50px rgba(201,169,110,0.45))",
        transition: "filter 0.6s",
      }}
    >
      <svg viewBox="0 0 320 220" width="320" height="220" style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="envBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f5e6c8" />
            <stop offset="100%" stopColor="#e8d0a0" />
          </linearGradient>
          <linearGradient id="envFlap" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#efd8a8" />
            <stop offset="100%" stopColor="#dfc080" />
          </linearGradient>
          <linearGradient id="envInner" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fdf6e8" />
            <stop offset="100%" stopColor="#f5e9cc" />
          </linearGradient>
        </defs>

        {/* Envelope body */}
        <rect x="10" y="60" width="300" height="150" rx="6" fill="url(#envBody)" stroke="#c9a96e" strokeWidth="0.8" />

        {/* Inner lighter area (open reveal) */}
        {isOpening && (
          <rect x="10" y="60" width="300" height="150" rx="6" fill="url(#envInner)" stroke="#c9a96e" strokeWidth="0.8" />
        )}

        {/* Bottom V fold lines */}
        <line x1="10" y1="60" x2="160" y2="150" stroke="#c9a96e" strokeWidth="0.6" strokeOpacity="0.5" />
        <line x1="310" y1="60" x2="160" y2="150" stroke="#c9a96e" strokeWidth="0.6" strokeOpacity="0.5" />

        {/* Flap — rotates open */}
        <g
          style={{
            transformOrigin: "160px 60px",
            transform: isOpening ? "rotateX(180deg)" : "rotateX(0deg)",
            transition: "transform 0.9s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          <polygon
            points="10,60 160,10 310,60"
            fill="url(#envFlap)"
            stroke="#c9a96e"
            strokeWidth="0.8"
          />
          {/* Wax seal */}
          {!isOpening && (
            <g transform="translate(140, 50)">
              <circle cx="20" cy="15" r="14" fill="#c9364a" stroke="#a02030" strokeWidth="0.8" />
              <text x="20" y="20" textAnchor="middle" fontSize="13" fill="#ffd0d8" fontFamily="serif">♥</text>
            </g>
          )}
        </g>

        {/* Tap hint */}
        {stage === "envelope" && (
          <text x="160" y="145" textAnchor="middle" fontSize="11" fill="#b8934a" fontFamily="'Jost', sans-serif" fontWeight="300" letterSpacing="1">
            tap to open
          </text>
        )}
      </svg>
    </div>
  );
}

// ── Letter content with draw animation
function LetterContent({ message }: { message: Message }) {
  const [visible, setVisible] = useState(false);
  const [heartsVisible, setHeartsVisible] = useState(false);
  const hearts = useRef<{ x: number; y: number; delay: number; color: string }[]>([]);

  useEffect(() => {
    hearts.current = Array.from({ length: 12 }, (_, i) => ({
      x: 20 + Math.random() * 260,
      y: 10 + Math.random() * 180,
      delay: i * 0.18,
      color: ["#c9364a","#e8a0b0","#c9a96e","#d4758a","#f5c0cc"][Math.floor(Math.random() * 5)],
    }));
    const t1 = setTimeout(() => setVisible(true), 100);
    const t2 = setTimeout(() => setHeartsVisible(true), 600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const date = new Date(message.sentAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div style={{
      position: "relative",
      maxWidth: 480, margin: "0 auto",
      background: "linear-gradient(160deg, #fdf8f0 0%, #f8f0e0 100%)",
      borderRadius: 4,
      boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
      padding: "40px 40px 48px",
      animation: "slideUp 0.7s cubic-bezier(0.2,0,0,1) forwards",
      overflow: "hidden",
    }}>
      {/* Hearts floating in background */}
      {heartsVisible && hearts.current.map((h, i) => (
        <FloatingHeart
          key={i}
          style={{
            left: h.x, top: h.y,
            color: h.color,
            animationDelay: `${h.delay}s`,
            opacity: 0,
            fontSize: 12 + Math.random() * 12,
          }}
        />
      ))}

      {/* Decorative top border */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #c9364a, #c9a96e, #c9364a)" }} />

      {/* Date */}
      <p style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: 12, fontStyle: "italic",
        color: "#9a7a50", textAlign: "right",
        marginBottom: 28, letterSpacing: "0.05em",
        opacity: visible ? 1 : 0, transition: "opacity 0.6s 0.2s",
      }}>
        {date}
      </p>

      {/* Salutation */}
      <p style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: 22, fontStyle: "italic", fontWeight: 300,
        color: "#4a3520", marginBottom: 20,
        opacity: visible ? 1 : 0, transition: "opacity 0.6s 0.4s",
      }}>
        My dearest,
      </p>

      {/* Body */}
      <p style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: 17, fontWeight: 300, lineHeight: 2,
        color: "#3a2a15",
        marginBottom: 32,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.8s 0.6s",
        whiteSpace: "pre-wrap",
      }}>
        {message.text}
      </p>

      {/* Signature */}
      <div style={{
        opacity: visible ? 1 : 0, transition: "opacity 0.6s 1s",
        borderTop: "0.5px solid rgba(180,140,80,0.3)", paddingTop: 20,
        display: "flex", justifyContent: "space-between", alignItems: "flex-end",
      }}>
        <p style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 14, fontStyle: "italic", color: "#9a7a50",
        }}>
          with all my love ♥
        </p>
        <div style={{ display: "flex", gap: 4 }}>
          {"♥♥♥".split("").map((h, i) => (
            <span key={i} style={{
              fontSize: 16, color: "#c9364a",
              animation: visible ? `heartPulse 1.2s ease-in-out ${1.2 + i * 0.2}s infinite alternate` : "none",
              display: "inline-block",
            }}>{h}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MailboxPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Message | null>(null);
  const [stage, setStage] = useState<Stage>("list");
  const [loading, setLoading] = useState(true);

  const unread = messages.filter(m => !m.read).length;

  useEffect(() => {
    fetch("/api/messages")
      .then(r => r.json())
      .then(data => { setMessages(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const openMessage = async (msg: Message) => {
    setSelected(msg);
    setStage("envelope");
    // Mark as read
    if (!msg.read) {
      await fetch("/api/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: msg.id }),
      });
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m));
    }
  };

  const handleEnvelopeTap = () => {
    if (stage !== "envelope") return;
    setStage("opening");
    setTimeout(() => setStage("letter"), 1000);
  };

  const closeMessage = () => {
    setStage("list");
    setSelected(null);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #06050f 0%, #0d0820 50%, #10061a 100%)",
      fontFamily: "'Jost', sans-serif",
      padding: "48px 24px 80px",
    }}>

      {/* Header */}
      <div style={{ maxWidth: 560, margin: "0 auto", marginBottom: 48 }}>
        <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "rgba(201,169,110,0.5)", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none", marginBottom: 32 }}>
          ← back
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ position: "relative" }}>
            <span style={{ fontSize: 32 }}>📬</span>
            {unread > 0 && (
              <span style={{
                position: "absolute", top: -4, right: -4,
                width: 16, height: 16,
                background: "#e03050",
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, fontWeight: 400, color: "#fff",
                boxShadow: "0 0 8px rgba(220,50,80,0.8)",
                animation: "redPulse 2s ease-in-out infinite",
              }}>
                {unread}
              </span>
            )}
          </div>
          <div>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 36, fontStyle: "italic", fontWeight: 300,
              color: "#f0e8d8", lineHeight: 1,
            }}>
              Your Mailbox
            </h1>
            <p style={{ fontSize: 11, fontWeight: 200, letterSpacing: "0.1em", color: "rgba(240,232,216,0.35)", marginTop: 4 }}>
              {unread > 0 ? `${unread} new letter${unread > 1 ? "s" : ""} waiting` : "all caught up"}
            </p>
          </div>
        </div>
      </div>

      {/* Message list */}
      {stage === "list" && (
        <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
          {loading && (
            <p style={{ textAlign: "center", color: "rgba(240,232,216,0.3)", fontSize: 13, fontStyle: "italic", paddingTop: 40 }}>
              Loading your letters...
            </p>
          )}
          {!loading && messages.length === 0 && (
            <div style={{ textAlign: "center", paddingTop: 60 }}>
              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, fontStyle: "italic", color: "rgba(201,169,110,0.4)" }}>
                No letters yet
              </p>
              <p style={{ fontSize: 12, color: "rgba(240,232,216,0.25)", marginTop: 8 }}>
                something special is on its way...
              </p>
            </div>
          )}
          {messages.map(msg => (
            <button
              key={msg.id}
              onClick={() => openMessage(msg)}
              style={{
                width: "100%",
                background: msg.read ? "rgba(240,232,216,0.03)" : "rgba(201,169,110,0.07)",
                border: `0.5px solid ${msg.read ? "rgba(201,169,110,0.12)" : "rgba(201,169,110,0.35)"}`,
                borderRadius: 12, padding: "20px 24px",
                cursor: "pointer", textAlign: "left",
                display: "flex", alignItems: "center", gap: 16,
                transition: "all 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(201,169,110,0.1)")}
              onMouseLeave={e => (e.currentTarget.style.background = msg.read ? "rgba(240,232,216,0.03)" : "rgba(201,169,110,0.07)")}
            >
              {/* Unread indicator */}
              <div style={{
                width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                background: msg.read ? "transparent" : "#e03050",
                boxShadow: msg.read ? "none" : "0 0 6px rgba(220,50,80,0.8)",
              }} />

              {/* Envelope icon */}
              <span style={{ fontSize: 20, flexShrink: 0 }}>{msg.read ? "✉️" : "💌"}</span>

              {/* Preview */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 16, fontStyle: "italic",
                  color: msg.read ? "rgba(240,232,216,0.6)" : "#f0e8d8",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  marginBottom: 4,
                }}>
                  {msg.text.slice(0, 60)}{msg.text.length > 60 ? "..." : ""}
                </p>
                <p style={{ fontSize: 10, fontWeight: 200, color: "rgba(201,169,110,0.5)", letterSpacing: "0.1em" }}>
                  {new Date(msg.sentAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  {!msg.read && " · new"}
                </p>
              </div>

              <span style={{ color: "rgba(201,169,110,0.4)", fontSize: 14, flexShrink: 0 }}>→</span>
            </button>
          ))}
        </div>
      )}

      {/* Envelope modal */}
      {(stage === "envelope" || stage === "opening" || stage === "letter") && selected && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(6,5,15,0.92)",
          backdropFilter: "blur(8px)",
          zIndex: 50,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: 24,
        }}>
          {/* Close */}
          <button
            onClick={closeMessage}
            style={{
              position: "absolute", top: 24, right: 24,
              background: "transparent", border: "0.5px solid rgba(201,169,110,0.3)",
              borderRadius: "50%", width: 36, height: 36,
              color: "rgba(201,169,110,0.7)", fontSize: 16, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            ×
          </button>

          {/* Stage: show envelope */}
          {(stage === "envelope" || stage === "opening") && (
            <div style={{ textAlign: "center", animation: "fadeUp 0.5s ease forwards" }}>
              <p style={{
                fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase",
                color: "rgba(201,169,110,0.5)", marginBottom: 32,
                opacity: stage === "opening" ? 0 : 1, transition: "opacity 0.3s",
              }}>
                a letter for you
              </p>
              <EnvelopeSVG stage={stage} onClick={handleEnvelopeTap} />
              {stage === "envelope" && (
                <p style={{ marginTop: 24, fontSize: 12, fontStyle: "italic", color: "rgba(201,169,110,0.4)", fontFamily: "'Cormorant Garamond', serif" }}>
                  tap the envelope to open it
                </p>
              )}
              {stage === "opening" && (
                <p style={{ marginTop: 24, fontSize: 12, fontStyle: "italic", color: "rgba(201,169,110,0.5)", fontFamily: "'Cormorant Garamond', serif", animation: "pulse 0.8s ease infinite alternate" }}>
                  opening...
                </p>
              )}
            </div>
          )}

          {/* Stage: show letter */}
          {stage === "letter" && (
            <div style={{ width: "100%", maxWidth: 520, overflow: "auto", maxHeight: "90vh" }}>
              <LetterContent message={selected} />
              <button
                onClick={closeMessage}
                style={{
                  display: "block", margin: "24px auto 0",
                  background: "transparent",
                  border: "0.5px solid rgba(201,169,110,0.3)",
                  borderRadius: 8, padding: "12px 32px",
                  color: "rgba(201,169,110,0.6)", fontSize: 11,
                  letterSpacing: "0.3em", textTransform: "uppercase",
                  cursor: "pointer", fontFamily: "'Jost', sans-serif",
                }}
              >
                close
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@200;300&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(40px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes floatHeart { 0% { opacity:0.8; transform:translateY(0) scale(1); } 100% { opacity:0; transform:translateY(-80px) scale(0.5); } }
        @keyframes heartPulse { from { transform: scale(1); } to { transform: scale(1.3); } }
        @keyframes redPulse { 0%,100% { box-shadow:0 0 6px rgba(220,50,80,0.6); } 50% { box-shadow:0 0 14px rgba(220,50,80,1); } }
        @keyframes pulse { from { opacity:0.4; } to { opacity:1; } }
      `}</style>
    </div>
  );
}
