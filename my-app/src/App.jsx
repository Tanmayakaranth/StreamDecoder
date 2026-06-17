// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
// import heroImg from './assets/hero.png'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <section id="center">
//         <div className="hero">
//           <img src={heroImg} className="base" width="170" height="179" alt="" />
//           <img src={reactLogo} className="framework" alt="React logo" />
//           <img src={viteLogo} className="vite" alt="Vite logo" />
//         </div>
//         <div>
//           <h1>Get started</h1>
//           <p>
//             Edit <code>src/App.jsx</code> and save to test <code>HMR</code>
//           </p>
//         </div>
//         <button
//           type="button"
//           className="counter"
//           onClick={() => setCount((count) => count + 1)}
//         >
//           Count is {count}
//         </button>
//       </section>

//       <div className="ticks"></div>

//       <section id="next-steps">
//         <div id="docs">
//           <svg className="icon" role="presentation" aria-hidden="true">
//             <use href="/icons.svg#documentation-icon"></use>
//           </svg>
//           <h2>Documentation</h2>
//           <p>Your questions, answered</p>
//           <ul>
//             <li>
//               <a href="https://vite.dev/" target="_blank">
//                 <img className="logo" src={viteLogo} alt="" />
//                 Explore Vite
//               </a>
//             </li>
//             <li>
//               <a href="https://react.dev/" target="_blank">
//                 <img className="button-icon" src={reactLogo} alt="" />
//                 Learn more
//               </a>
//             </li>
//           </ul>
//         </div>
//         <div id="social">
//           <svg className="icon" role="presentation" aria-hidden="true">
//             <use href="/icons.svg#social-icon"></use>
//           </svg>
//           <h2>Connect with us</h2>
//           <p>Join the Vite community</p>
//           <ul>
//             <li>
//               <a href="https://github.com/vitejs/vite" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#github-icon"></use>
//                 </svg>
//                 GitHub
//               </a>
//             </li>
//             <li>
//               <a href="https://chat.vite.dev/" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#discord-icon"></use>
//                 </svg>
//                 Discord
//               </a>
//             </li>
//             <li>
//               <a href="https://x.com/vite_js" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#x-icon"></use>
//                 </svg>
//                 X.com
//               </a>
//             </li>
//             <li>
//               <a href="https://bsky.app/profile/vite.dev" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#bluesky-icon"></use>
//                 </svg>
//                 Bluesky
//               </a>
//             </li>
//           </ul>
//         </div>
//       </section>

//       <div className="ticks"></div>
//       <section id="spacer"></section>
//     </>
//   )
// }

// export default App
import { useState, useEffect, useRef, useCallback } from "react";

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const T = {
  void: "#08090A",
  ink: "#111318",
  panel: "#16191F",
  border: "#252A34",
  muted: "#353D4A",
  text: "#C8CDD8",
  soft: "#7A8494",
  accent: "#6C63FF",
  accentGlow: "#6C63FF33",
  green: "#22C55E",
  orange: "#F97316",
  red: "#EF4444",
  gold: "#F59E0B",
};

// ─── PERSONA CONFIG ───────────────────────────────────────────────────────────
const PERSONAS = [
  { id: "skeptic", label: "Data-Driven Skeptic", icon: "📊", color: "#3B82F6", desc: "Needs proof, metrics, and credibility signals" },
  { id: "trendy", label: "Trend Follower", icon: "🔥", color: "#EC4899", desc: "Driven by social proof, FOMO, and cultural momentum" },
  { id: "roi", label: "ROI Calculator", icon: "💰", color: T.gold, desc: "Focuses on cost savings and financial returns" },
  { id: "emotional", label: "Emotional Buyer", icon: "💜", color: "#A855F7", desc: "Connects with stories, feelings, and identity" },
  { id: "expert", label: "Domain Expert", icon: "🎓", color: "#06B6D4", desc: "Wants technical depth and peer-level language" },
  { id: "minimalist", label: "Minimalist", icon: "⬜", color: T.soft, desc: "Cut the fluff, just the essential value" },
  { id: "social", label: "Community Seeker", icon: "🤝", color: T.green, desc: "Values belonging, community, and shared identity" },
  { id: "risk", label: "Risk Avoider", icon: "🛡️", color: T.orange, desc: "Needs guarantees, testimonials, and reassurance" },
  { id: "pioneer", label: "Early Adopter", icon: "🚀", color: "#F43F5E", desc: "Wants to be first, craves novelty and exclusivity" },
  { id: "practical", label: "Practical Solver", icon: "🔧", color: "#10B981", desc: "Wants step-by-step clarity and ease of use" },
];

// ─── STREAMDECODER ENGINE ─────────────────────────────────────────────────────
function useStreamDecoder(enabled, onFriction) {
  const events = useRef([]);
  const intentMatrix = useRef({});
  const lastScroll = useRef(0);
  const erraticCount = useRef(0);
  const interventionFired = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const push = (type, meta = {}) => {
      const ev = { type, ts: Date.now(), ...meta };
      events.current.push(ev);
      if (events.current.length > 200) events.current.shift();
      analyze();
    };

    const analyze = () => {
      if (interventionFired.current) return;
      const recent = events.current.filter(e => Date.now() - e.ts < 8000);
      const score = {
        hover: recent.filter(e => e.type === "hover").length,
        scroll: erraticCount.current,
        highlight: recent.filter(e => e.type === "highlight").length,
        pause: recent.filter(e => e.type === "pause").length,
      };
      intentMatrix.current = score;
      const frictionScore = score.hover * 1 + score.scroll * 2 + score.highlight * 3 + score.pause * 4;
      if (frictionScore > 14) {
        interventionFired.current = true;
        onFriction({ score: frictionScore, dominant: Object.entries(score).sort((a,b)=>b[1]-a[1])[0][0], matrix: score });
        setTimeout(() => { interventionFired.current = false; }, 20000);
      }
    };

    const onMouseMove = (e) => {
      if (Math.abs(e.movementX) > 30 || Math.abs(e.movementY) > 30) push("hover", { x: e.clientX, y: e.clientY });
    };
    const onScroll = () => {
      const delta = Math.abs(window.scrollY - lastScroll.current);
      if (delta > 200) erraticCount.current++;
      lastScroll.current = window.scrollY;
      push("scroll", { delta });
    };
    const onSelect = () => {
      const sel = window.getSelection()?.toString();
      if (sel && sel.length > 3) push("highlight", { text: sel.slice(0, 40) });
    };
    let pauseTimer;
    const onPause = () => {
      clearTimeout(pauseTimer);
      pauseTimer = setTimeout(() => push("pause"), 3000);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("selectionchange", onSelect);
    window.addEventListener("mousemove", onPause, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("selectionchange", onSelect);
      window.removeEventListener("mousemove", onPause);
      clearTimeout(pauseTimer);
    };
  }, [enabled, onFriction]);

  return intentMatrix;
}

// ─── API CALL ─────────────────────────────────────────────────────────────────
async function generateForPersona(product, persona) {
  const prompts = {
    skeptic: `You are writing ad copy for a DATA-DRIVEN SKEPTIC persona. Use statistics, specific numbers, case studies, third-party validation, and credible proof points. Include a metric-heavy headline. Respond in JSON: {"headline":"...","subheadline":"...","body":"...","cta":"...","proof":"...","badge":"..."}`,
    trendy: `You are writing ad copy for a TREND FOLLOWER persona. Use FOMO, social proof numbers, hype language, "everyone is switching to", cultural references. Respond in JSON: {"headline":"...","subheadline":"...","body":"...","cta":"...","proof":"...","badge":"..."}`,
    roi: `You are writing ad copy for an ROI CALCULATOR persona. Focus on cost savings, payback period, revenue impact, and financial ROI. Use "$X saved" framing. Respond in JSON: {"headline":"...","subheadline":"...","body":"...","cta":"...","proof":"...","badge":"..."}`,
    emotional: `You are writing ad copy for an EMOTIONAL BUYER persona. Use storytelling, identity, aspiration, and feelings. Make them feel something. Avoid numbers. Respond in JSON: {"headline":"...","subheadline":"...","body":"...","cta":"...","proof":"...","badge":"..."}`,
    expert: `You are writing ad copy for a DOMAIN EXPERT persona. Use technical language, industry jargon, deep feature specifics, and peer-level tone. No dumbing down. Respond in JSON: {"headline":"...","subheadline":"...","body":"...","cta":"...","proof":"...","badge":"..."}`,
    minimalist: `You are writing ad copy for a MINIMALIST persona. Ultra brief, no fluff. One killer line. Stark and confident. Respond in JSON: {"headline":"...","subheadline":"...","body":"...","cta":"...","proof":"...","badge":"..."}`,
    social: `You are writing ad copy for a COMMUNITY SEEKER persona. Emphasize belonging, shared values, the group they'll join, community size, collective identity. Respond in JSON: {"headline":"...","subheadline":"...","body":"...","cta":"...","proof":"...","badge":"..."}`,
    risk: `You are writing ad copy for a RISK AVOIDER persona. Lead with guarantees, testimonials, "no risk", money-back promise, trusted by X brands. Reassure at every turn. Respond in JSON: {"headline":"...","subheadline":"...","body":"...","cta":"...","proof":"...","badge":"..."}`,
    pioneer: `You are writing ad copy for an EARLY ADOPTER persona. Emphasize being first, exclusive access, beta invite, cutting-edge, ahead of the curve. Respond in JSON: {"headline":"...","subheadline":"...","body":"...","cta":"...","proof":"...","badge":"..."}`,
    practical: `You are writing ad copy for a PRACTICAL SOLVER persona. Step-by-step, "takes 5 minutes", easy setup, no learning curve, just works. Respond in JSON: {"headline":"...","subheadline":"...","body":"...","cta":"...","proof":"...","badge":"..."}`,
  };

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: prompts[persona.id] + " Only respond with valid JSON, no markdown, no preamble.",
      messages: [{ role: "user", content: `Product: ${product}\n\nGenerate ad copy for the ${persona.label} persona.` }],
    }),
  });
  const data = await res.json();
  const raw = data.content?.find(b => b.type === "text")?.text || "{}";
  try { return JSON.parse(raw.replace(/```json|```/g, "").trim()); }
  catch { return { headline: "Copy error", subheadline: "", body: raw.slice(0, 100), cta: "Learn More", proof: "", badge: "" }; }
}

// ─── AD CARD ─────────────────────────────────────────────────────────────────
function AdCard({ persona, copy, loading }) {
  return (
    <div style={{
      background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16,
      padding: "24px", display: "flex", flexDirection: "column", gap: 12,
      position: "relative", overflow: "hidden", transition: "transform 0.2s",
    }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
    >
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${persona.color}, ${persona.color}88)`,
      }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 22 }}>{persona.icon}</span>
        <div>
          <div style={{ color: persona.color, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{persona.label}</div>
          <div style={{ color: T.soft, fontSize: 11 }}>{persona.desc}</div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[80, 60, 95, 50].map((w, i) => (
            <div key={i} style={{
              height: i === 0 ? 18 : 12, width: `${w}%`, borderRadius: 6,
              background: `linear-gradient(90deg, ${T.muted}, ${T.border}, ${T.muted})`,
              backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite",
            }} />
          ))}
        </div>
      ) : copy ? (
        <>
          {copy.badge && (
            <span style={{
              alignSelf: "flex-start", background: `${persona.color}22`, color: persona.color,
              fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, letterSpacing: "0.08em",
            }}>{copy.badge}</span>
          )}
          <div style={{ color: "#FFFFFF", fontSize: 18, fontWeight: 800, lineHeight: 1.3 }}>{copy.headline}</div>
          {copy.subheadline && <div style={{ color: T.text, fontSize: 14, fontWeight: 500 }}>{copy.subheadline}</div>}
          <div style={{ color: T.soft, fontSize: 13, lineHeight: 1.6 }}>{copy.body}</div>
          {copy.proof && (
            <div style={{
              background: T.ink, borderRadius: 8, padding: "10px 14px",
              color: T.text, fontSize: 12, borderLeft: `3px solid ${persona.color}`,
            }}>{copy.proof}</div>
          )}
          <button style={{
            marginTop: "auto", padding: "10px 18px", borderRadius: 10,
            background: `linear-gradient(135deg, ${persona.color}, ${persona.color}BB)`,
            border: "none", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer",
          }}>{copy.cta || "Get Started →"}</button>
        </>
      ) : (
        <div style={{ color: T.muted, fontSize: 13, textAlign: "center", padding: "20px 0" }}>Waiting to generate…</div>
      )}
    </div>
  );
}

// ─── STREAMDECODER OVERLAY ────────────────────────────────────────────────────
function FrictionOverlay({ friction, onDismiss }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [chatLog, setChatLog] = useState([{ role: "bot", text: "Hey! Looks like you might have some questions. What can I help with?" }]);
  const [typing, setTyping] = useState(false);

  const send = async () => {
    if (!msg.trim()) return;
    const userMsg = msg.trim();
    setMsg("");
    setChatLog(l => [...l, { role: "user", text: userMsg }]);
    setTyping(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6", max_tokens: 1000,
          system: "You are a helpful sales assistant. Answer concisely in 1-2 sentences.",
          messages: [{ role: "user", content: userMsg }],
        }),
      });
      const d = await res.json();
      const reply = d.content?.find(b => b.type === "text")?.text || "Let me connect you with our team!";
      setChatLog(l => [...l, { role: "bot", text: reply }]);
    } catch { setChatLog(l => [...l, { role: "bot", text: "Happy to help! Reach us at hello@example.com" }]); }
    setTyping(false);
  };

  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 1000,
      display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12,
    }}>
      {chatOpen && (
        <div style={{
          width: 320, background: T.panel, border: `1px solid ${T.border}`,
          borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 60px #00000088",
        }}>
          <div style={{
            background: `linear-gradient(135deg, ${T.accent}, #9333EA)`,
            padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>Need help deciding?</div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>Friction score: {friction.score} · Avg reply: instant</div>
            </div>
            <button onClick={() => setChatOpen(false)} style={{ background: "none", border: "none", color: "#fff", fontSize: 18, cursor: "pointer" }}>×</button>
          </div>
          <div style={{ height: 200, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {chatLog.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                background: m.role === "user" ? T.accent : T.ink,
                color: T.text, borderRadius: 10, padding: "8px 12px", fontSize: 13, maxWidth: "80%",
              }}>{m.text}</div>
            ))}
            {typing && <div style={{ color: T.soft, fontSize: 12, padding: "4px 8px" }}>Typing…</div>}
          </div>
          <div style={{ padding: 12, borderTop: `1px solid ${T.border}`, display: "flex", gap: 8 }}>
            <input
              value={msg} onChange={e => setMsg(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Ask anything…"
              style={{
                flex: 1, background: T.ink, border: `1px solid ${T.border}`, borderRadius: 8,
                padding: "8px 12px", color: T.text, fontSize: 13, outline: "none",
              }}
            />
            <button onClick={send} style={{
              background: T.accent, border: "none", borderRadius: 8, padding: "8px 12px",
              color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13,
            }}>→</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onDismiss} style={{
          background: T.muted, border: "none", borderRadius: 50, width: 44, height: 44,
          color: T.soft, cursor: "pointer", fontSize: 16,
        }}>×</button>
        <button onClick={() => setChatOpen(o => !o)} style={{
          background: `linear-gradient(135deg, ${T.accent}, #9333EA)`,
          border: "none", borderRadius: 50, width: 52, height: 52,
          color: "#fff", cursor: "pointer", fontSize: 22, boxShadow: `0 0 20px ${T.accentGlow}`,
          animation: "pulse 2s infinite",
        }}>💬</button>
      </div>

      {!chatOpen && (
        <div style={{
          background: T.panel, border: `1px solid ${T.border}`, borderRadius: 12,
          padding: "10px 16px", fontSize: 13, color: T.text, maxWidth: 240,
          boxShadow: "0 8px 24px #00000066",
        }}>
          🎯 <strong>Special offer</strong> — 20% off if you start today!
        </div>
      )}
    </div>
  );
}

// ─── STREAMDECODER DASHBOARD ──────────────────────────────────────────────────
function StreamDecoderPanel({ matrix, enabled, onToggle }) {
  const signals = [
    { label: "Hover Bursts", key: "hover", icon: "🖱️", color: T.accent },
    { label: "Erratic Scrolls", key: "scroll", icon: "📜", color: T.orange },
    { label: "Text Highlights", key: "highlight", icon: "✏️", color: T.gold },
    { label: "Long Pauses", key: "pause", icon: "⏸️", color: T.green },
  ];
  const score = Object.values(matrix.current || {}).reduce((a, b) => a + b, 0);

  return (
    <div style={{
      background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16,
      padding: 20, display: "flex", flexDirection: "column", gap: 16,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ color: T.text, fontWeight: 700, fontSize: 15 }}>StreamDecoder</div>
          <div style={{ color: T.soft, fontSize: 12 }}>Live friction detection engine</div>
        </div>
        <button onClick={onToggle} style={{
          background: enabled ? `${T.green}22` : T.muted,
          border: `1px solid ${enabled ? T.green : T.border}`,
          borderRadius: 20, padding: "5px 14px", color: enabled ? T.green : T.soft,
          cursor: "pointer", fontSize: 12, fontWeight: 700,
        }}>{enabled ? "● ACTIVE" : "○ OFF"}</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {signals.map(s => {
          const val = (matrix.current || {})[s.key] || 0;
          return (
            <div key={s.key} style={{
              background: T.ink, borderRadius: 10, padding: "10px 14px",
              border: `1px solid ${val > 3 ? s.color + "44" : T.border}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: T.soft }}>{s.icon} {s.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: val > 3 ? s.color : T.text }}>{val}</span>
              </div>
              <div style={{ marginTop: 6, height: 3, background: T.border, borderRadius: 3 }}>
                <div style={{
                  height: "100%", borderRadius: 3, width: `${Math.min(val * 12, 100)}%`,
                  background: s.color, transition: "width 0.5s",
                }} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        background: T.ink, borderRadius: 10, padding: "12px 16px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ color: T.soft, fontSize: 12 }}>Friction Score</span>
        <span style={{
          fontSize: 22, fontWeight: 900,
          color: score > 14 ? T.red : score > 8 ? T.orange : T.green,
        }}>{score}</span>
      </div>

      <div style={{ color: T.soft, fontSize: 11, lineHeight: 1.6 }}>
        Intervention fires at score &gt; 14. Tracking: hover velocity, scroll erraticism, text selection, idle pauses. Intent matrix resets every 20s post-trigger.
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [product, setProduct] = useState("");
  const [copies, setCopies] = useState({});
  const [loading, setLoading] = useState({});
  const [generated, setGenerated] = useState(false);
  const [friction, setFriction] = useState(null);
  const [decoderEnabled, setDecoderEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState("chameleon");

  const matrix = useStreamDecoder(decoderEnabled, useCallback((f) => setFriction(f), []));

  const generate = async () => {
    if (!product.trim()) return;
    setGenerated(true);
    setCopies({});
    const loadingMap = {};
    PERSONAS.forEach(p => loadingMap[p.id] = true);
    setLoading(loadingMap);

    await Promise.all(PERSONAS.map(async (persona) => {
      const copy = await generateForPersona(product, persona);
      setCopies(prev => ({ ...prev, [persona.id]: copy }));
      setLoading(prev => ({ ...prev, [persona.id]: false }));
    }));
  };

  return (
    <div style={{
      minHeight: "100vh", background: T.void, fontFamily: "'Inter', -apple-system, sans-serif",
      color: T.text,
    }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 #6C63FF44} 50%{box-shadow:0 0 0 12px #6C63FF00} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #252A34; border-radius: 3px; }
        input:focus { border-color: #6C63FF !important; box-shadow: 0 0 0 3px #6C63FF22; }
        textarea:focus { border-color: #6C63FF !important; box-shadow: 0 0 0 3px #6C63FF22; outline: none; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${T.border}`, padding: "0 24px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: `linear-gradient(135deg, ${T.accent}, #9333EA)`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
            }}>🦎</div>
            <div>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>Social Chameleon</div>
              <div style={{ color: T.soft, fontSize: 11 }}>+ StreamDecoder</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 4, background: T.ink, borderRadius: 10, padding: 4 }}>
            {[["chameleon", "🦎 Ad Generator"], ["decoder", "📡 StreamDecoder"]].map(([id, label]) => (
              <button key={id} onClick={() => setActiveTab(id)} style={{
                padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                background: activeTab === id ? T.accent : "transparent",
                color: activeTab === id ? "#fff" : T.soft,
                transition: "all 0.15s",
              }}>{label}</button>
            ))}
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: `${T.green}11`, border: `1px solid ${T.green}33`,
            borderRadius: 20, padding: "5px 14px",
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.green, animation: "pulse 2s infinite" }} />
            <span style={{ color: T.green, fontSize: 11, fontWeight: 600 }}>LIVE</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 24px" }}>
        {activeTab === "chameleon" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {/* Hero input */}
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", color: T.accent, textTransform: "uppercase" }}>One product → 10 personas</div>
              <h1 style={{ margin: 0, fontSize: 36, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>
                Every buyer sees their<br />
                <span style={{ background: `linear-gradient(135deg, ${T.accent}, #EC4899)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>perfect version</span>
              </h1>
            </div>

            <div style={{ maxWidth: 680, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
              <textarea
                value={product}
                onChange={e => setProduct(e.target.value)}
                placeholder="Describe your product or service... e.g. 'A project management SaaS that uses AI to auto-prioritize tasks and reduce meeting time by 40%'"
                rows={4}
                style={{
                  width: "100%", background: T.panel, border: `1px solid ${T.border}`, borderRadius: 12,
                  padding: "16px 18px", color: T.text, fontSize: 14, resize: "none",
                  fontFamily: "inherit", lineHeight: 1.6, transition: "all 0.2s",
                }}
              />
              <button
                onClick={generate}
                disabled={!product.trim()}
                style={{
                  padding: "14px 32px", borderRadius: 12, border: "none",
                  background: product.trim() ? `linear-gradient(135deg, ${T.accent}, #9333EA)` : T.muted,
                  color: "#fff", fontWeight: 800, fontSize: 15, cursor: product.trim() ? "pointer" : "default",
                  boxShadow: product.trim() ? `0 8px 32px ${T.accentGlow}` : "none", transition: "all 0.2s",
                }}>
                Generate 10 Persona Variations →
              </button>
            </div>

            {/* Persona grid */}
            {generated && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: 20, animation: "fadeIn 0.4s ease",
              }}>
                {PERSONAS.map(persona => (
                  <AdCard
                    key={persona.id}
                    persona={persona}
                    copy={copies[persona.id]}
                    loading={loading[persona.id]}
                  />
                ))}
              </div>
            )}

            {!generated && (
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12,
              }}>
                {PERSONAS.map(p => (
                  <div key={p.id} style={{
                    background: T.panel, border: `1px solid ${T.border}`, borderRadius: 12,
                    padding: "14px 16px", display: "flex", alignItems: "center", gap: 10,
                  }}>
                    <span style={{ fontSize: 20 }}>{p.icon}</span>
                    <div>
                      <div style={{ color: p.color, fontSize: 11, fontWeight: 700 }}>{p.label}</div>
                      <div style={{ color: T.soft, fontSize: 11 }}>{p.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "decoder" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 700 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", color: T.accent, textTransform: "uppercase", marginBottom: 8 }}>Behavioral Intelligence</div>
              <h2 style={{ margin: 0, color: "#fff", fontSize: 28, fontWeight: 900 }}>StreamDecoder</h2>
              <p style={{ color: T.soft, marginTop: 8, lineHeight: 1.7 }}>
                Detects implicit friction signals — hover velocity, scroll erraticism, text highlights, and idle pauses — running them through an in-memory intent matrix to trigger micro-interventions before users drop off.
              </p>
            </div>

            <StreamDecoderPanel matrix={matrix} enabled={decoderEnabled} onToggle={() => setDecoderEnabled(e => !e)} />

            <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, padding: 20 }}>
              <div style={{ color: T.text, fontWeight: 700, marginBottom: 12 }}>How to trigger an intervention</div>
              {[
                ["Move your mouse rapidly and erratically", "Raises hover + scroll signals"],
                ["Select / highlight text on this page", "Signals reading confusion"],
                ["Stop moving your mouse for 3+ seconds", "Detected as long pause / hesitation"],
                ["Scroll up and down quickly multiple times", "Classified as erratic scroll"],
              ].map(([action, result]) => (
                <div key={action} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ fontSize: 13, color: T.text }}>→ {action}</span>
                  <span style={{ fontSize: 12, color: T.soft }}>{result}</span>
                </div>
              ))}
              <div style={{ marginTop: 12, color: T.soft, fontSize: 12 }}>
                When friction score exceeds 14, a chatbot + offer overlay appears in the bottom-right corner.
              </div>
            </div>

            <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, padding: 20 }}>
              <div style={{ color: T.text, fontWeight: 700, marginBottom: 12 }}>Architecture</div>
              {[
                ["Signal capture", "mousemove, scroll, selectionchange, idle timers"],
                ["In-memory cache", "Rolling 200-event window, 8s recency filter"],
                ["Intent matrix", "{ hover, scroll, highlight, pause } → friction score"],
                ["Intervention trigger", "Score > 14 → chatbot + reward overlay"],
                ["Cooldown", "20s lockout prevents re-trigger spam"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", gap: 16, padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ fontSize: 12, color: T.accent, fontWeight: 600, minWidth: 140 }}>{k}</span>
                  <span style={{ fontSize: 12, color: T.soft }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* StreamDecoder friction overlay */}
      {friction && decoderEnabled && (
        <FrictionOverlay friction={friction} onDismiss={() => setFriction(null)} />
      )}
    </div>
  );
}