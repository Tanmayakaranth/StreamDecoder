import { useState, useEffect, useRef, useCallback } from "react";

// ─── DESIGN TOKENS ─────────────────────────────────────────────────────────────
const T = {
  void: "#FAFAFA",
  ink: "#111827",
  panel: "#FFFFFF",
  border: "#E5E7EB",
  muted: "#9CA3AF",
  text: "#374151",
  soft: "#6B7280",
  accent: "#464D69",
  accentBg: "rgba(70, 77, 105, 0.06)",
  gold: "#EAA823",
  goldBg: "rgba(234, 168, 35, 0.08)",
  green: "#065F46",
  orange: "#9A3412",
  red: "#991B1B",
};

// ─── PERSONA CONFIGURATION ───────────────────────────────────────────────────
const PERSONAS = [
  { id: "skeptic",    label: "Data-Driven Skeptic",  icon: "📊", color: T.accent, desc: "Needs proof, metrics, and credibility signals" },
  { id: "trendy",     label: "Trend Follower",        icon: "🔥", color: T.gold,   desc: "Driven by social proof, FOMO, and cultural momentum" },
  { id: "roi",        label: "ROI Calculator",        icon: "💰", color: "#854D0E",desc: "Focuses on cost savings and financial returns" },
  { id: "emotional",  label: "Emotional Buyer",       icon: "💜", color: "#3730A3",desc: "Connects with stories, feelings, and identity" },
  { id: "expert",     label: "Domain Expert",         icon: "🎓", color: "#065F46",desc: "Wants technical depth and peer-level language" },
  { id: "minimalist", label: "Minimalist",            icon: "⬜", color: T.soft,   desc: "Cut the fluff, just the essential value" },
  { id: "social",     label: "Community Seeker",      icon: "🤝", color: "#166534",desc: "Values belonging, community, and shared identity" },
  { id: "risk",       label: "Risk Avoider",          icon: "🛡️", color: T.orange, desc: "Needs guarantees, testimonials, and reassurance" },
  { id: "pioneer",    label: "Early Adopter",         icon: "🚀", color: T.red,    desc: "Wants to be first, craves novelty and exclusivity" },
  { id: "practical",  label: "Practical Solver",      icon: "🔧", color: "#075985",desc: "Wants step-by-step clarity and ease of use" },
];

const PERSONA_MAP = Object.fromEntries(PERSONAS.map(p => [p.id, p]));

// ─── PERSONA PROFILES ─────────────────────────────────────────────────────────
const PERSONA_PROFILES = {
  skeptic:    [2.5, 2.0, 3.5, 2.0, 4.8, 2.0, 2.5, 1.8, 2.0, 3.5, 2.5, 3.5],
  trendy:     [3.0, 4.8, 3.5, 4.2, 2.0, 3.8, 4.5, 4.0, 2.5, 2.0, 3.5, 3.5],
  roi:        [4.8, 1.8, 3.0, 3.0, 4.0, 1.5, 2.0, 1.5, 3.5, 5.0, 2.0, 2.5],
  emotional:  [2.5, 3.5, 2.5, 4.0, 2.0, 3.5, 3.0, 5.0, 2.5, 1.5, 3.5, 3.0],
  expert:     [2.5, 1.5, 5.0, 2.0, 5.0, 2.5, 3.5, 1.5, 2.0, 3.0, 3.0, 4.0],
  minimalist: [3.5, 1.5, 3.5, 3.5, 2.5, 1.5, 2.0, 2.0, 5.0, 3.5, 3.0, 2.5],
  social:     [2.5, 5.0, 3.0, 3.5, 2.5, 5.0, 3.5, 4.5, 2.5, 2.0, 3.0, 3.0],
  risk:       [4.0, 3.5, 2.5, 1.5, 4.5, 2.5, 1.5, 3.5, 3.0, 3.5, 1.0, 2.5],
  pioneer:    [2.0, 3.0, 4.5, 4.5, 3.0, 2.5, 5.0, 3.0, 2.0, 2.5, 5.0, 4.0],
  practical:  [3.5, 2.0, 3.5, 4.5, 3.0, 2.0, 2.0, 2.0, 4.5, 3.5, 3.0, 3.0],
};

// ─── FEATURE DEFINITIONS ─────────────────────────────────────────────────────
const FEATURES = [
  { key: "price_sensitivity",       label: "Price Sensitivity",        desc: "How much does cost influence decisions?",         lo: "Doesn't care",   hi: "Very price-driven" },
  { key: "social_proof_importance", label: "Social Proof Importance",  desc: "How much do reviews & popularity matter?",        lo: "Ignores it",     hi: "Needs validation" },
  { key: "tech_comfort",            label: "Tech Comfort",             desc: "Comfort level with technology & tools",           lo: "Tech-averse",    hi: "Power user" },
  { key: "decision_speed",          label: "Decision Speed",           desc: "How quickly do they make purchase decisions?",    lo: "Very deliberate",hi: "Impulsive" },
  { key: "research_depth",          label: "Research Depth",           desc: "How deeply do they research before buying?",      lo: "Minimal",        hi: "Exhaustive" },
  { key: "community_importance",    label: "Community Importance",     desc: "How important is belonging to a group?",          lo: "Solo buyer",     hi: "Community-first" },
  { key: "novelty_preference",      label: "Novelty Preference",       desc: "Do they prefer new/exclusive or proven things?",  lo: "Proven only",    hi: "First adopter" },
  { key: "emotional_resonance",     label: "Emotional Resonance",      desc: "How much do emotions drive purchase decisions?",  lo: "Pure logic",     hi: "Feeling-driven" },
  { key: "simplicity_preference",   label: "Simplicity Preference",    desc: "Do they want simple or feature-rich solutions?",  lo: "Wants features", hi: "Minimal only" },
  { key: "roi_focus",               label: "ROI Focus",                desc: "How important is measurable return on investment?",lo: "Not important",  hi: "Core criterion" },
  { key: "risk_tolerance",          label: "Risk Tolerance",           desc: "Comfort with uncertainty and new untested things", lo: "Risk-averse",    hi: "Risk-loving" },
  { key: "budget_range",            label: "Budget Range",             desc: "Typical spending tier for this customer",         lo: "Tight budget",   hi: "Premium spender" },
];

const FEATURE_IMPORTANCES = {
  social_proof_importance: 0.1056, decision_speed: 0.1014, emotional_resonance: 0.0971,
  novelty_preference: 0.0962, research_depth: 0.0886, simplicity_preference: 0.0883,
  risk_tolerance: 0.0869, community_importance: 0.0779, tech_comfort: 0.0757,
  price_sensitivity: 0.0713, roi_focus: 0.0658, budget_range: 0.0453,
};

// ─── JS RANDOM FOREST CLASSIFIER ─────────────────────────────────────────────
function classifyPersona(featureValues) {
  const SIGMA = 0.85;
  const scores = {};

  for (const [persona, profile] of Object.entries(PERSONA_PROFILES)) {
    let logProb = 0;
    for (let i = 0; i < featureValues.length; i++) {
      const diff = featureValues[i] - profile[i];
      const importance = FEATURE_IMPORTANCES[FEATURES[i].key] || (1 / FEATURES.length);
      const weight = importance * FEATURES.length;
      logProb -= weight * (diff * diff) / (2 * SIGMA * SIGMA);
    }
    scores[persona] = Math.exp(logProb);
  }

  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const probs = {};
  for (const [k, v] of Object.entries(scores)) probs[k] = v / total;

  return Object.entries(probs)
    .sort((a, b) => b[1] - a[1])
    .map(([id, conf]) => ({ id, conf }));
}

// ─── AD COPY TEMPLATES (TAB 1 FALLBACKS) ──────────────────────────────────────
function getDynamicTemplates(productDesc) {
  const desc = productDesc?.trim() || "our solution";
  let shortProduct = desc;
  const match = desc.match(/^([A-Za-z0-9\s'-]{3,30})(?:\s+(?:is|that|uses|helps|automates|allows|delivers|built for))\b/i);
  if (match && match[1]) shortProduct = match[1].trim();
  else if (desc.length > 25) shortProduct = desc.split(" ").slice(0, 3).join(" ");
  shortProduct = shortProduct.charAt(0).toUpperCase() + shortProduct.slice(1);

  return {
    skeptic:    { headline: `Verified 41% Gains with ${shortProduct}`, subheadline: "Backed by 12 independent audits", body: `${desc} is proven to reduce friction and streamline operations by up to 40%.`, cta: "Download Audit Metrics →", proof: "4.9/5 stars, 1,250 verified reviews", badge: "AUDITED METRICS" },
    trendy:     { headline: `Everyone is Switching to ${shortProduct}`, subheadline: `Why 45,000+ teams migrated this month`, body: `High-growth teams are already using ${desc}. Join the movement before it becomes legacy.`, cta: "Join the Movement →", proof: "Trending #1 on Product Hunt", badge: "MOST POPULAR" },
    roi:        { headline: `Save $5,400/Mo with ${shortProduct}`, subheadline: "Full ROI in under 30 days", body: `${desc} redirects wasted hours into pure revenue-generating activity. It pays for itself.`, cta: "Calculate Your ROI →", proof: "Average 4.8x ROI across industries", badge: "ROI ADVANTAGE" },
    emotional:  { headline: `Do What You Love. Let ${shortProduct} Handle the Rest.`, subheadline: "Reclaim your focus and feel inspired again", body: `Remember your passion before the overhead? ${desc} gives that back to you.`, cta: "Start Your Journey →", proof: "Voted #1 for Team Wellness", badge: "PEACE OF MIND" },
    expert:     { headline: `${shortProduct} Architecture Deep-Dive`, subheadline: "Built for high-performance event-loop dispatch", body: `${desc} uses zero-copy concurrency to resolve allocations dynamically. No thread-locks.`, cta: "Review Technical Specs →", proof: "Supports 10k ops/sec, sub-ms dispatch", badge: "DEVELOPER GRADE" },
    minimalist: { headline: `${shortProduct}. Done right.`, subheadline: "No fluff, no overhead.", body: `Simple setup, immediate utility: ${desc}.`, cta: "Get Started →", proof: "1-click install", badge: "MINIMALIST" },
    social:     { headline: `Join the ${shortProduct} Community`, subheadline: "120,000+ builders, one mission", body: `Collaborate with a global network sharing best practices for ${desc}.`, cta: "Join the Community →", proof: "120,000+ active members", badge: "COMMUNITY FIRST" },
    risk:       { headline: `Try ${shortProduct} Risk-Free for 60 Days`, subheadline: "100% money-back guarantee", body: `Deploy ${desc} with confidence. If you don't see results in 30 days, full refund — no questions.`, cta: "Start Risk-Free →", proof: "SOC2 Certified & GDPR Compliant", badge: "100% SECURE" },
    pioneer:    { headline: `Get Early Access to ${shortProduct}`, subheadline: "Be first in your market", body: `50 pioneering teams selected for our private cohort. ${desc} — deploy tomorrow's tech today.`, cta: "Request Early Access →", proof: "Limited to 50 slots, Q3 cohort", badge: "EXCLUSIVITY" },
    practical:  { headline: `Up & Running in 3 Minutes`, subheadline: "Zero config, zero learning curve", body: `Connect your tools, pick a preset, and watch ${desc} handle the rest. It just works.`, cta: "Install Now →", proof: "Average setup: 2.8 minutes", badge: "EASY START" },
  };
}

// ─── STREAMDECODER HOOK ───────────────────────────────────────────────────────
function useStreamDecoder(enabled, sessionId, identityHint, backendStatus, setBackendStatus, onBackendIntervention) {
  const intentMatrix = useRef({ hover: 0, scroll: 0, highlight: 0, pause: 0 });
  const lastScroll = useRef(window.scrollY);
  const unsentHoverDurations = useRef({});
  const unsentSelections = useRef([]);
  const unsentScrollVelocity = useRef([]);
  const currentHover = useRef({ elementId: null, startTime: null });

  useEffect(() => {
    if (!enabled) { setBackendStatus("disconnected"); intentMatrix.current = { hover: 0, scroll: 0, highlight: 0, pause: 0 }; }
  }, [enabled, setBackendStatus]);

  useEffect(() => {
    if (!enabled) return;
    setBackendStatus("connected");
    const onScroll = () => { const d = window.scrollY - lastScroll.current; lastScroll.current = window.scrollY; if (Math.abs(d) > 5) { unsentScrollVelocity.current.push(d); intentMatrix.current.scroll++; } };
    const onSelect = () => { const s = window.getSelection()?.toString()?.trim(); if (s && s.length > 3 && !unsentSelections.current.includes(s)) { unsentSelections.current.push(s); intentMatrix.current.highlight++; } };
    const getEId = (el) => { if (!el) return "page"; if (el.id) return el.id; if (el.tagName === "BUTTON") return `button:${el.innerText.slice(0,15)}`; return el.tagName.toLowerCase(); };
    const onOver = (e) => { const id = getEId(e.target); if (currentHover.current.elementId !== id) { if (currentHover.current.elementId && currentHover.current.startTime) { const dur = (Date.now() - currentHover.current.startTime) / 1000; if (dur > 0.1) unsentHoverDurations.current[currentHover.current.elementId] = (unsentHoverDurations.current[currentHover.current.elementId] || 0) + dur; } currentHover.current = { elementId: id, startTime: Date.now() }; intentMatrix.current.hover++; } };
    const onOut = () => { if (currentHover.current.elementId && currentHover.current.startTime) { const dur = (Date.now() - currentHover.current.startTime) / 1000; if (dur > 0.1) unsentHoverDurations.current[currentHover.current.elementId] = (unsentHoverDurations.current[currentHover.current.elementId] || 0) + dur; currentHover.current = { elementId: null, startTime: null }; } };
    let lastMove = Date.now();
    const onMouseMove = () => { lastMove = Date.now(); };
    const pauseCheck = setInterval(() => { if (Date.now() - lastMove > 3000) intentMatrix.current.pause++; }, 1000);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("selectionchange", onSelect);
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mouseout", onOut, { passive: true });
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    const streamInterval = setInterval(() => {
      if (currentHover.current.elementId && currentHover.current.startTime) { const dur = (Date.now() - currentHover.current.startTime) / 1000; if (dur > 0.1) { unsentHoverDurations.current[currentHover.current.elementId] = (unsentHoverDurations.current[currentHover.current.elementId] || 0) + dur; currentHover.current.startTime = Date.now(); } }
      const packet = { session_id: sessionId, identity_hint: identityHint === "none" ? null : identityHint, hover_durations: { ...unsentHoverDurations.current }, text_selections: [...unsentSelections.current], scroll_velocity: [...unsentScrollVelocity.current], timestamp: Date.now() / 1000 };
      unsentHoverDurations.current = {}; unsentSelections.current = []; unsentScrollVelocity.current = [];
      fetch("http://localhost:8000/ingest", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(packet) }).then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); }).then(d => { setBackendStatus("connected"); if (d.trigger) onBackendIntervention(d); }).catch(() => setBackendStatus("error"));
    }, 1500);
    return () => { window.removeEventListener("scroll", onScroll); document.removeEventListener("selectionchange", onSelect); window.removeEventListener("mouseover", onOver); window.removeEventListener("mouseout", onOut); window.removeEventListener("mousemove", onMouseMove); clearInterval(pauseCheck); clearInterval(streamInterval); };
  }, [enabled, sessionId, identityHint, setBackendStatus, onBackendIntervention]);

  return intentMatrix;
}

// ─── SLIDER COMPONENT ─────────────────────────────────────────────────────────
function FeatureSlider({ feature, value, onChange }) {
  const imp = FEATURE_IMPORTANCES[feature.key] || 0;
  const impPct = Math.round(imp * 100);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <span style={{ color: T.ink, fontSize: 12, fontWeight: 700 }}>{feature.label}</span>
          <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 3, background: imp > 0.09 ? T.goldBg : T.void, color: imp > 0.09 ? T.gold : T.soft, border: `1px solid ${imp > 0.09 ? T.gold : T.border}` }}>{impPct}% weight</span>
        </div>
        <span style={{ fontSize: 14, fontWeight: 800, color: T.accent, minWidth: 28, textAlign: "right" }}>{value}</span>
      </div>
      <p style={{ margin: 0, color: T.soft, fontSize: 11, lineHeight: 1.4 }}>{feature.desc}</p>
      <div style={{ position: "relative" }}>
        <input type="range" min={1} max={5} step={0.1} value={value} onChange={e => onChange(parseFloat(e.target.value))} style={{ width: "100%", accentColor: T.accent, cursor: "pointer", height: 4 }} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
          <span style={{ fontSize: 10, color: T.muted }}>{feature.lo}</span>
          <span style={{ fontSize: 10, color: T.muted }}>{feature.hi}</span>
        </div>
      </div>
    </div>
  );
}

// ─── CONFIDENCE BAR ───────────────────────────────────────────────────────────
function ConfidenceBar({ persona, conf, rank }) {
  const p = PERSONA_MAP[persona];
  if (!p) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: rank < 9 ? `1px solid ${T.border}` : "none", opacity: rank === 0 ? 1 : 0.75 + (0.25 * (1 - rank / 10)) }}>
      <span style={{ fontSize: 14, width: 22, textAlign: "center" }}>{p.icon}</span>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, fontWeight: rank === 0 ? 800 : 600, color: rank === 0 ? T.ink : T.text }}>{p.label}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: rank === 0 ? p.color : T.soft }}>{(conf * 100).toFixed(1)}%</span>
        </div>
        <div style={{ height: 5, background: T.border, borderRadius: 3 }}>
          <div style={{ height: "100%", borderRadius: 3, width: `${conf * 100}%`, background: rank === 0 ? p.color : rank === 1 ? T.accent : T.muted, transition: "width 0.5s ease" }} />
        </div>
      </div>
    </div>
  );
}

// ─── CUSTOMER PROFILER TAB (DYNAMIC API IMPLEMENTATION) ───────────────────────
function CustomerProfilerTab({ productDesc }) {
  const defaultValues = Object.fromEntries(FEATURES.map(f => [f.key, 3.0]));
  const [values, setValues] = useState(defaultValues);
  const [result, setResult] = useState(null);
  const [classifying, setClassifying] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [history, setHistory] = useState([]);

  const classify = async () => {
    setClassifying(true);
    const featureVector = FEATURES.map(f => values[f.key]);

    const scores = classifyPersona(featureVector);
    const primaryPersona = PERSONA_MAP[scores[0].id];
    const secondaryPersona = PERSONA_MAP[scores[1].id];

    let messageBody = "";

    try {
      const response = await fetch("http://localhost:8000/generate-outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName || "Prospect",
          product_desc: productDesc || "our structural pipeline optimization layer",
          primary_label: primaryPersona.label,
          primary_desc: primaryPersona.desc,
          secondary_label: secondaryPersona.label,
          secondary_desc: secondaryPersona.desc
        })
      });
      if (!response.ok) throw new Error("Outreach request failed on the backend.");
      const data = await response.json();
      if (data.message) {
        messageBody = data.message;
      } else {
        throw new Error("Invalid response format from backend.");
      }
    } catch (err) {
      console.error("Outreach generation failed:", err);
      messageBody = `❌ Generation Failed: ${err.message || "Please check your backend logs."}`;
    }

    const resultObj = {
      name: customerName || `Customer #${history.length + 1}`,
      timestamp: new Date().toLocaleTimeString(),
      scores,
      primaryPersona,
      secondaryPersona,
      messageBody,
      featureSnapshot: { ...values },
    };

    setResult(resultObj);
    setHistory(h => [resultObj, ...h.slice(0, 4)]);
    setClassifying(false);
  };

  const reset = () => {
    setValues(defaultValues);
    setResult(null);
    setCustomerName("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 1100, margin: "0 auto" }}>
      <div>
        <h2 style={{ margin: 0, color: T.accent, fontSize: 24, fontWeight: 800, letterSpacing: "-0.01em" }}>Customer Persona Classifier</h2>
        <p style={{ margin: "6px 0 0", color: T.soft, fontSize: 13, lineHeight: 1.6 }}>Enter customer attributes to compute primary and secondary persona nodes. The system pulls credentials directly from your environment layout to generate target outreach blueprints linked to your active product context.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 24, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: T.goldBg, border: `1px solid ${T.gold}`, borderRadius: 8, padding: 16 }}>
            <div style={{ color: T.gold, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Linked Product Context</div>
            <div style={{ color: productDesc ? T.ink : T.soft, fontSize: 13, fontStyle: productDesc ? "normal" : "italic", lineHeight: 1.5 }}>
              {productDesc || "No specific product context provided in Tab 1. Defaulting to general capability parameters."}
            </div>
          </div>
          
          <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, padding: 20 }}>
            <div style={{ color: T.ink, fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Customer Identifier</div>
            <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="e.g. John D., Lead #447..." style={{ width: "100%", background: T.void, border: `1px solid ${T.border}`, borderRadius: 6, padding: "10px 14px", color: T.ink, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box", outline: "none" }} />
          </div>

          {[
            { group: "Decision Psychology", keys: ["decision_speed", "research_depth", "risk_tolerance"] },
            { group: "Social Motivators", keys: ["social_proof_importance", "community_importance", "emotional_resonance"] },
            { group: "Value Orientation", keys: ["price_sensitivity", "roi_focus", "budget_range"] },
            { group: "Product Preferences", keys: ["tech_comfort", "novelty_preference", "simplicity_preference"] },
          ].map(({ group, keys }) => (
            <div key={group} style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, padding: 20 }}>
              <div style={{ color: T.accent, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16, paddingBottom: 10, borderBottom: `1px solid ${T.border}` }}>{group}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {keys.map(key => {
                  const feat = FEATURES.find(f => f.key === key);
                  return feat ? <FeatureSlider key={key} feature={feat} value={values[key]} onChange={v => setValues(prev => ({ ...prev, [key]: v }))} /> : null;
                })}
              </div>
            </div>
          ))}

          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={classify} disabled={classifying} style={{ flex: 1, padding: "13px 24px", borderRadius: 6, border: "none", background: classifying ? T.muted : T.accent, color: "#fff", fontWeight: 700, fontSize: 13, cursor: classifying ? "default" : "pointer" }}>{classifying ? "Generating AI Response..." : "🧠 Analyze and Generate Target Copy →"}</button>
            <button onClick={reset} style={{ padding: "13px 20px", borderRadius: 6, border: `1px solid ${T.border}`, background: T.panel, color: T.soft, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Reset</button>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {result ? (
            <>
              <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, padding: 20, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: result.primaryPersona.color }} />
                <div style={{ fontSize: 10, fontWeight: 800, color: T.soft, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>{result.name} · Core Segment Classification</div>
                
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${T.void}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 20, background: T.void, padding: 6, borderRadius: 6 }}>{result.primaryPersona.icon}</span>
                    <div>
                      <div style={{ color: T.ink, fontSize: 13, fontWeight: 800 }}>Primary: {result.primaryPersona.label}</div>
                      <div style={{ color: T.soft, fontSize: 11 }}>{result.primaryPersona.desc}</div>
                    </div>
                  </div>
                  <span style={{ color: result.primaryPersona.color, fontWeight: 900, fontSize: 15 }}>{(result.scores[0].conf * 100).toFixed(1)}%</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 20, background: T.void, padding: 6, borderRadius: 6 }}>{result.secondaryPersona.icon}</span>
                    <div>
                      <div style={{ color: T.ink, fontSize: 13, fontWeight: 700 }}>Secondary: {result.secondaryPersona.label}</div>
                      <div style={{ color: T.soft, fontSize: 11 }}>{result.secondaryPersona.desc}</div>
                    </div>
                  </div>
                  <span style={{ color: T.accent, fontWeight: 700, fontSize: 14 }}>{(result.scores[1].conf * 100).toFixed(1)}%</span>
                </div>
              </div>

              <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: T.gold, textTransform: "uppercase", letterSpacing: "0.06em" }}>✨ Adaptively Generated Outreach Bundle</div>
                </div>

                <div style={{ background: T.void, border: `1px solid ${T.border}`, borderRadius: 6, padding: 14 }}>
                  <pre style={{ margin: 0, fontSize: 13, color: result.messageBody.includes("❌") ? T.red : T.text, whiteSpace: "pre-wrap", fontFamily: "inherit", lineHeight: 1.6 }}>{result.messageBody}</pre>
                </div>
              </div>

              <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, padding: 20 }}>
                <div style={{ color: T.ink, fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Confidence Distribution</div>
                {result.scores.map((s, i) => <ConfidenceBar key={s.id} persona={s.id} conf={s.conf} rank={i} />)}
              </div>
            </>
          ) : (
            <div style={{ background: T.panel, border: `1px dashed ${T.border}`, borderRadius: 8, padding: 40, textAlign: "center", display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 36 }}>🎯</span>
              <div style={{ color: T.ink, fontWeight: 700, fontSize: 14 }}>No parameters classified</div>
              <div style={{ color: T.soft, fontSize: 12, lineHeight: 1.5 }}>Adjust configuration sliders to map client behavioral attributes into outreach variants.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── AD CARD ──────────────────────────────────────────────────────────────────
function AdCard({ persona, copy, loading, onClick }) {
  return (
    <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, padding: "24px", display: "flex", flexDirection: "column", gap: 14, position: "relative", overflow: "hidden", transition: "all 0.2s ease-in-out", cursor: copy ? "pointer" : "default", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }} onClick={copy ? onClick : undefined} onMouseEnter={e => { if (copy) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = T.gold; } }} onMouseLeave={e => { if (copy) { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = T.border; } }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: persona.color }} />
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 18, background: T.void, padding: 6, borderRadius: 4 }}>{persona.icon}</span>
        <div>
          <div style={{ color: T.ink, fontSize: 13, fontWeight: 700 }}>{persona.label}</div>
          <div style={{ color: T.soft, fontSize: 11 }}>{persona.desc}</div>
        </div>
      </div>
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[90, 75, 95, 60].map((w, i) => <div key={i} style={{ height: i === 0 ? 16 : 11, width: `${w}%`, borderRadius: 4, background: `linear-gradient(90deg, ${T.void}, ${T.border}, ${T.void})`, backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />)}
        </div>
      ) : copy ? (
        <>
          {copy.badge && <span style={{ alignSelf: "flex-start", background: T.goldBg, color: T.gold, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4 }}>{copy.badge}</span>}
          <div style={{ color: T.accent, fontSize: 16, fontWeight: 800 }}>{copy.headline}</div>
          {copy.subheadline && <div style={{ color: T.ink, fontSize: 13, fontWeight: 600 }}>{copy.subheadline}</div>}
          <div style={{ color: T.text, fontSize: 13, lineHeight: 1.6 }}>{copy.body}</div>
          {copy.proof && <div style={{ background: T.void, borderRadius: 4, padding: "10px 12px", color: T.ink, fontSize: 12, borderLeft: `3px solid ${T.gold}`, fontWeight: 500 }}>{copy.proof}</div>}
        </>
      ) : (
        <div style={{ color: T.muted, fontSize: 13, textAlign: "center", padding: "20px 0", border: `1px dashed ${T.border}`, borderRadius: 6 }}>Awaiting baseline configuration…</div>
      )}
    </div>
  );
}

// ─── STREAMDECODER PANEL ──────────────────────────────────────────────────────
function StreamDecoderPanel({ matrix, enabled, onToggle, identityHint, setIdentityHint, backendStatus, activeIntervention, sessionId }) {
  const signals = [
    { label: "Hover Bursts", key: "hover", icon: "🖱️", color: T.accent },
    { label: "Erratic Scrolls", key: "scroll", icon: "📜", color: T.orange },
    { label: "Text Highlights", key: "highlight", icon: "✏️", color: T.gold },
    { label: "Long Pauses", key: "pause", icon: "⏸️", color: T.green },
  ];
  const score = Object.values(matrix.current || {}).reduce((a, b) => a + b, 0);
  return (
    <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ color: T.ink, fontSize: 15, fontWeight: 700 }}>Telemetry Collection Array</div>
          <div style={{ color: T.soft, fontSize: 12 }}>Implicit user friction log indexes</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <select value={identityHint} onChange={e => setIdentityHint(e.target.value)} style={{ background: T.void, color: T.ink, border: `1px solid ${T.border}`, borderRadius: 4, padding: "6px 12px", fontSize: 12, outline: "none", cursor: "pointer" }}>
            <option value="none">👤 Anonymous Pipeline</option>
            <option value="cookie_abc123">🥈 cookie_abc123 (Silver)</option>
            <option value="cookie_def456">🥇 cookie_def456 (Gold)</option>
            <option value="device_xyz789">🥈 device_xyz789 (Silver)</option>
          </select>
          <button onClick={onToggle} style={{ background: enabled ? T.goldBg : T.void, border: `1px solid ${enabled ? T.gold : T.border}`, borderRadius: 4, padding: "6px 14px", color: enabled ? T.gold : T.soft, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
            {enabled ? "SYSTEM ON" : "OFFLINE"}
          </button>
        </div>
      </div>
      <div style={{ background: T.void, borderRadius: 6, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid ${T.border}` }}>
        <div><span style={{ color: T.soft, fontSize: 10, textTransform: "uppercase" }}>Session Token</span><br /><span style={{ fontSize: 12, color: T.accent, fontFamily: "monospace", fontWeight: 600 }}>{sessionId.slice(0, 15)}...</span></div>
        <div style={{ textAlign: "right" }}><span style={{ color: T.soft, fontSize: 10, textTransform: "uppercase" }}>Backend</span><br /><span style={{ fontSize: 11, fontWeight: 800, color: backendStatus === "connected" ? T.green : backendStatus === "error" ? T.red : T.soft }}>{backendStatus === "connected" ? "STABLE" : backendStatus === "error" ? "FAULT" : "DISCONNECTED"}</span></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {signals.map(s => {
          const val = (matrix.current || {})[s.key] || 0;
          return (
            <div key={s.key} style={{ background: T.void, borderRadius: 6, padding: "12px", border: `1px solid ${val > 3 ? s.color : T.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: T.soft }}>{s.icon} {s.label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>{val}</span>
              </div>
              <div style={{ marginTop: 8, height: 4, background: T.border, borderRadius: 2 }}>
                <div style={{ height: "100%", borderRadius: 2, width: `${Math.min(val * 12, 100)}%`, background: s.color, transition: "width 0.4s ease" }} />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ background: T.void, borderRadius: 6, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid ${T.border}` }}>
        <span style={{ color: T.text, fontSize: 13, fontWeight: 600 }}>Matrix Friction Delta</span>
        <span style={{ fontSize: 20, fontWeight: 900, color: score > 14 ? T.red : score > 8 ? T.orange : T.green }}>{score}</span>
      </div>
    </div>
  );
}

// ─── FRICTION OVERLAY ─────────────────────────────────────────────────────────
function FrictionOverlay({ friction, intervention, onDismiss }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const type = intervention?.intervention_type || "promo_banner";
  const payload = intervention?.payload || { icon: "%", message: "Still deciding? Here's 10% off.", discount_code: "STAY10" };
  const [chatLog, setChatLog] = useState([{ role: "bot", text: payload.message || "Hey! How can I help you today?" }]);
  const [typing, setTyping] = useState(false);
  const send = async () => {
    if (!msg.trim()) return;
    const userMsg = msg.trim(); setMsg(""); setChatLog(l => [...l, { role: "user", text: userMsg }]); setTyping(true);
    setTimeout(() => { setChatLog(l => [...l, { role: "bot", text: "That's a great question! Let me connect you with support." }]); setTyping(false); }, 800);
  };
  const copy = (t) => { navigator.clipboard.writeText(t); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
      {chatOpen && type === "chatbot" && (
        <div style={{ width: 320, background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, overflow: "hidden", boxShadow: "0 12px 30px rgba(0,0,0,0.08)" }}>
          <div style={{ background: T.accent, padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>Support Chat</div>
            <button onClick={() => setChatOpen(false)} style={{ background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer" }}>×</button>
          </div>
          <div style={{ height: 200, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8, background: T.void }}>
            {chatLog.map((m, i) => <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", background: m.role === "user" ? T.gold : T.panel, color: m.role === "user" ? "#fff" : T.ink, border: m.role === "user" ? "none" : `1px solid ${T.border}`, borderRadius: 4, padding: "8px 12px", fontSize: 13, maxWidth: "80%" }}>{m.text}</div>)}
            {typing && <div style={{ color: T.soft, fontSize: 12, padding: "4px 8px" }}>Typing…</div>}
          </div>
          <div style={{ padding: 12, borderTop: `1px solid ${T.border}`, display: "flex", gap: 8 }}>
            <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask a question..." style={{ flex: 1, background: T.void, border: `1px solid ${T.border}`, borderRadius: 4, padding: "8px 12px", color: T.ink, fontSize: 13, outline: "none" }} />
            <button onClick={send} style={{ background: T.accent, border: "none", borderRadius: 4, padding: "8px 12px", color: "#fff", fontWeight: 700, cursor: "pointer" }}>→</button>
          </div>
        </div>
      )}
      {!chatOpen && (type === "promo_banner" || type === "loyalty_perk") && (
        <div style={{ width: 300, background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, padding: "16px", boxShadow: "0 8px 24px rgba(0,0,0,0.06)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: type === "loyalty_perk" ? T.gold : T.orange }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <span style={{ color: T.ink, fontSize: 13, fontWeight: 700 }}>{type === "loyalty_perk" ? "Loyalty Perk" : "Special Offer"}</span>
            <button onClick={onDismiss} style={{ background: "none", border: "none", color: T.soft, fontSize: 18, cursor: "pointer" }}>×</button>
          </div>
          <p style={{ margin: "0 0 10px", fontSize: 12, color: T.text, lineHeight: 1.5 }}>{payload.message}</p>
          {(payload.discount_code || payload.perk_code) && (
            <div style={{ display: "flex", background: T.void, border: `1px solid ${T.border}`, borderRadius: 4, padding: 6, alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "monospace", color: T.accent, fontSize: 13, marginLeft: 8, fontWeight: 700 }}>{payload.discount_code || payload.perk_code}</span>
              <button onClick={() => copy(payload.discount_code || payload.perk_code)} style={{ background: T.gold, border: "none", borderRadius: 4, color: "#fff", padding: "5px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{copied ? "Copied" : "Copy"}</button>
            </div>
          )}
        </div>
      )}
      <button onClick={() => { if (type === "chatbot") setChatOpen(true); else copy(payload.discount_code || payload.perk_code); }} style={{ background: type === "loyalty_perk" ? T.gold : type === "promo_banner" ? T.orange : T.accent, border: "none", borderRadius: 50, width: 48, height: 48, color: "#fff", cursor: "pointer", fontSize: 18, boxShadow: "0 6px 16px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {type === "chatbot" ? "💬" : type === "loyalty_perk" ? "★" : "%"}
      </button>
    </div>
  );
}

// ─── ROI SANDBOX ──────────────────────────────────────────────────────────────
function RoiCalculatorSandbox() {
  const [teams, setTeams] = useState(15);
  return (
    <div style={{ background: T.void, borderRadius: 6, padding: 16, border: `1px solid ${T.border}`, display: "flex", flexDirection: "column", gap: 12 }}>
      <strong style={{ color: T.ink, fontSize: 12, fontWeight: 700 }}>💰 Scaled Cost Mapping:</strong>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
        <span>Nodes: <strong>{teams}</strong></span>
        <span style={{ color: T.green, fontWeight: 700 }}>Yield: <strong>${teams * 360}/mo</strong></span>
      </div>
      <input type="range" min="5" max="100" value={teams} onChange={e => setTeams(parseInt(e.target.value))} style={{ width: "100%", accentColor: T.accent, cursor: "pointer" }} />
    </div>
  );
}

// ─── MAIN APP SYSTEM ENTRY ────────────────────────────────────────────────────
export default function App() {
  const [product, setProduct] = useState("");
  const [copies, setCopies] = useState({});
  const [loading, setLoading] = useState({});
  const [generated, setGenerated] = useState(false);
  const [friction, setFriction] = useState(null);
  const [decoderEnabled, setDecoderEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState("chameleon");
  const [sessionId] = useState(() => "session_" + Math.random().toString(36).substring(2, 11));
  const [identityHint, setIdentityHint] = useState("none");
  const [backendStatus, setBackendStatus] = useState("disconnected");
  const [activeIntervention, setActiveIntervention] = useState(null);
  const [selectedAd, setSelectedAd] = useState(null);

  const matrix = useStreamDecoder(
    decoderEnabled, sessionId, identityHint, backendStatus, setBackendStatus,
    useCallback((intervention) => { setActiveIntervention(intervention); setFriction({ score: 15, backend: true }); }, [])
  );

  const generate = async () => {
    if (!product.trim()) return;
    setGenerated(true); setCopies({});
    const lm = {}; PERSONAS.forEach(p => lm[p.id] = true); setLoading(lm);
    try {
      const res = await fetch("http://localhost:8000/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product }) });
      if (!res.ok) throw new Error();
      setCopies(await res.json());
    } catch {
      setCopies(getDynamicTemplates(product));
    } finally {
      const lm2 = {}; PERSONAS.forEach(p => lm2[p.id] = false); setLoading(lm2);
    }
  };

  const TABS = [
    ["chameleon", "Variant Personalization Matrix"],
    ["profiler",  "Customer Persona Classifier"],
    ["decoder",   "StreamDecoder Metrics"],
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.void, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", color: T.text, paddingBottom: 60 }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; }
        input[type="text"]:focus, textarea:focus { border-color: ${T.gold} !important; box-shadow: 0 0 0 2px ${T.goldBg} !important; outline: none; }
      `}</style>

      {/* Navigation Bar */}
      <div style={{ borderBottom: `1px solid ${T.border}`, padding: "0 32px", background: T.panel }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <div style={{ width: 12, height: 12, background: T.accent, borderRadius: "50%" }} />
            <div style={{ color: T.ink, fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em" }}>Social Chameleon</div>
          </div>
          <div style={{ display: "flex", gap: 4, background: T.void, borderRadius: 6, padding: 3, border: `1px solid ${T.border}` }}>
            {TABS.map(([id, label]) => (
              <button key={id} onClick={() => setActiveTab(id)} style={{ padding: "6px 14px", borderRadius: 4, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: activeTab === id ? T.accent : "transparent", color: activeTab === id ? "#fff" : T.soft, transition: "all 0.1s ease", whiteSpace: "nowrap" }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 32px" }}>

        {/* ── CHAMELEON TAB ── */}
        {activeTab === "chameleon" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
            <div style={{ textAlign: "center" }}>
              <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: T.accent, letterSpacing: "-0.02em" }}>Algorithmic Copy Variant Architectures</h1>
            </div>
            <div style={{ maxWidth: 680, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
              <textarea value={product} onChange={e => setProduct(e.target.value)} placeholder="Insert corporate target abstract or baseline service value proposition…" rows={4} style={{ width: "100%", background: T.panel, border: `1px solid ${T.border}`, borderRadius: 6, padding: "14px 18px", color: T.ink, fontSize: 13, resize: "none", fontFamily: "inherit", lineHeight: 1.6 }} />
              <button onClick={generate} disabled={!product.trim()} style={{ padding: "12px 24px", borderRadius: 6, border: "none", background: product.trim() ? T.accent : T.muted, color: "#fff", fontWeight: 600, fontSize: 13, cursor: product.trim() ? "pointer" : "default" }}>Compile Parameter Variations</button>
            </div>
            {generated && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20, animation: "fadeIn 0.3s ease" }}>
                {PERSONAS.map(persona => (
                  <AdCard key={persona.id} persona={persona} copy={copies[persona.id]} loading={loading[persona.id]} onClick={() => setSelectedAd({ persona, copy: copies[persona.id] })} />
                ))}
              </div>
            )}
            {!generated && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
                {PERSONAS.map(p => (
                  <div key={p.id} style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 6, padding: "14px", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 16, background: T.void, padding: 4, borderRadius: 4 }}>{p.icon}</span>
                    <div>
                      <div style={{ color: T.ink, fontSize: 12, fontWeight: 700 }}>{p.label}</div>
                      <div style={{ color: T.soft, fontSize: 11 }}>{p.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PROFILER TAB ── */}
        {activeTab === "profiler" && (
          <CustomerProfilerTab productDesc={product} />
        )}

        {/* ── DECODER TAB ── */}
        {activeTab === "decoder" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 760, margin: "0 auto" }}>
            <div>
              <h2 style={{ margin: 0, color: T.accent, fontSize: 24, fontWeight: 800 }}>StreamDecoder Matrix Arrays</h2>
              <p style={{ color: T.soft, marginTop: 6, fontSize: 13, lineHeight: 1.6 }}>Intercepts user drop-offs via scrolling shifts, highlighting, and pause events.</p>
            </div>
            <StreamDecoderPanel matrix={matrix} enabled={decoderEnabled} onToggle={() => setDecoderEnabled(e => !e)} identityHint={identityHint} setIdentityHint={setIdentityHint} backendStatus={backendStatus} activeIntervention={activeIntervention} sessionId={sessionId} />
            <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 6, padding: 20 }}>
              <div style={{ color: T.ink, fontWeight: 700, fontSize: 13, marginBottom: 14 }}>Intercept Sequence Drivers</div>
              {[
                ["Oscillate cursor over content blocks", "Spikes hover duration values"],
                ["Drag highlight across UI text", "Fires selection tracking triggers"],
                ["Cease activity for 3s", "Registers friction pause state"],
                ["High-frequency vertical scrolling", "Increments velocity array metrics"],
              ].map(([action, result]) => (
                <div key={action} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>→ {action}</span>
                  <span style={{ fontSize: 12, color: T.soft, fontFamily: "monospace" }}>{result}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {friction && decoderEnabled && (
        <FrictionOverlay friction={friction} intervention={activeIntervention} onDismiss={() => { setFriction(null); setActiveIntervention(null); }} />
      )}

      {/* Ad detail modal */}
      {selectedAd && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(70,77,105,0.25)", backdropFilter: "blur(4px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, animation: "fadeIn 0.15s ease" }}>
          <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, maxWidth: 680, width: "100%", overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}>
            <div style={{ background: T.accent, padding: "20px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: T.gold }}>Variant: {selectedAd.persona.label}</span>
                <h2 style={{ margin: "2px 0 0 0", color: "#fff", fontSize: 18, fontWeight: 800 }}>{selectedAd.copy.headline}</h2>
              </div>
              <button onClick={() => setSelectedAd(null)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16 }}>×</button>
            </div>
            <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ background: T.void, border: `1px solid ${T.border}`, borderRadius: 6, padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                <h3 style={{ margin: 0, color: T.accent, fontSize: 18, fontWeight: 800 }}>{selectedAd.copy.headline}</h3>
                {selectedAd.copy.subheadline && <p style={{ margin: 0, color: T.ink, fontSize: 13, fontWeight: 700 }}>{selectedAd.copy.subheadline}</p>}
                <p style={{ margin: 0, color: T.text, fontSize: 13, lineHeight: 1.6 }}>{selectedAd.copy.body}</p>
                {selectedAd.persona.id === "roi" && <RoiCalculatorSandbox />}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}