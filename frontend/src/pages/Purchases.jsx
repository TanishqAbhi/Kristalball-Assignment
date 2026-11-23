import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Purchases() {
  const { user } = useAuth();
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [form, setForm] = useState({
    baseId: user?.role === 'ADMIN' ? '2' : String(user?.base_id || '2'),
    equipmentTypeId: '1',
    quantity: '',
  });
  const [statusMsg, setStatusMsg] = useState('');

  const loadData = async () => {
    const [refRes, purRes] = await Promise.all([
      api.get('/assets/reference'),
      api.get('/purchases'),
    ]);
    setBases(refRes.data.bases || []);
    setEquipmentTypes(refRes.data.equipmentTypes || []);
    setPurchases(purRes.data || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg('');
    try {
      await api.post('/purchases', {
        baseId: Number(form.baseId),
        equipmentTypeId: Number(form.equipmentTypeId),
        quantity: Number(form.quantity),
      });
      setForm({ ...form, quantity: '' });
      setStatusMsg('Purchase logged successfully.');
      loadData();
    } catch (err) {
      setStatusMsg(err.response?.data?.error || 'Failed to log purchase');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">Asset Purchases</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 rounded-xl p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
      >
        <div>
          <label className="block text-xs text-slate-400 mb-1">Receiving Base</label>
          <select
            value={form.baseId}
            disabled={user?.role !== 'ADMIN'}
            onChange={(e) => setForm({ ...form, baseId: e.target.value })}
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
          Log Purchase
        </button>
      </form>

      {statusMsg && <div className="text-sm text-emerald-400">{statusMsg}</div>}

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Base</th>
              <th className="px-4 py-3">Equipment</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {purchases.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">#{p.id}</td>
                <td className="px-4 py-3">{p.base_name}</td>
                <td className="px-4 py-3">{p.equipment_name}</td>
                <td className="px-4 py-3 font-mono text-emerald-400">+{p.quantity}</td>
                <td className="px-4 py-3 text-slate-400">
                  {new Date(p.purchase_date).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
