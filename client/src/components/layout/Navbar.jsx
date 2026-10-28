import { LogOut, MonitorPlay, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket'; // <--- NEW
import { Button } from '../ui/Button';

export default function Navbar() {
    const { authUser, logout } = useAuth();
    const { isConnected } = useSocket(); // <--- NEW

    if (!authUser) return null;

    return (
        <nav className="w-full h-16 border-b border-glassBorder bg-black/20 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-6xl mx-auto h-full px-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                    <MonitorPlay className="text-primary w-6 h-6" />
                    <span className="font-bold text-xl tracking-wide">Togetherly</span>
                </div>

                <div className="flex items-center gap-6">

                    {/* Connection Status Indicator */}
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/5" title={isConnected ? "Server Connected" : "Server Disconnected"}>
                        {isConnected ? (
                            <>
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                <Wifi className="w-3.5 h-3.5 text-green-500" />
                            </>
                        ) : (
                            <>
                                <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                                <WifiOff className="w-3.5 h-3.5 text-red-500" />
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-4 border-l border-glassBorder pl-6">
                        {/* NEW: Admin Button visible only to suvro */}
                        {authUser.username === 'suvro' && (
                            <Button size="sm" variant="secondary" onClick={() => window.location.href = '/admin'}>
                                Admin Panel
                            </Button>
                        )}

                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-sm font-bold text-white shadow-lg">
                                {authUser.username.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium hidden md:block">{authUser.username}</span>
                        </div>

                        <Button variant="ghost" size="icon" onClick={logout} title="Logout">
                            <LogOut className="w-5 h-5 text-slate-400 hover:text-white transition-colors" />
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
}