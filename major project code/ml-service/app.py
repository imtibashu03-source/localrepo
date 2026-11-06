"""
app.py
------
Flask REST API for the Cyber Threat Prediction ML service.

Endpoints:
    POST /predict       — Predict threat level for a given feature set
    GET  /health        — Health check
    GET  /model-info    — Information about the loaded models

Run:
    python app.py
"""

import os
import sys
import logging
from datetime import datetime, timezone

from flask import Flask, request, jsonify
from flask_cors import CORS

# Ensure the project root is importable when run from other directories
sys.path.insert(0, os.path.dirname(__file__))

from model import ThreatPredictionModel, FEATURE_NAMES

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Flask app & CORS
# ---------------------------------------------------------------------------
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# ---------------------------------------------------------------------------
# Model initialisation
# ---------------------------------------------------------------------------
threat_model = ThreatPredictionModel()


def _ensure_model_ready():
    """Train models on startup if saved artifacts do not exist yet."""
    if not threat_model.models_exist():
        logger.info("No saved models found — starting auto-training ...")
        threat_model.train()
        logger.info("Auto-training finished.")
    else:
        logger.info("Saved models found — skipping training.")


with app.app_context():
    _ensure_model_ready()

# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------
REQUIRED_FIELDS = [
    "failedLogins",
    "accessFrequency",
    "ipMismatch",
    "modificationAttempts",
    "offHoursAccess",
    "geoAnomalies",
    "unusualPatterns",
    "sessionDuration",
]


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/health", methods=["GET"])
def health():
    """Simple health-check endpoint."""
    return jsonify({"status": "healthy", "model": "loaded"}), 200


@app.route("/model-info", methods=["GET"])
def model_info():
    """Return information about the models used by the service."""
    return (
        jsonify(
            {
                "service": "Cyber Threat Prediction API",
                "version": "1.0.0",
                "models": [
                    {
                        "name": "Random Forest Classifier",
                        "weight": "70%",
                        "n_estimators": 100,
                        "max_depth": 12,
                    },
                    {
                        "name": "Decision Tree Classifier",
                        "weight": "30%",
                        "max_depth": 10,
                    },
                ],
                "ensemble_strategy": "Weighted average of class probabilities (RF=0.7, DT=0.3)",
                "features": FEATURE_NAMES,
                "threat_levels": ["safe", "low", "medium", "high"],
                "training_samples": 2000,
            }
        ),
        200,
    )


@app.route("/predict", methods=["POST"])
def predict():
    """
    Predict the cyber threat level for the provided feature set.

    Expected JSON body:
    {
        "failedLogins":          <int   0-10>,
        "accessFrequency":       <float 0-100>,
        "ipMismatch":            <int   0|1>,
        "modificationAttempts":  <int   0-10>,
        "offHoursAccess":        <int   0|1>,
        "geoAnomalies":          <int   0|1>,
        "unusualPatterns":       <int   0|1>,
        "sessionDuration":       <float 0-120>
    }
    """
    # --- Parse JSON body ---
    if not request.is_json:
        return (
            jsonify(
                {
                    "success": False,
                    "error": "Request body must be JSON (Content-Type: application/json).",
                }
            ),
            400,
        )

    body = request.get_json(silent=True)
    if body is None:
        return (
            jsonify({"success": False, "error": "Invalid or empty JSON body."}),
            400,
        )

    # --- Validate required fields ---
    missing = [f for f in REQUIRED_FIELDS if f not in body]
    if missing:
        return (
            jsonify(
                {
                    "success": False,
                    "error": f"Missing required fields: {missing}",
                }
            ),
            400,
        )

    # --- Validate numeric types ---
    invalid = []
    for field in REQUIRED_FIELDS:
        val = body.get(field)
        if not isinstance(val, (int, float)):
            invalid.append(field)
    if invalid:
        return (
            jsonify(
                {
                    "success": False,
                    "error": f"Fields must be numeric: {invalid}",
                }
            ),
            400,
        )

    # --- Run prediction ---
    try:
        prediction = threat_model.predict(body)
    except FileNotFoundError as exc:
        logger.error("Model files missing: %s", exc)
        return (
            jsonify(
                {
                    "success": False,
                    "error": "Model not loaded. Please contact the administrator.",
                }
            ),
            500,
        )
    except Exception as exc:
        logger.exception("Unexpected error during prediction: %s", exc)
        return (
            jsonify(
                {
                    "success": False,
                    "error": "An internal error occurred during prediction.",
                }
            ),
            500,
        )

    logger.info(
        "Prediction: level=%s score=%.2f confidence=%.2f%%",
        prediction["threatLevel"],
        prediction["threatScore"],
        prediction["confidence"],
    )

    return (
        jsonify(
            {
                "success": True,
                "prediction": prediction,
                "timestamp": _utc_now_iso(),
            }
        ),
        200,
    )


# ---------------------------------------------------------------------------
# 404 / 405 handlers
# ---------------------------------------------------------------------------

@app.errorhandler(404)
def not_found(error):
    return (
        jsonify(
            {
                "success": False,
                "error": f"Endpoint not found. Available: POST /predict, GET /health, GET /model-info",
            }
        ),
        404,
    )


@app.errorhandler(405)
def method_not_allowed(error):
    return (
        jsonify({"success": False, "error": "HTTP method not allowed for this endpoint."}),
        405,
    )


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    logger.info("Starting Cyber Threat Prediction API on port %d ...", port)
    app.run(host="0.0.0.0", port=port, debug=False)
