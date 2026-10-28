import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MonitorPlay, Users, Lock, Sparkles, Activity } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { axiosInstance } from '../lib/axios';

export default function Landing() {
    const [stats, setStats] = useState({ onlineUsers: 0, activeRooms: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axiosInstance.get('/stats/public');
                setStats(res.data);
            } catch (err) {
                console.error('Could not fetch public stats');
            }
        };

        fetchStats();
        // Poll every 30 seconds for an updated live feel
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center overflow-hidden px-4">
            {/* Background Ambient Glows */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10 animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] -z-10 animate-pulse delay-1000" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-4xl mx-auto text-center z-10"
            >
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-black/40 border border-glassBorder rounded-3xl backdrop-blur-md shadow-2xl">
                        <MonitorPlay className="w-16 h-16 text-primary" />
                    </div>
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-white drop-shadow-lg">
                    Watch together, <br className="hidden md:block" />
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        no matter the distance.
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                    A premium, private synchronized media experience designed exclusively for two.
                    Perfectly synced playback, real-time chat, and cinematic glassmorphism.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                    <Link to="/register">
                        <Button size="lg" className="w-full sm:w-auto text-lg px-8 shadow-primary/30 shadow-xl">
                            <Sparkles className="w-5 h-5 mr-2" /> Start a Watch Party
                        </Button>
                    </Link>
                    <Link to="/login">
                        <Button variant="secondary" size="lg" className="w-full sm:w-auto text-lg px-8">
                            Sign In
                        </Button>
                    </Link>
                </div>

                {/* Live Public Stats */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="flex flex-wrap justify-center gap-6"
                >
                    <div className="flex items-center gap-3 bg-black/40 border border-glassBorder px-6 py-3 rounded-full backdrop-blur-sm">
                        <div className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </div>
                        <span className="text-sm font-medium text-slate-200">
                            <span className="text-white font-bold">{stats.onlineUsers}</span> Users Online
                        </span>
                    </div>

                    <div className="flex items-center gap-3 bg-black/40 border border-glassBorder px-6 py-3 rounded-full backdrop-blur-sm">
                        <Activity className="w-4 h-4 text-accent" />
                        <span className="text-sm font-medium text-slate-200">
                            <span className="text-white font-bold">{stats.activeRooms}</span> Active Rooms
                        </span>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}