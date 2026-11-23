import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import DashboardMetrics from '../components/DashboardMetrics';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [filters, setFilters] = useState({
    baseId: user?.role === 'ADMIN' ? '' : user?.base_id || '',
    equipmentTypeId: '',
    startDate: '',
    endDate: '',
  });
  const [metrics, setMetrics] = useState({
    opening_balance: 0,
    total_purchases: 0,
    total_transfer_in: 0,
    total_transfer_out: 0,
    net_movement: 0,
    total_assigned: 0,
    total_expended: 0,
    closing_balance: 0,
  });

  const loadReference = async () => {
    const res = await api.get('/assets/reference');
    setBases(res.data.bases || []);
    setEquipmentTypes(res.data.equipmentTypes || []);
    setAuditLogs(res.data.auditLogs || []);
  };

  const loadMetrics = async () => {
    const params = {};
    if (filters.baseId) params.baseId = filters.baseId;
    if (filters.equipmentTypeId) params.equipmentTypeId = filters.equipmentTypeId;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;

    const res = await api.get('/assets/dashboard-metrics', { params });
    setMetrics(res.data);
  };

  useEffect(() => {
    loadReference();
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [filters]);

  const chartData = [
    { name: 'Purchases', qty: metrics.total_purchases || 0 },
    { name: 'Transfer In', qty: metrics.total_transfer_in || 0 },
    { name: 'Transfer Out', qty: metrics.total_transfer_out || 0 },
    { name: 'Assigned', qty: metrics.total_assigned || 0 },
    { name: 'Expended', qty: metrics.total_expended || 0 },
    { name: 'Closing', qty: metrics.closing_balance || 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-100">Asset Command Dashboard</h1>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Base</label>
          <select
            value={filters.baseId}
            disabled={user?.role !== 'ADMIN'}
            onChange={(e) => setFilters({ ...filters, baseId: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-slate-100"
          >
            {user?.role === 'ADMIN' && <option value="">All Bases</option>}
            {bases.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Equipment Type</label>
          <select
            value={filters.equipmentTypeId}
            onChange={(e) => setFilters({ ...filters, equipmentTypeId: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-slate-100"
          >
            <option value="">All Equipment</option>
            {equipmentTypes.map((et) => (
              <option key={et.id} value={et.id}>
                {et.name} ({et.category})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Start Date</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-slate-100"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">End Date</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-slate-100"
          />
        </div>
      </div>

      <DashboardMetrics metrics={metrics} />

      {/* Chart & Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-base font-semibold text-slate-100 mb-4">Inventory Flow Overview</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Bar dataKey="qty" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-base font-semibold text-slate-100 mb-4">Recent Audit Trail</h2>
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs flex flex-col gap-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-400">{log.action}</span>
                  <span className="text-slate-500">
                    {log.username || 'system'} • {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="text-slate-300">{log.details}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
