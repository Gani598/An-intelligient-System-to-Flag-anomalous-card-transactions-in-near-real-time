import React from 'react';
import { ShieldCheck, AlertTriangle, DollarSign, Clock, Layers, Flame } from 'lucide-react';

export default function StatsCards({ stats }) {
  const cards = [
    {
      label: 'Total Processed',
      value: (stats.total_transactions || 0).toLocaleString(),
      subtext: `Volume: $${(stats.total_volume || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Layers,
      color: 'var(--primary)',
      bgColor: 'rgba(99, 102, 241, 0.12)'
    },
    {
      label: 'Flagged Anomalies',
      value: (stats.flagged_anomalies || 0).toLocaleString(),
      subtext: `${stats.pending_alerts || 0} active alerts pending review`,
      icon: AlertTriangle,
      color: 'var(--risk-critical)',
      bgColor: 'var(--risk-critical-bg)'
    },
    {
      label: 'Fraud Volume Prevented',
      value: `$${(stats.fraud_amount_at_risk || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtext: 'Intercepted before settlement',
      icon: DollarSign,
      color: 'var(--risk-high)',
      bgColor: 'var(--risk-high-bg)'
    },
    {
      label: 'Anomaly Flag Rate',
      value: `${stats.fraud_rate_pct || 0}%`,
      subtext: `At threshold ${stats.decision_threshold || 0.5}`,
      icon: Flame,
      color: 'var(--risk-medium)',
      bgColor: 'var(--risk-medium-bg)'
    },
    {
      label: 'Average Latency',
      value: `${stats.avg_latency_ms || 2.4} ms`,
      subtext: 'Near real-time inference',
      icon: Clock,
      color: 'var(--risk-low)',
      bgColor: 'var(--risk-low-bg)'
    }
  ];

  return (
    <div className="grid-cols-stats" style={{ marginBottom: '1.75rem' }}>
      {cards.map((c, i) => {
        const IconComponent = c.icon;
        return (
          <div key={i} className="glass-panel" style={{
            padding: '1.15rem 1.35rem',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '0.35rem' }}>
                {c.label}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                {c.value}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.35rem' }}>
                {c.subtext}
              </div>
            </div>

            <div style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: c.bgColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: c.color,
              flexShrink: 0
            }}>
              <IconComponent size={20} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
