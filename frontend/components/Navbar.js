'use client';
import Link from 'next/link';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { user, logout } = useApp();
  return (
    <nav className="w-full border-b border-white/10 bg-black/30 backdrop-blur sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg">Anime Episodes</Link>
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:underline">Search</Link>
          {user ? (
            <>
              <span className="text-sm text-gray-300">Hi, {user.name || user.email}</span>
              <button onClick={logout} className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="px-3 py-1 rounded bg-emerald-500 hover:bg-emerald-600 text-white text-sm">Login</Link>
              <Link href="/register" className="px-3 py-1 rounded border border-emerald-500 text-emerald-400 text-sm hover:bg-emerald-500/10">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
