import React from 'react';
import { X } from 'lucide-react';

export default function NetMovementModal({ isOpen, onClose, metrics }) {
  if (!isOpen || !metrics) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl p-6 max-w-md w-full border border-slate-700 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-100">Net Movement Breakdown</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-slate-800">
            <span className="text-slate-400">Purchases (+)</span>
            <span className="font-mono text-emerald-400">
              +{Number(metrics.total_purchases ?? 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-800">
            <span className="text-slate-400">Transfers In (+)</span>
            <span className="font-mono text-emerald-400">
              +{Number(metrics.total_transfer_in ?? 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-800">
            <span className="text-slate-400">Transfers Out (-)</span>
            <span className="font-mono text-rose-400">
              -{Number(metrics.total_transfer_out ?? 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between pt-2 font-bold text-slate-100">
            <span>Net Movement</span>
            <span className="font-mono">
              {Number(metrics.net_movement ?? 0).toLocaleString()}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-lg text-sm font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
}
