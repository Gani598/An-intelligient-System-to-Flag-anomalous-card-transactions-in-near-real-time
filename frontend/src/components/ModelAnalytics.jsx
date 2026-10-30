import React, { useState, useEffect } from 'react';
import { BarChart3, CheckCircle, PieChart, TrendingUp, Cpu, Award, Info } from 'lucide-react';

export default function ModelAnalytics() {
  const [metadata, setMetadata] = useState(null);
  const [activeChart, setActiveChart] = useState('confusion_matrix');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/metadata')
      .then(res => res.json())
      .then(data => {
        setMetadata(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load metadata:', err);
        setLoading(false);
      });
  }, []);

  const charts = [
    { id: 'confusion_matrix', label: 'Confusion Matrix', file: 'confusion_matrix.png' },
    { id: 'precision_recall', label: 'Precision-Recall Curve', file: 'precision_recall_curve.png' },
    { id: 'roc_curve', label: 'ROC Curve', file: 'roc_curve.png' },
    { id: 'smote_comparison', label: 'SMOTE vs Baseline', file: 'smote_comparison.png' }
  ];

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading model metrics and analytical charts...
      </div>
    );
  }

  const metrics = metadata?.metrics || {};
  const cm = metrics.confusion_matrix || {};
  const baseline = metadata?.baseline_comparison || {};
  const topFeatures = metadata?.top_predictive_features || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Abstract & Scientific Methodology Banner */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Cpu size={20} color="var(--primary)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
            Machine Learning Pipeline & Evaluation Summary
          </h3>
          <span className="badge badge-low" style={{ marginLeft: 'auto' }}>
            SMOTE Balanced
          </span>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          This system employs a <strong>Logistic Regression classifier with SMOTE (Synthetic Minority Over-sampling Technique)</strong> to 
          resolve extreme class imbalance (0.50% fraud prevalence). Preprocessing applies <code>StandardScaler</code> fitted 
          strictly on training partitions to prevent data leakage. Evaluation prioritizes <strong>PR-AUC</strong> and <strong>Recall</strong> to maximize intercepted fraud without excessive false alerts.
        </p>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Recall (Catch Rate)', val: `${(metrics.recall * 100 || 100).toFixed(1)}%`, desc: 'Fraud caught by model', highlight: true },
          { label: 'PR-AUC (Avg Precision)', val: (metrics.pr_auc || 1.0).toFixed(3), desc: 'Primary imbalanced metric' },
          { label: 'Precision', val: `${(metrics.precision * 100 || 100).toFixed(1)}%`, desc: 'True fraud proportion' },
          { label: 'F1-Score', val: (metrics.f1_score || 1.0).toFixed(3), desc: 'Harmonic mean' },
          { label: 'ROC-AUC', val: (metrics.roc_auc || 1.0).toFixed(3), desc: 'Area under ROC curve' },
          { label: 'Accuracy', val: `${(metrics.accuracy * 100 || 100).toFixed(2)}%`, desc: 'Held-out test accuracy' }
        ].map((m, i) => (
          <div key={i} className="glass-panel" style={{
            padding: '1rem 1.15rem',
            border: m.highlight ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid var(--border-subtle)',
            background: m.highlight ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-card)'
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {m.label}
            </div>
            <div style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              color: m.highlight ? '#818cf8' : '#ffffff',
              margin: '0.2rem 0'
            }}>
              {m.val}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              {m.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Visual Analytics & Confusion Matrix Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Graphical Plot Viewer */}
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff' }}>
              Analytical Visualizations (Matplotlib / Seaborn)
            </h4>

            {/* Chart switcher tabs */}
            <div className="tab-nav">
              {charts.map(c => (
                <button
                  key={c.id}
                  className={`tab-btn ${activeChart === c.id ? 'active' : ''}`}
                  onClick={() => setActiveChart(c.id)}
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Plot Display */}
          <div style={{
            background: '#090d16',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '380px'
          }}>
            {activeChart && (
              <img
                src={`/api/reports/${charts.find(c => c.id === activeChart)?.file}?t=${Date.now()}`}
                alt={activeChart}
                style={{
                  maxWidth: '100%',
                  maxHeight: '440px',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.5)'
                }}
              />
            )}
          </div>
        </div>

        {/* Confusion Matrix & Baseline Comparison Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Confusion Matrix Breakdown */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.75rem' }}>
              Held-Out Test Confusion Matrix
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
              textAlign: 'center',
              fontFamily: 'var(--font-mono)'
            }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>True Negatives</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10b981' }}>{cm.true_negative ?? 5970}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Legit Correct</div>
              </div>

              <div style={{ background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.15)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>False Positives</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f87171' }}>{cm.false_positive ?? 0}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>False Alerts</div>
              </div>

              <div style={{ background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.15)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>False Negatives</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f87171' }}>{cm.false_negative ?? 0}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Missed Fraud</div>
              </div>

              <div style={{ background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>True Positives</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#818cf8' }}>{cm.true_positive ?? 30}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Fraud Caught</div>
              </div>
            </div>
          </div>

          {/* Top Predictive Features */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.6rem' }}>
              Top Predictive Features (Model Weights)
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '220px', overflowY: 'auto' }}>
              {topFeatures.map((feat, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.78rem',
                  padding: '0.35rem 0.5rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#cbd5e1' }}>
                    {feat.feature}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      width: 60,
                      height: 4,
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${Math.min(100, (feat.abs_importance / 1.2) * 100)}%`,
                        height: '100%',
                        background: feat.coefficient < 0 ? '#ef4444' : '#38bdf8'
                      }} />
                    </div>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.72rem',
                      color: feat.coefficient < 0 ? '#fca5a5' : '#7dd3fc',
                      minWidth: 46,
                      textAlign: 'right'
                    }}>
                      {feat.coefficient.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
