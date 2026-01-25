"use client";

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Song, ApiResponse } from '@/types';
import SongCard from '@/components/SongCard';
import AuthGuard from '@/components/AuthGuard';
import SongSkeleton from '@/components/SongSkeleton';
import { Library as LibraryIcon, Search } from 'lucide-react';

export default function Library() {
    const [songs, setSongs] = useState<Song[]>([]);
    const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'All' | 'Hindi' | 'Bengali' | 'English'>('All');

    useEffect(() => {
        fetchSongs();
    }, []);

    useEffect(() => {
        let result = songs;

        // Filter by Tab
        if (activeTab !== 'All') {
            result = result.filter(song => song.language === activeTab);
        }

        // Filter by Search
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(song =>
                song.song_name.toLowerCase().includes(lowerTerm) ||
                song.artist.toLowerCase().includes(lowerTerm) ||
                song.album?.toLowerCase().includes(lowerTerm)
            );
        }

        setFilteredSongs(result);
    }, [searchTerm, activeTab, songs]);

    const fetchSongs = async () => {
        try {
            const response = await api.get<ApiResponse<Song[]>>('/songs');
            if (response.data.success && response.data.data) {
                setSongs(response.data.data);
                setFilteredSongs(response.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch library:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSong = async (id: string) => {
        try {
            const response = await api.delete<ApiResponse<any>>(`/songs/${id}`);
            if (response.data.success) {
                // Update local state to remove the deleted song
                const updatedSongs = songs.filter(song => song._id !== id);
                setSongs(updatedSongs);
                // Also update filteredSongs if necessary, though useEffect will handle it based on 'songs' state change
                // but setting it directly ensures immediate UI feedback if useEffect has dependencies
                // Actually useEffect depends on [songs], so updating setSongs is enough.
            } else {
                alert(response.data.message || "Failed to delete song");
            }
        } catch (err: any) {
            console.error("Failed to delete song:", err);
            alert(err.response?.data?.message || "Failed to delete song");
        }
    };

    // Get unique languages and add 'All'
    const languages = Array.from(new Set(songs.map(s => s.language)));
    const tabs = ['All', ...languages];

    return (
        <AuthGuard>
            <main className="min-h-screen bg-dark-bg text-foreground pb-20">
                <div className="max-w-7xl mx-auto px-6 py-6 space-y-8">

                    {/* Header & Controls */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-lg shadow-lg shadow-purple-500/20">
                                <LibraryIcon className="text-white" size={24} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">Music Library</h1>
                                <p className="text-text-muted text-sm">{songs.length} songs available</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                            {/* Search */}
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={18} className="text-text-muted group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search songs, artists..."
                                    className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-full focus:outline-none focus:border-primary/50 text-white transition-all focus:w-full sm:focus:w-72"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex flex-wrap gap-2 border-b border-white/10 pb-1">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors relative ${activeTab === tab ? 'text-white' : 'text-text-muted hover:text-white/80'
                                    }`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-purple-500 shadow-[0_-2px_6px_rgba(34,197,94,0.4)]"></div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
                        {loading ? (
                            Array.from({ length: 8 }).map((_, i) => <SongSkeleton key={i} />)
                        ) : filteredSongs.length > 0 ? (
                            filteredSongs.map((song) => (
                                <SongCard key={song._id} song={song} onDelete={handleDeleteSong} />
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center text-text-muted">
                                <p className="text-lg">No songs found matching your search.</p>
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </AuthGuard>
    );
}
