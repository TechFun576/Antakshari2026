"use client";

import React, { useState, useEffect } from 'react';
import { Shuffle } from 'lucide-react';
import api from '@/lib/api';
import { Song, ApiResponse } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Lock, Unlock } from 'lucide-react';

interface ShuffleButtonProps {
    onShuffle: (newSongs: Song[]) => void;
}

const ShuffleButton: React.FC<ShuffleButtonProps> = ({ onShuffle }) => {
    const { user } = useAuth();
    const isAdmin = user?.email === 'admin@gmail.com';

    const [loading, setLoading] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [lockedSongs, setLockedSongs] = useState<Song[]>([]);

    // Fetch initial lock state
    useEffect(() => {
        fetchGameState();
        // Poll every 5 seconds to keep users in sync with Admin's lock
        const interval = setInterval(fetchGameState, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchGameState = async () => {
        try {
            const res = await api.get('/songs/state');
            const { isLocked: locked, lockedSongs: songs } = res.data.data;
            setIsLocked(locked);
            if (locked && songs.length > 0) {
                setLockedSongs(songs);
                // If locked, automatically show the locked set to the user
                // preventing them from seeing anything else.
                if (!isAdmin) {
                    onShuffle(songs);
                }
            }
        } catch (err) {
            console.error("Failed to fetch game state:", err);
        }
    };

    const toggleLock = async () => {
        if (!isAdmin) return;
        try {
            const res = await api.post('/songs/lock');
            setIsLocked(res.data.data.isLocked);
        } catch (err) {
            console.error("Failed to toggle lock:", err);
            alert("Failed to toggle lock.");
        }
    };

    const handleShuffle = async () => {
        setLoading(true);
        try {
            const response = await api.post<ApiResponse<Song[]>>('/songs/shuffle');
            if (response.data.data) {
                onShuffle(response.data.data);
            }
        } catch (error: any) {
            console.error("Shuffle failed:", error);
            // Handle specifically the 403 Locked error
            if (error.response?.status === 403) {
                // Refresh state to confirm lock
                fetchGameState();
                alert("Shuffle is locked by Admin!");
            } else {
                alert("Failed to shuffle songs. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Admin Lock Control */}
            {isAdmin && (
                <button
                    onClick={toggleLock}
                    className={`p-2 rounded-full shadow-md transition-colors ${isLocked ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                        } text-white`}
                    title={isLocked ? "Unlock Shuffle" : "Lock Shuffle"}
                >
                    {isLocked ? <Lock size={20} /> : <Unlock size={20} />}
                </button>
            )}

            {/* User Message when Locked */}
            {!isAdmin && isLocked && (
                <div className="text-red-400 font-semibold flex items-center gap-2">
                    <Lock size={16} />
                    <span>Locked by Admin</span>
                </div>
            )}

            <button
                onClick={handleShuffle}
                disabled={loading || (!isAdmin && isLocked)}
                className={`flex items-center gap-2 px-6 py-3 font-bold rounded-full shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isLocked && !isAdmin
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : 'bg-secondary hover:bg-red-600 text-white hover:shadow-red-500/30'
                    }`}
            >
                <Shuffle size={20} className={loading ? "animate-spin" : ""} />
                {loading ? "Shuffling..." : "Shuffle Round"}
            </button>
        </div>
    );
};

export default ShuffleButton;
