import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, ArrowLeftRight, ClipboardList } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();
  const role = user?.role;

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
      isActive
        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
    }`;

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col gap-2">
      <NavLink to="/dashboard" className={navClass}>
        <LayoutDashboard className="w-4 h-4" />
        Dashboard
      </NavLink>
      <NavLink to="/purchases" className={navClass}>
        <ShoppingCart className="w-4 h-4" />
        Purchases
      </NavLink>
      <NavLink to="/transfers" className={navClass}>
        <ArrowLeftRight className="w-4 h-4" />
        Transfers
      </NavLink>
      {role !== 'LOGISTICS_OFFICER' && (
        <NavLink to="/assignments" className={navClass}>
          <ClipboardList className="w-4 h-4" />
          Assignments & Expenditures
        </NavLink>
      )}
    </aside>
  );
}
