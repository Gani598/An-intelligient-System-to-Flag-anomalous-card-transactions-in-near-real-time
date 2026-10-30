import React, { useState } from 'react';
import { X, Sliders, ShieldAlert, Check } from 'lucide-react';

export default function ThresholdSettingsModal({ currentThreshold, onClose, onSaveThreshold }) {
  const [threshold, setThreshold] = useState(currentThreshold || 0.50);
  const [autoBlock, setAutoBlock] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision_threshold: threshold,
          auto_block_critical: autoBlock
        })
      });
      setSaved(true);
      setTimeout(() => {
        onSaveThreshold(threshold);
        onClose();
      }, 500);
    } catch (err) {
      console.error('Failed to save config:', err);
    }
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
        maxWidth: 540,
        background: '#0e1726',
        border: '1px solid var(--border-glow)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Sliders size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
              Fraud Decision Threshold & Sensitivity
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff' }}>
                Classification Cut-Off Threshold (τ)
              </label>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--primary)'
              }}>
                {Number(threshold).toFixed(2)}
              </span>
            </div>

            <input
              type="range"
              min="0.10"
              max="0.90"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer', height: 8 }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.35rem' }}>
              <span>0.10 (Aggressive / High Recall)</span>
              <span>0.50 (Standard)</span>
              <span>0.90 (Conservative / High Precision)</span>
            </div>
          </div>

          {/* Trade-off Explainer */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.85rem 1rem',
            fontSize: '0.78rem',
            color: 'var(--text-muted)'
          }}>
            <strong style={{ color: '#ffffff' }}>Impact Analysis:</strong>
            {threshold < 0.40 ? (
              <p style={{ marginTop: '0.25rem', color: '#fcd34d' }}>
                ⚠️ <strong>Higher Recall Mode:</strong> Lowering the threshold flags more subtle, borderline transactions as anomalies. You will catch almost 100% of fraud, but expect a slight increase in analyst review workload (false positives).
              </p>
            ) : threshold > 0.60 ? (
              <p style={{ marginTop: '0.25rem', color: '#67e8f9' }}>
                🛡️ <strong>Higher Precision Mode:</strong> Raising the threshold requires stronger statistical evidence before raising an alert. Reduces false alarm fatigue, but may let borderline fraud slip through.
              </p>
            ) : (
              <p style={{ marginTop: '0.25rem', color: '#cbd5e1' }}>
                ⚖️ <strong>Balanced Mode:</strong> 0.50 cutoff provides the mathematically optimal F1 balance calibrated by the SMOTE-balanced training distribution.
              </p>
            )}
          </div>

          {/* Auto-block toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ffffff' }}>
                Auto-Block Critical Severity (≥ 80%)
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                Immediately decline card authorization in real-time
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoBlock}
              onChange={(e) => setAutoBlock(e.target.checked)}
              style={{ accentColor: 'var(--primary)', width: 18, height: 18, cursor: 'pointer' }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saved}>
              {saved ? (
                <>
                  <Check size={16} /> Saved!
                </>
              ) : (
                'Save Sensitivity'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
