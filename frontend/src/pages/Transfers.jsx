import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Transfers() {
  const { user } = useAuth();
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [form, setForm] = useState({
    sourceBaseId: user?.role === 'ADMIN' ? '2' : String(user?.base_id || '2'),
    destinationBaseId: '3',
    equipmentTypeId: '1',
    quantity: '',
  });
  const [statusMsg, setStatusMsg] = useState('');

  const loadData = async () => {
    const [refRes, trRes] = await Promise.all([
      api.get('/assets/reference'),
      api.get('/transfers'),
    ]);
    setBases(refRes.data.bases || []);
    setEquipmentTypes(refRes.data.equipmentTypes || []);
    setTransfers(trRes.data || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg('');
    try {
      await api.post('/transfers', {
        sourceBaseId: Number(form.sourceBaseId),
        destinationBaseId: Number(form.destinationBaseId),
        equipmentTypeId: Number(form.equipmentTypeId),
        quantity: Number(form.quantity),
      });
      setForm({ ...form, quantity: '' });
      setStatusMsg('Atomic transfer completed and audited.');
      loadData();
    } catch (err) {
      setStatusMsg(err.response?.data?.error || 'Transfer failed');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">Cross-Base Transfers</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 rounded-xl p-5 grid grid-cols-1 md:grid-cols-5 gap-4 items-end"
      >
        <div>
          <label className="block text-xs text-slate-400 mb-1">Source Base</label>
          <select
            value={form.sourceBaseId}
            disabled={user?.role !== 'ADMIN'}
            onChange={(e) => setForm({ ...form, sourceBaseId: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm"
          >
            {bases.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Destination Base</label>
          <select
            value={form.destinationBaseId}
            onChange={(e) => setForm({ ...form, destinationBaseId: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm"
          >
            {bases.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Equipment</label>
          <select
            value={form.equipmentTypeId}
            onChange={(e) => setForm({ ...form, equipmentTypeId: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm"
          >
            {equipmentTypes.map((et) => (
              <option key={et.id} value={et.id}>
                {et.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Quantity</label>
          <input
            type="number"
            min="1"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm"
            required
          />
        </div>

        <button
          type="submit"
          className="py-2 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-sm"
        >
          Execute Transfer
        </button>
      </form>

      {statusMsg && <div className="text-sm text-emerald-400">{statusMsg}</div>}

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">From</th>
              <th className="px-4 py-3">To</th>
              <th className="px-4 py-3">Equipment</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {transfers.map((t) => (
              <tr key={t.id}>
                <td className="px-4 py-3">#{t.id}</td>
                <td className="px-4 py-3">{t.source_base_name}</td>
                <td className="px-4 py-3">{t.destination_base_name}</td>
                <td className="px-4 py-3">{t.equipment_name}</td>
                <td className="px-4 py-3 font-mono text-amber-400">{t.quantity}</td>
                <td className="px-4 py-3 text-slate-400">
                  {new Date(t.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
