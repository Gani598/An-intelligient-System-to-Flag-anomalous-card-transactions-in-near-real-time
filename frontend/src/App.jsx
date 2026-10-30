import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import StatsCards from './components/StatsCards';
import LiveStream from './components/LiveStream';
import ManualPredictor from './components/ManualPredictor';
import ModelAnalytics from './components/ModelAnalytics';
import TransactionTable from './components/TransactionTable';
import AlertDetailModal from './components/AlertDetailModal';
import ThresholdSettingsModal from './components/ThresholdSettingsModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('stream');
  const [stats, setStats] = useState({
    total_transactions: 0,
    flagged_anomalies: 0,
    fraud_amount_at_risk: 0,
    total_volume: 0,
    pending_alerts: 0,
    fraud_rate_pct: 0,
    avg_latency_ms: 2.1,
    decision_threshold: 0.50
  });

  const [transactions, setTransactions] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simSpeed, setSimSpeed] = useState(1500);
  const [selectedInspectTx, setSelectedInspectTx] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const simTimerRef = useRef(null);

  // Fetch initial stats & transactions
  const loadInitialData = async () => {
    try {
      const [statsRes, txRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/transactions?limit=60')
      ]);
      const statsData = await statsRes.json();
      const txData = await txRes.json();

      setStats(statsData);
      setTransactions(txData.transactions || []);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Near real-time simulation interval
  useEffect(() => {
    if (isSimulating) {
      simTimerRef.current = setInterval(async () => {
        try {
          const res = await fetch('/api/simulate/next', { method: 'POST' });
          if (!res.ok) return;
          const newTx = await res.json();

          setTransactions(prev => [newTx, ...prev.slice(0, 80)]);

          // Refresh stats
          const statsRes = await fetch('/api/stats');
          const statsData = await statsRes.json();
          setStats(statsData);
        } catch (err) {
          console.error('Simulation tick error:', err);
        }
      }, simSpeed);
    } else {
      if (simTimerRef.current) {
        clearInterval(simTimerRef.current);
        simTimerRef.current = null;
      }
    }

    return () => {
      if (simTimerRef.current) {
        clearInterval(simTimerRef.current);
      }
    };
  }, [isSimulating, simSpeed]);

  const handleSimulateNext = async () => {
    try {
      const res = await fetch('/api/simulate/next', { method: 'POST' });
      if (!res.ok) return;
      const newTx = await res.json();
      setTransactions(prev => [newTx, ...prev.slice(0, 80)]);

      const statsRes = await fetch('/api/stats');
      const statsData = await statsRes.json();
      setStats(statsData);
    } catch (err) {
      console.error('Simulate next error:', err);
    }
  };

  const handleReviewStatus = async (txId, newStatus, notes) => {
    try {
      await fetch(`/api/transactions/${txId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, notes })
      });

      setTransactions(prev => prev.map(t => {
        if (t.transaction_id === txId) {
          return { ...t, status: newStatus };
        }
        return t;
      }));

      const statsRes = await fetch('/api/stats');
      const statsData = await statsRes.json();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to review transaction:', err);
    }
  };

  const handleResetDemo = async () => {
    if (window.confirm('Reset transaction history and re-seed clean demonstration transactions?')) {
      try {
        setIsSimulating(false);
        await fetch('/api/reset_demo', { method: 'POST' });
        loadInitialData();
      } catch (err) {
        console.error('Failed to reset demo:', err);
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        stats={stats}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onResetDemo={handleResetDemo}
        isSimulating={isSimulating}
        onToggleSimulate={() => setIsSimulating(prev => !prev)}
      />

      <main className="app-container" style={{ flex: 1 }}>
        {/* KPI Telemetry Banner */}
        <StatsCards stats={stats} />

        {/* Tab Content */}
        {activeTab === 'stream' && (
          <LiveStream
            transactions={transactions}
            isSimulating={isSimulating}
            onToggleSimulate={() => setIsSimulating(prev => !prev)}
            simSpeed={simSpeed}
            onChangeSpeed={(spd) => setSimSpeed(spd)}
            onSimulateNext={handleSimulateNext}
            onInspectTransaction={(tx) => setSelectedInspectTx(tx)}
          />
        )}

        {activeTab === 'manual' && (
          <ManualPredictor
            onScoredTransaction={(tx) => {
              setTransactions(prev => [tx, ...prev.slice(0, 80)]);
              fetch('/api/stats').then(r => r.json()).then(setStats);
            }}
          />
        )}

        {activeTab === 'analytics' && (
          <ModelAnalytics />
        )}

        {activeTab === 'audit' && (
          <TransactionTable
            transactions={transactions}
            onInspect={(tx) => setSelectedInspectTx(tx)}
            onReviewStatus={handleReviewStatus}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '1.25rem 2rem',
        textAlign: 'center',
        fontSize: '0.78rem',
        color: 'var(--text-dim)',
        background: 'rgba(9, 13, 22, 0.95)'
      }}>
        An Intelligent System to Flag Anomalous Card Transactions in Near Real Time • Logistic Regression with SMOTE Balancing • Python / Flask / React / SQLite
      </footer>

      {/* Modals */}
      {selectedInspectTx && (
        <AlertDetailModal
          transaction={selectedInspectTx}
          onClose={() => setSelectedInspectTx(null)}
          onReviewStatus={handleReviewStatus}
        />
      )}

      {isSettingsOpen && (
        <ThresholdSettingsModal
          currentThreshold={stats.decision_threshold}
          onClose={() => setIsSettingsOpen(false)}
          onSaveThreshold={(newThresh) => {
            setStats(prev => ({ ...prev, decision_threshold: newThresh }));
          }}
        />
      )}
    </div>
  );
}
