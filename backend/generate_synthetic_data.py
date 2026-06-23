import os
import sys
import random
import csv
import argparse

# Ensure working directory is the backend directory so relative paths in inference.py work correctly
backend_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(backend_dir)
sys.path.append(backend_dir)

from inference import infer_intent

def generate_scroll_velocities(sample_count: int, reversals: int) -> list[float]:
    if sample_count == 0:
        return []
    # Reversals cannot exceed sample_count - 1
    reversals = min(reversals, max(0, sample_count - 1))
    
    # Start with a random sign
    current_sign = 1.0 if random.random() > 0.5 else -1.0
    velocities = []
    
    # Select indices where sign changes occur
    if reversals > 0 and sample_count > 1:
        change_indices = sorted(random.sample(range(1, sample_count), reversals))
    else:
        change_indices = []
        
    for i in range(sample_count):
        if i in change_indices:
            current_sign = -current_sign
        # Generate non-zero velocity
        vel = current_sign * random.uniform(0.1, 5.0)
        velocities.append(vel)
        
    return velocities

def generate_row():
    # Step 2: Generate random values per feature
    max_hover = random.uniform(0.0, 10.0)
    scroll_sample_count = random.randint(0, 10)
    scroll_reversals = random.randint(0, 8)
    
    # Make sure scroll_reversals doesn't exceed sample count bounds
    actual_reversals = min(scroll_reversals, max(0, scroll_sample_count - 1))
    
    has_technical_selection = 1 if random.random() < 0.35 else 0
    loyalty_tier = 1 if random.random() < 0.25 else 0
    
    # Construct state and identity for infer_intent
    state = {
        "hover_durations": {"product_details": max_hover},
        "text_selections": ["spec"] if has_technical_selection == 1 else [],
        "scroll_velocity": generate_scroll_velocities(scroll_sample_count, actual_reversals),
        "session_id": "dummy_session",
        "timestamp": 0.0
    }
    identity = {
        "loyalty_tier": "gold" if loyalty_tier == 1 else "none",
        "unified_id": "dummy_user",
        "persona_tags": [],
        "past_purchases": 0
    }
    
    # Step 3: Label each row using existing rules (infer_intent)
    result = infer_intent(state, identity)
    
    label = "none"
    if result.get("trigger"):
        intervention_type = result.get("intervention_type")
        if intervention_type == "loyalty_perk":
            label = "loyalty_recognition"
        elif intervention_type == "chatbot":
            label = "technical_friction"
        elif intervention_type == "promo_banner":
            label = "price_hesitation"
            
    # Quick sanity check with explicit rule mapping to ensure alignment
    rule_label = "none"
    if loyalty_tier == 1 and max_hover > 1.0:
        rule_label = "loyalty_recognition"
    elif max_hover > 4.0 and has_technical_selection == 1:
        rule_label = "technical_friction"
    elif actual_reversals >= 3 and scroll_sample_count >= 4 and max_hover > 2.0:
        rule_label = "price_hesitation"
        
    assert label == rule_label, f"Mismatch: state labeled as '{label}' but rules label as '{rule_label}'"
    
    return {
        "max_hover": round(max_hover, 4),
        "scroll_reversals": actual_reversals,
        "scroll_sample_count": scroll_sample_count,
        "has_technical_selection": has_technical_selection,
        "loyalty_tier": loyalty_tier,
        "label": label
    }

def main():
    parser = argparse.ArgumentParser(description="Generate synthetic behavior dataset.")
    parser.add_argument("--rows", type=int, default=4000, help="Number of rows to generate (default: 4000)")
    parser.add_argument("--output", type=str, default="data/synthetic_behavior_data.csv", help="Output CSV path (relative to backend/)")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility")
    parser.add_argument("--noise-rate", type=float, default=0.09, help="Rate of label noise injection to limit model accuracy (default: 0.09)")
    args = parser.parse_args()

    
    random.seed(args.seed)
    
    print(f"Generating {args.rows} rows of behavior data (seed={args.seed})...")
    
    rows = []
    class_counts = {
        "loyalty_recognition": 0,
        "technical_friction": 0,
        "price_hesitation": 0,
        "none": 0
    }
    
    for _ in range(args.rows):
        row = generate_row()
        rows.append(row)
        class_counts[row["label"]] += 1
        
    print("\nClass distribution:")
    for label, count in class_counts.items():
        pct = (count / args.rows) * 100
        print(f"  - {label}: {count} ({pct:.2f}%)")
        
    # Check class balance requirements (at least 400 rows per class)
    min_required = 400
    underrepresented = [label for label, count in class_counts.items() if count < min_required]
    
    if underrepresented:
        print(f"\n[WARNING] Some classes have fewer than {min_required} rows: {underrepresented}")
        print("Regenerating with slightly skewed generation parameters...")
        
        # We can implement a simple loop to guarantee class constraints by oversampling underrepresented classes if needed, 
        # or skewing parameters. But since our calculated distribution naturally has >500 rows for each, it is highly likely to pass.
        # Let's add a robust fallback just in case:
        while any(count < min_required for count in class_counts.values()):
            # Find the missing count
            rows = []
            class_counts = {k: 0 for k in class_counts}
            # Adjust weights to boost underrepresented classes if needed
            # For example, let's just generate using target class-guided profiles to balance them perfectly
            for _ in range(args.rows):
                # Choose a target class to balance things out
                target_choice = random.choice(["loyalty_recognition", "technical_friction", "price_hesitation", "none"])
                
                # Make features that are guaranteed to trigger the target class (with random noise)
                if target_choice == "loyalty_recognition":
                    loyalty_tier = 1
                    max_hover = random.uniform(1.1, 10.0)
                    scroll_sample_count = random.randint(0, 10)
                    scroll_reversals = random.randint(0, 8)
                    has_technical_selection = random.choice([0, 1])
                elif target_choice == "technical_friction":
                    loyalty_tier = 0
                    max_hover = random.uniform(4.1, 10.0)
                    scroll_sample_count = random.randint(0, 10)
                    scroll_reversals = random.randint(0, 8)
                    has_technical_selection = 1
                elif target_choice == "price_hesitation":
                    loyalty_tier = 0
                    # Must not trigger tech friction (so either hover <= 4.0 or no technical selection)
                    max_hover = random.uniform(2.1, 10.0)
                    if max_hover > 4.0:
                        has_technical_selection = 0
                    else:
                        has_technical_selection = random.choice([0, 1])
                    scroll_sample_count = random.randint(4, 10)
                    scroll_reversals = random.randint(3, 8)
                else: # none
                    # Ensure no rules are triggered
                    loyalty_tier = 0
                    has_technical_selection = 0
                    max_hover = random.uniform(0.0, 2.0)
                    scroll_sample_count = random.randint(0, 3)
                    scroll_reversals = random.randint(0, 2)
                    
                actual_reversals = min(scroll_reversals, max(0, scroll_sample_count - 1))
                
                state = {
                    "hover_durations": {"product_details": max_hover},
                    "text_selections": ["spec"] if has_technical_selection == 1 else [],
                    "scroll_velocity": generate_scroll_velocities(scroll_sample_count, actual_reversals),
                    "session_id": "dummy_session",
                    "timestamp": 0.0
                }
                identity = {
                    "loyalty_tier": "gold" if loyalty_tier == 1 else "none",
                    "unified_id": "dummy_user",
                    "persona_tags": [],
                    "past_purchases": 0
                }
                
                result = infer_intent(state, identity)
                label = "none"
                if result.get("trigger"):
                    intervention_type = result.get("intervention_type")
                    if intervention_type == "loyalty_perk":
                        label = "loyalty_recognition"
                    elif intervention_type == "chatbot":
                        label = "technical_friction"
                    elif intervention_type == "promo_banner":
                        label = "price_hesitation"
                
                rows.append({
                    "max_hover": round(max_hover, 4),
                    "scroll_reversals": actual_reversals,
                    "scroll_sample_count": scroll_sample_count,
                    "has_technical_selection": has_technical_selection,
                    "loyalty_tier": loyalty_tier,
                    "label": label
                })
                class_counts[label] += 1
                
            print("\nAdjusted Profile Class distribution:")
            for label, count in class_counts.items():
                pct = (count / args.rows) * 100
                print(f"  - {label}: {count} ({pct:.2f}%)")
    
    # Inject label noise to limit accuracy to max 92%
    if args.noise_rate > 0.0:
        print(f"\nInjecting {args.noise_rate:.2%} label noise to limit max model accuracy...")
        all_labels = ["loyalty_recognition", "technical_friction", "price_hesitation", "none"]
        noise_count = 0
        for row in rows:
            if random.random() < args.noise_rate:
                current_label = row["label"]
                other_labels = [l for l in all_labels if l != current_label]
                row["label"] = random.choice(other_labels)
                noise_count += 1
        print(f"  - Injected noise into {noise_count} / {len(rows)} rows ({noise_count / len(rows):.2%})")
        
        # Print updated class distribution after noise injection
        final_counts = {l: 0 for l in all_labels}
        for row in rows:
            final_counts[row["label"]] += 1
        print("Final Class distribution after noise:")
        for label, count in final_counts.items():
            pct = (count / len(rows)) * 100
            print(f"  - {label}: {count} ({pct:.2f}%)")
            
    # Save to CSV
    output_path = args.output
    # Ensure directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    fields = ["max_hover", "scroll_reversals", "scroll_sample_count", "has_technical_selection", "loyalty_tier", "label"]
    with open(output_path, "w", newline="", encoding="utf-8") as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)

        
    print(f"\nSuccessfully generated and saved dataset to {os.path.abspath(output_path)}")

if __name__ == "__main__":
    main()
