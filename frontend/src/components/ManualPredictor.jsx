import React, { useState } from 'react';
import { Zap, ShieldCheck, AlertTriangle, HelpCircle, ArrowRight, RefreshCw } from 'lucide-react';

export default function ManualPredictor({ onScoredTransaction }) {
  const [amount, setAmount] = useState(45.0);
  const [timeSec, setTimeSec] = useState(43200); // 12 hours
  const [features, setFeatures] = useState({
    V4: 0.1,
    V10: -0.2,
    V11: 0.05,
    V12: -0.15,
    V14: -0.1,
    V17: -0.05
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const presets = [
    {
      name: 'Legitimate Coffee & Bakery',
      amount: 14.50,
      timeSec: 32000,
      features: { V4: 0.12, V10: -0.1, V11: 0.05, V12: -0.08, V14: -0.15, V17: 0.02 },
      badgeColor: 'badge-low'
    },
    {
      name: 'High-Ticket Electronics',
      amount: 420.00,
      timeSec: 72000,
      features: { V4: 1.1, V10: -0.8, V11: 0.6, V12: -0.9, V14: -1.1, V17: -0.7 },
      badgeColor: 'badge-medium'
    },
    {
      name: 'Card-Testing Bot (Micro-Charge)',
      amount: 1.25,
      timeSec: 14500,
      features: { V4: 4.2, V10: -4.8, V11: 3.5, V12: -5.1, V14: -6.2, V17: -5.4 },
      badgeColor: 'badge-critical'
    },
    {
      name: 'Extreme Midnight Account Drain',
      amount: 1890.00,
      timeSec: 10800,
      features: { V4: 5.4, V10: -6.2, V11: 4.1, V12: -6.8, V14: -7.6, V17: -6.9 },
      badgeColor: 'badge-critical'
    }
  ];

  const applyPreset = (p) => {
    setAmount(p.amount);
    setTimeSec(p.timeSec);
    setFeatures(p.features);
  };

  const handleSliderChange = (feat, val) => {
    setFeatures(prev => ({
      ...prev,
      [feat]: parseFloat(val)
    }));
  };

  const handleEvaluate = async () => {
    setLoading(true);
    try {
      const resp = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          time_sec: parseFloat(timeSec),
          features: features
        })
      });
      const data = await resp.json();
      setResult(data);
      if (onScoredTransaction) {
        onScoredTransaction(data);
      }
    } catch (err) {
      console.error('Error scoring transaction:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(300px, 0.8fr)', gap: '1.5rem', alignItems: 'start' }}>
      {/* Input Form Panel */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
              Manual Transaction Inspector
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Inject custom transaction amounts & PCA behavioral features to observe real-time scoring.
            </p>
          </div>
          <Zap size={22} color="var(--primary)" />
        </div>

        {/* Quick Presets */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.6rem' }}>
            Quick Scenario Presets:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
            {presets.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => applyPreset(p)}
                style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.6rem 0.8rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff' }}>{p.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                  ${p.amount.toFixed(2)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Amount & Time */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
              Transaction Amount ($ USD)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.6rem 0.85rem',
                color: '#ffffff',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
              Elapsed Time: {(timeSec / 3600).toFixed(1)} hrs ({timeSec}s)
            </label>
            <input
              type="range"
              min="0"
              max="172800"
              step="3600"
              value={timeSec}
              onChange={(e) => setTimeSec(e.target.value)}
              style={{ width: '100%', accentColor: 'var(--primary)', marginTop: '0.5rem', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Predictive PCA Sliders */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1' }}>
              Top Predictive PCA Components (Model Weighted)
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              Zero = Normal, Negative/Positive = Shift
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { id: 'V12', label: 'V12 (Velocity Discrepancy)', min: -8, max: 4, desc: 'Model Coef: -1.09' },
              { id: 'V10', label: 'V10 (Geo/Terminal Disparity)', min: -8, max: 4, desc: 'Model Coef: -0.82' },
              { id: 'V14', label: 'V14 (Behavioral Signature)', min: -8, max: 4, desc: 'Model Coef: -0.57' },
              { id: 'V17', label: 'V17 (Merchant Anomaly)', min: -8, max: 4, desc: 'Model Coef: -0.72' },
              { id: 'V4', label: 'V4 (Risk Factor Spike)', min: -3, max: 7, desc: 'Model Coef: +0.58' },
              { id: 'V11', label: 'V11 (Auth Retry Anomaly)', min: -3, max: 6, desc: 'Model Coef: +0.33' }
            ].map(feat => (
              <div key={feat.id} style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#cbd5e1', fontWeight: 500 }}>{feat.label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: features[feat.id] < 0 ? '#f87171' : '#38bdf8' }}>
                    {features[feat.id] ? features[feat.id].toFixed(2) : '0.00'}
                  </span>
                </div>
                <input
                  type="range"
                  min={feat.min}
                  max={feat.max}
                  step="0.1"
                  value={features[feat.id] || 0}
                  onChange={(e) => handleSliderChange(feat.id, e.target.value)}
                  style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
              </div>
            ))}
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleEvaluate}
          disabled={loading}
          style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }}
        >
          {loading ? (
            <>
              <RefreshCw size={16} className="animate-spin" /> Evaluating Model...
            </>
          ) : (
            <>
              Score Transaction in Real Time <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>

      {/* Real-time Verdict Output Panel */}
      <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '440px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.35rem' }}>
          Prediction Verdict & Explainability
        </h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Logistic Regression Sigmoid Output & Risk Factor Analysis
        </p>

        {result ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
            {/* Risk Probability Hero */}
            <div style={{
              background: result.is_fraud
                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(18, 26, 45, 0.8) 100%)'
                : 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(18, 26, 45, 0.8) 100%)',
              border: `1px solid ${result.is_fraud ? 'var(--risk-critical-border)' : 'var(--risk-low-border)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Estimated Fraud Probability
              </div>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                color: result.is_fraud ? '#ef4444' : '#10b981',
                margin: '0.35rem 0'
              }}>
                {(result.risk_score * 100).toFixed(1)}%
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className={`badge ${result.severity === 'CRITICAL' ? 'badge-critical' : result.severity === 'HIGH' ? 'badge-high' : result.severity === 'MEDIUM' ? 'badge-medium' : 'badge-low'}`}>
                  {result.severity} RISK
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  Latency: {result.latency_ms} ms
                </span>
              </div>
            </div>

            {/* Verdict summary */}
            <div style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.82rem'
            }}>
              <div style={{ fontWeight: 600, color: '#ffffff', marginBottom: '0.2rem' }}>
                Automated Action: {result.is_fraud ? '🚨 FLAGGED FOR IMMEDIATE REVIEW' : '✅ TRANSACTION APPROVED'}
              </div>
              <div style={{ color: 'var(--text-muted)' }}>
                {result.is_fraud
                  ? `Transaction risk score exceeds decision threshold (0.50). Blocked from automated straight-through processing.`
                  : `Transaction is within safe statistical tolerances. Processed straight through.`}
              </div>
            </div>

            {/* Explainable AI Top Factors */}
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.6rem' }}>
                Primary Contributing Factors:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {result.top_factors && result.top_factors.map((tf, i) => (
                  <div key={i} style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.65rem 0.85rem',
                    fontSize: '0.78rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ffffff', fontWeight: 600, marginBottom: '0.15rem' }}>
                      <span>{tf.feature}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{tf.value}</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)' }}>{tf.impact}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px dashed var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '2rem',
            textAlign: 'center',
            color: 'var(--text-dim)'
          }}>
            <ShieldCheck size={40} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
            <div style={{ fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              Awaiting Transaction Input
            </div>
            <div style={{ fontSize: '0.78rem' }}>
              Select a scenario preset on the left or customize values, then click "Score Transaction".
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
