import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Assignments() {
  const { user } = useAuth();
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({
    baseId: user?.role === 'ADMIN' ? '2' : String(user?.base_id || '2'),
    equipmentTypeId: '1',
    recordType: 'ASSIGNMENT',
    assignedTo: '',
    quantity: '',
  });

  const loadData = async () => {
    const [refRes, recRes] = await Promise.all([
      api.get('/assets/reference'),
      api.get('/assets/assignments-expenditures'),
    ]);
    setBases(refRes.data.bases || []);
    setEquipmentTypes(refRes.data.equipmentTypes || []);
    setRecords(recRes.data || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/assets/assignments-expenditures', {
      baseId: Number(form.baseId),
      equipmentTypeId: Number(form.equipmentTypeId),
      recordType: form.recordType,
      assignedTo: form.assignedTo,
      quantity: Number(form.quantity),
    });
    setForm({ ...form, assignedTo: '', quantity: '' });
    loadData();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">Assignments & Expenditures</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 rounded-xl p-5 grid grid-cols-1 md:grid-cols-6 gap-4 items-end"
      >
        <div>
          <label className="block text-xs text-slate-400 mb-1">Base</label>
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
          <label className="block text-xs text-slate-400 mb-1">Type</label>
          <select
            value={form.recordType}
            onChange={(e) => setForm({ ...form, recordType: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm"
          >
            <option value="ASSIGNMENT">ASSIGNMENT</option>
            <option value="EXPENDITURE">EXPENDITURE</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Personnel / Purpose</label>
          <input
            type="text"
            value={form.assignedTo}
            onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
            placeholder="e.g., Sgt. Vance"
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm"
          />
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
          Save Record
        </button>
      </form>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
            <tr>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Base</th>
              <th className="px-4 py-3">Equipment</th>
              <th className="px-4 py-3">Personnel / Purpose</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {records.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 font-semibold text-emerald-400">{r.record_type}</td>
                <td className="px-4 py-3">{r.base_name}</td>
                <td className="px-4 py-3">{r.equipment_name}</td>
                <td className="px-4 py-3">{r.assigned_to}</td>
                <td className="px-4 py-3 font-mono">{r.quantity}</td>
                <td className="px-4 py-3 text-slate-400">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
