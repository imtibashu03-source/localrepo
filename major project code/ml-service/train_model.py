"""
train_model.py
--------------
Standalone script to train the ThreatPredictionModel and persist the
trained artifacts to the models/ directory.

Usage:
    python train_model.py
"""

import os
import sys

# Ensure the project root is on the path when running from other directories
sys.path.insert(0, os.path.dirname(__file__))

from model import ThreatPredictionModel, FEATURE_NAMES

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")


def main():
    print("=" * 60)
    print("  Cyber Threat Prediction Model — Training")
    print("=" * 60)

    # Create models directory if it does not exist
    os.makedirs(MODELS_DIR, exist_ok=True)
    print(f"\n[*] Models directory : {MODELS_DIR}")

    model = ThreatPredictionModel()

    print("[*] Generating synthetic training data (2000 samples) ...")
    print("[*] Training Random Forest and Decision Tree classifiers ...")

    results = model.train()

    print("\n--- Training Results ---")
    print(f"  Random Forest accuracy : {results['rf_accuracy'] * 100:.2f}%")
    print(f"  Decision Tree accuracy : {results['dt_accuracy'] * 100:.2f}%")

    print("\n--- Random Forest Feature Importances ---")
    rf_importances = results["rf_feature_importances"]
    sorted_rf = sorted(rf_importances.items(), key=lambda x: x[1], reverse=True)
    for feature, importance in sorted_rf:
        bar = "#" * int(importance * 50)
        print(f"  {feature:<25} {importance:.4f}  {bar}")

    print("\n--- Decision Tree Feature Importances ---")
    dt_importances = results["dt_feature_importances"]
    sorted_dt = sorted(dt_importances.items(), key=lambda x: x[1], reverse=True)
    for feature, importance in sorted_dt:
        bar = "#" * int(importance * 50)
        print(f"  {feature:<25} {importance:.4f}  {bar}")

    print("\n[*] Quick sanity check — sample predictions:")
    test_cases = [
        {
            "name": "Safe user",
            "features": {
                "failedLogins": 0,
                "accessFrequency": 10.0,
                "ipMismatch": 0,
                "modificationAttempts": 0,
                "offHoursAccess": 0,
                "geoAnomalies": 0,
                "unusualPatterns": 0,
                "sessionDuration": 15.0,
            },
        },
        {
            "name": "Low-risk user",
            "features": {
                "failedLogins": 1,
                "accessFrequency": 20.0,
                "ipMismatch": 0,
                "modificationAttempts": 0,
                "offHoursAccess": 0,
                "geoAnomalies": 0,
                "unusualPatterns": 1,
                "sessionDuration": 30.0,
            },
        },
        {
            "name": "Medium-risk user",
            "features": {
                "failedLogins": 3,
                "accessFrequency": 85.0,
                "ipMismatch": 0,
                "modificationAttempts": 2,
                "offHoursAccess": 1,
                "geoAnomalies": 0,
                "unusualPatterns": 0,
                "sessionDuration": 60.0,
            },
        },
        {
            "name": "High-risk user",
            "features": {
                "failedLogins": 8,
                "accessFrequency": 95.0,
                "ipMismatch": 1,
                "modificationAttempts": 7,
                "offHoursAccess": 1,
                "geoAnomalies": 1,
                "unusualPatterns": 1,
                "sessionDuration": 5.0,
            },
        },
    ]

    for tc in test_cases:
        prediction = model.predict(tc["features"])
        print(
            f"  [{tc['name']}] → level={prediction['threatLevel']:6s} "
            f"score={prediction['threatScore']:5.1f} "
            f"confidence={prediction['confidence']:5.1f}%"
        )

    print("\n[✓] Training complete. Models are ready for the Flask API.")
    print("=" * 60)


if __name__ == "__main__":
    main()
