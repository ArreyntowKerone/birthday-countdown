"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";

// ── YouTube hidden audio player component
function YouTubeAudioPlayer() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [playing, setPlaying] = useState(false);
  const [bars, setBars] = useState<number[]>(Array(40).fill(4));
  const animRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const animateBars = useCallback(() => {
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    setBars(Array.from({ length: 40 }, (_, i) => {
      const w1 = (Math.sin(elapsed * 3.5 + i * 0.45) + 1) / 2;
      const w2 = (Math.sin(elapsed * 5.1 + i * 0.8) + 1) / 2;
      const w3 = (Math.sin(elapsed * 2.2 + i * 0.25) + 1) / 2;
      return Math.max(3, Math.round((w1 * 0.5 + w2 * 0.3 + w3 * 0.2) * 32 + 3));
    }));
    animRef.current = requestAnimationFrame(animateBars);
  }, []);

  const togglePlay = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    if (!playing) {
      iframe.contentWindow?.postMessage(JSON.stringify({ event: "command", func: "playVideo" }), "*");
      setPlaying(true);
      startTimeRef.current = Date.now();
      animateBars();
    } else {
      iframe.contentWindow?.postMessage(JSON.stringify({ event: "command", func: "pauseVideo" }), "*");
      setPlaying(false);
      cancelAnimationFrame(animRef.current);
      setBars(Array(40).fill(4));
    }
  };

  useEffect(() => () => cancelAnimationFrame(animRef.current), []);

  return (
    <div style={{ position: "relative", background: "rgba(240,232,216,0.03)", border: "0.5px solid rgba(201,169,110,0.15)", borderRadius: 12, padding: "24px 28px", marginBottom: 32 }}>
      <p style={{ fontSize: 10, fontWeight: 200, letterSpacing: "0.4em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>our song</p>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <button onClick={togglePlay} aria-label={playing ? "Pause" : "Play"} style={{ width: 48, height: 48, borderRadius: "50%", border: "0.5px solid rgba(201,169,110,0.4)", background: playing ? "rgba(201,169,110,0.15)" : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold)", fontSize: 18, flexShrink: 0, transition: "all 0.2s" }}>
          {playing ? "⏸" : "▶"}
        </button>
        <div>
          <p style={{ fontFamily: "\'Cormorant Garamond\', Georgia, serif", fontSize: 20, fontStyle: "italic", fontWeight: 300, color: "var(--cream)", marginBottom: 3 }}>Rewrite the Stars</p>
          <p style={{ fontSize: 11, fontWeight: 200, letterSpacing: "0.1em", color: "var(--muted)" }}>Anne-Marie &amp; James Arthur</p>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 2, height: 44 }}>
        {bars.map((h, i) => (
          <div key={i} style={{ flex: 1, height: h, borderRadius: 2, background: playing ? (i % 4 === 0 ? "var(--gold)" : i % 4 === 2 ? "var(--rose)" : "rgba(201,169,110,0.45)") : "rgba(240,232,216,0.1)", transition: "height 0.07s ease, background 0.4s" }} />
        ))}
      </div>
      {playing && (
        <p style={{ fontFamily: "\'Cormorant Garamond\', Georgia, serif", fontSize: 13, fontStyle: "italic", color: "rgba(201,169,110,0.55)", textAlign: "center", marginTop: 14, letterSpacing: "0.05em" }}>
          &ldquo;All I want is to fly with you...&rdquo;
        </p>
      )}
      <iframe ref={iframeRef} src="https://www.youtube.com/embed/Y2gzu_xwpMU?enablejsapi=1&autoplay=0&controls=0&rel=0&modestbranding=1" allow="autoplay" style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none", top: 0, left: 0 }} title="audio" />
    </div>
  );
}


function MailboxButton() {
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    fetch("/api/messages")
      .then(r => r.json())
      .then((msgs) => {
        const arr = Array.isArray(msgs) ? msgs : [];
        setUnread(arr.filter((m: { read: boolean }) => !m.read).length);
      })
      .catch(() => {});
    const id = setInterval(() => {
      fetch("/api/messages")
        .then(r => r.json())
        .then((msgs) => {
          const arr = Array.isArray(msgs) ? msgs : [];
          setUnread(arr.filter((m: { read: boolean }) => !m.read).length);
        })
        .catch(() => {});
    }, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <a
      href="/mailbox"
      style={{
        display: "flex", alignItems: "center", gap: 14,
        background: unread > 0 ? "rgba(201,169,110,0.08)" : "rgba(240,232,216,0.03)",
        border: `0.5px solid ${unread > 0 ? "rgba(201,169,110,0.35)" : "rgba(201,169,110,0.15)"}`,
        borderRadius: 12, padding: "18px 24px",
        textDecoration: "none",
        transition: "all 0.2s",
        marginBottom: 32,
        cursor: "pointer",
      }}
    >
      <div style={{ position: "relative", flexShrink: 0 }}>
        <span style={{ fontSize: 28 }}>{unread > 0 ? "💌" : "📬"}</span>
        {unread > 0 && (
          <span style={{
            position: "absolute", top: -4, right: -4,
            width: 16, height: 16,
            background: "#e03050", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 9, color: "#fff",
            boxShadow: "0 0 10px rgba(220,50,80,0.9)",
            animation: "mbPulse 2s ease-in-out infinite",
          }}>
            {unread}
          </span>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 17, fontStyle: "italic", color: "#f0e8d8", marginBottom: 2 }}>
          {unread > 0 ? `You have ${unread} new letter${unread > 1 ? "s" : ""}` : "Your mailbox"}
        </p>
        <p style={{ fontSize: 10, fontWeight: 200, letterSpacing: "0.1em", color: "rgba(201,169,110,0.5)" }}>
          {unread > 0 ? "tap to open →" : "no new letters right now"}
        </p>
      </div>
      <span style={{ color: "rgba(201,169,110,0.4)", fontSize: 16 }}>→</span>
      <style>{`@keyframes mbPulse { 0%,100%{box-shadow:0 0 8px rgba(220,50,80,0.7);}50%{box-shadow:0 0 18px rgba(220,50,80,1);}}`}</style>
    </a>
  );
}

// ── Types
interface Star { x: number; y: number; r: number; alpha: number; twinkleSpeed: number; twinkleOffset: number; }
interface Petal { x: number; y: number; vx: number; vy: number; rot: number; rotV: number; scale: number; alpha: number; color: string; }

function useCountdown(target: Date) {
  const [diff, setDiff] = useState(0);
  const targetMs = target.getTime();
  useEffect(() => {
    const tick = () => setDiff(Math.max(0, targetMs - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetMs]);
  const s = Math.floor(diff / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    done: diff === 0,
  };
}

function getBirthdayTarget(): Date {
  const now = new Date();
  const year = (now.getMonth() > 6 || (now.getMonth() === 6 && now.getDate() > 16))
    ? now.getFullYear() + 1 : now.getFullYear();
  return new Date(year, 6, 16, 0, 0, 0);
}

function pad(n: number) { return String(n).padStart(2, "0"); }

export default function Page() {
  const starsRef = useRef<HTMLCanvasElement>(null);
  const petalsRef = useRef<HTMLCanvasElement>(null);
  const [name, setName] = useState("Her Name");
  const [nameInput, setNameInput] = useState("");
  const [revealed, setRevealed] = useState(false);

  const target = useMemo(() => getBirthdayTarget(), []);
  const countdown = useCountdown(target);

  // ── Star canvas
  useEffect(() => {
    const canvas = starsRef.current;
    if (!canvas) return;
    let animId: number;
    const stars: Star[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.5 + 0.3,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 2 + 0.5,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }

    const ctx = canvas.getContext("2d")!;
    let t = 0;

    const draw = () => {
      t += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        const a = s.alpha * (0.6 + 0.4 * Math.sin(t * s.twinkleSpeed + s.twinkleOffset));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  // ── Petal canvas on mount
  useEffect(() => {
    const canvas = petalsRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d")!;
    const colors = ["rgba(212,117,138,0.7)","rgba(201,169,110,0.6)","rgba(240,210,200,0.65)","rgba(180,140,200,0.6)"];
    const petals: Petal[] = [];

    for (let i = 0; i < 40; i++) {
      petals.push({
        x: Math.random() * canvas.width,
        y: -60 - Math.random() * 400,
        vx: (Math.random() - 0.5) * 1.5,
        vy: Math.random() * 1.8 + 0.6,
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.05,
        scale: Math.random() * 0.7 + 0.5,
        alpha: Math.random() * 0.5 + 0.4,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = 0;
      petals.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.rot += p.rotV;
        if (p.y < canvas.height + 30) alive++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(p.scale, p.scale);
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 5, 0, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();
      });
      if (alive > 0) animId = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleReveal = () => {
    if (nameInput.trim()) setName(nameInput.trim());
    setRevealed(true);
  };

  // ── Render
  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden", background: "linear-gradient(160deg, #06050f 0%, #0d0820 40%, #10061a 100%)" }}>
      {/* Star canvas */}
      <canvas ref={starsRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />
      {/* Petal canvas */}
      <canvas ref={petalsRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 10 }} />

      {/* Ambient glow */}
      <div style={{ position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,169,110,0.06) 0%, transparent 70%)", pointerEvents: "none", zIndex: 1 }} />
      <div style={{ position: "fixed", bottom: "10%", right: "5%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(212,117,138,0.07) 0%, transparent 70%)", pointerEvents: "none", zIndex: 1 }} />

      <div style={{ position: "relative", zIndex: 5, maxWidth: 680, margin: "0 auto", padding: "60px 24px 80px" }}>

        {/* ── Entry Gate */}
        {!revealed && (
          <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40, textAlign: "center" }}>
            <div>
              <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 200, fontSize: 11, letterSpacing: "0.35em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 20 }}>
                a birthday letter
              </p>
              <h1 className="font-display" style={{ fontSize: "clamp(48px, 10vw, 80px)", fontWeight: 300, fontStyle: "italic", color: "var(--cream)", lineHeight: 1.1, marginBottom: 16 }}>
                This is for you
              </h1>
              <p style={{ fontSize: 14, fontWeight: 200, letterSpacing: "0.1em", color: "var(--muted)" }}>
                Enter your name to open
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 320 }}>
              <input
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && nameInput.trim() && handleReveal()}
                placeholder="Her name..."
                style={{
                  background: "rgba(240,232,216,0.06)",
                  border: "0.5px solid rgba(201,169,110,0.3)",
                  borderRadius: 6,
                  padding: "14px 18px",
                  color: "var(--cream)",
                  fontSize: 15,
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: "italic",
                  letterSpacing: "0.05em",
                  outline: "none",
                  textAlign: "center",
                  width: "100%",
                }}
              />
              <button
                onClick={handleReveal}
                disabled={!nameInput.trim()}
                style={{
                  background: nameInput.trim() ? "rgba(201,169,110,0.15)" : "transparent",
                  border: "0.5px solid rgba(201,169,110,0.4)",
                  borderRadius: 6,
                  padding: "13px 24px",
                  color: nameInput.trim() ? "var(--gold-light)" : "var(--muted)",
                  fontFamily: "'Jost', sans-serif",
                  fontWeight: 300,
                  fontSize: 13,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  cursor: nameInput.trim() ? "pointer" : "default",
                  transition: "all 0.3s",
                }}
              >
                Open →
              </button>
            </div>

            {/* Decorative line */}
            <div style={{ width: 1, height: 60, background: "linear-gradient(to bottom, transparent, rgba(201,169,110,0.4), transparent)" }} />
            <p className="font-display" style={{ fontSize: 13, fontStyle: "italic", color: "rgba(201,169,110,0.5)", letterSpacing: "0.1em" }}>
              16. Juli · Germany
            </p>
          </div>
        )}

        {/* ── Main card */}
        {revealed && (
          <div style={{ animation: "fadeUp 1.2s ease forwards" }}>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <p style={{ fontSize: 11, fontWeight: 200, letterSpacing: "0.4em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 24 }}>
                for you, always
              </p>
              <h1 className="font-display" style={{ fontSize: "clamp(52px, 12vw, 96px)", fontWeight: 300, fontStyle: "italic", color: "var(--cream)", lineHeight: 0.95, marginBottom: 20 }}>
                {name}
              </h1>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 20 }}>
                <div style={{ height: "0.5px", width: 60, background: "linear-gradient(to right, transparent, rgba(201,169,110,0.5))" }} />
                <p style={{ fontSize: 13, fontWeight: 200, letterSpacing: "0.2em", color: "var(--gold)", textTransform: "uppercase" }}>
                  Happy Birthday
                </p>
                <div style={{ height: "0.5px", width: 60, background: "linear-gradient(to left, transparent, rgba(201,169,110,0.5))" }} />
              </div>
            </div>

            {/* Countdown */}
            <div style={{ marginBottom: 48 }}>
              <p style={{ textAlign: "center", fontSize: 10, fontWeight: 200, letterSpacing: "0.4em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 20 }}>
                {countdown.done ? "today is the day ✦" : "counting down to 16 july"}
              </p>
              {!countdown.done ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                  {[["days", countdown.days], ["hours", countdown.hours], ["minutes", countdown.minutes], ["seconds", countdown.seconds]].map(([label, val]) => (
                    <div key={label as string} style={{
                      background: "rgba(240,232,216,0.04)",
                      border: "0.5px solid rgba(201,169,110,0.18)",
                      borderRadius: 8,
                      padding: "20px 8px",
                      textAlign: "center",
                    }}>
                      <div className="font-display" style={{ fontSize: 40, fontWeight: 300, color: "var(--cream)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                        {pad(val as number)}
                      </div>
                      <div style={{ fontSize: 9, fontWeight: 200, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--muted)", marginTop: 8 }}>
                        {label}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-display" style={{ textAlign: "center", fontSize: 36, fontStyle: "italic", color: "var(--gold)" }}>
                  Herzlichen Glückwunsch 🎂
                </p>
              )}
            </div>

            {/* Message */}
            <div style={{
              background: "rgba(240,232,216,0.03)",
              border: "0.5px solid rgba(201,169,110,0.15)",
              borderRadius: 12,
              padding: "36px 32px",
              marginBottom: 32,
            }}>
              <p className="font-display" style={{ fontSize: 20, fontStyle: "italic", fontWeight: 300, lineHeight: 1.9, color: "var(--cream)", marginBottom: 24 }}>
                From wherever I am, I think of you — walking through cobblestone streets in Germany, under the same sky, beneath the same stars.
                <br /><br />
                You came into my life and made everything feel like it was worth rewriting. Every moment with you is the one I&apos;d choose to keep.
                <br /><br />
                I hope this birthday, wherever you are, feels as extraordinary as you are to me. You deserve all of it — every candle, every wish, every star.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ height: "0.5px", flex: 1, background: "rgba(201,169,110,0.2)" }} />
                <p style={{ fontSize: 12, fontWeight: 200, letterSpacing: "0.2em", color: "var(--gold)", fontStyle: "italic" }}>
                  — with love, always
                </p>
              </div>
            </div>

            {/* Our song — audio player */}
            <YouTubeAudioPlayer />

            {/* Mailbox CTA */}
            <MailboxButton />

            {/* German flag + footer */}
            <div style={{ textAlign: "center", marginTop: 40 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                <div style={{ display: "flex", overflow: "hidden", borderRadius: 4, width: 60, height: 12 }}>
                  <div style={{ flex: 1, background: "#000" }} />
                  <div style={{ flex: 1, background: "#DD0000" }} />
                  <div style={{ flex: 1, background: "#FFCE00" }} />
                </div>
              </div>
              <p style={{ fontSize: 12, fontWeight: 200, letterSpacing: "0.25em", color: "var(--muted)" }}>
                Herzlichen Glückwunsch zum Geburtstag
              </p>
              <p className="font-display" style={{ fontSize: 14, fontStyle: "italic", color: "rgba(201,169,110,0.5)", marginTop: 8 }}>
                16. Juli · Germany ✦ always
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        input::placeholder { color: rgba(240,232,216,0.25); }
        input:focus { border-color: rgba(201,169,110,0.6) !important; }
      `}</style>
    </div>
  );
}
