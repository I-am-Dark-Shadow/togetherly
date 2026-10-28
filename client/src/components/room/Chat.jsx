import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../hooks/useAuth';
import { axiosInstance } from '../../lib/axios';
import { Card } from '../ui/Card';
import { Send, MessageSquare } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Chat({ roomId }) {
    const { socket, isConnected } = useSocket();
    const { authUser } = useAuth();

    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isSending, setIsSending] = useState(false);

    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom when messages change
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Fetch initial chat history
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axiosInstance.get(`/rooms/${roomId}/messages`);
                setMessages(res.data);
            } catch (err) {
                console.error('Failed to fetch messages', err);
            }
        };
        fetchHistory();
    }, [roomId]);

    // Listen for real-time messages
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (message) => {
            setMessages((prev) => [...prev, message]);
        };

        socket.on('new-message', handleNewMessage);

        return () => {
            socket.off('new-message', handleNewMessage);
        };
    }, [socket]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputText.trim() || !isConnected || isSending) return;

        setIsSending(true);
        socket.emit('send-message', { roomId, text: inputText }, (response) => {
            if (response.error) {
                console.error(response.error);
            }
            setIsSending(false);
            setInputText('');
        });
    };

    const formatTime = (isoString) => {
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <Card className="flex flex-col h-[400px] border-glassBorder bg-black/40">
            <div className="flex items-center gap-2 p-4 border-b border-glassBorder bg-black/20">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-white">Room Chat</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 opacity-50">
                        <MessageSquare className="w-8 h-8" />
                        <p className="text-sm">No messages yet. Say hi!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderId._id === authUser._id;
                        return (
                            <div key={msg._id} className={cn("flex flex-col max-w-[85%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}>
                                <span className="text-[10px] text-slate-400 mb-1 px-1">
                                    {isMe ? 'You' : msg.senderId.username} • {formatTime(msg.createdAt)}
                                </span>
                                <div className={cn(
                                    "px-3 py-2 rounded-2xl text-sm shadow-md break-words",
                                    isMe
                                        ? "bg-primary text-white rounded-br-sm"
                                        : "bg-glass border border-glassBorder text-slate-200 rounded-bl-sm"
                                )}>
                                    {/* React safely encodes this preventing raw HTML/XSS */}
                                    {msg.text}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-3 border-t border-glassBorder bg-black/20 flex gap-2">
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message..."
                    disabled={!isConnected || isSending}
                    maxLength={500}
                    className="flex-1 bg-black/40 border border-glassBorder rounded-xl px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/70 transition-all"
                />
                <button
                    type="submit"
                    disabled={!inputText.trim() || !isConnected || isSending}
                    className="w-10 h-10 rounded-xl bg-primary hover:bg-primary/90 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                    <Send className="w-4 h-4 ml-0.5" />
                </button>
            </form>
        </Card>
    );
}