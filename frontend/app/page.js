'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from '../context/AppContext';

export default function HomePage() {
  const { searchAnime, listAllAnime } = useApp();

  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [allAnime, setAllAnime] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'search'

  const loadAllAnime = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await listAllAnime(page, 50);
      setAllAnime(res.data);
      setPagination(res.pagination);
      setViewMode('all');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onSearch = async (e) => {
    e?.preventDefault();
    if (!q.trim()) {
      loadAllAnime(1);
      return;
    }
    setLoading(true);
    setError('');
    setSearchResult(null);
    try {
      const res = await searchAnime(q); 
      setSearchResult(res.data);
      setViewMode('search');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAnime(1);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Anime Episodes</h1>

      <form onSubmit={onSearch} className="flex gap-2">
        <input
          className="flex-1 px-3 py-2 rounded border border-white/10 bg-white text-black"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search anime (e.g., Naruto, One Piece, Bleach)"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-600 text-white"
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
        {viewMode === 'search' && (
          <button
            type="button"
            onClick={() => {
              setQ('');
              setSearchResult(null);
              loadAllAnime(1);
            }}
            className="px-4 py-2 rounded bg-gray-500 hover:bg-gray-600 text-white"
          >
            Show All
          </button>
        )}
      </form>

      {error && <p className="text-red-400">{error}</p>}

      {/* Search Result */}
      {viewMode === 'search' && searchResult && (
        <div className="p-4 rounded border border-white/10 bg-white/5">
          <div className="text-gray-300 text-sm mb-2">Search Result</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-lg">{searchResult.title}</div>
              <div className="text-sm text-gray-400">Episodes: {searchResult.episodeCount}</div>
            </div>
            <Link
              href={`/anime?id=${searchResult.id}`}
              className="px-3 py-2 rounded bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              View Episodes
            </Link>
          </div>
        </div>
      )}

      {/* All Anime List */}
      {viewMode === 'all' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">All Anime ({pagination?.total || 0})</h2>
            {pagination && pagination.pages > 1 && (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const prev = Math.max(1, currentPage - 1);
                    setCurrentPage(prev);
                    loadAllAnime(prev);
                  }}
                  disabled={currentPage === 1 || loading}
                  className="px-3 py-1 rounded bg-gray-500 hover:bg-gray-600 text-white disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="px-3 py-1 text-sm">
                  Page {currentPage} of {pagination.pages}
                </span>
                <button
                  onClick={() => {
                    const next = Math.min(pagination.pages, currentPage + 1);
                    setCurrentPage(next);
                    loadAllAnime(next);
                  }}
                  disabled={currentPage === pagination.pages || loading}
                  className="px-3 py-1 rounded bg-gray-500 hover:bg-gray-600 text-white disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {loading && allAnime.length === 0 ? (
            <p>Loading anime...</p>
          ) : allAnime.length === 0 ? (
            <p className="text-gray-400">No anime found. Try searching for one to add it.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allAnime.map((anime) => (
                <Link
                  key={anime._id}
                  href={`/anime?id=${anime._id}`}
                  className="p-4 rounded border border-white/10 bg-white/5 hover:bg-white/10 transition"
                >
                  <div className="font-medium text-lg mb-1">{anime.title}</div>
                  <div className="text-sm text-gray-400">
                    {anime.episodeCount} episodes
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
