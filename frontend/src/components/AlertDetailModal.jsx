import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle, AlertOctagon, CornerDownRight } from 'lucide-react';

export default function AlertDetailModal({ transaction, onClose, onReviewStatus }) {
  const [notes, setNotes] = useState('');

  if (!transaction) return null;

  const features = transaction.features || {};
  const topFactors = transaction.top_factors || [];

  const handleAction = (status) => {
    onReviewStatus(transaction.transaction_id, status, notes);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1.5rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: 780,
        maxHeight: '90vh',
        overflowY: 'auto',
        background: '#0e1726',
        border: '1px solid var(--border-glow)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg), 0 0 35px rgba(99, 102, 241, 0.2)'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: transaction.is_fraud ? 'var(--risk-critical-bg)' : 'var(--risk-low-bg)',
              color: transaction.is_fraud ? 'var(--risk-critical)' : 'var(--risk-low)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {transaction.is_fraud ? <AlertOctagon size={20} /> : <CheckCircle size={20} />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                  Transaction Inspector: {transaction.transaction_id}
                </h3>
                <span className={`badge ${transaction.severity === 'CRITICAL' ? 'badge-critical' : transaction.severity === 'HIGH' ? 'badge-high' : transaction.severity === 'MEDIUM' ? 'badge-medium' : 'badge-low'}`}>
                  {transaction.severity}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Recorded at {transaction.timestamp} | Latency: {transaction.latency_ms || 2.1} ms
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.4rem' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Summary Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Amount</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>${transaction.amount.toFixed(2)}</div>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Fraud Probability</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: transaction.is_fraud ? '#f87171' : '#4ade80' }}>
                {(transaction.risk_score * 100).toFixed(1)}%
              </div>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Status</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#cbd5e1', marginTop: '0.2rem' }}>{transaction.status}</div>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Time Elapsed</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ffffff' }}>{(transaction.time_sec / 3600).toFixed(1)} hrs</div>
            </div>
          </div>

          {/* Explainable AI Top Factors */}
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.5rem' }}>
              Why was this flagged? (Explainable Factors)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {topFactors.map((tf, i) => (
                <div key={i} style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.8rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: '#ffffff' }}>
                    <span>{tf.feature}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: '#fca5a5' }}>{tf.value}</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.15rem' }}>
                    {tf.impact}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Full 28 PCA Features Grid */}
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.5rem' }}>
              Complete 28 PCA Vector Fingerprint (V1 - V28)
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '0.4rem',
              maxHeight: '180px',
              overflowY: 'auto',
              background: 'rgba(15, 23, 42, 0.8)',
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)'
            }}>
              {Array.from({ length: 28 }, (_, i) => i + 1).map(num => {
                const key = `V${num}`;
                const val = features[key] ?? 0.0;
                const isHeavyNeg = val < -2.5;
                const isHeavyPos = val > 2.5;
                return (
                  <div key={key} style={{
                    padding: '0.3rem 0.4rem',
                    borderRadius: 'var(--radius-sm)',
                    background: isHeavyNeg ? 'rgba(239, 68, 68, 0.25)' : isHeavyPos ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    textAlign: 'center',
                    fontSize: '0.7rem'
                  }}>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.62rem' }}>{key}</div>
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                      color: isHeavyNeg ? '#fca5a5' : isHeavyPos ? '#7dd3fc' : '#94a3b8'
                    }}>
                      {typeof val === 'number' ? val.toFixed(2) : val}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Review Actions */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.5rem' }}>
              Fraud Analyst Review & Case Resolution
            </div>
            <textarea
              placeholder="Add investigation notes or case rationale (optional)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.5rem 0.75rem',
                color: '#ffffff',
                fontSize: '0.8rem',
                outline: 'none',
                resize: 'none',
                marginBottom: '0.75rem'
              }}
            />

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-success"
                onClick={() => handleAction('FALSE_POSITIVE')}
                style={{ fontSize: '0.8rem' }}
              >
                Mark False Positive (Approve)
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleAction('CONFIRMED_FRAUD')}
                style={{ fontSize: '0.8rem' }}
              >
                Confirm Fraud & Blacklist Card
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
