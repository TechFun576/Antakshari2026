"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';
import { Music2, Save, X, Upload, FileAudio } from 'lucide-react';
import { ApiResponse } from '@/types';

export default function AddSong() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        artist: '',
        album: '',
        language: 'Hindi', // Default
        lyrics: ''
    });

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type.startsWith("audio/")) {
                setFile(droppedFile);
            } else {
                alert("Please upload an audio file.");
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            alert("Please upload a song file.");
            return;
        }
        setLoading(true);

        const data = new FormData();
        data.append('name', formData.name);
        data.append('artist', formData.artist);
        data.append('album', formData.album);
        data.append('language', formData.language);
        data.append('songFile', file);
        if (formData.lyrics) data.append('lyrics', formData.lyrics);

        try {
            await api.post<ApiResponse<any>>('/songs', data, {
                headers: {
                    'Content-Type': undefined // Let browser set multipart/form-data with boundary
                },
                timeout: 300000 // 5 minutes timeout for large files
            });
            router.push('/library'); // Redirect to library after adding
        } catch (err: any) {
            console.error("Failed to add song:", err);
            // Handle duplicate song warning specifically
            if (err.response && err.response.status === 409) {
                alert(err.response.data.message || "A song with this name already exists. Please change the name.");
            } else {
                const errorMessage = err.response?.data?.message || err.message || "Unknown error";
                alert(`Failed to add song: ${errorMessage}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <AuthGuard>
            <main className="min-h-screen bg-dark-bg text-foreground pb-20">
                <div className="max-w-2xl mx-auto px-6 py-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-gradient-to-tr from-primary to-green-400 rounded-lg shadow-lg shadow-green-500/20">
                            <Music2 className="text-black" size={24} />
                        </div>
                        <h1 className="text-3xl font-bold text-white">Add New Song</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 bg-card-bg/50 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-muted">Song Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    placeholder="e.g. Tum Hi Ho"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-primary transition-colors text-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-muted">Artist *</label>
                                <input
                                    type="text"
                                    name="artist"
                                    required
                                    placeholder="e.g. Arijit Singh"
                                    value={formData.artist}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-primary transition-colors text-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-muted">Album</label>
                                <input
                                    type="text"
                                    name="album"
                                    placeholder="e.g. Aashiqui 2"
                                    value={formData.album}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-primary transition-colors text-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-muted">Language *</label>
                                <select
                                    name="language"
                                    value={formData.language}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-primary transition-colors text-white"
                                >
                                    <option value="Hindi">Hindi</option>
                                    <option value="Bengali">Bengali</option>
                                    <option value="English">English</option>
                                </select>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-text-muted">Audio File *</label>
                                <div
                                    className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ease-in-out text-center cursor-pointer ${dragActive
                                        ? "border-primary bg-primary/10 scale-[1.02]"
                                        : "border-white/10 hover:border-primary/50 hover:bg-white/5"
                                        }`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    onClick={() => document.getElementById('file-upload')?.click()}
                                >
                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept="audio/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />

                                    <div className="flex flex-col items-center gap-3">
                                        {file ? (
                                            <>
                                                <div className="p-4 bg-primary/20 rounded-full text-primary animate-pulse">
                                                    <FileAudio size={32} />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-white font-medium break-all">{file.name}</p>
                                                    <p className="text-sm text-green-400 mt-1">Ready to upload</p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="p-4 bg-white/5 rounded-full text-text-muted mb-1">
                                                    <Upload size={32} />
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium text-lg">Click to upload or drag and drop</p>
                                                    <p className="text-text-muted text-sm mt-1">Any audio format supported</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-text-muted">Lyrics URL</label>
                                <input
                                    type="url"
                                    name="lyrics"
                                    placeholder="https://..."
                                    value={formData.lyrics}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-primary transition-colors text-white"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="flex-1 py-3 px-4 border border-white/10 text-white rounded-lg hover:bg-white/5 transition-colors font-medium flex items-center justify-center gap-2"
                            >
                                <X size={18} /> Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-3 px-4 bg-primary text-black rounded-lg hover:bg-green-400 transition-colors font-bold shadow-lg flex items-center justify-center gap-2"
                            >
                                {loading ? 'Saving...' : <><Save size={18} /> Save Song</>}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </AuthGuard>
    );
}
