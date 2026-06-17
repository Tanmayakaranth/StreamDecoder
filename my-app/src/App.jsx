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
function useStreamDecoder(enabled, sessionId, identityHint, backendStatus, setBackendStatus, onBackendIntervention) {
  const intentMatrix = useRef({ hover: 0, scroll: 0, highlight: 0, pause: 0 });
  const lastScroll = useRef(window.scrollY);
  
  // Unsent event stores (delta updates)
  const unsentHoverDurations = useRef({});
  const unsentSelections = useRef([]);
  const unsentScrollVelocity = useRef([]);
  
  // Track currently hovered element
  const currentHover = useRef({ elementId: null, startTime: null });

  // Reset metrics if disabled
  useEffect(() => {
    if (!enabled) {
      setBackendStatus("disconnected");
      intentMatrix.current = { hover: 0, scroll: 0, highlight: 0, pause: 0 };
    }
  }, [enabled, setBackendStatus]);

  useEffect(() => {
    if (!enabled) return;

    setBackendStatus("connected");

    // Track scroll events (capture directional velocity)
    const onScroll = () => {
      const currentScroll = window.scrollY;
      const delta = currentScroll - lastScroll.current;
      lastScroll.current = currentScroll;
      
      if (Math.abs(delta) > 5) {
        unsentScrollVelocity.current.push(delta);
        intentMatrix.current.scroll++;
      }
    };

    // Track text selection
    const onSelect = () => {
      const sel = window.getSelection()?.toString()?.trim();
      if (sel && sel.length > 3) {
        if (!unsentSelections.current.includes(sel)) {
          unsentSelections.current.push(sel);
          intentMatrix.current.highlight++;
        }
      }
    };

    // Track element hovers (precise enter/exit duration)
    const getElementId = (el) => {
      if (!el) return "page";
      if (el.id) return el.id;
      if (el.tagName === "BUTTON") return `button:${el.innerText.slice(0, 15).trim()}`;
      if (el.tagName === "TEXTAREA") return "textarea:product";
      if (el.tagName === "INPUT") return `input:${el.placeholder || el.name}`;
      if (el.tagName === "A") return `link:${el.innerText.slice(0, 15).trim()}`;
      
      let parent = el.parentElement;
      for (let i = 0; i < 3 && parent; i++) {
        if (parent.id) return `${parent.id}:${el.tagName.toLowerCase()}`;
        parent = parent.parentElement;
      }
      return el.tagName.toLowerCase();
    };

    const onMouseOver = (e) => {
      const elId = getElementId(e.target);
      if (currentHover.current.elementId !== elId) {
        if (currentHover.current.elementId && currentHover.current.startTime) {
          const duration = (Date.now() - currentHover.current.startTime) / 1000;
          if (duration > 0.1) {
            unsentHoverDurations.current[currentHover.current.elementId] = 
              (unsentHoverDurations.current[currentHover.current.elementId] || 0) + duration;
          }
        }
        currentHover.current = { elementId: elId, startTime: Date.now() };
        intentMatrix.current.hover++;
      }
    };

    const onMouseOut = () => {
      if (currentHover.current.elementId && currentHover.current.startTime) {
        const duration = (Date.now() - currentHover.current.startTime) / 1000;
        if (duration > 0.1) {
          unsentHoverDurations.current[currentHover.current.elementId] = 
            (unsentHoverDurations.current[currentHover.current.elementId] || 0) + duration;
        }
        currentHover.current = { elementId: null, startTime: null };
      }
    };

    // Track pauses
    let lastMove = Date.now();
    const onMouseMove = () => {
      lastMove = Date.now();
    };
    
    const pauseCheckInterval = setInterval(() => {
      if (Date.now() - lastMove > 3000) {
        intentMatrix.current.pause++;
      }
    }, 1000);

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("selectionchange", onSelect);
    window.addEventListener("mouseover", onMouseOver, { passive: true });
    window.addEventListener("mouseout", onMouseOut, { passive: true });
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // Stream loop
    const streamInterval = setInterval(() => {
      if (currentHover.current.elementId && currentHover.current.startTime) {
        const duration = (Date.now() - currentHover.current.startTime) / 1000;
        if (duration > 0.1) {
          unsentHoverDurations.current[currentHover.current.elementId] = 
            (unsentHoverDurations.current[currentHover.current.elementId] || 0) + duration;
          currentHover.current.startTime = Date.now();
        }
      }

      const packet = {
        session_id: sessionId,
        identity_hint: identityHint === "none" ? null : identityHint,
        hover_durations: { ...unsentHoverDurations.current },
        text_selections: [...unsentSelections.current],
        scroll_velocity: [...unsentScrollVelocity.current],
        timestamp: Date.now() / 1000
      };

      unsentHoverDurations.current = {};
      unsentSelections.current = [];
      unsentScrollVelocity.current = [];

      fetch("http://localhost:8000/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(packet)
      })
      .then(res => {
        if (!res.ok) throw new Error("HTTP error " + res.status);
        return res.json();
      })
      .then(data => {
        setBackendStatus("connected");
        if (data.trigger) {
          onBackendIntervention(data);
        }
      })
      .catch(err => {
        console.error("[StreamDecoder] Error sending to backend:", err);
        setBackendStatus("error");
      });
    }, 1500);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("selectionchange", onSelect);
      window.removeEventListener("mouseover", onMouseOver);
      window.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("mousemove", onMouseMove);
      clearInterval(pauseCheckInterval);
      clearInterval(streamInterval);
    };
  }, [enabled, sessionId, identityHint, setBackendStatus, onBackendIntervention]);

  return intentMatrix;
}

// ─── DYNAMIC MOCK AD COPY FALLBACKS ──────────────────────────────────────────
function getDynamicTemplates(productDesc) {
  const desc = productDesc?.trim() || "our solution";
  const lower = desc.toLowerCase();
  
  // Extract a clean product name (up to 3-4 words)
  let shortProduct = desc;
  const match = desc.match(/^([A-Za-z0-9\s'-]{3,30})(?:\s+(?:is|that|uses|helps|automates|allows|delivers|built for))\b/i);
  if (match && match[1]) {
    shortProduct = match[1].trim();
  } else if (desc.length > 25) {
    shortProduct = desc.split(" ").slice(0, 3).join(" ");
  }
  shortProduct = shortProduct.charAt(0).toUpperCase() + shortProduct.slice(1);

  // Classify topic to provide custom persona experiences
  let category = "general";
  if (lower.match(/coffee|food|cafe|restaurant|drink|bake|cook|chef|menu|tea|barista|dine|dining|kitchen/)) {
    category = "food";
  } else if (lower.match(/gym|fitness|health|workout|run|diet|doctor|med|exercise|body|train|yoga|wellness/)) {
    category = "health";
  } else if (lower.match(/shop|buy|store|commerce|sell|product|clothes|shoe|market|retail|apparel|boutique/)) {
    category = "shop";
  } else if (lower.match(/app|software|saas|tool|manage|prioritize|meeting|code|api|dev|database|platform|task/)) {
    category = "saas";
  }

  const templates = {
    food: {
      skeptic: {
        headline: `100% Organic Quality at ${shortProduct}`,
        subheadline: "Certified fresh ingredients, local suppliers",
        body: `Taste the difference with ${desc}. Our recipe uses zero artificial additives, ensuring authentic flavors crafted daily.`,
        cta: "Order Fresh Now →",
        proof: "Rated 4.9/5 by 800+ local foodies",
        badge: "VERIFIED FRESH"
      },
      roi: {
        headline: `Eat Better, Spend Less with ${shortProduct}`,
        subheadline: "Best value gourmet meals in the city",
        body: `Compare the cost: dining at ${desc} saves you money compared to grocery shopping and cooking time, without sacrificing taste.`,
        cta: "View Our Menu →",
        proof: "Meals starting at just $9.99",
        badge: "BEST VALUE"
      },
      trendy: {
        headline: `The New Spot Everyone is Reviewing`,
        subheadline: "Find out why tables are fully booked weeks ahead",
        body: `The word is out. Local food critics and foodies are raving about ${desc}. Reserve your spot today to taste our signature specials.`,
        cta: "Book a Table →",
        proof: "As featured in Local Eats Magazine",
        badge: "TRENDING SPOT"
      },
      emotional: {
        headline: `A Taste of Pure Comfort and Delight`,
        subheadline: "Made with love, served with a warm smile",
        body: `Remember when food made you feel at home? ${desc} brings back authentic culinary traditions, crafting meals that feed the soul.`,
        cta: "Explore Our Story",
        proof: "Family-owned & operated for 15 years",
        badge: "CRAFTED WITH CARE"
      },
      expert: {
        headline: `Artisanal Culinary Specs`,
        subheadline: "Precisely roasted beans and micro-foam texture",
        body: `For the connoisseur: ${desc} utilizes single-origin direct-trade arabica, roasted at precisely 205°C and extracted at 9 bars of pressure.`,
        cta: "Read Coffee Specs",
        proof: "Barista championship certified grade",
        badge: "BARISTA STANDARD"
      },
      minimalist: {
        headline: `Fresh coffee. Daily.`,
        subheadline: "No fluff, just roasting.",
        body: `Locally sourced beans, freshly brewed: ${desc}.`,
        cta: "Get Cup",
        proof: "Brewed in 90 seconds",
        badge: "MINIMAL"
      },
      social: {
        headline: `Your Local Neighborhood Hangout`,
        subheadline: "Where friends and creators gather daily",
        body: `Meet new people or focus on your work. ${desc} is a community hub designed to foster connection, warmth, and synergy.`,
        cta: "Find a Location →",
        proof: "Hosting weekly community open-mics",
        badge: "COMMUNITY HUB"
      },
      risk: {
        headline: `Love It or It's Free Guarantee`,
        subheadline: "We promise you'll love every single bite",
        body: `Try any item on our menu. If it's not the best cup or plate you've had this week, tell us and we will replace it or refund you on the spot.`,
        cta: "Order Risk-Free",
        proof: "100% Taste Satisfaction Guarantee",
        badge: "OUR PROMISE"
      },
      pioneer: {
        headline: `Join Our Secret Tasting Menu`,
        subheadline: "Get exclusive access to new recipes before release",
        body: `We are opening 30 spots for our chef's private beta testing cohort. Be the first to try our experimental plates and pairings.`,
        cta: "Apply for Invite",
        proof: "Only 30 slots available for Q3",
        badge: "VIP ENTRY"
      },
      practical: {
        headline: `Quick Pick-Up, No Long Lines`,
        subheadline: "Order ahead and grab it in 2 minutes",
        body: `Craving a quick bite? Simply customize your order on our digital portal, and grab it from the counter. Easy, fast, and fresh.`,
        cta: "Order Pick-Up",
        proof: "Average prep time under 3 minutes",
        badge: "EXPRESS LANE"
      }
    },
    health: {
      skeptic: {
        headline: `Scientifically Proven Results`,
        subheadline: "Clinically backed fitness methodologies",
        body: `Stop guessing. ${desc} is based on real physiological data, optimized to burn 30% more calories and increase core strength in 4 weeks.`,
        cta: "See Clinical Studies →",
        proof: "94% success rate reported in double-blind trials",
        badge: "CLINICALLY PROVEN"
      },
      roi: {
        headline: `Invest in Your Longevity Today`,
        subheadline: "Preventative wellness worth every penny",
        body: `Avoid future medical costs. ${desc} delivers high-yield health returns, enhancing your energy levels and focus for a fraction of gym fees.`,
        cta: "Start Your Investment",
        proof: "Save up to $1,200/year in healthcare premiums",
        badge: "HEALTH VALUE"
      },
      trendy: {
        headline: `The Workout System Going Viral`,
        subheadline: "See why active professionals are switching",
        body: `The reviews are everywhere. People are posting their incredible transformations online using ${desc}. Join the fitness movement now.`,
        cta: "Try Free Session",
        proof: "Over 5 million workouts completed",
        badge: "VIRAL FITNESS"
      },
      emotional: {
        headline: `Feel Strong, Energized, and Confident`,
        subheadline: "Awaken your potential and love your body",
        body: `It's not about numbers on a scale; it's about how you feel when you wake up. Rebuild your energy and mental clarity with ${desc}.`,
        cta: "Begin Your Journey",
        proof: "Loved by 8,000+ active members",
        badge: "HOLISTIC WELLNESS"
      },
      expert: {
        headline: `Bio-Mechanical Performance Specs`,
        subheadline: "Targeted heart-rate zone tracking",
        body: `Designed for athletes: ${desc} optimizes lactic thresholds and VO2 Max through tailored biometric resistance ranges. No guesswork.`,
        cta: "Analyze System Specs",
        proof: "Developed by certified kinesiologists",
        badge: "BIO-TECH GRADE"
      },
      minimalist: {
        headline: `Move better. Live longer.`,
        subheadline: "No fitness gimmicks.",
        body: `Biometric feedback, real-time results: ${desc}.`,
        cta: "Start Move",
        proof: "Requires 15 mins a day",
        badge: "ESSENTIAL"
      },
      social: {
        headline: `Join Our Fitness Family`,
        subheadline: "Build strength alongside supportive friends",
        body: `Group motivation makes the difference. With ${desc}, you'll train with a friendly community that cheers you on at every step.`,
        cta: "Find a Group →",
        proof: "Monthly team fitness challenges",
        badge: "COMMUNITY HUB"
      },
      risk: {
        headline: `Guaranteed Results in 30 Days`,
        subheadline: "Or your money back, no questions asked",
        body: `We guarantee you will feel more energetic and strong in the first month of using ${desc}, or we will issue a full refund instantly.`,
        cta: "Start Risk-Free",
        proof: "SOC-certified wellness standards",
        badge: "SATISFACTION GUARANTEED"
      },
      pioneer: {
        headline: `Join the Elite Athlete Program`,
        subheadline: "Exclusive beta testing for biometric wearable integration",
        body: `We are opening a limited group to test our new automated physiological tracking system. Train with cutting-edge tools first.`,
        cta: "Apply for Program",
        proof: "Strictly limited to 50 applicants",
        badge: "ELITE ACCESS"
      },
      practical: {
        headline: `Fits Easily into Your Busy Schedule`,
        subheadline: "15-minute workouts you can do anywhere",
        body: `No time for the gym? ${desc} is built for active lifestyles. Quick routines that deliver maximum results with zero gym equipment.`,
        cta: "Get Routine",
        proof: "Average setup time: 30 seconds",
        badge: "EASY START"
      }
    },
    shop: {
      skeptic: {
        headline: `Certified Premium Craftsmanship`,
        subheadline: "Grade-A materials, double-stitched durability",
        body: `Inspect the quality. ${desc} is made from premium, sustainably sourced materials designed to last 5x longer than standard alternatives.`,
        cta: "View Materials Report",
        proof: "Backed by 5-year replacement guarantee",
        badge: "PREMIUM GRADE"
      },
      roi: {
        headline: `Buy Quality Once, Save for Years`,
        subheadline: "Direct-to-consumer pricing, no retail markup",
        body: `Stop buying cheap replacements. Investing in ${desc} saves you money over time by delivering retail-grade excellence at wholesale value.`,
        cta: "Shop Direct Catalog",
        proof: "Average 60% savings compared to retail",
        badge: "DIRECT VALUE"
      },
      trendy: {
        headline: `The Season's Most Requested Item`,
        subheadline: "Selling out fast, limit 2 per customer",
        body: `The aesthetic upgrade your space needs. Influencers and designers are calling ${desc} the must-have product of the season.`,
        cta: "Claim Yours Today →",
        proof: "Limited quantity remaining in stock",
        badge: "SELLING FAST"
      },
      emotional: {
        headline: `Elevate Your Everyday Style`,
        subheadline: "Beautiful design that sparks joy in your home",
        body: `You deserve products that look as good as they function. Enhance your daily routine and express your personal style with ${desc}.`,
        cta: "Explore Collection",
        proof: "Handcrafted detailing in every piece",
        badge: "ARTISANAL"
      },
      expert: {
        headline: `Technical Material Specs`,
        subheadline: "High-density polymers and structural integrity",
        body: `For the specialist: ${desc} features a reinforced alloy frame, weather-resistant micro-weaves, and double anodized coatings.`,
        cta: "Read Material Spec",
        proof: "Tensile strength rating: 480 MPa",
        badge: "INDUSTRIAL GRADE"
      },
      minimalist: {
        headline: `Pure design. Pure utility.`,
        subheadline: "No clutter, no logos.",
        body: `Stark aesthetics, functional materials: ${desc}.`,
        cta: "Purchase Now",
        proof: "Ships in biodegradable packing",
        badge: "MINIMALIST"
      },
      social: {
        headline: `Loved by 100,000+ Conscious Buyers`,
        subheadline: "Join a global network supporting sustainable craft",
        body: `Every purchase of ${desc} supports ethical labor practices and environmental cleanups. Together, we're building a better market.`,
        cta: "Read Our Mission",
        proof: "1% of all revenue donated to planet cleanup",
        badge: "MISSION DRIVEN"
      },
      risk: {
        headline: `100% Love-It Guarantee`,
        subheadline: "Free returns and exchanges for 60 days",
        body: `Order ${desc} and try it out. If it doesn't fit your lifestyle or meet your standards, return it for a full refund. We pay return shipping.`,
        cta: "Order with Guarantee",
        proof: "Pre-paid return label included in box",
        badge: "RISK-FREE"
      },
      pioneer: {
        headline: `Access the Next Design Release`,
        subheadline: "Exclusive presale for our registered members",
        body: `Sign up for early catalog access. Members get 48 hours to purchase new limited-edition runs of ${desc} before they open to the public.`,
        cta: "Join Presale List",
        proof: "Presale cohorts limited to 100 slots",
        badge: "EARLY MEMBER"
      },
      practical: {
        headline: `Simple Delivery, Zero Assembly`,
        subheadline: "Unbox and enjoy in under 2 minutes",
        body: `No complex manuals or missing screws. ${desc} arrives fully assembled in protective, easy-open packaging. Ready to use immediately.`,
        cta: "Shop Now",
        proof: "Ships next business day",
        badge: "EXPRESS DELIVERY"
      }
    },
    saas: {
      skeptic: {
        headline: `Verified 41% Gains with ${shortProduct}`,
        subheadline: "Independent system performance audits",
        body: `Review the data. ${desc} is proven to automate system prioritizations, reduce synchronization latency, and reclaim up to 40% of operations.`,
        cta: "Download Audit Report →",
        proof: "4.9/5 stars based on 1,250 verified IT audits",
        badge: "AUDITED METRICS"
      },
      roi: {
        headline: `Save $5,400/Month Per Engineer using ${shortProduct}`,
        subheadline: "Full ROI achieved in under 30 days of setup",
        body: `Calculate the efficiency: deploying ${desc} automates standard developer overhead and eliminates manual status syncs. It pays for itself immediately.`,
        cta: "Calculate Your ROI →",
        proof: "Average 4.8x ROI across all software companies",
        badge: "ROI ADVANTAGE"
      },
      trendy: {
        headline: `The Upgrade All High-Growth Teams Are Talking About`,
        subheadline: "Join 45,000+ engineering teams automated this month",
        body: `FOMO is real. Modern engineering operations are moving away from manual queues to deploy ${desc}. Upgrade now before you fall behind.`,
        cta: "Upgrade Today →",
        proof: "Trending #1 on Product Hunt this week",
        badge: "MOST POPULAR"
      },
      emotional: {
        headline: `Write Code, Focus on What Matters`,
        subheadline: "Reclaim your creative focus and forget about ticket syncs",
        body: `Remember when programming was pure joy? Eliminate friction, reduce developer stress, and build the future with ${desc}.`,
        cta: "Start Your Journey →",
        proof: "Voted #1 Developer Platform for Team Happiness",
        badge: "PEACE OF MIND"
      },
      expert: {
        headline: `DAG Concurrency Specs for ${shortProduct}`,
        subheadline: "Built for zero-latency event loops",
        body: `Engineered for specialists: ${desc} resolves task dependency trees in memory with zero-copy async dispatches. No manual thread locks needed.`,
        cta: "Read API Specs →",
        proof: "Supports up to 10k ops/sec with sub-millisecond dispatch",
        badge: "DEVELOPER GRADE"
      },
      minimalist: {
        headline: `Auto-prioritize workflows. Reclaim 40% time.`,
        subheadline: "No fluff, no manual queues.",
        body: `Direct repository sync, immediate automation: ${desc}.`,
        cta: "Try it Now",
        proof: "1 click install",
        badge: "MINIMALIST"
      },
      social: {
        headline: `Welcome to the Developer Synergy Hub`,
        subheadline: "Where 120,000+ engineers build together",
        body: `You are not alone. Join a global network of engineers sharing recipes, custom webhooks, and automation templates for ${desc}.`,
        cta: "Join our Discord →",
        proof: "Active community of 120,000+ members",
        badge: "COMMUNITY FIRST"
      },
      risk: {
        headline: `Try ${shortProduct} Risk-Free for 60 Days`,
        subheadline: "100% money-back guarantee, no questions asked",
        body: `Deploy ${desc} with absolute security. If your team doesn't automate at least 20% of meeting overhead in the first month, it's free.`,
        cta: "Start Risk-Free Trial",
        proof: "SOC2 Type II Certified & Fully GDPR Compliant",
        badge: "100% SECURE"
      },
      pioneer: {
        headline: `Join the Autonomous Operations Beta`,
        subheadline: "Exclusive early access for registered teams",
        body: `We are selecting 50 pioneering engineering teams to join our private cohort for ${desc}. Claim your team's slot today.`,
        cta: "Apply for Beta Access",
        proof: "Limited to 50 slots for Q3 cohort",
        badge: "EXCLUSIVITY"
      },
      practical: {
        headline: `Up & Running in Exactly 3 Minutes`,
        subheadline: "Zero configurations, zero learning curves",
        body: `Connect your tools, select a preset recipe, and watch ${desc} handle the rest. No complex manual onboarding needed. It just works.`,
        cta: "Deploy in 3 Mins →",
        proof: "Average setup time: 2.8 minutes",
        badge: "EASY START"
      }
    },
    general: {
      skeptic: {
        headline: `Verified 41% Gains with ${shortProduct}`,
        subheadline: "Backed by 12 independent system audits",
        body: `Review the data. ${desc} is proven to reduce execution lag, eliminate operational friction, and streamline core processes by up to 40%.`,
        cta: "Download Audit Report →",
        proof: "4.9/5 stars based on 1,250 verified IT reviews",
        badge: "AUDITED METRICS"
      },
      trendy: {
        headline: `Everyone is Switching to ${shortProduct}`,
        subheadline: `Why 45,000+ teams migrated this month`,
        body: `Don't get left behind. High-growth teams are already using ${desc} to unlock modern workflows. Join the movement before it becomes legacy.`,
        cta: "Join the Wave →",
        proof: "Trending #1 on Product Hunt this week",
        badge: "MOST POPULAR"
      },
      roi: {
        headline: `Save $5,400/Mo per Seat using ${shortProduct}`,
        subheadline: "Full return on investment in under 30 days",
        body: `Calculate the financial return: deploying ${desc} redirects wasted manual hours into pure revenue-generating activity. It pays for itself immediately.`,
        cta: "Calculate Your ROI →",
        proof: "Average 4.8x ROI across all industries",
        badge: "ROI ADVANTAGE"
      },
      emotional: {
        headline: `Do What You Love. Let ${shortProduct} Do the Rest.`,
        subheadline: "Reclaim your creative focus and feel inspired again",
        body: `Remember the passion of creating? It gets lost in administrative overhead. Reclaim your core focus, reduce daily stress, and design the future with ${desc}.`,
        cta: "Start Your Journey →",
        proof: "Voted #1 Platform for Team Wellness",
        badge: "PEACE OF MIND"
      },
      expert: {
        headline: `${shortProduct} Architecture Specs`,
        subheadline: "Built for high-performance event loop dispatch",
        body: `Engineered for specialists: ${desc} utilizes a zero-copy concurrency bus to resolve resource allocations dynamically. No thread-locks or blocking overhead.`,
        cta: "Read API Specs →",
        proof: "Supports up to 10k ops/sec with sub-millisecond dispatch",
        badge: "DEVELOPER GRADE"
      },
      minimalist: {
        headline: `${shortProduct}. Done right.`,
        subheadline: "No fluff, no overhead.",
        body: `Simple setup, immediate utility: ${desc}.`,
        cta: "Try it Now",
        proof: "1 click install",
        badge: "MINIMALIST"
      },
      social: {
        headline: `Join the ${shortProduct} Community`,
        subheadline: "Where 120,000+ builders synergy is unlocked",
        body: `You are not alone. Collaborate with a global network of engineers sharing recipes, best practices, and custom automations for ${desc}.`,
        cta: "Join our Discord →",
        proof: "Active community of 120,000+ members",
        badge: "COMMUNITY FIRST"
      },
      risk: {
        headline: `Try ${shortProduct} Risk-Free for 60 Days`,
        subheadline: "100% money-back guarantee, no questions asked",
        body: `Deploy ${desc} with absolute confidence. If you don't experience a massive reduction in friction and operational overhead in the first month, it's free.`,
        cta: "Start Risk-Free Trial",
        proof: "SOC2 Type II Certified & Fully GDPR Compliant",
        badge: "100% SECURE"
      },
      pioneer: {
        headline: `Get Early Access to ${shortProduct}`,
        subheadline: "Be the first in your market to deploy this capability",
        body: `We are selecting 50 pioneering engineering teams to join our private cohort for ${desc}. Gain an unfair advantage by deploying tomorrow's tech today.`,
        cta: "Apply for Beta Access",
        proof: "Limited to 50 slots for Q3 cohort",
        badge: "EXCLUSIVITY"
      },
      practical: {
        headline: `Up & Running with ${shortProduct} in 3 Mins`,
        subheadline: "Zero configurations, zero learning curve",
        body: `Just connect your systems, choose your presets, and watch ${desc} handle the rest. No complex onboarding or workshops needed. It just works.`,
        cta: "Deploy in 3 Mins →",
        proof: "Average setup time: 2.8 minutes",
        badge: "EASY START"
      }
    }
  };

  const activeTemplate = templates[category];
  const result = {};
  Object.keys(templates.general).forEach(key => {
    result[key] = activeTemplate[key] || templates.general[key];
  });
  return result;
}

// Ad generation is now handled securely on the backend via the /generate endpoint.

// ─── AD CARD ─────────────────────────────────────────────────────────────────
function AdCard({ persona, copy, loading, onClick }) {
  return (
    <div style={{
      background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16,
      padding: "24px", display: "flex", flexDirection: "column", gap: 12,
      position: "relative", overflow: "hidden", transition: "all 0.2s ease",
      cursor: copy ? "pointer" : "default",
    }}
      onClick={copy ? onClick : undefined}
      onMouseEnter={e => { if (copy) e.currentTarget.style.transform = "translateY(-4px)"; }}
      onMouseLeave={e => { if (copy) e.currentTarget.style.transform = "translateY(0)"; }}
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
          <button 
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            style={{
              marginTop: "auto", padding: "10px 18px", borderRadius: 10,
              background: `linear-gradient(135deg, ${persona.color}, ${persona.color}BB)`,
              border: "none", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer",
            }}
          >
            {copy.cta || "Get Started →"}
          </button>
        </>
      ) : (
        <div style={{ color: T.muted, fontSize: 13, textAlign: "center", padding: "20px 0" }}>Waiting to generate…</div>
      )}
    </div>
  );
}

// ─── STREAMDECODER OVERLAY ────────────────────────────────────────────────────
function FrictionOverlay({ friction, intervention, onDismiss }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const type = intervention?.intervention_type || "promo_banner";
  const payload = intervention?.payload || {
    icon: "%",
    message: "Still deciding? Here's 10% off if you check out now.",
    discount_code: "STAY10"
  };

  const initialMessage = type === "chatbot" 
    ? (payload.message || "Hey! Looks like you might have some questions. What can I help with?")
    : "Hey! How can I help you today?";

  const [chatLog, setChatLog] = useState([
    { role: "bot", text: initialMessage }
  ]);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    setChatLog([{ role: "bot", text: initialMessage }]);
  }, [initialMessage]);

  const send = async () => {
    if (!msg.trim()) return;
    const userMsg = msg.trim();
    setMsg("");
    setChatLog(l => [...l, { role: "user", text: userMsg }]);
    setTyping(true);

    setTimeout(() => {
      let botResponse = "That's a great question! Let me connect you with our engineering support team.";
      const lowerMsg = userMsg.toLowerCase();
      
      if (lowerMsg.includes("spec") || lowerMsg.includes("dimension") || lowerMsg.includes("material") || lowerMsg.includes("warranty")) {
        botResponse = "Our product features a high-grade carbon fiber body, dimensions of 14.2\" x 9.8\" x 0.6\", and comes with a full 3-year warranty. We are fully compatible with REST/FastAPI.";
      } else if (lowerMsg.includes("discount") || lowerMsg.includes("coupon") || lowerMsg.includes("price") || lowerMsg.includes("stay10")) {
        botResponse = "Use the promo code STAY10 at checkout to claim your 10% discount!";
      } else if (lowerMsg.includes("shipping") || lowerMsg.includes("goldship") || lowerMsg.includes("free")) {
        botResponse = "Your Gold Loyalty perk grants you free express shipping with code GOLDSHIP!";
      } else if (lowerMsg.includes("hi") || lowerMsg.includes("hello") || lowerMsg.includes("hey")) {
        botResponse = "Hello! I am your Chameleon Support Agent. Ask me about specifications, warranty, or discounts.";
      }
      
      setChatLog(l => [...l, { role: "bot", text: botResponse }]);
      setTyping(false);
    }, 800);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 1000,
      display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12,
    }}>
      {chatOpen && type === "chatbot" && (
        <div style={{
          width: 320, background: T.panel, border: `1px solid ${T.border}`,
          borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 60px #00000088",
        }}>
          <div style={{
            background: `linear-gradient(135deg, ${T.accent}, #9333EA)`,
            padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{payload.title || "Need help with specs?"}</div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>Friction detected · Technical Support</div>
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
              placeholder="Ask specs, compatibility..."
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

      {!chatOpen && (type === "promo_banner" || type === "loyalty_perk") && (
        <div style={{
          width: 320, background: T.panel, border: `1px solid ${T.border}`,
          borderRadius: 16, padding: "20px", display: "flex", flexDirection: "column", gap: 12,
          boxShadow: "0 15px 45px #000000aa", position: "relative", overflow: "hidden",
          animation: "fadeIn 0.3s ease",
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 3,
            background: type === "loyalty_perk" ? `linear-gradient(90deg, ${T.gold}, #F59E0B)` : `linear-gradient(90deg, ${T.orange}, #E65C00)`,
          }} />
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                fontSize: 22, width: 36, height: 36, borderRadius: "50%",
                background: type === "loyalty_perk" ? `${T.gold}22` : `${T.orange}22`,
                display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center",
                color: type === "loyalty_perk" ? T.gold : T.orange
              }}>
                {payload.icon || (type === "loyalty_perk" ? "★" : "%")}
              </span>
              <div>
                <div style={{
                  color: type === "loyalty_perk" ? T.gold : T.orange,
                  fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase"
                }}>
                  {type === "loyalty_perk" ? "VIP Privilege Activated" : "Limited-Time Discount"}
                </div>
                <div style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>
                  {type === "loyalty_perk" ? "Gold loyalty shipping" : "Hesitation discount"}
                </div>
              </div>
            </div>
            <button onClick={onDismiss} style={{
              background: "none", border: "none", color: T.soft, fontSize: 18, cursor: "pointer"
            }}>×</button>
          </div>

          <p style={{ margin: 0, fontSize: 12, color: T.text, lineHeight: 1.5 }}>
            {payload.message}
          </p>

          {(payload.discount_code || payload.perk_code) && (
            <div style={{
              display: "flex", background: T.ink, border: `1px solid ${T.border}`,
              borderRadius: 8, padding: 6, alignItems: "center", justifyContent: "space-between"
            }}>
              <span style={{
                fontFamily: "monospace", color: "#fff", fontWeight: 700,
                fontSize: 14, marginLeft: 10
              }}>
                {payload.discount_code || payload.perk_code}
              </span>
              <button 
                onClick={() => copyToClipboard(payload.discount_code || payload.perk_code)}
                style={{
                  background: type === "loyalty_perk" ? T.gold : T.orange, border: "none",
                  borderRadius: 6, color: "#fff", padding: "5px 12px", fontSize: 11,
                  fontWeight: 700, cursor: "pointer"
                }}
              >
                {copied ? "Copied!" : "Copy Code"}
              </button>
            </div>
          )}

          {type === "loyalty_perk" && intervention?.identity && (
            <div style={{
              borderTop: `1px solid ${T.border}`, paddingTop: 10,
              display: "flex", justifyContent: "space-between", fontSize: 10, color: T.soft
            }}>
              <span>User: {intervention.identity.unified_id}</span>
              <span>Loyalty: Gold ({intervention.identity.past_purchases} orders)</span>
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        {chatOpen ? null : (
          <>
            <button onClick={onDismiss} style={{
              background: T.muted, border: "none", borderRadius: 50, width: 44, height: 44,
              color: T.soft, cursor: "pointer", fontSize: 16,
            }}>×</button>
            <button onClick={() => {
              if (type === "chatbot") {
                setChatOpen(true);
              } else {
                copyToClipboard(payload.discount_code || payload.perk_code);
              }
            }} style={{
              background: type === "loyalty_perk" ? `linear-gradient(135deg, ${T.gold}, #F59E0B)` : type === "promo_banner" ? `linear-gradient(135deg, ${T.orange}, #E65C00)` : `linear-gradient(135deg, ${T.accent}, #9333EA)`,
              border: "none", borderRadius: 50, width: 52, height: 52,
              color: "#fff", cursor: "pointer", fontSize: 22, boxShadow: `0 0 20px ${T.accentGlow}`,
              animation: "pulse 2s infinite",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              {type === "chatbot" ? "💬" : type === "loyalty_perk" ? "★" : "%"}
            </button>
          </>
        )}
      </div>

      {!chatOpen && type === "chatbot" && (
        <div style={{
          background: T.panel, border: `1px solid ${T.border}`, borderRadius: 12,
          padding: "10px 16px", fontSize: 13, color: T.text, maxWidth: 240,
          boxShadow: "0 8px 24px #00000066",
        }}>
          🎯 <strong>{payload.title}</strong> — {payload.message}
        </div>
      )}
    </div>
  );
}

// ─── STREAMDECODER DASHBOARD ──────────────────────────────────────────────────
function StreamDecoderPanel({ 
  matrix, enabled, onToggle, identityHint, setIdentityHint, 
  backendStatus, activeIntervention, sessionId 
}) {
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ color: T.text, fontWeight: 700, fontSize: 15 }}>StreamDecoder</div>
          <div style={{ color: T.soft, fontSize: 12 }}>Live friction detection engine</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <select 
            value={identityHint} 
            onChange={(e) => setIdentityHint(e.target.value)}
            style={{
              background: T.ink,
              color: T.text,
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: 12,
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="none">👤 Anonymous User</option>
            <option value="cookie_abc123">🥈 cookie_abc123 (Silver Tier)</option>
            <option value="cookie_def456">🥇 cookie_def456 (Gold Tier)</option>
            <option value="device_xyz789">🥈 device_xyz789 (Silver Tier)</option>
          </select>
          <button onClick={onToggle} style={{
            background: enabled ? `${T.green}22` : T.muted,
            border: `1px solid ${enabled ? T.green : T.border}`,
            borderRadius: 20, padding: "5px 14px", color: enabled ? T.green : T.soft,
            cursor: "pointer", fontSize: 12, fontWeight: 700,
          }}>{enabled ? "● ACTIVE" : "○ OFF"}</button>
        </div>
      </div>

      <div style={{
        background: T.ink, borderRadius: 10, padding: "12px 16px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        border: `1px solid ${T.border}`
      }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ color: T.soft, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Session ID</span>
          <span style={{ fontSize: 12, color: T.text, fontFamily: "monospace" }}>{sessionId.slice(0, 15)}...</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <span style={{ color: T.soft, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Backend API</span>
          <span style={{
            fontSize: 11, fontWeight: 800,
            color: backendStatus === "connected" ? T.green : backendStatus === "error" ? T.red : T.soft,
          }}>
            {backendStatus === "connected" ? "● CONNECTED" : backendStatus === "error" ? "● OFFLINE" : "○ DISCONNECTED"}
          </span>
        </div>
      </div>

      {activeIntervention && (
        <div style={{
          background: `${activeIntervention.intervention_type === "loyalty_perk" ? T.gold : activeIntervention.intervention_type === "promo_banner" ? T.orange : T.accent}22`,
          border: `1px solid ${activeIntervention.intervention_type === "loyalty_perk" ? T.gold : activeIntervention.intervention_type === "promo_banner" ? T.orange : T.accent}44`,
          borderRadius: 10, padding: "12px 16px",
          display: "flex", flexDirection: "column", gap: 6,
          animation: "fadeIn 0.3s ease",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ 
              fontSize: 10, fontWeight: 800, 
              color: activeIntervention.intervention_type === "loyalty_perk" ? T.gold : activeIntervention.intervention_type === "promo_banner" ? T.orange : T.accent, 
              textTransform: "uppercase", letterSpacing: "0.05em" 
            }}>
              🎯 Backend Trigger: {activeIntervention.intervention_type}
            </span>
            <span style={{ fontSize: 10, color: T.soft }}>Confidence: {activeIntervention.confidence || 0.8}</span>
          </div>
          <div style={{ fontSize: 12, color: "#fff", fontWeight: 700 }}>
            {activeIntervention.payload?.message || activeIntervention.payload?.title}
          </div>
          {activeIntervention.payload?.discount_code && (
            <div style={{ fontSize: 11, color: T.soft }}>
              Coupon: <strong style={{ color: T.orange }}>{activeIntervention.payload.discount_code}</strong>
            </div>
          )}
          {activeIntervention.payload?.perk_code && (
            <div style={{ fontSize: 11, color: T.soft }}>
              Shipping Perk: <strong style={{ color: T.gold }}>{activeIntervention.payload.perk_code}</strong>
            </div>
          )}
        </div>
      )}

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
        <span style={{ color: T.soft, fontSize: 12 }}>Local Friction Score</span>
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

function RoiCalculatorSandbox() {
  const [teams, setTeams] = useState(15);
  return (
    <div style={{
      background: T.panel, borderRadius: 10, padding: 16,
      border: `1px solid ${T.border}`, display: "flex", flexDirection: "column", gap: 12
    }}>
      <strong style={{ color: T.gold, fontSize: 12 }}>💰 ROI Calculator Sandbox:</strong>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
          <span>Team size: <strong>{teams} devs</strong></span>
          <span style={{ color: T.green }}>Save: <strong>${teams * 360}/mo</strong></span>
        </div>
        <input 
          type="range" min="5" max="100" value={teams} 
          onChange={e => setTeams(parseInt(e.target.value))} 
          style={{ width: "100%", accentColor: T.gold, cursor: "pointer" }}
        />
      </div>
      <div style={{ fontSize: 11, color: T.soft, borderTop: `1px solid ${T.border}`, paddingTop: 8 }}>
        Calculated return: <strong>{(teams * 360 * 12 / 2400).toFixed(1)}x</strong> software payback in Q1.
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

  const [sessionId] = useState(() => "session_" + Math.random().toString(36).substring(2, 11));
  const [identityHint, setIdentityHint] = useState("none");
  const [backendStatus, setBackendStatus] = useState("disconnected");
  const [activeIntervention, setActiveIntervention] = useState(null);
  const [selectedAd, setSelectedAd] = useState(null);

  const matrix = useStreamDecoder(
    decoderEnabled,
    sessionId,
    identityHint,
    backendStatus,
    setBackendStatus,
    useCallback((intervention) => {
      setActiveIntervention(intervention);
      setFriction({ score: 15, backend: true });
    }, [])
  );

  const generate = async () => {
    if (!product.trim()) return;
    setGenerated(true);
    setCopies({});
    const loadingMap = {};
    PERSONAS.forEach(p => loadingMap[p.id] = true);
    setLoading(loadingMap);

    try {
      const res = await fetch("http://localhost:8000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product })
      });
      if (!res.ok) throw new Error(`Backend generation failed: ${res.statusText}`);
      const data = await res.json();
      setCopies(data);
    } catch (err) {
      console.error("[Ad Generation Error]: Failed to fetch from backend", err);
      // Fallback: generate using local dynamic templates
      const fallbacks = getDynamicTemplates(product);
      setCopies(fallbacks);
    } finally {
      const loadedMap = {};
      PERSONAS.forEach(p => loadedMap[p.id] = false);
      setLoading(loadedMap);
    }
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

            <div style={{ maxWidth: 680, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
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
                    onClick={() => setSelectedAd({ persona, copy: copies[persona.id] })}
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

            <StreamDecoderPanel 
              matrix={matrix} 
              enabled={decoderEnabled} 
              onToggle={() => setDecoderEnabled(e => !e)} 
              identityHint={identityHint}
              setIdentityHint={setIdentityHint}
              backendStatus={backendStatus}
              activeIntervention={activeIntervention}
              sessionId={sessionId}
            />

            {/* Interactive Specs Sandbox */}
            <div id="sandbox-specs" style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, padding: 20 }}>
              <div style={{ color: T.text, fontWeight: 700, marginBottom: 6 }}>Friction Sandbox (Interactive Specs)</div>
              <div style={{ color: T.soft, fontSize: 12, marginBottom: 14 }}>
                Hover here and select text terms to trigger Technical Friction on the backend.
              </div>
              <div style={{
                background: T.ink, borderRadius: 10, padding: 14,
                border: `1px solid ${T.border}`, fontSize: 13, lineHeight: 1.6
              }}>
                <strong style={{ color: T.accent }}>Product Spec Sheet:</strong><br />
                • <strong>Material</strong>: High-durability premium carbon composite fiber.<br />
                • <strong>Dimensions</strong>: 14.2" x 9.8" x 0.6" ultra-thin form factor.<br />
                • <strong>Compatibility</strong>: Full REST API and WebHook integration.<br />
                • <strong>Warranty</strong>: 3-year enterprise hardware replacement guarantee.
              </div>
            </div>

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
        <FrictionOverlay 
          friction={friction} 
          intervention={activeIntervention}
          onDismiss={() => {
            setFriction(null);
            setActiveIntervention(null);
          }} 
        />
      )}

      {/* Personalized Landing Page Simulation Modal */}
      {selectedAd && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(8, 9, 10, 0.95)", backdropFilter: "blur(12px)",
          zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24, animation: "fadeIn 0.3s ease"
        }}>
          <div style={{
            background: T.panel, border: `1px solid ${T.border}`, borderRadius: 24,
            maxWidth: 700, width: "100%", overflow: "hidden", display: "flex", flexDirection: "column",
            boxShadow: "0 30px 90px rgba(0,0,0,0.9)", position: "relative"
          }}>
            <div style={{
              background: `linear-gradient(135deg, ${selectedAd.persona.color}, ${selectedAd.persona.color}99)`,
              padding: "24px 32px", display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.8)" }}>
                  Simulated Funnel Experience: {selectedAd.persona.label}
                </span>
                <h2 style={{ margin: "4px 0 0 0", color: "#fff", fontSize: 20, fontWeight: 800 }}>
                  {selectedAd.copy.headline}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedAd(null)}
                style={{
                  background: "rgba(255,255,255,0.15)", border: "none", color: "#fff",
                  borderRadius: "50%", width: 36, height: 36, display: "flex",
                  alignItems: "center", justifyContent: "center", cursor: "pointer",
                  fontSize: 18, fontWeight: 700, transition: "background 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
              >
                ×
              </button>
            </div>

            <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 28 }}>{selectedAd.persona.icon}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Active Persona Segment:</div>
                  <div style={{ fontSize: 12, color: T.soft }}>{selectedAd.persona.desc}</div>
                </div>
              </div>

              <div style={{
                background: T.ink, border: `1px solid ${T.border}`, borderRadius: 16,
                padding: "24px", display: "flex", flexDirection: "column", gap: 16
              }}>
                <div style={{
                  fontSize: 11, fontWeight: 800, textTransform: "uppercase",
                  letterSpacing: "0.15em", color: selectedAd.persona.color
                }}>
                  Personalized Landing Page Hero
                </div>
                
                <h3 style={{ margin: 0, color: "#fff", fontSize: 22, fontWeight: 900 }}>
                  {selectedAd.copy.headline}
                </h3>
                {selectedAd.copy.subheadline && (
                  <p style={{ margin: 0, color: T.text, fontSize: 14, fontWeight: 500, lineHeight: 1.5 }}>
                    {selectedAd.copy.subheadline}
                  </p>
                )}
                
                <p style={{ margin: 0, color: T.soft, fontSize: 13, lineHeight: 1.6 }}>
                  {selectedAd.copy.body}
                </p>

                {selectedAd.persona.id === "skeptic" && (
                  <div style={{
                    background: T.panel, borderRadius: 10, padding: 16,
                    border: `1px solid ${T.border}`, display: "flex", flexDirection: "column", gap: 10
                  }}>
                    <strong style={{ color: T.green, fontSize: 12 }}>✓ Verified Performance Audits:</strong>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 12 }}>
                      <div>📊 Latency: <strong>0.82ms avg</strong></div>
                      <div>🛡️ Security: <strong>SOC-2 Compliant</strong></div>
                      <div>🔄 Uptime: <strong>99.997% audited</strong></div>
                      <div>⭐ Integrity: <strong>Signed verification key</strong></div>
                    </div>
                  </div>
                )}

                {selectedAd.persona.id === "roi" && (
                  <RoiCalculatorSandbox />
                )}

                {selectedAd.persona.id === "trendy" && (
                  <div style={{
                    background: T.panel, borderRadius: 10, padding: 16,
                    border: `1px solid ${T.border}`, display: "flex", flexDirection: "column", gap: 8
                  }}>
                    <strong style={{ color: T.orange, fontSize: 12 }}>🔥 Social Proof Live Tracker:</strong>
                    <div style={{ fontSize: 12, color: T.text }}>
                      Join <strong>12,410</strong> engineers who migrated from legacy tools this week.
                    </div>
                    <div style={{ display: "flex", gap: 6, fontSize: 10, color: T.soft }}>
                      <span>🟢 Just joined: Alex (Stripe)</span>
                      <span>🟢 Just joined: Jessica (Vercel)</span>
                    </div>
                  </div>
                )}

                {selectedAd.persona.id === "risk" && (
                  <div style={{
                    background: `${T.green}11`, border: `1px solid ${T.green}44`,
                    borderRadius: 10, padding: 16, display: "flex", alignItems: "center", gap: 12
                  }}>
                    <span style={{ fontSize: 32 }}>🛡️</span>
                    <div>
                      <strong style={{ color: T.green, fontSize: 13, display: "block" }}>Double Satisfaction Guarantee</strong>
                      <span style={{ fontSize: 12, color: T.text }}>
                        If you don't save at least 20% of meeting overhead in 30 days, we'll refund 100% of your payment AND let you keep the templates.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button 
                  onClick={() => setSelectedAd(null)}
                  style={{
                    flex: 1, padding: "14px 24px", borderRadius: 12,
                    background: `linear-gradient(135deg, ${selectedAd.persona.color}, ${selectedAd.persona.color}BB)`,
                    border: "none", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer",
                    boxShadow: `0 8px 24px ${selectedAd.persona.color}33`, textAlign: "center"
                  }}
                >
                  Confirm Simulated Conversion (Get Started)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}