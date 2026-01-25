"use client";

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Song, ApiResponse } from '@/types';
import SongCard from '@/components/SongCard';
import AuthGuard from '@/components/AuthGuard';
import ShuffleButton from '@/components/ShuffleButton';
import SongSkeleton from '@/components/SongSkeleton';

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSelectedSongs = async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse<Song[]>>('/songs/selected');
      const songsData = response.data.data;

      // If no songs selected initially (fresh DB), shuffle once
      if (!songsData || songsData.length === 0) {
        const shuffleRes = await api.post<ApiResponse<Song[]>>('/songs/shuffle'); // Updated endpoint path
        setSongs(shuffleRes.data.data);
      } else {
        setSongs(songsData);
      }
    } catch (err) {
      console.error("Failed to fetch songs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSelectedSongs();
  }, []);

  const handleShuffleUpdate = (newSongs: Song[]) => {
    setSongs(newSongs);
  };

  // Dynamically group songs by language
  const groupedSongs = songs.reduce((acc, song) => {
    if (!acc[song.language]) {
      acc[song.language] = [];
    }
    acc[song.language].push(song);
    return acc;
  }, {} as Record<string, Song[]>);

  // Get unique languages from grouped songs
  const languages = Object.keys(groupedSongs);

  return (
    <AuthGuard>
      <main className="min-h-screen bg-dark-bg text-foreground pb-20">

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Current Round</h2>
            <ShuffleButton onShuffle={handleShuffleUpdate} />
          </div>

          {languages.map((lang) => (
            <section key={lang} className="animate-fade-in">
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
                  {lang} Songs
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <SongSkeleton key={i} />
                  ))
                ) : (
                  groupedSongs[lang].map((song) => (
                    <SongCard key={song._id} song={song} />
                  ))
                )}
              </div>
            </section>
          ))}

          {!loading && songs.length === 0 && (
            <div className="text-center py-20">
              <h3 className="text-xl text-text-muted">No songs selected. Click Shuffle to start!</h3>
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}
