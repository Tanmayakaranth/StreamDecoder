import os
import re
import json
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor

# ─── PERSONA PROMPTS ──────────────────────────────────────────────────────────
PERSONA_PROMPTS = {
    "skeptic": 'You are writing ad copy for a DATA-DRIVEN SKEPTIC persona. Use statistics, specific numbers, case studies, third-party validation, and credible proof points. Include a metric-heavy headline. Respond in JSON: {"headline":"...","subheadline":"...","body":"...","cta":"...","proof":"...","badge":"..."}',
    "trendy": 'You are writing ad copy for a TREND FOLLOWER persona. Use FOMO, social proof numbers, hype language, "everyone is switching to", cultural references. Respond in JSON: {"headline":"...","subheadline":"...","body":"...","cta":"...","proof":"...","badge":"..."}',
    "roi": 'You are writing ad copy for an ROI CALCULATOR persona. Focus on cost savings, payback period, revenue impact, and financial ROI. Use "$X saved" framing. Respond in JSON: {"headline":"...","subheadline":"...","body":"...","cta":"...","proof":"...","badge":"..."}',
    "emotional": 'You are writing ad copy for an EMOTIONAL BUYER persona. Use storytelling, identity, aspiration, and feelings. Make them feel something. Avoid numbers. Respond in JSON: {"headline":"...","subheadline":"...","body":"...","cta":"...","proof":"...","badge":"..."}',
    "expert": 'You are writing ad copy for a DOMAIN EXPERT persona. Use technical language, industry jargon, deep feature specifics, and peer-level tone. No dumbing down. Respond in JSON: {"headline":"...","subheadline":"...","body":"...","cta":"...","proof":"...","badge":"..."}',
    "minimalist": 'You are writing ad copy for a MINIMALIST persona. Ultra brief, no fluff. One killer line. Stark and confident. Respond in JSON: {"headline":"...","subheadline":"...","body":"...","cta":"...","proof":"...","badge":"..."}',
    "social": 'You are writing ad copy for a COMMUNITY SEEKER persona. Emphasize belonging, shared values, the group they\'ll join, community size, collective identity. Respond in JSON: {"headline":"...","subheadline":"...","body":"...","cta":"...","proof":"...","badge":"..."}',
    "risk": 'You are writing ad copy for a RISK AVOIDER persona. Lead with guarantees, testimonials, "no risk", money-back promise, trusted by X brands. Reassure at every turn. Respond in JSON: {"headline":"...","subheadline":"...","body":"...","cta":"...","proof":"...","badge":"..."}',
    "pioneer": 'You are writing ad copy for an EARLY ADOPTER persona. Emphasize being first, exclusive access, beta invite, cutting-edge, ahead of the curve. Respond in JSON: {"headline":"...","subheadline":"...","body":"...","cta":"...","proof":"...","badge":"..."}',
    "practical": 'You are writing ad copy for a PRACTICAL SOLVER persona. Step-by-step, "takes 5 minutes", easy setup, no learning curve, just works. Respond in JSON: {"headline":"...","subheadline":"...","body":"...","cta":"...","proof":"...","badge":"..."}',
}

# ─── API KEY LOADER ───────────────────────────────────────────────────────────
def load_api_key():
    # 1. Check current environment
    key = os.environ.get("VITE_GEMINI_API_KEY") or os.environ.get("GEMINI_API_KEY")
    if key:
        return key

    # 2. Check file paths relative to this file
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    possible_paths = [
        os.path.join(backend_dir, "..", ".env"),
        os.path.join(backend_dir, "..", "my-app", ".env"),
        os.path.join(backend_dir, ".env"),
    ]
    for path in possible_paths:
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if not line or line.startswith("#"):
                            continue
                        if "=" in line:
                            k, v = line.split("=", 1)
                            if k.strip() in ("VITE_GEMINI_API_KEY", "GEMINI_API_KEY"):
                                val = v.strip().strip("'\"")
                                if val:
                                    return val
            except Exception as e:
                print(f"[Backend Env Loader] Error reading {path}: {e}")
    return None

# ─── LOCAL DYNAMIC TEMPLATES ──────────────────────────────────────────────────
def get_dynamic_templates(product_desc: str) -> dict:
    desc = product_desc.strip() if product_desc else "our solution"
    lower_desc = desc.lower()

    # Extract short product name
    short_product = desc
    match = re.search(
        r"^([A-Za-z0-9\s'-]{3,30})(?:\s+(?:is|that|uses|helps|automates|allows|delivers|built for))\b",
        desc,
        re.IGNORECASE
    )
    if match:
        short_product = match.group(1).strip()
    elif len(desc.split()) > 3:
        short_product = " ".join(desc.split()[:3])
    
    short_product = short_product[0].upper() + short_product[1:] if short_product else ""

    # Classify category
    category = "general"
    if re.search(r"coffee|food|cafe|restaurant|drink|bake|cook|chef|menu|tea|barista|dine|dining|kitchen", lower_desc):
        category = "food"
    elif re.search(r"gym|fitness|health|workout|run|diet|doctor|med|exercise|body|train|yoga|wellness", lower_desc):
        category = "health"
    elif re.search(r"shop|buy|store|commerce|sell|product|clothes|shoe|market|retail|apparel|boutique", lower_desc):
        category = "shop"
    elif re.search(r"app|software|saas|tool|manage|prioritize|meeting|code|api|dev|database|platform|task", lower_desc):
        category = "saas"

    templates = {
        "food": {
            "skeptic": {
                "headline": f"100% Organic Quality at {short_product}",
                "subheadline": "Certified fresh ingredients, local suppliers",
                "body": f"Taste the difference with {desc}. Our recipe uses zero artificial additives, ensuring authentic flavors crafted daily.",
                "cta": "Order Fresh Now →",
                "proof": "Rated 4.9/5 by 800+ local foodies",
                "badge": "VERIFIED FRESH"
            },
            "roi": {
                "headline": f"Eat Better, Spend Less with {short_product}",
                "subheadline": "Best value gourmet meals in the city",
                "body": f"Compare the cost: dining at {desc} saves you money compared to grocery shopping and cooking time, without sacrificing taste.",
                "cta": "View Our Menu →",
                "proof": "Meals starting at just $9.99",
                "badge": "BEST VALUE"
            },
            "trendy": {
                "headline": "The New Spot Everyone is Reviewing",
                "subheadline": "Find out why tables are fully booked weeks ahead",
                "body": f"The word is out. Local food critics and foodies are raving about {desc}. Reserve your spot today to taste our signature specials.",
                "cta": "Book a Table →",
                "proof": "As featured in Local Eats Magazine",
                "badge": "TRENDING SPOT"
            },
            "emotional": {
                "headline": "A Taste of Pure Comfort and Delight",
                "subheadline": "Made with love, served with a warm smile",
                "body": f"Remember when food made you feel at home? {desc} brings back authentic culinary traditions, crafting meals that feed the soul.",
                "cta": "Explore Our Story",
                "proof": "Family-owned & operated for 15 years",
                "badge": "CRAFTED WITH CARE"
            },
            "expert": {
                "headline": "Artisanal Culinary Specs",
                "subheadline": "Precisely roasted beans and micro-foam texture",
                "body": f"For the connoisseur: {desc} utilizes single-origin direct-trade arabica, roasted at precisely 205°C and extracted at 9 bars of pressure.",
                "cta": "Read Coffee Specs",
                "proof": "Barista championship certified grade",
                "badge": "BARISTA STANDARD"
            },
            "minimalist": {
                "headline": "Fresh coffee. Daily.",
                "subheadline": "No fluff, just roasting.",
                "body": f"Locally sourced beans, freshly brewed: {desc}.",
                "cta": "Get Cup",
                "proof": "Brewed in 90 seconds",
                "badge": "MINIMAL"
            },
            "social": {
                "headline": "Your Local Neighborhood Hangout",
                "subheadline": "Where friends and creators gather daily",
                "body": f"Meet new people or focus on your work. {desc} is a community hub designed to foster connection, warmth, and synergy.",
                "cta": "Find a Location →",
                "proof": "Hosting weekly community open-mics",
                "badge": "COMMUNITY HUB"
            },
            "risk": {
                "headline": "Love It or It's Free Guarantee",
                "subheadline": "We promise you'll love every single bite",
                "body": f"Try any item on our menu. If it's not the best cup or plate you've had this week, tell us and we will replace it or refund you on the spot.",
                "cta": "Order Risk-Free",
                "proof": "100% Taste Satisfaction Guarantee",
                "badge": "OUR PROMISE"
            },
            "pioneer": {
                "headline": "Join Our Secret Tasting Menu",
                "subheadline": "Get exclusive access to new recipes before release",
                "body": f"We are opening 30 spots for our chef's private beta testing cohort. Be the first to try our experimental plates and pairings.",
                "cta": "Apply for Invite",
                "proof": "Only 30 slots available for Q3",
                "badge": "VIP ENTRY"
            },
            "practical": {
                "headline": "Quick Pick-Up, No Long Lines",
                "subheadline": "Order ahead and grab it in 2 minutes",
                "body": f"Craving a quick bite? Simply customize your order on our digital portal, and grab it from the counter. Easy, fast, and fresh.",
                "cta": "Order Pick-Up",
                "proof": "Average prep time under 3 minutes",
                "badge": "EXPRESS LANE"
            }
        },
        "health": {
            "skeptic": {
                "headline": "Scientifically Proven Results",
                "subheadline": "Clinically backed fitness methodologies",
                "body": f"Stop guessing. {desc} is based on real physiological data, optimized to burn 30% more calories and increase core strength in 4 weeks.",
                "cta": "See Clinical Studies →",
                "proof": "94% success rate reported in double-blind trials",
                "badge": "CLINICALLY PROVEN"
            },
            "roi": {
                "headline": "Invest in Your Longevity Today",
                "subheadline": "Preventative wellness worth every penny",
                "body": f"Avoid future medical costs. {desc} delivers high-yield health returns, enhancing your energy levels and focus for a fraction of gym fees.",
                "cta": "Start Your Investment",
                "proof": "Save up to $1,200/year in healthcare premiums",
                "badge": "HEALTH VALUE"
            },
            "trendy": {
                "headline": "The Workout System Going Viral",
                "subheadline": "See why active professionals are switching",
                "body": f"The reviews are everywhere. People are posting their incredible transformations online using {desc}. Join the fitness movement now.",
                "cta": "Try Free Session",
                "proof": "Over 5 million workouts completed",
                "badge": "VIRAL FITNESS"
            },
            "emotional": {
                "headline": "Feel Strong, Energized, and Confident",
                "subheadline": "Awaken your potential and love your body",
                "body": f"It's not about numbers on a scale; it's about how you feel when you wake up. Rebuild your energy and mental clarity with {desc}.",
                "cta": "Begin Your Journey",
                "proof": "Loved by 8,000+ active members",
                "badge": "HOLISTIC WELLNESS"
            },
            "expert": {
                "headline": "Bio-Mechanical Performance Specs",
                "subheadline": "Targeted heart-rate zone tracking",
                "body": f"Designed for athletes: {desc} optimizes lactic thresholds and VO2 Max through tailored biometric resistance ranges. No guesswork.",
                "cta": "Analyze System Specs",
                "proof": "Developed by certified kinesiologists",
                "badge": "BIO-TECH GRADE"
            },
            "minimalist": {
                "headline": "Move better. Live longer.",
                "subheadline": "No fitness gimmicks.",
                "body": f"Biometric feedback, real-time results: {desc}.",
                "cta": "Start Move",
                "proof": "Requires 15 mins a day",
                "badge": "ESSENTIAL"
            },
            "social": {
                "headline": "Join Our Fitness Family",
                "subheadline": "Build strength alongside supportive friends",
                "body": f"Group motivation makes the difference. With {desc}, you'll train with a friendly community that cheers you on at every step.",
                "cta": "Find a Group →",
                "proof": "Monthly team fitness challenges",
                "badge": "COMMUNITY HUB"
            },
            "risk": {
                "headline": "Guaranteed Results in 30 Days",
                "subheadline": "Or your money back, no questions asked",
                "body": f"We guarantee you will feel more energetic and strong in the first month of using {desc}, or we will issue a full refund instantly.",
                "cta": "Start Risk-Free",
                "proof": "SOC-certified wellness standards",
                "badge": "SATISFACTION GUARANTEED"
            },
            "pioneer": {
                "headline": "Join the Elite Athlete Program",
                "subheadline": "Exclusive beta testing for biometric wearable integration",
                "body": f"We are opening a limited group to test our new automated physiological tracking system. Train with cutting-edge tools first.",
                "cta": "Apply for Program",
                "proof": "Strictly limited to 50 applicants",
                "badge": "ELITE ACCESS"
            },
            "practical": {
                "headline": "Fits Easily into Your Busy Schedule",
                "subheadline": "15-minute workouts you can do anywhere",
                "body": f"No time for the gym? {desc} is built for active lifestyles. Quick routines that deliver maximum results with zero gym equipment.",
                "cta": "Get Routine",
                "proof": "Average setup time: 30 seconds",
                "badge": "EASY START"
            }
        },
        "shop": {
            "skeptic": {
                "headline": "Certified Premium Craftsmanship",
                "subheadline": "Grade-A materials, double-stitched durability",
                "body": f"Inspect the quality. {desc} is made from premium, sustainably sourced materials designed to last 5x longer than standard alternatives.",
                "cta": "View Materials Report",
                "proof": "Backed by 5-year replacement guarantee",
                "badge": "PREMIUM GRADE"
            },
            "roi": {
                "headline": "Buy Quality Once, Save for Years",
                "subheadline": "Direct-to-consumer pricing, no retail markup",
                "body": f"Stop buying cheap replacements. Investing in {desc} saves you money over time by delivering retail-grade excellence at wholesale value.",
                "cta": "Shop Direct Catalog",
                "proof": "Average 60% savings compared to retail",
                "badge": "DIRECT VALUE"
            },
            "trendy": {
                "headline": "The Season's Most Requested Item",
                "subheadline": "Selling out fast, limit 2 per customer",
                "body": f"The aesthetic upgrade your space needs. Influencers and designers are calling {desc} the must-have product of the season.",
                "cta": "Claim Yours Today →",
                "proof": "Limited quantity remaining in stock",
                "badge": "SELLING FAST"
            },
            "emotional": {
                "headline": "Elevate Your Everyday Style",
                "subheadline": "Beautiful design that sparks joy in your home",
                "body": f"You deserve products that look as good as they function. Enhance your daily routine and express your personal style with {desc}.",
                "cta": "Explore Collection",
                "proof": "Handcrafted detailing in every piece",
                "badge": "ARTISANAL"
            },
            "expert": {
                "headline": "Technical Material Specs",
                "subheadline": "High-density polymers and structural integrity",
                "body": f"For the specialist: {desc} features a reinforced alloy frame, weather-resistant micro-weaves, and double anodized coatings.",
                "cta": "Read Material Spec",
                "proof": "Tensile strength rating: 480 MPa",
                "badge": "INDUSTRIAL GRADE"
            },
            "minimalist": {
                "headline": "Pure design. Pure utility.",
                "subheadline": "No clutter, no logos.",
                "body": f"Stark aesthetics, functional materials: {desc}.",
                "cta": "Purchase Now",
                "proof": "Ships in biodegradable packing",
                "badge": "MINIMALIST"
            },
            "social": {
                "headline": "Loved by 100,000+ Conscious Buyers",
                "subheadline": "Join a global network supporting sustainable craft",
                "body": f"Every purchase of {desc} supports ethical labor practices and environmental cleanups. Together, we're building a better market.",
                "cta": "Read Our Mission",
                "proof": "1% of all revenue donated to planet cleanup",
                "badge": "MISSION DRIVEN"
            },
            "risk": {
                "headline": "100% Love-It Guarantee",
                "subheadline": "Free returns and exchanges for 60 days",
                "body": f"Order {desc} and try it out. If it doesn't fit your lifestyle or meet your standards, return it for a full refund. We pay return shipping.",
                "cta": "Order with Guarantee",
                "proof": "Pre-paid return label included in box",
                "badge": "RISK-FREE"
            },
            "pioneer": {
                "headline": "Access the Next Design Release",
                "subheadline": "Exclusive presale for our registered members",
                "body": f"Sign up for early catalog access. Members get 48 hours to purchase new limited-edition runs of {desc} before they open to the public.",
                "cta": "Join Presale List",
                "proof": "Presale cohorts limited to 100 slots",
                "badge": "EARLY MEMBER"
            },
            "practical": {
                "headline": "Simple Delivery, Zero Assembly",
                "subheadline": "Unbox and enjoy in under 2 minutes",
                "body": f"No complex manuals or missing screws. {desc} arrives fully assembled in protective, easy-open packaging. Ready to use immediately.",
                "cta": "Shop Now",
                "proof": "Ships next business day",
                "badge": "EXPRESS DELIVERY"
            }
        },
        "saas": {
            "skeptic": {
                "headline": f"Verified 41% Gains with {short_product}",
                "subheadline": "Independent system performance audits",
                "body": f"Review the data. {desc} is proven to automate system prioritizations, reduce synchronization latency, and reclaim up to 40% of operations.",
                "cta": "Download Audit Report →",
                "proof": "4.9/5 stars based on 1,250 verified IT audits",
                "badge": "AUDITED METRICS"
            },
            "roi": {
                "headline": f"Save $5,400/Month Per Engineer using {short_product}",
                "subheadline": "Full ROI achieved in under 30 days of setup",
                "body": f"Calculate the efficiency: deploying {desc} automates standard developer overhead and eliminates manual status syncs. It pays for itself immediately.",
                "cta": "Calculate Your ROI →",
                "proof": "Average 4.8x ROI across all software companies",
                "badge": "ROI ADVANTAGE"
            },
            "trendy": {
                "headline": "The Upgrade All High-Growth Teams Are Talking About",
                "subheadline": "Join 45,000+ engineering teams automated this month",
                "body": f"FOMO is real. Modern engineering operations are moving away from manual queues to deploy {desc}. Upgrade now before you fall behind.",
                "cta": "Upgrade Today →",
                "proof": "Trending #1 on Product Hunt this week",
                "badge": "MOST POPULAR"
            },
            "emotional": {
                "headline": "Write Code, Focus on What Matters",
                "subheadline": "Reclaim your creative focus and forget about ticket syncs",
                "body": f"Remember when programming was pure joy? Eliminate friction, reduce developer stress, and build the future with {desc}.",
                "cta": "Start Your Journey →",
                "proof": "Voted #1 Developer Platform for Team Happiness",
                "badge": "PEACE OF MIND"
            },
            "expert": {
                "headline": f"DAG Concurrency Specs for {short_product}",
                "subheadline": "Built for zero-latency event loops",
                "body": f"Engineered for specialists: {desc} resolves task dependency trees in memory with zero-copy async dispatches. No manual thread locks needed.",
                "cta": "Read API Specs →",
                "proof": "Supports up to 10k ops/sec with sub-millisecond dispatch",
                "badge": "DEVELOPER GRADE"
            },
            "minimalist": {
                "headline": "Auto-prioritize workflows. Reclaim 40% time.",
                "subheadline": "No fluff, no manual queues.",
                "body": f"Direct repository sync, immediate automation: {desc}.",
                "cta": "Try it Now",
                "proof": "1 click install",
                "badge": "MINIMALIST"
            },
            "social": {
                "headline": "Welcome to the Developer Synergy Hub",
                "subheadline": "Where 120,000+ engineers build together",
                "body": f"You are not alone. Collaborate with a global network of engineers sharing recipes, best practices, and custom automations for {desc}.",
                "cta": "Join our Discord →",
                "proof": "Active community of 120,000+ members",
                "badge": "COMMUNITY FIRST"
            },
            "risk": {
                "headline": f"Try {short_product} Risk-Free for 60 Days",
                "subheadline": "100% money-back guarantee, no questions asked",
                "body": f"Deploy {desc} with absolute confidence. If you don't experience a massive reduction in friction and operational overhead in the first month, it's free.",
                "cta": "Start Risk-Free Trial",
                "proof": "SOC2 Type II Certified & Fully GDPR Compliant",
                "badge": "100% SECURE"
            },
            "pioneer": {
                "headline": f"Get Early Access to {short_product}",
                "subheadline": "Be the first in your market to deploy this capability",
                "body": f"We are selecting 50 pioneering engineering teams to join our private cohort for {desc}. Gain an unfair advantage by deploying tomorrow's tech today.",
                "cta": "Apply for Beta Access",
                "proof": "Limited to 50 slots for Q3 cohort",
                "badge": "EXCLUSIVITY"
            },
            "practical": {
                "headline": f"Up & Running with {short_product} in 3 Mins",
                "subheadline": "Zero configurations, zero learning curve",
                "body": f"Just connect your systems, choose your presets, and watch {desc} handle the rest. No complex onboarding or workshops needed. It just works.",
                "cta": "Deploy in 3 Mins →",
                "proof": "Average setup time: 2.8 minutes",
                "badge": "EASY START"
            }
        },
        "general": {
            "skeptic": {
                "headline": f"Verified 41% Gains with {short_product}",
                "subheadline": "Backed by 12 independent system audits",
                "body": f"Review the data. {desc} is proven to reduce execution lag, eliminate operational friction, and streamline core processes by up to 40%.",
                "cta": "Download Audit Report →",
                "proof": "4.9/5 stars based on 1,250 verified IT reviews",
                "badge": "AUDITED METRICS"
            },
            "trendy": {
                "headline": "Everyone is Switching to " + short_product,
                "subheadline": "Why 45,000+ teams migrated this month",
                "body": f"Don't get left behind. High-growth teams are already using {desc} to unlock modern workflows. Join the movement before it becomes legacy.",
                "cta": "Join the Wave →",
                "proof": "Trending #1 on Product Hunt this week",
                "badge": "MOST POPULAR"
            },
            "roi": {
                "headline": f"Save $5,400/Mo per Seat using {short_product}",
                "subheadline": "Full return on investment in under 30 days",
                "body": f"Calculate the financial return: deploying {desc} redirects wasted manual hours into pure revenue-generating activity. It pays for itself immediately.",
                "cta": "Calculate Your ROI →",
                "proof": "Average 4.8x ROI across all industries",
                "badge": "ROI ADVANTAGE"
            },
            "emotional": {
                "headline": f"Do What You Love. Let {short_product} Do the Rest.",
                "subheadline": "Reclaim your creative focus and feel inspired again",
                "body": f"Remember the passion of creating? It gets lost in administrative overhead. Reclaim your core focus, reduce daily stress, and design the future with {desc}.",
                "cta": "Start Your Journey →",
                "proof": "Voted #1 Platform for Team Wellness",
                "badge": "PEACE OF MIND"
            },
            "expert": {
                "headline": f"{short_product} Architecture Specs",
                "subheadline": "Built for high-performance event loop dispatch",
                "body": f"Engineered for specialists: {desc} utilizes a zero-copy concurrency bus to resolve resource allocations dynamically. No thread-locks or blocking overhead.",
                "cta": "Read API Specs →",
                "proof": "Supports up to 10k ops/sec with sub-millisecond dispatch",
                "badge": "DEVELOPER GRADE"
            },
            "minimalist": {
                "headline": f"{short_product}. Done right.",
                "subheadline": "No fluff, no overhead.",
                "body": f"Simple setup, immediate utility: {desc}.",
                "cta": "Try it Now",
                "proof": "1 click install",
                "badge": "MINIMALIST"
            },
            "social": {
                "headline": f"Join the {short_product} Community",
                "subheadline": "Where 120,000+ builders synergy is unlocked",
                "body": f"You are not alone. Collaborate with a global network of engineers sharing recipes, best practices, and custom automations for {desc}.",
                "cta": "Join our Discord →",
                "proof": "Active community of 120,000+ members",
                "badge": "COMMUNITY FIRST"
            },
            "risk": {
                "headline": f"Try {short_product} Risk-Free for 60 Days",
                "subheadline": "100% money-back guarantee, no questions asked",
                "body": f"Deploy {desc} with absolute confidence. If you don't experience a massive reduction in friction and operational overhead in the first month, it's free.",
                "cta": "Start Risk-Free Trial",
                "proof": "SOC2 Type II Certified & Fully GDPR Compliant",
                "badge": "100% SECURE"
            },
            "pioneer": {
                "headline": f"Get Early Access to {short_product}",
                "subheadline": "Be the first in your market to deploy this capability",
                "body": f"We are selecting 50 pioneering engineering teams to join our private cohort for {desc}. Gain an unfair advantage by deploying tomorrow's tech today.",
                "cta": "Apply for Beta Access",
                "proof": "Limited to 50 slots for Q3 cohort",
                "badge": "EXCLUSIVITY"
            },
            "practical": {
                "headline": f"Up & Running with {short_product} in 3 Mins",
                "subheadline": "Zero configurations, zero learning curve",
                "body": f"Just connect your systems, choose your presets, and watch {desc} handle the rest. No complex onboarding or workshops needed. It just works.",
                "cta": "Deploy in 3 Mins →",
                "proof": "Average setup time: 2.8 minutes",
                "badge": "EASY START"
            }
        }
    }

    active_template = templates[category]
    result = {}
    for key in templates["general"].keys():
        result[key] = active_template.get(key, templates["general"][key])
    return result

# ─── GEMINI API INVOCATION ───────────────────────────────────────────────────
def call_gemini_for_persona(product: str, persona_id: str, api_key: str) -> dict:
    prompt = PERSONA_PROMPTS.get(persona_id)
    if not prompt:
        raise ValueError(f"Unknown persona: {persona_id}")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    system_instruction = (
        prompt
        + " You MUST respond strictly in valid JSON format matching the schema. "
        "Do not output any Markdown block formatting (no ```json code blocks), no explanation text, and no leading/trailing commentary."
    )

    payload = {
        "contents": [{
            "parts": [{
                "text": f"Product Description: {product}\n\nGenerate the ad copy variations for this product."
            }]
        }],
        "systemInstruction": {
            "parts": [{
                "text": system_instruction
            }]
        },
        "generationConfig": {
            "responseMimeType": "application/json"
        }
    }

    req_data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=req_data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            res_data = response.read().decode("utf-8")
            data = json.loads(res_data)
            
            raw_text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "{}")
            
            # Clean possible markdown wrap
            clean_json = raw_text.replace("```json", "").replace("```", "").strip()
            return json.loads(clean_json)
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        print(f"[Gemini API backend HTTP error for {persona_id}] Code {e.code}: {error_body}")
        raise e
    except Exception as e:
        print(f"[Gemini API backend error for {persona_id}]: {e}")
        raise e

# ─── GENERATE ALL PERSONAS ────────────────────────────────────────────────────
def generate_all_persona_copies(product: str) -> dict:
    api_key = load_api_key()
    
    # If no key, immediately fall back to local templates
    if not api_key:
        print("[Backend Generation] No Gemini API key detected. Using dynamic templates.")
        return get_dynamic_templates(product)

    print(f"[Backend Generation] Generating copy using Gemini API key (first 8 chars: {api_key[:8]}...)")

    results = {}
    
    # Define worker function for thread pool
    def worker(persona_id):
        try:
            return persona_id, call_gemini_for_persona(product, persona_id, api_key)
        except Exception:
            # Fall back to template for this specific persona
            fallback_copy = get_dynamic_templates(product).get(persona_id)
            return persona_id, fallback_copy

    personas_list = list(PERSONA_PROMPTS.keys())
    
    # Run requests concurrently using a ThreadPoolExecutor
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(worker, p_id) for p_id in personas_list]
        for future in futures:
            try:
                p_id, copy = future.result()
                results[p_id] = copy
            except Exception as e:
                print(f"[Backend Thread Pool Error]: {e}")

    # Ensure all personas have something
    fallbacks = get_dynamic_templates(product)
    for p_id in personas_list:
        if p_id not in results or not results[p_id]:
            results[p_id] = fallbacks[p_id]

    return results

# ─── B2B OUTREACH GENERATION ──────────────────────────────────────────────────
def get_outreach_fallback(customer_name: str, product_desc: str, primary_label: str, primary_desc: str, secondary_label: str, secondary_desc: str) -> str:
    desc = product_desc.strip() if product_desc else "our structural pipeline optimization layer"
    lower_desc = desc.lower()

    # Extract short product name
    short_product = desc
    match = re.search(
        r"^([A-Za-z0-9\s'-]{3,30})(?:\s+(?:is|that|uses|helps|automates|allows|delivers|built for))\b",
        desc,
        re.IGNORECASE
    )
    if match:
        short_product = match.group(1).strip()
    elif len(desc.split()) > 3:
        short_product = " ".join(desc.split()[:3])
    
    short_product = short_product[0].upper() + short_product[1:] if short_product else ""

    # Classify category
    category = "general"
    if re.search(r"coffee|food|cafe|restaurant|drink|bake|cook|chef|menu|tea|barista|dine|dining|kitchen", lower_desc):
        category = "food"
    elif re.search(r"gym|fitness|health|workout|run|diet|doctor|med|exercise|body|train|yoga|wellness", lower_desc):
        category = "health"
    elif re.search(r"shop|buy|store|commerce|sell|product|clothes|shoe|market|retail|apparel|boutique", lower_desc):
        category = "shop"
    elif re.search(r"app|software|saas|tool|manage|prioritize|meeting|code|api|dev|database|platform|task", lower_desc):
        category = "saas"

    cust = customer_name or "there"

    templates = {
        "food": (
            f"Hi {cust},\n\n"
            f"I wanted to reach out because we've been helping culinary teams elevate their operations with {short_product}. "
            f"Given your focus matches an explicit need for {primary_label} ({primary_desc}) alongside {secondary_label} ({secondary_desc}), "
            f"our fresh, artisanal approach is a perfect fit to drive higher customer engagement.\n\n"
            f"Let's coordinate a brief sync next week to see how we can optimize your menu offerings.\n\n"
            f"Best,\n{short_product} Growth Team"
        ),
        "health": (
            f"Hi {cust},\n\n"
            f"I hope you're doing well. At {short_product}, we focus on high-yield biometric wellness and structural optimizations. "
            f"We noticed your target profile aligns with {primary_label} ({primary_desc}) alongside the flexibility of {secondary_label} ({secondary_desc}).\n\n"
            f"Our system is specifically built to match these goals and maximize physical and metrics criteria. Let's sync this week.\n\n"
            f"Best,\n{short_product} Wellness Engine"
        ),
        "shop": (
            f"Hi {cust},\n\n"
            f"I wanted to share how leading brands are scaling their commerce operations using {short_product}. "
            f"Given your target profile focuses on {primary_label} ({primary_desc}) and requires a strong alignment to {secondary_label} ({secondary_desc}), "
            f"our premium direct-value catalog is uniquely built to optimize your conversions.\n\n"
            f"Let's set up a brief time to walk through the collection.\n\n"
            f"Best,\n{short_product} Commerce Group"
        ),
        "saas": (
            f"Hi {cust},\n\n"
            f"I noticed your engineering team is working with unoptimized layers. At {short_product}, we automate software workflows. "
            f"Our platform is ideal for teams who prioritize verified metrics for {primary_label} ({primary_desc}) and require {secondary_label} ({secondary_desc}) specifications.\n\n"
            f"Let's coordinate a brief sync next week to see how we can optimize your event loop and dispatch latency.\n\n"
            f"Best,\n{short_product} Operations Hub"
        ),
        "general": (
            f"Hi {cust},\n\n"
            f"I'm reaching out because we help teams optimize their workflows using {short_product}. "
            f"Given your focus on {primary_label} ({primary_desc}) and {secondary_label} ({secondary_desc}), "
            f"our platform offers the ideal combination of performance and utility for your needs.\n\n"
            f"Let's connect for 10 minutes to review a tailored baseline sync check this week.\n\n"
            f"Best,\n{short_product} Growth Team"
        )
    }

    return templates[category]

def generate_outreach_message(customer_name: str, product_desc: str, primary_label: str, primary_desc: str, secondary_label: str, secondary_desc: str) -> str:
    api_key = load_api_key()
    if not api_key:
        print("[Backend Outreach] No Gemini API key detected. Returning fallback.")
        return get_outreach_fallback(customer_name, product_desc, primary_label, primary_desc, secondary_label, secondary_desc)

    prompt = (
        f"You are an elite B2B growth marketer. Write a hyper-personalized outreach message for a lead named '{customer_name or 'Prospect'}'. \n"
        f"Product Capability Context: '{product_desc or 'our structural pipeline optimization layer'}'.\n"
        f"The user has been classified into two buyer personas simultaneously:\n"
        f"1. Primary Focus: '{primary_label}' ({primary_desc})\n"
        f"2. Supporting Secondary Focus: '{secondary_label}' ({secondary_desc})\n"
        f"Combine the messaging triggers seamlessly. Keep the output professional, crisp, tactical, and directly applicable. Do not use boilerplate intro text or summary wrap-ups. Write strictly the finalized outreach text context under 160 words."
    )

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    payload = {
        "contents": [{ "parts": [{ "text": prompt }] }]
    }

    req_data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=req_data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            res_data = response.read().decode("utf-8")
            data = json.loads(res_data)
            return data["candidates"][0]["content"]["parts"][0]["text"]
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        print(f"[Backend Outreach API HTTP Error] Code {e.code}: {error_body}. Returning fallback.")
        return get_outreach_fallback(customer_name, product_desc, primary_label, primary_desc, secondary_label, secondary_desc)
    except Exception as e:
        print(f"[Backend Outreach API Error]: {e}. Returning fallback.")
        return get_outreach_fallback(customer_name, product_desc, primary_label, primary_desc, secondary_label, secondary_desc)


