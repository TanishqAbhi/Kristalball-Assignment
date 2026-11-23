import React from 'react';

export default function StatCard({ title, value, subtitle, onClick, icon: Icon }) {
  return (
    <div
      onClick={onClick}
      className={`bg-slate-900 p-4 rounded-xl border border-slate-800 ${
        onClick ? 'cursor-pointer hover:border-emerald-500/60 transition' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
          {title}
        </span>
        {Icon && <Icon className="w-4 h-4 text-emerald-400" />}
      </div>
      <div className="text-2xl font-bold text-slate-100 mt-2">
        {Number(value ?? 0).toLocaleString()}
      </div>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}
