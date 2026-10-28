import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { axiosInstance } from '../lib/axios';
import { Upload, ShieldAlert } from 'lucide-react';

export default function Admin() {
    const { authUser } = useAuth();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [type, setType] = useState('video');
    const [mediaFile, setMediaFile] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [status, setStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Security barrier
    if (authUser?.username !== 'suvro') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
                <Card className="p-8 text-center border-red-500/30 max-w-md">
                    <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-red-400 mb-2">Access Denied</h2>
                    <p className="text-slate-300">You are not authorized to view the admin panel.</p>
                    <Button onClick={() => navigate('/')} className="mt-6 w-full">Go Home</Button>
                </Card>
            </div>
        );
    }

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!mediaFile || !thumbnail) {
            return setStatus('Please select both files!');
        }

        setIsLoading(true);
        setStatus('Uploading... Please wait (do not refresh)');

        const formData = new FormData();
        formData.append('title', title);
        formData.append('type', type);
        formData.append('mediaFile', mediaFile);
        formData.append('thumbnail', thumbnail);

        try {
            // Must use multipart/form-data for file uploads
            await axiosInstance.post('/media/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setStatus('Upload Complete! 🎉');
            setTitle('');
            setMediaFile(null);
            setThumbnail(null);
        } catch (err) {
            setStatus(`Error: ${err.response?.data?.message || 'Upload failed'}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <Card className="p-8 bg-black/60 border-primary/30">
                <div className="flex items-center gap-3 mb-6">
                    <Upload className="w-8 h-8 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold text-white">Admin Upload Panel</h1>
                        <p className="text-sm text-slate-400">Welcome, suvro. Upload your movies and songs here.</p>
                    </div>
                </div>

                <form onSubmit={handleUpload} className="space-y-6">
                    <Input
                        label="Media Title / Name"
                        placeholder="e.g., Avengers Endgame or Arijit Singh Song"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-300 ml-1">Media Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="bg-black/40 border border-glassBorder rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary/70 transition-all"
                        >
                            <option value="video">Movie / Video</option>
                            <option value="song">Song / Audio</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-300 ml-1">Media File (.mp4, .mp3)</label>
                        <input
                            type="file"
                            accept="video/*,audio/*"
                            onChange={(e) => setMediaFile(e.target.files[0])}
                            required
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 text-slate-300"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-300 ml-1">Thumbnail / Poster (.jpg, .png)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setThumbnail(e.target.files[0])}
                            required
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-accent/90 text-slate-300"
                        />
                    </div>

                    {status && (
                        <div className={`p-4 rounded-xl text-sm font-bold ${status.includes('Error') ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                            {status}
                        </div>
                    )}

                    <Button type="submit" className="w-full text-lg" isLoading={isLoading}>
                        Upload to Server
                    </Button>
                </form>
            </Card>
        </div>
    );
}