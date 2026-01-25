"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Song } from '@/types';
import { Play, Pause, ExternalLink, Music, RotateCcw, User, Trash2 } from 'lucide-react';

interface SongCardProps {
    song: Song;
    onDelete?: (id: string) => void;
}

const SongCard: React.FC<SongCardProps> = ({ song, onDelete }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isEnded, setIsEnded] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const togglePlay = async () => {
        const audio = audioRef.current;
        if (!audio) return;

        try {
            if (isEnded) {
                // Restart logic
                audio.currentTime = 0;
                await audio.play();
                setIsPlaying(true);
                setIsEnded(false);
            } else if (isPlaying) {
                audio.pause();
                setIsPlaying(false);
            } else {
                // Pause all other audios
                document.querySelectorAll('audio').forEach(el => {
                    if (el !== audio) {
                        el.pause();
                        (el.parentNode as any)?.dispatchEvent(new Event('pause-others'));
                    }
                });

                // Play and catch abort errors
                await audio.play();
                setIsPlaying(true);
            }
        } catch (error: any) {
            console.error("Playback error:", error);
            // Ignore abort errors which happen when pausing quickly after playing
            if (error.name !== 'AbortError') {
                setIsPlaying(false);
            }
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const current = audioRef.current.currentTime;
            const total = audioRef.current.duration || 0;
            setProgress(current);
            setDuration(total);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setProgress(time);
            setIsEnded(false);
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setIsEnded(true);
        if (audioRef.current) setProgress(audioRef.current.duration);
    };

    const themeColors = {
        Hindi: "from-orange-500/20 to-orange-900/40 border-orange-500/30 hover:shadow-orange-500/20",
        Bengali: "from-teal-500/20 to-teal-900/40 border-teal-500/30 hover:shadow-teal-500/20",
        English: "from-purple-500/20 to-purple-900/40 border-purple-500/30 hover:shadow-purple-500/20",
    };

    const badgeColors = {
        Hindi: "bg-orange-500/20 text-orange-200 border-orange-500/30",
        Bengali: "bg-teal-500/20 text-teal-200 border-teal-500/30",
        English: "bg-purple-500/20 text-purple-200 border-purple-500/30",
    };

    const colorClass = themeColors[song.language] || "from-white/5 to-white/10 border-white/10";
    const badgeClass = badgeColors[song.language] || "bg-white/10 text-white border-white/10";

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`group relative w-full h-64 bg-card-bg/50 backdrop-blur-sm rounded-xl border overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl bg-gradient-to-br ${colorClass} flex flex-col`}>
            <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex gap-2">
                {onDelete && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Are you sure you want to delete this song?')) {
                                onDelete(song._id);
                            }
                        }}
                        className="p-1 rounded-full bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white transition-colors"
                        title="Delete Song"
                    >
                        <Trash2 size={14} />
                    </button>
                )}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClass}`}>
                    {song.language}
                </span>
            </div>

            <div className="flex-1 p-5 flex flex-col justify-between">
                <div>
                    <h3 className="text-base font-bold text-white leading-tight mb-1 line-clamp-2" title={song.song_name}>
                        {song.song_name}
                    </h3>
                    <p className="text-xs text-text-muted line-clamp-1">
                        {song.artist}
                    </p>
                    {song.album && (
                        <p className="text-[10px] text-text-muted/60 line-clamp-1 mt-0.5">
                            {song.album}
                        </p>
                    )}
                </div>

                {/* Improved Added By Section */}
                {song.added_by && (
                    <div className="flex items-center gap-1.5 mt-2 bg-black/20 p-1.5 rounded-lg w-fit">
                        <div className="p-0.5 bg-white/10 rounded-full">
                            <User size={10} className="text-text-muted" />
                        </div>
                        <span className="text-[10px] text-text-muted">
                            Added by <span className="text-white/80 font-medium">{song.added_by}</span>
                        </span>
                    </div>
                )}
            </div>

            <div className="p-4 bg-black/20 z-10">
                {/* Seekbar */}
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] text-text-muted w-8 tabular-nums text-right">{formatTime(progress)}</span>
                    <div className="relative flex-1 h-1 bg-white/10 rounded-full cursor-pointer group/seek">
                        <input
                            type="range"
                            min={0}
                            max={duration || 100}
                            value={progress}
                            onChange={handleSeek}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div
                            className="h-full bg-primary rounded-full transition-all duration-100 relative"
                            style={{ width: `${(progress / (duration || 1)) * 100}%` }}
                        >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow opacity-0 group-hover/seek:opacity-100 transition-opacity transform translate-x-1/2" />
                        </div>
                    </div>
                    <span className="text-[10px] text-text-muted w-8 tabular-nums">{formatTime(duration)}</span>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-[10px] text-text-muted/60">
                            <Music size={10} />
                            <span>{song.short_code}</span>
                        </div>
                        <a
                            href={song.lyrics_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs hover:text-white transition-colors text-text-muted"
                        >
                            Lyrics <ExternalLink size={10} />
                        </a>
                    </div>

                    <button
                        onClick={togglePlay}
                        className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary text-black shadow-lg hover:bg-green-400 transition-transform active:scale-95"
                        aria-label={isEnded ? "Replay" : isPlaying ? "Pause" : "Play"}
                    >
                        {isEnded ? (
                            <RotateCcw size={18} />
                        ) : isPlaying ? (
                            <Pause size={18} fill="currentColor" />
                        ) : (
                            <Play size={18} fill="currentColor" className="ml-0.5" />
                        )}
                    </button>
                </div>
            </div>

            <audio
                ref={audioRef}
                src={song.intro_audio_url}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleTimeUpdate}
                onEnded={handleEnded}
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
            />
        </div>
    );
};

export default SongCard;
