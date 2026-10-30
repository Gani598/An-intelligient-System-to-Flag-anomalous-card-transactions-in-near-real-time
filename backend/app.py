import os
import sys
import time
import json
import uuid
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS


# Add local directories to sys.path
BASE_DIR = os.path.dirname(__file__)
sys.path.append(BASE_DIR)
sys.path.append(os.path.join(BASE_DIR, 'database'))
sys.path.append(os.path.join(BASE_DIR, 'model'))

from database.db import (
    log_transaction,
    get_recent_transactions,
    get_stats,
    update_transaction_status,
    get_config,
    set_config,
    get_connection
)

app = Flask(__name__)
CORS(app)

# Load Model Artifacts
MODEL_PATH = os.path.join(BASE_DIR, 'model', 'fraud_model.joblib')
SCALER_PATH = os.path.join(BASE_DIR, 'model', 'scaler.joblib')
METADATA_PATH = os.path.join(BASE_DIR, 'model', 'model_metadata.json')
TEST_STREAM_PATH = os.path.join(BASE_DIR, 'model', 'test_stream_samples.json')
REPORTS_DIR = os.path.join(BASE_DIR, 'static_reports')

model = None
scaler = None
metadata = {}
test_stream = []
stream_index = 0

def load_artifacts():
    global model, scaler, metadata, test_stream
    if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
        model = joblib.load(MODEL_PATH)
        scaler = joblib.load(SCALER_PATH)
        print("[Server] Successfully loaded trained Logistic Regression model and StandardScaler.")
    else:
        print("[Server Warning] Model artifacts not found. Please run train_model.py first.")

    if os.path.exists(METADATA_PATH):
        with open(METADATA_PATH, 'r') as f:
            metadata = json.load(f)

    if os.path.exists(TEST_STREAM_PATH):
        with open(TEST_STREAM_PATH, 'r') as f:
            test_stream = json.load(f)
        print(f"[Server] Loaded {len(test_stream)} test transactions for real-time simulation.")

load_artifacts()

def compute_risk_severity(prob):
    """Categorizes fraud probability into four security severity tiers."""
    if prob >= 0.80:
        return 'CRITICAL'
    elif prob >= 0.50:
        return 'HIGH'
    elif prob >= 0.20:
        return 'MEDIUM'
    return 'LOW'

def explain_prediction(features_dict, amount, prob):
    """
    Identifies top contributing factors that influenced the fraud risk score,
    providing human-understandable explainability for bank risk officers.
    """
    factors = []
    
    # 1. Check Amount anomalies
    if amount >= 1000:
        factors.append({
            'feature': 'Amount',
            'value': f"${amount:,.2f}",
            'impact': 'High transaction volume far exceeding standard cardholder median ($25-$80).'
        })
    elif amount < 5.0 and prob >= 0.5:
        factors.append({
            'feature': 'Amount',
            'value': f"${amount:,.2f}",
            'impact': 'Card-testing micro transaction typical of automated brute-force card validation.'
        })

    # 2. Check key known PCA indicators based on model coefficients
    key_indicators = [
        ('V12', -3.0, 'Heavy negative deviation in transaction velocity/account velocity (V12).'),
        ('V14', -3.0, 'Severe anomaly in authentication & behavioral pattern signature (V14).'),
        ('V10', -3.0, 'Unusual cross-device / terminal geographical disparity (V10).'),
        ('V17', -3.0, 'Anomalous merchant category mismatch and card-present signal (V17).'),
        ('V4', 2.5, 'Sharp atypical spike in risk factor V4.'),
        ('V11', 2.5, 'Anomalous elevation in authentication retry counter (V11).')
    ]

    for feat, thresh, desc in key_indicators:
        val = features_dict.get(feat, 0.0)
        if (thresh < 0 and val <= thresh) or (thresh > 0 and val >= thresh):
            factors.append({
                'feature': feat,
                'value': f"{val:+.2f}",
                'impact': desc
            })

    if not factors:
        factors.append({
            'feature': 'Pattern Match',
            'value': 'Baseline',
            'impact': 'Transaction pattern closely matches normal consumer spending signatures.'
        })

    return factors[:3]

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'HEALTHY',
        'model_loaded': model is not None,
        'scaler_loaded': scaler is not None,
        'total_stream_samples': len(test_stream),
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/api/metadata', methods=['GET'])
def get_metadata():
    if not metadata:
        load_artifacts()
    return jsonify(metadata)

@app.route('/api/stats', methods=['GET'])
def stats():
    st = get_stats()
    threshold = float(get_config('decision_threshold', 0.50))
    st['decision_threshold'] = threshold
    return jsonify(st)

@app.route('/api/transactions', methods=['GET'])
def transactions():
    limit = int(request.args.get('limit', 50))
    status_filter = request.args.get('status')
    fraud_only = request.args.get('fraud_only', 'false').lower() == 'true'
    txs = get_recent_transactions(limit=limit, status_filter=status_filter, fraud_only=fraud_only)
    return jsonify({'transactions': txs, 'count': len(txs)})

FEATURE_COLS = ['Time'] + [f'V{i}' for i in range(1, 29)] + ['Amount']

def score_transaction_record(amount, time_sec, features, ground_truth=None, tx_id=None):
    """Core scoring function accepting raw features and returning a full scored record."""
    start_time = time.perf_counter()
    raw_vector = [time_sec] + [float(features.get(f'V{i}', 0.0)) for i in range(1, 29)] + [amount]
    
    # Use DataFrame to preserve feature column names and suppress sklearn warnings
    df_in = pd.DataFrame([raw_vector], columns=FEATURE_COLS)
    X_scaled = scaler.transform(df_in)

    prob_fraud = float(model.predict_proba(X_scaled)[0, 1])
    threshold = float(get_config('decision_threshold', 0.50))
    is_fraud = bool(prob_fraud >= threshold)
    severity = compute_risk_severity(prob_fraud)
    top_factors = explain_prediction(features, amount, prob_fraud)
    latency_ms = round((time.perf_counter() - start_time) * 1000.0, 2)

    assigned_id = tx_id or f"TX-{uuid.uuid4().hex[:8].upper()}"

    tx_record = {
        'transaction_id': assigned_id,
        'timestamp': datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S'),
        'amount': round(amount, 2),
        'time_sec': round(time_sec, 1),
        'features': features,
        'risk_score': round(prob_fraud, 4),
        'is_fraud': is_fraud,
        'ground_truth': ground_truth,
        'severity': severity,
        'status': 'FLAGGED' if is_fraud else 'APPROVED',
        'latency_ms': latency_ms,
        'top_factors': top_factors
    }

    log_transaction(tx_record)
    return tx_record

@app.route('/api/predict', methods=['POST'])
def predict():
    """Near real-time inference endpoint."""
    if model is None or scaler is None:
        return jsonify({'error': 'Model or scaler not initialized'}), 500

    data = request.get_json() or {}
    amount = float(data.get('amount', 50.0))
    time_sec = float(data.get('time_sec', 3600.0))
    features = data.get('features', {})
    ground_truth = data.get('ground_truth')
    tx_id = data.get('transaction_id')

    tx_record = score_transaction_record(amount, time_sec, features, ground_truth, tx_id)
    return jsonify(tx_record)

def generate_next_stream_record():
    """Pulls or synthesizes next streaming record and scores it."""
    global stream_index
    if not test_stream:
        load_artifacts()
    
    if not test_stream:
        is_sim_fraud = np.random.rand() < 0.15
        amount = float(np.random.uniform(300, 1800) if is_sim_fraud else np.random.uniform(10, 120))
        features = {}
        for i in range(1, 29):
            base_val = float(np.random.randn())
            if is_sim_fraud and i in [14, 12, 10, 17]:
                base_val -= float(np.random.uniform(4.5, 7.5))
            elif is_sim_fraud and i in [4, 11, 2]:
                base_val += float(np.random.uniform(3.0, 5.0))
            features[f'V{i}'] = round(base_val, 4)
        
        sample = {
            'amount': round(amount, 2),
            'time_sec': round(float(np.random.uniform(1000, 150000)), 1),
            'ground_truth': 1 if is_sim_fraud else 0,
            'features': features
        }
    else:
        sample = test_stream[stream_index % len(test_stream)]
        stream_index += 1

    return score_transaction_record(
        amount=sample['amount'],
        time_sec=sample.get('time_sec', 0.0),
        features=sample['features'],
        ground_truth=sample.get('ground_truth')
    )

@app.route('/api/simulate/next', methods=['POST'])
def simulate_next():
    """Simulates near real-time arrival of live transactions."""
    tx_record = generate_next_stream_record()
    return jsonify(tx_record)

@app.route('/api/transactions/<tx_id>/review', methods=['POST'])
def review_transaction(tx_id):
    """Fraud analyst action: update status to CONFIRMED_FRAUD, FALSE_POSITIVE, or APPROVED."""
    body = request.get_json() or {}
    new_status = body.get('status', 'CONFIRMED_FRAUD')
    notes = body.get('notes', f"Reviewed by Risk Officer on {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}")
    
    update_transaction_status(tx_id, new_status, notes)
    return jsonify({'success': True, 'transaction_id': tx_id, 'new_status': new_status})

@app.route('/api/config', methods=['GET', 'POST'])
def handle_config():
    if request.method == 'POST':
        data = request.get_json() or {}
        if 'decision_threshold' in data:
            val = float(data['decision_threshold'])
            if 0.05 <= val <= 0.95:
                set_config('decision_threshold', str(round(val, 2)))
        if 'auto_block_critical' in data:
            set_config('auto_block_critical', 'true' if data['auto_block_critical'] else 'false')
        return jsonify({'success': True, 'threshold': float(get_config('decision_threshold', 0.50))})

    return jsonify({
        'decision_threshold': float(get_config('decision_threshold', 0.50)),
        'auto_block_critical': get_config('auto_block_critical', 'true') == 'true'
    })

@app.route('/api/reports/<path:filename>', methods=['GET'])
def get_report_image(filename):
    """Serves generated Matplotlib/Seaborn visualization graphs."""
    return send_from_directory(REPORTS_DIR, filename)

@app.route('/api/reset_demo', methods=['POST'])
def reset_demo():
    """Resets transaction history and seeds fresh demonstration events."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM alerts')
    cursor.execute('DELETE FROM transactions')
    conn.commit()
    conn.close()

    # Pre-seed 8 realistic recent transactions for instant demonstration
    for _ in range(8):
        generate_next_stream_record()

    return jsonify({'success': True, 'message': 'Demo data reset and seeded with initial transactions.'})

if __name__ == '__main__':
    # Initialize DB and seed demo data if empty
    current_txs = get_recent_transactions(limit=1)
    if not current_txs:
        print("[Server] Initializing transaction history with initial batch...")
        for _ in range(8):
            generate_next_stream_record()
            
    print("[Server] Starting Bank Fraud Detection API on http://127.0.0.1:5000 ...")
    app.run(host='127.0.0.1', port=5000, debug=False)

