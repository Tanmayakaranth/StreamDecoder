import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import lightgbm as lgb

# Ensure working directory is backend
backend_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(backend_dir)

def main():
    csv_path = "data/synthetic_behavior_data.csv"
    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found. Please run generate_synthetic_data.py first.")
        return
        
    print(f"Loading dataset from {csv_path}...")
    df = pd.read_csv(csv_path)
    
    # Feature columns
    feature_cols = ["max_hover", "scroll_reversals", "scroll_sample_count", "has_technical_selection", "loyalty_tier"]
    target_col = "label"
    
    X = df[feature_cols]
    y = df[target_col]
    
    # Map labels to numeric categories
    # Sort categories to be deterministic
    categories = sorted(y.unique())
    label_to_idx = {label: i for i, label in enumerate(categories)}
    idx_to_label = {i: label for label, i in label_to_idx.items()}
    
    y_encoded = y.map(label_to_idx)
    
    print("\nFeature shape:", X.shape)
    print("Class mapping:")
    for label, idx in label_to_idx.items():
        print(f"  {label} -> {idx}")
        
    # Step 4: Train/test split (80% train, 20% test)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )
    
    print(f"\nTrain size: {X_train.shape[0]}, Test size: {X_test.shape[0]}")
    
    # --------------------
    # Model 1: LightGBM
    # --------------------
    print("\n==============================================")
    print("Training LightGBM Classifier...")
    print("==============================================")
    
    lgb_clf = lgb.LGBMClassifier(
        objective="multiclass",
        num_class=len(categories),
        random_state=42,
        verbosity=-1  # Suppress excessive logging
    )
    lgb_clf.fit(X_train, y_train)
    
    y_pred_lgb = lgb_clf.predict(X_test)
    acc_lgb = accuracy_score(y_test, y_pred_lgb)
    
    print(f"LightGBM Accuracy: {acc_lgb:.4%}")
    print("\nLightGBM Classification Report:")
    print(classification_report(y_test, y_pred_lgb, target_names=categories))
    
    print("LightGBM Confusion Matrix:")
    cm_lgb = confusion_matrix(y_test, y_pred_lgb)
    cm_df_lgb = pd.DataFrame(cm_lgb, index=categories, columns=categories)
    print(cm_df_lgb)
    
    # Feature importances for LightGBM
    importances_lgb = lgb_clf.feature_importances_
    indices_lgb = np.argsort(importances_lgb)[::-1]
    
    print("\nLightGBM Feature Importance (Gain/Splits):")
    for i in indices_lgb:
        print(f"  - {feature_cols[i]}: {importances_lgb[i]}")
        
    # --------------------
    # Model 2: RandomForest (For comparison / baseline verification)
    # --------------------
    print("\n==============================================")
    print("Training RandomForest Classifier...")
    print("==============================================")
    
    rf_clf = RandomForestClassifier(random_state=42, n_estimators=100)
    rf_clf.fit(X_train, y_train)
    
    y_pred_rf = rf_clf.predict(X_test)
    acc_rf = accuracy_score(y_test, y_pred_rf)
    
    print(f"RandomForest Accuracy: {acc_rf:.4%}")
    print("\nRandomForest Classification Report:")
    print(classification_report(y_test, y_pred_rf, target_names=categories))
    
    print("RandomForest Confusion Matrix:")
    cm_rf = confusion_matrix(y_test, y_pred_rf)
    cm_df_rf = pd.DataFrame(cm_rf, index=categories, columns=categories)
    print(cm_df_rf)
    
    # Feature importances for RandomForest
    importances_rf = rf_clf.feature_importances_
    indices_rf = np.argsort(importances_rf)[::-1]
    
    print("\nRandomForest Feature Importance:")
    for i in indices_rf:
        print(f"  - {feature_cols[i]}: {importances_rf[i]:.4f}")

    # --------------------
    # Model Exporting
    # --------------------
    print("\n==============================================")
    print("Exporting Models...")
    print("==============================================")
    
    # 1. Save LightGBM to .txt
    lgbm_export_path = "data/lgbm_model.txt"
    lgb_clf.booster_.save_model(lgbm_export_path)

    print(f"LightGBM model successfully saved to: {os.path.abspath(lgbm_export_path)}")
    
    # 2. Save RandomForest to .pkl using pickle
    import pickle
    rf_export_path = "data/rf_model.pkl"
    with open(rf_export_path, "wb") as f:
        pickle.dump(rf_clf, f)
    print(f"RandomForest model successfully saved to: {os.path.abspath(rf_export_path)}")

if __name__ == "__main__":
    main()

