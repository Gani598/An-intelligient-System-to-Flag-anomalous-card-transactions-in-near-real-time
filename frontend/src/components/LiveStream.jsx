import React, { useState } from 'react';
import { Play, Pause, FastForward, ShieldAlert, CheckCircle2, AlertOctagon, ExternalLink, Filter } from 'lucide-react';

export default function LiveStream({
  transactions,
  isSimulating,
  onToggleSimulate,
  simSpeed,
  onChangeSpeed,
  onSimulateNext,
  onInspectTransaction
}) {
  const [filterAnomaliesOnly, setFilterAnomaliesOnly] = useState(false);

  const displayedTransactions = filterAnomaliesOnly
    ? transactions.filter(t => t.is_fraud)
    : transactions;

  // Most recent flagged transaction for live banner
  const latestAlert = transactions.find(t => t.is_fraud);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Simulation Controls Bar */}
      <div className="glass-panel" style={{
        padding: '1rem 1.35rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            className={`btn ${isSimulating ? 'btn-danger' : 'btn-primary'}`}
            onClick={onToggleSimulate}
            style={{ minWidth: 140 }}
          >
            {isSimulating ? <Pause size={16} /> : <Play size={16} />}
            {isSimulating ? 'Pause Stream' : 'Start Live Stream'}
          </button>

          <button
            className="btn btn-secondary"
            onClick={onSimulateNext}
            title="Evaluate single next transaction from benchmark stream"
          >
            <FastForward size={16} /> Next Transaction
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>Speed:</span>
            <select
              value={simSpeed}
              onChange={(e) => onChangeSpeed(Number(e.target.value))}
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                color: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.35rem 0.6rem',
                fontSize: '0.8rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value={800}>Fast (0.8s)</option>
              <option value={1500}>Normal (1.5s)</option>
              <option value={3000}>Slow (3.0s)</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={filterAnomaliesOnly}
              onChange={(e) => setFilterAnomaliesOnly(e.target.checked)}
              style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
            <Filter size={14} /> Only Flagged ({transactions.filter(t => t.is_fraud).length})
          </label>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.78rem',
            color: isSimulating ? 'var(--risk-low)' : 'var(--text-dim)',
            background: isSimulating ? 'var(--risk-low-bg)' : 'rgba(255,255,255,0.03)',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            border: `1px solid ${isSimulating ? 'var(--risk-low-border)' : 'var(--border-subtle)'}`
          }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: isSimulating ? 'var(--risk-low)' : 'var(--text-dim)',
              display: 'inline-block',
              animation: isSimulating ? 'pulse-dot 1.2s infinite' : 'none'
            }} />
            {isSimulating ? 'Ingesting Real-Time Stream' : 'Simulation Paused'}
          </div>
        </div>
      </div>

      {/* Real-time Alert Banner if an anomaly was recently caught */}
      {latestAlert && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.16) 0%, rgba(18, 26, 45, 0.9) 100%)',
          border: '1px solid var(--risk-critical-border)',
          borderRadius: 'var(--radius-md)',
          padding: '0.9rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          animation: 'slideDownAlert 0.3s ease',
          boxShadow: '0 0 20px rgba(239, 68, 68, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'var(--risk-critical-bg)',
              color: 'var(--risk-critical)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <AlertOctagon size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.9rem' }}>
                  Suspicious Card Activity Intercepted: {latestAlert.transaction_id}
                </span>
                <span className="badge badge-critical" style={{ fontSize: '0.68rem' }}>
                  Risk Score {(latestAlert.risk_score * 100).toFixed(1)}%
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Amount: <strong style={{ color: '#fff' }}>${latestAlert.amount.toFixed(2)}</strong> | 
                Primary Indicator: <span style={{ color: '#fca5a5' }}>
                  {latestAlert.top_factors && latestAlert.top_factors[0] ? latestAlert.top_factors[0].impact : 'Statistical anomaly in PCA space'}
                </span>
              </div>
            </div>
          </div>

          <button
            className="btn btn-secondary"
            onClick={() => onInspectTransaction(latestAlert)}
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}
          >
            Review Alert <ExternalLink size={14} />
          </button>
        </div>
      )}

      {/* Stream Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{
          padding: '0.9rem 1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff' }}>
            Live Transaction Stream & Risk Scorer
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Showing {displayedTransactions.length} recent transactions
          </span>
        </div>

        <div style={{ overflowX: 'auto', maxHeight: '560px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{
                background: 'rgba(15, 23, 42, 0.95)',
                color: 'var(--text-muted)',
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                borderBottom: '1px solid var(--border-subtle)',
                position: 'sticky',
                top: 0,
                zIndex: 10
              }}>
                <th style={{ padding: '0.75rem 1rem' }}>Tx ID</th>
                <th style={{ padding: '0.75rem 1rem' }}>Timestamp</th>
                <th style={{ padding: '0.75rem 1rem' }}>Amount</th>
                <th style={{ padding: '0.75rem 1rem' }}>Risk Score</th>
                <th style={{ padding: '0.75rem 1rem' }}>Severity</th>
                <th style={{ padding: '0.75rem 1rem' }}>Top Contributing Factor</th>
                <th style={{ padding: '0.75rem 1rem' }}>Latency</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                    No transactions to display. Click "Start Live Stream" or "Next Transaction" to score transactions.
                  </td>
                </tr>
              ) : (
                displayedTransactions.map((tx, idx) => {
                  const isCritical = tx.severity === 'CRITICAL';
                  const isHigh = tx.severity === 'HIGH';
                  const isMed = tx.severity === 'MEDIUM';

                  let badgeClass = 'badge-low';
                  if (isCritical) badgeClass = 'badge-critical';
                  else if (isHigh) badgeClass = 'badge-high';
                  else if (isMed) badgeClass = 'badge-medium';

                  const topFactor = tx.top_factors && tx.top_factors[0] ? tx.top_factors[0] : null;

                  return (
                    <tr
                      key={tx.transaction_id || idx}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        background: tx.is_fraud
                          ? 'rgba(239, 68, 68, 0.05)'
                          : (idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.01)'),
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = tx.is_fraud ? 'rgba(239, 68, 68, 0.05)' : (idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.01)')}
                    >
                      <td style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#cbd5e1' }}>
                        {tx.transaction_id}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                        {tx.timestamp}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#ffffff' }}>
                        ${tx.amount.toFixed(2)}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', width: 140 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{
                            flex: 1,
                            height: 6,
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: 'var(--radius-full)',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${Math.min(100, Math.max(0, tx.risk_score * 100))}%`,
                              height: '100%',
                              background: tx.is_fraud
                                ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                                : '#10b981',
                              borderRadius: 'var(--radius-full)'
                            }} />
                          </div>
                          <span style={{
                            fontSize: '0.75rem',
                            fontFamily: 'var(--font-mono)',
                            color: tx.is_fraud ? '#fca5a5' : '#86efac',
                            minWidth: 42
                          }}>
                            {(tx.risk_score * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span className={`badge ${badgeClass}`}>
                          {tx.severity}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.78rem', maxWidth: 280 }}>
                        {topFactor ? (
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={topFactor.impact}>
                            <strong style={{ color: '#cbd5e1' }}>{topFactor.feature} ({topFactor.value}):</strong> {topFactor.impact}
                          </div>
                        ) : 'Pattern Normal'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-dim)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                        {tx.latency_ms ? `${tx.latency_ms} ms` : '1.8 ms'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary"
                          onClick={() => onInspectTransaction(tx)}
                          style={{ padding: '0.3rem 0.65rem', fontSize: '0.72rem' }}
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
