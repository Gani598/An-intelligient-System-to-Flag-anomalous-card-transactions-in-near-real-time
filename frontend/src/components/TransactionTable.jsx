import React, { useState } from 'react';
import { Search, Filter, Check, X, ExternalLink, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function TransactionTable({ transactions, onInspect, onReviewStatus }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = transactions.filter(t => {
    const matchesSearch = 
      t.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.amount.toString().includes(searchTerm);

    if (!matchesSearch) return false;

    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'FLAGGED') return t.is_fraud;
    if (statusFilter === 'APPROVED') return t.status === 'APPROVED';
    if (statusFilter === 'CONFIRMED') return t.status === 'CONFIRMED_FRAUD';
    if (statusFilter === 'FALSE_POSITIVE') return t.status === 'FALSE_POSITIVE';
    return true;
  });

  return (
    <div className="glass-panel" style={{ overflow: 'hidden' }}>
      {/* Header & Controls */}
      <div style={{
        padding: '1.1rem 1.5rem',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#ffffff' }}>
            Historical Transaction Audit & Case Management
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Search and review flagged transactions, false positive adjustments, and investigation records.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-dim)' }} />
            <input
              type="text"
              placeholder="Search TX ID or Amount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.45rem 0.75rem 0.45rem 2.2rem',
                color: '#ffffff',
                fontSize: '0.82rem',
                outline: 'none',
                width: 210
              }}
            />
          </div>

          {/* Filter Pills */}
          <div className="tab-nav">
            {['ALL', 'FLAGGED', 'APPROVED', 'CONFIRMED', 'FALSE_POSITIVE'].map(f => (
              <button
                key={f}
                className={`tab-btn ${statusFilter === f ? 'active' : ''}`}
                onClick={() => setStatusFilter(f)}
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', maxHeight: '620px' }}>
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
              <th style={{ padding: '0.75rem 1rem' }}>Status</th>
              <th style={{ padding: '0.75rem 1rem' }}>Severity</th>
              <th style={{ padding: '0.75rem 1rem' }}>Analyst Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                  No transactions match the selected filters.
                </td>
              </tr>
            ) : (
              filtered.map((tx, idx) => {
                const isCritical = tx.severity === 'CRITICAL';
                const isHigh = tx.severity === 'HIGH';
                const isMed = tx.severity === 'MEDIUM';

                let badgeClass = 'badge-low';
                if (isCritical) badgeClass = 'badge-critical';
                else if (isHigh) badgeClass = 'badge-high';
                else if (isMed) badgeClass = 'badge-medium';

                return (
                  <tr
                    key={tx.transaction_id || idx}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      background: tx.status === 'CONFIRMED_FRAUD'
                        ? 'rgba(239, 68, 68, 0.08)'
                        : tx.status === 'FALSE_POSITIVE'
                        ? 'rgba(16, 185, 129, 0.05)'
                        : (idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.01)'),
                      transition: 'background 0.15s ease'
                    }}
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
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 600,
                        color: tx.is_fraud ? '#f87171' : '#4ade80'
                      }}>
                        {(tx.risk_score * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        background: tx.status === 'CONFIRMED_FRAUD' ? 'rgba(239, 68, 68, 0.2)' :
                                    tx.status === 'FALSE_POSITIVE' ? 'rgba(16, 185, 129, 0.2)' :
                                    tx.status === 'FLAGGED' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        color: tx.status === 'CONFIRMED_FRAUD' ? '#fca5a5' :
                               tx.status === 'FALSE_POSITIVE' ? '#86efac' :
                               tx.status === 'FLAGGED' ? '#fcd34d' : 'var(--text-muted)'
                      }}>
                        {tx.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className={`badge ${badgeClass}`} style={{ fontSize: '0.68rem' }}>
                        {tx.severity}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <button
                          className="btn btn-secondary"
                          onClick={() => onInspect(tx)}
                          style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                          title="Inspect Features"
                        >
                          <ExternalLink size={13} />
                        </button>

                        {tx.is_fraud && tx.status !== 'CONFIRMED_FRAUD' && (
                          <button
                            className="btn btn-danger"
                            onClick={() => onReviewStatus(tx.transaction_id, 'CONFIRMED_FRAUD')}
                            style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                            title="Confirm as Fraudulent"
                          >
                            <Check size={13} /> Confirm Fraud
                          </button>
                        )}

                        {tx.is_fraud && tx.status !== 'FALSE_POSITIVE' && (
                          <button
                            className="btn btn-success"
                            onClick={() => onReviewStatus(tx.transaction_id, 'FALSE_POSITIVE')}
                            style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                            title="Mark as False Positive"
                          >
                            <X size={13} /> Dismiss
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
