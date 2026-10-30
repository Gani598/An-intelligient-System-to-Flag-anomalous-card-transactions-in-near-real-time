import React from 'react';
import { ShieldAlert, Activity, Sliders, RotateCcw, Zap } from 'lucide-react';

export default function Navbar({ 
  stats, 
  activeTab, 
  setActiveTab, 
  onOpenSettings, 
  onResetDemo, 
  isSimulating, 
  onToggleSimulate 
}) {
  return (
    <header style={{
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0.9rem 2rem'
    }}>
      <div style={{
        maxWidth: 1440,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)'
          }}>
            <ShieldAlert size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
                Bank Fraud-Alert Console
              </h1>
              <span className="badge badge-low" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
                <span style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--risk-low)',
                  display: 'inline-block',
                  animation: 'pulse-dot 1.5s infinite'
                }} />
                Near Real-Time
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              SMOTE-Balanced Logistic Regression Pipeline & Predictive Analytics
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tab-nav">
          <button 
            className={`tab-btn ${activeTab === 'stream' ? 'active' : ''}`}
            onClick={() => setActiveTab('stream')}
          >
            <Activity size={16} /> Live Stream
          </button>
          <button 
            className={`tab-btn ${activeTab === 'manual' ? 'active' : ''}`}
            onClick={() => setActiveTab('manual')}
          >
            <Zap size={16} /> Test Transaction
          </button>
          <button 
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Model & SMOTE Metrics
          </button>
          <button 
            className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            Audit Log
          </button>
        </div>

        {/* Controls & Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button 
            className={`btn ${isSimulating ? 'btn-danger' : 'btn-success'}`}
            onClick={onToggleSimulate}
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
          >
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: 'currentColor',
              display: 'inline-block'
            }} />
            {isSimulating ? 'Pause Stream' : 'Live Stream'}
          </button>

          <button 
            className="btn btn-secondary" 
            onClick={onOpenSettings}
            title="Configure Decision Threshold"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
          >
            <Sliders size={16} />
            Threshold ({stats.decision_threshold ?? 0.50})
          </button>

          <button 
            className="btn btn-secondary" 
            onClick={onResetDemo}
            title="Reset Simulation History"
            style={{ padding: '0.45rem 0.65rem' }}
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}
