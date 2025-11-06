'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast'
export default function AnimeDetailPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');   // ✅ read ID from URL query
  const { user, getEpisodes, setEpisodeWatched } = useApp();

  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const res = await getEpisodes(id);
        let eps = res.data;

        if (user?.watchedEpisodes) {
          eps = eps.map(ep => ({
            ...ep,
            __watched: user.watchedEpisodes.includes(ep._id)
          }));
        }

        setEpisodes(eps);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, user]);

  const toggleWatched = async (episodeId, checked) => {
    if (!user) return toast.error("Please login first");
    try {
      setBusyId(episodeId);
      await setEpisodeWatched(episodeId, checked);
      setEpisodes(prev => prev.map(ep =>
        ep._id === episodeId ? { ...ep, __watched: checked } : ep
      ));
    } finally { setBusyId(null); }
  };

  return (
    <div className="space-y-6 p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold">Episodes</h1>
      {loading && <p>Loading episodes…</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && episodes.length === 0 && <p>No episodes found.</p>}

      <ul className="divide-y divide-white/10 rounded border border-white/10">
        {episodes.map(ep => (
          <li key={ep._id} className="p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">EP {ep.number}: {ep.title}</div>
              <div className="text-xs text-gray-400">{ep.type}</div>
            </div>
            <input
              type="checkbox"
              checked={!!ep.__watched}
              disabled={busyId === ep._id}
              onChange={e => toggleWatched(ep._id, e.target.checked)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
