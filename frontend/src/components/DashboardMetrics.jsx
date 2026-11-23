import React, { useState } from 'react';
import { Package, TrendingUp, ShieldCheck, Flame, Layers } from 'lucide-react';
import StatCard from './StatCard';
import NetMovementModal from './NetMovementModal';

export default function DashboardMetrics({ metrics }) {
  const [showNetModal, setShowNetModal] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Opening Balance"
          value={metrics.opening_balance}
          subtitle="Start of period"
          icon={Layers}
        />
        <StatCard
          title="Net Movement"
          value={metrics.net_movement}
          subtitle="Click for breakdown"
          onClick={() => setShowNetModal(true)}
          icon={TrendingUp}
        />
        <StatCard
          title="Assigned"
          value={metrics.total_assigned}
          subtitle="Allocated to personnel"
          icon={ShieldCheck}
        />
        <StatCard
          title="Expended"
          value={metrics.total_expended}
          subtitle="Consumed / spent"
          icon={Flame}
        />
        <StatCard
          title="Closing Balance"
          value={metrics.closing_balance}
          subtitle="Current available stock"
          icon={Package}
        />
      </div>

      <NetMovementModal
        isOpen={showNetModal}
        onClose={() => setShowNetModal(false)}
        metrics={metrics}
      />
    </>
  );
}
