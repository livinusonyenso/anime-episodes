'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from '../context/AppContext';

export default function HomePage() {
  const { searchAnime } = useApp();

  const [q, setQ] = useState('naruto');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const onSearch = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await searchAnime(q); 
      setResult(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { onSearch(); }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Search Anime</h1>

      <form onSubmit={onSearch} className="flex gap-2">
        <input
          className="flex-1 px-3 py-2 rounded border border-white/10 bg-white text-black"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="e.g., Naruto, One Piece, Bleach"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-600 text-white"
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <p className="text-red-400">{error}</p>}

      {/* ✅ Display Result */}
      {result && (
        <div className="p-4 rounded border border-white/10 bg-white/5">
          <div className="text-gray-300 text-sm mb-2">Result</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-lg">{result.title}</div>
              <div className="text-sm text-gray-400">Episodes: {result.episodeCount}</div>
            </div>

            {/* ✅ Navigate using query param */}
            <Link
              href={`/anime?id=${result.id}`}
              className="px-3 py-2 rounded bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              View Episodes
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
