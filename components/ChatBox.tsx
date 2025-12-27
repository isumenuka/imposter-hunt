import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, RoomState, Player } from '../types';
import { gameService } from '../services/gameService';
import { Send, MessageCircle, X, Minimize2 } from 'lucide-react';
import { soundManager } from '../utils/sounds';

interface Props {
    roomState: RoomState;
    currentPlayer: Player;
}

export const ChatBox: React.FC<Props> = ({ roomState, currentPlayer }) => {
    const [message, setMessage] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const messages = roomState.messages || [];
    const prevMessageCountRef = useRef(messages.length);

    // Detect new messages and play notification sound
    useEffect(() => {
        const currentMessageCount = messages.length;
        const previousCount = prevMessageCountRef.current;

        // New message arrived
        if (currentMessageCount > previousCount) {
            const newMessagesCount = currentMessageCount - previousCount;

            // If chat is minimized, increment unread count and play sound
            if (!isExpanded) {
                setUnreadCount(prev => prev + newMessagesCount);
                // Play notification sound (subtle click)
                soundManager.playClick();
            }
        }

        // Update ref for next comparison
        prevMessageCountRef.current = currentMessageCount;
    }, [messages.length, isExpanded]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (isExpanded) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isExpanded]);

    // Clear unread count when chat is expanded
    const handleExpand = () => {
        setIsExpanded(true);
        setUnreadCount(0);
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();

        if (!message.trim()) return;

        gameService.sendChatMessage(message.trim());
        setMessage('');
        inputRef.current?.focus();
    };

    // Don't show in offline mode
    if (roomState.gameMode === 'OFFLINE') {
        return null;
    }

    return (
        <div className={`fixed z-50 transition-all duration-300 ${isExpanded
            ? 'inset-0 md:inset-x-auto md:right-0 md:bottom-0 md:top-0 md:w-96 md:max-w-[400px]'
            : 'bottom-4 right-4'
            }`}>
            {/* Minimized View */}
            {!isExpanded && (
                <>
                    {/* Floating Message Preview - Last 3 messages with fade effect */}
                    {messages.length > 0 && (
                        <div className="absolute bottom-16 right-0 mb-2 w-80 max-w-[calc(100vw-2rem)] pointer-events-none">
                            <div className="space-y-1 flex flex-col-reverse">
                                {messages.slice(-3).reverse().map((msg, index) => (
                                    <div
                                        key={msg.id}
                                        className="animate-in slide-in-from-bottom-2 fade-in"
                                        style={{
                                            opacity: 1 - (index * 0.25),
                                            animationDelay: `${index * 50}ms`
                                        }}
                                    >
                                        <div className="bg-slate-900/60 backdrop-blur-md px-3 py-2 rounded-lg border border-white/5 shadow-lg">
                                            <p className="text-xs text-slate-200 break-words">
                                                <span className="font-bold text-purple-300">{msg.playerName}</span>
                                                <span className="text-slate-400">: </span>
                                                <span>{msg.message}</span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Chat Button */}
                    <button
                        onClick={handleExpand}
                        className="px-3 py-2 sm:px-4 sm:py-3 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-full sm:rounded-2xl shadow-2xl flex items-center gap-1.5 sm:gap-2 transition-all hover:scale-105 active:scale-95 border border-purple-500/50 relative pointer-events-auto"
                    >
                        <MessageCircle size={18} className="sm:w-5 sm:h-5" />
                        <span className="font-bold text-xs sm:text-sm">Chat</span>
                        {messages.length > 0 && (
                            <span className="ml-0.5 sm:ml-1 px-1.5 sm:px-2 py-0.5 bg-purple-400 rounded-full text-[10px] sm:text-xs font-black">
                                {messages.length}
                            </span>
                        )}

                        {/* Unread notification badge with animated red dot */}
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex items-center justify-center">
                                <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping"></span>
                                <span className="relative inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-black text-white bg-red-600 rounded-full border-2 border-white shadow-lg">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            </span>
                        )}
                    </button>
                </>
            )}

            {/* Expanded Chat Box */}
            {isExpanded && (
                <>
                    {/* Mobile backdrop overlay */}
                    <div
                        className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm -z-10"
                        onClick={() => setIsExpanded(false)}
                    />

                    <div className="w-full h-full bg-slate-900/98 md:bg-slate-900/95 backdrop-blur-md flex flex-col border-t md:border-l border-white/10 shadow-2xl md:rounded-tl-3xl overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-800/70 flex-shrink-0">
                            <div className="flex items-center gap-2 min-w-0">
                                <MessageCircle size={18} className="text-purple-400 flex-shrink-0" />
                                <h3 className="font-bold text-white text-sm">Chat</h3>
                                <span className="text-[10px] text-slate-500 font-semibold whitespace-nowrap">
                                    {messages.length} {messages.length === 1 ? 'msg' : 'msgs'}
                                </span>
                            </div>
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="p-2 hover:bg-white/10 active:bg-white/20 rounded-lg transition-colors text-slate-400 hover:text-white flex-shrink-0"
                                aria-label="Close chat"
                            >
                                <X size={18} className="md:hidden" />
                                <Minimize2 size={16} className="hidden md:block" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 scroll-smooth overscroll-contain">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center py-8 px-4">
                                    <p className="text-slate-500 text-sm font-normal">
                                        No messages yet
                                    </p>
                                    <p className="text-slate-600 text-xs mt-1">
                                        Start the conversation!
                                    </p>
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    return (
                                        <div key={msg.id} className="text-slate-200 text-sm font-normal leading-relaxed break-words">
                                            <span className="text-white font-semibold">{msg.playerName}</span> : {msg.message}
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-3 md:p-4 border-t border-white/10 bg-slate-800/30 flex-shrink-0">
                            <div className="flex gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    maxLength={500}
                                    className="flex-1 px-3 md:px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-xl md:rounded-2xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all min-w-0"
                                />
                                <button
                                    type="submit"
                                    disabled={!message.trim()}
                                    className="px-3 md:px-4 py-2.5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl md:rounded-2xl transition-all flex items-center justify-center gap-2 font-bold text-sm shadow-lg hover:shadow-purple-500/20 disabled:shadow-none hover:scale-105 active:scale-95 disabled:scale-100 flex-shrink-0"
                                >
                                    <Send size={16} />
                                    <span className="hidden sm:inline">Send</span>
                                </button>
                            </div>
                            {message.length > 450 && (
                                <p className="text-xs text-slate-500 mt-2 text-right">
                                    {500 - message.length} chars left
                                </p>
                            )}
                        </form>
                    </div>
                </>
            )}
        </div>
    );
};
