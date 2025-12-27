import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, RoomState, Player } from '../types';
import { gameService } from '../services/gameService';
import { Send, MessageCircle, X, Minimize2 } from 'lucide-react';

interface Props {
    roomState: RoomState;
    currentPlayer: Player;
}

export const ChatBox: React.FC<Props> = ({ roomState, currentPlayer }) => {
    const [message, setMessage] = useState('');
    const [isExpanded, setIsExpanded] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const messages = roomState.messages || [];

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (isExpanded) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isExpanded]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();

        if (!message.trim()) return;

        gameService.sendChatMessage(message.trim());
        setMessage('');
        inputRef.current?.focus();
    };

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    // Don't show in offline mode
    if (roomState.gameMode === 'OFFLINE') {
        return null;
    }

    return (
        <div className={`fixed z-40 transition-all duration-300 ${isExpanded
            ? 'inset-x-0 bottom-0 h-[70vh] max-h-[500px] md:inset-x-auto md:right-0 md:bottom-0 md:w-96 md:h-[600px] md:max-h-[80vh]'
            : 'bottom-4 right-4'
            }`}>
            {/* Minimized View */}
            {!isExpanded && (
                <button
                    onClick={() => setIsExpanded(true)}
                    className="px-3 py-2 sm:px-4 sm:py-3 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-full sm:rounded-2xl shadow-2xl flex items-center gap-1.5 sm:gap-2 transition-all hover:scale-105 active:scale-95 border border-purple-500/50"
                >
                    <MessageCircle size={18} className="sm:w-5 sm:h-5" />
                    <span className="font-bold text-xs sm:text-sm">Chat</span>
                    {messages.length > 0 && (
                        <span className="ml-0.5 sm:ml-1 px-1.5 sm:px-2 py-0.5 bg-purple-400 rounded-full text-[10px] sm:text-xs font-black">
                            {messages.length}
                        </span>
                    )}
                </button>
            )}

            {/* Expanded Chat Box */}
            {isExpanded && (
                <div className="w-full h-full bg-slate-900/95 backdrop-blur-md flex flex-col border-t md:border-l md:border-t border-white/10 shadow-2xl md:rounded-tl-3xl overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-white/10 bg-slate-800/50 flex-shrink-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                            <MessageCircle size={16} className="text-purple-400 flex-shrink-0 sm:w-[18px] sm:h-[18px]" />
                            <h3 className="font-bold text-white text-xs sm:text-sm">Chat</h3>
                            <span className="text-[9px] sm:text-[10px] text-slate-500 font-semibold whitespace-nowrap">
                                {messages.length} {messages.length === 1 ? 'msg' : 'msgs'}
                            </span>
                        </div>
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="p-1.5 hover:bg-white/10 active:bg-white/20 rounded-lg transition-colors text-slate-400 hover:text-white flex-shrink-0"
                            aria-label="Minimize chat"
                        >
                            <Minimize2 size={14} className="sm:w-4 sm:h-4" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 md:p-4 space-y-1.5 sm:space-y-2 scroll-smooth overscroll-contain">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-6 sm:py-8 px-4">
                                <p className="text-slate-500 text-xs sm:text-sm font-normal">
                                    No messages yet
                                </p>
                                <p className="text-slate-600 text-[10px] sm:text-xs mt-1">
                                    Start the conversation!
                                </p>
                            </div>
                        ) : (
                            messages.map((msg) => {
                                return (
                                    <div key={msg.id} className="text-slate-200 text-xs sm:text-sm font-normal leading-relaxed break-words">
                                        <span className="text-white font-semibold">{msg.playerName}</span> : {msg.message}
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-2.5 sm:p-3 md:p-4 border-t border-white/10 bg-slate-800/30 flex-shrink-0">
                        <div className="flex gap-1.5 sm:gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type a message..."
                                maxLength={500}
                                className="flex-1 px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 bg-slate-900/50 border border-white/10 rounded-lg sm:rounded-xl md:rounded-2xl text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all min-w-0"
                            />
                            <button
                                type="submit"
                                disabled={!message.trim()}
                                className="px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg sm:rounded-xl md:rounded-2xl transition-all flex items-center justify-center gap-1 sm:gap-2 font-bold text-xs sm:text-sm shadow-lg hover:shadow-purple-500/20 disabled:shadow-none hover:scale-105 active:scale-95 disabled:scale-100 flex-shrink-0"
                            >
                                <Send size={14} className="sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">Send</span>
                            </button>
                        </div>
                        {message.length > 450 && (
                            <p className="text-[10px] sm:text-xs text-slate-500 mt-1.5 sm:mt-2 text-right">
                                {500 - message.length} chars left
                            </p>
                        )}
                    </form>
                </div>
            )}
        </div>
    );
};
