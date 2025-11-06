'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';

export default function RegisterPage() {
  const { register } = useApp();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(name, email, password);
      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Create Account</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input className="w-full px-3 py-2 rounded border border-white/10 bg-white" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input className="w-full px-3 py-2 rounded border border-white/10 bg-white" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full px-3 py-2 rounded border border-white/10 bg-white" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <p className="text-red-400">{error}</p>}
        <button className="w-full px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-600 text-white" disabled={loading}>
          {loading ? 'Please wait...' : 'Register'}
        </button>
      </form>
    </div>
  );
}
