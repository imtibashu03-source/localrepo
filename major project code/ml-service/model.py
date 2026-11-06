import os
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
RF_MODEL_PATH = os.path.join(MODELS_DIR, "random_forest.joblib")
DT_MODEL_PATH = os.path.join(MODELS_DIR, "decision_tree.joblib")
SCALER_PATH = os.path.join(MODELS_DIR, "scaler.joblib")

FEATURE_NAMES = [
    "failedLogins",
    "accessFrequency",
    "ipMismatch",
    "modificationAttempts",
    "offHoursAccess",
    "geoAnomalies",
    "unusualPatterns",
    "sessionDuration",
]

THREAT_LEVEL_MAP = {0: "safe", 1: "low", 2: "medium", 3: "high"}

RECOMMENDATIONS = {
    "safe": "System access appears normal. Continue monitoring.",
    "low": "Minor anomalies detected. Increase monitoring frequency.",
    "medium": "Suspicious activity detected. Review access logs immediately.",
    "high": "Critical threat detected! Immediate action required. Block suspicious IPs.",
}


class ThreatPredictionModel:
    def __init__(self):
        self.rf_model = RandomForestClassifier(
            n_estimators=100,
            max_depth=12,
            min_samples_split=5,
            min_samples_leaf=2,
            class_weight="balanced",
            random_state=42,
            n_jobs=-1,
        )
        self.dt_model = DecisionTreeClassifier(
            max_depth=10,
            min_samples_split=5,
            min_samples_leaf=2,
            class_weight="balanced",
            random_state=42,
        )
        self.scaler = StandardScaler()
        self._models_loaded = False

    # ------------------------------------------------------------------
    # Data generation
    # ------------------------------------------------------------------
    def generate_training_data(self, n_samples: int = 2000):
        rng = np.random.default_rng(seed=42)

        failed_logins = rng.integers(0, 11, size=n_samples)
        access_frequency = rng.uniform(0, 100, size=n_samples)
        ip_mismatch = rng.integers(0, 2, size=n_samples)
        modification_attempts = rng.integers(0, 11, size=n_samples)
        off_hours_access = rng.integers(0, 2, size=n_samples)
        geo_anomalies = rng.integers(0, 2, size=n_samples)
        unusual_patterns = rng.integers(0, 2, size=n_samples)
        session_duration = rng.uniform(0, 120, size=n_samples)

        X = np.column_stack(
            [
                failed_logins,
                access_frequency,
                ip_mismatch,
                modification_attempts,
                off_hours_access,
                geo_anomalies,
                unusual_patterns,
                session_duration,
            ]
        )

        y = np.zeros(n_samples, dtype=int)

        for i in range(n_samples):
            fl = failed_logins[i]
            af = access_frequency[i]
            im = ip_mismatch[i]
            ma = modification_attempts[i]
            oha = off_hours_access[i]
            up = unusual_patterns[i]

            if fl >= 5 and (im == 1 or ma >= 5):
                y[i] = 3  # high
            elif fl >= 3 or (af > 80 and oha == 1):
                y[i] = 2  # medium
            elif fl >= 1 or im == 1 or up == 1:
                y[i] = 1  # low
            else:
                y[i] = 0  # safe

        # Add gaussian noise / label flipping (≤5%)
        flip_mask = rng.random(n_samples) < 0.05
        flip_count = flip_mask.sum()
        y[flip_mask] = rng.integers(0, 4, size=flip_count)

        return X, y

    # ------------------------------------------------------------------
    # Training
    # ------------------------------------------------------------------
    def train(self):
        os.makedirs(MODELS_DIR, exist_ok=True)

        X, y = self.generate_training_data(n_samples=2000)

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        self.rf_model.fit(X_train_scaled, y_train)
        self.dt_model.fit(X_train_scaled, y_train)

        rf_accuracy = self.rf_model.score(X_test_scaled, y_test)
        dt_accuracy = self.dt_model.score(X_test_scaled, y_test)

        joblib.dump(self.rf_model, RF_MODEL_PATH)
        joblib.dump(self.dt_model, DT_MODEL_PATH)
        joblib.dump(self.scaler, SCALER_PATH)

        self._models_loaded = True

        print(f"[ThreatPredictionModel] Training complete.")
        print(f"  Random Forest accuracy : {rf_accuracy:.4f}")
        print(f"  Decision Tree accuracy : {dt_accuracy:.4f}")
        print(f"  Models saved to        : {MODELS_DIR}")

        return {
            "rf_accuracy": rf_accuracy,
            "dt_accuracy": dt_accuracy,
            "rf_feature_importances": dict(
                zip(FEATURE_NAMES, self.rf_model.feature_importances_.tolist())
            ),
            "dt_feature_importances": dict(
                zip(FEATURE_NAMES, self.dt_model.feature_importances_.tolist())
            ),
        }

    # ------------------------------------------------------------------
    # Loading saved models
    # ------------------------------------------------------------------
    def _load_models(self):
        if not (
            os.path.exists(RF_MODEL_PATH)
            and os.path.exists(DT_MODEL_PATH)
            and os.path.exists(SCALER_PATH)
        ):
            raise FileNotFoundError(
                "Saved models not found. Please run train_model.py first."
            )
        self.rf_model = joblib.load(RF_MODEL_PATH)
        self.dt_model = joblib.load(DT_MODEL_PATH)
        self.scaler = joblib.load(SCALER_PATH)
        self._models_loaded = True

    def models_exist(self) -> bool:
        return (
            os.path.exists(RF_MODEL_PATH)
            and os.path.exists(DT_MODEL_PATH)
            and os.path.exists(SCALER_PATH)
        )

    # ------------------------------------------------------------------
    # Prediction
    # ------------------------------------------------------------------
    def predict(self, features_dict: dict) -> dict:
        if not self._models_loaded:
            self._load_models()

        # Extract features with sensible defaults
        raw = [
            float(features_dict.get("failedLogins", 0)),
            float(features_dict.get("accessFrequency", 0.0)),
            float(features_dict.get("ipMismatch", 0)),
            float(features_dict.get("modificationAttempts", 0)),
            float(features_dict.get("offHoursAccess", 0)),
            float(features_dict.get("geoAnomalies", 0)),
            float(features_dict.get("unusualPatterns", 0)),
            float(features_dict.get("sessionDuration", 0.0)),
        ]

        # Clamp values to valid ranges
        raw[0] = np.clip(raw[0], 0, 10)        # failedLogins
        raw[1] = np.clip(raw[1], 0, 100)       # accessFrequency
        raw[2] = np.clip(round(raw[2]), 0, 1)  # ipMismatch (binary)
        raw[3] = np.clip(raw[3], 0, 10)        # modificationAttempts
        raw[4] = np.clip(round(raw[4]), 0, 1)  # offHoursAccess (binary)
        raw[5] = np.clip(round(raw[5]), 0, 1)  # geoAnomalies (binary)
        raw[6] = np.clip(round(raw[6]), 0, 1)  # unusualPatterns (binary)
        raw[7] = np.clip(raw[7], 0, 120)       # sessionDuration

        X = np.array([raw])
        X_scaled = self.scaler.transform(X)

        # --- Random Forest ---
        rf_proba = self.rf_model.predict_proba(X_scaled)[0]
        rf_class = int(np.argmax(rf_proba))

        # --- Decision Tree ---
        dt_proba = self.dt_model.predict_proba(X_scaled)[0]
        dt_class = int(np.argmax(dt_proba))

        # Align probability arrays to 4 classes (in case a model only saw 3)
        rf_proba_full = self._align_probas(rf_proba, self.rf_model.classes_)
        dt_proba_full = self._align_probas(dt_proba, self.dt_model.classes_)

        # --- Ensemble (RF 70% + DT 30%) ---
        ensemble_proba = 0.70 * rf_proba_full + 0.30 * dt_proba_full
        ensemble_class = int(np.argmax(ensemble_proba))

        # Threat score: weighted sum of class indices (0-3) mapped to 0-100
        threat_score = float(np.dot(ensemble_proba, [0, 33, 66, 100]))

        # Confidence: max ensemble probability * 100
        confidence = float(np.max(ensemble_proba) * 100)

        threat_level = THREAT_LEVEL_MAP[ensemble_class]
        recommendation = RECOMMENDATIONS[threat_level]

        return {
            "threatLevel": threat_level,
            "threatScore": round(threat_score, 2),
            "confidence": round(confidence, 2),
            "rfPrediction": THREAT_LEVEL_MAP.get(rf_class, "unknown"),
            "dtPrediction": THREAT_LEVEL_MAP.get(dt_class, "unknown"),
            "recommendation": recommendation,
        }

    # ------------------------------------------------------------------
    # Helper
    # ------------------------------------------------------------------
    @staticmethod
    def _align_probas(proba: np.ndarray, classes: np.ndarray) -> np.ndarray:
        """Ensure probability vector covers all 4 classes [0,1,2,3]."""
        full = np.zeros(4)
        for idx, cls in enumerate(classes):
            if 0 <= cls <= 3:
                full[int(cls)] = proba[idx]
        return full
