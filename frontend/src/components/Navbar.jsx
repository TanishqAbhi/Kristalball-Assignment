import React from 'react';
import { Shield, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-emerald-400" />
        <span className="font-bold tracking-wide text-slate-100">
          KRISTALLBALL // ASSET COMMAND
        </span>
      </div>
      {user && (
        <div className="flex items-center gap-4">
          <div className="text-right text-sm">
            <div className="font-medium text-slate-200">{user.username}</div>
            <div className="text-xs text-emerald-400">{user.role}</div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
