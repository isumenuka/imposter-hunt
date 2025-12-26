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
        <div className={`fixed bottom-0 right-0 z-40 transition-all duration-300 ${isExpanded
                ? 'w-full sm:w-96 h-[60vh] sm:h-[500px]'
                : 'w-auto h-auto'
            }`}>
            {/* Minimized View */}
            {!isExpanded && (
                <button
                    onClick={() => setIsExpanded(true)}
                    className="m-3 sm:m-4 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl shadow-2xl flex items-center gap-2 transition-all hover:scale-105 border border-purple-500/50"
                >
                    <MessageCircle size={20} />
                    <span className="font-bold text-sm">Chat</span>
                    {messages.length > 0 && (
                        <span className="ml-1 px-2 py-0.5 bg-purple-400 rounded-full text-xs font-black">
                            {messages.length}
                        </span>
                    )}
                </button>
            )}

            {/* Expanded Chat Box */}
            {isExpanded && (
                <div className="w-full h-full bg-slate-900/95 backdrop-blur-md flex flex-col border-t sm:border-l sm:border-t-0 border-white/10 shadow-2xl sm:rounded-tl-3xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-800/50">
                        <div className="flex items-center gap-2">
                            <MessageCircle size={18} className="text-purple-400" />
                            <h3 className="font-bold text-white text-sm">Chat</h3>
                            <span className="text-[10px] text-slate-500 font-semibold">
                                {messages.length} {messages.length === 1 ? 'message' : 'messages'}
                            </span>
                        </div>
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                            aria-label="Minimize chat"
                        >
                            <Minimize2 size={16} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 scroll-smooth">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-8">
                                <div className="text-4xl mb-3 opacity-50">💬</div>
                                <p className="text-slate-500 text-sm font-normal">
                                    No messages yet
                                </p>
                                <p className="text-slate-600 text-xs mt-1">
                                    Start the conversation!
                                </p>
                            </div>
                        ) : (
                            messages.map((msg) => {
                                const isOwnMessage = msg.playerId === currentPlayer.id;

                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex gap-2 animate-in slide-in-from-bottom-2 duration-200 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'
                                            }`}
                                    >
                                        {/* Avatar */}
                                        <div className="flex-shrink-0">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${isOwnMessage
                                                    ? 'bg-purple-600/30 border border-purple-500/50'
                                                    : 'bg-slate-700/50 border border-slate-600/50'
                                                }`}>
                                                {msg.avatar}
                                            </div>
                                        </div>

                                        {/* Message Bubble */}
                                        <div className={`flex-1 max-w-[75%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                                            <div className={`flex items-baseline gap-2 mb-0.5 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                                                <span className={`text-xs font-bold ${isOwnMessage ? 'text-purple-300' : 'text-slate-300'
                                                    }`}>
                                                    {isOwnMessage ? 'You' : msg.playerName}
                                                </span>
                                                <span className="text-[10px] text-slate-500 font-normal">
                                                    {formatTime(msg.timestamp)}
                                                </span>
                                            </div>

                                            <div className={`px-3 py-2 rounded-2xl break-words ${isOwnMessage
                                                    ? 'bg-purple-600/90 text-white rounded-br-md'
                                                    : 'bg-slate-800/90 text-slate-100 rounded-bl-md'
                                                }`}>
                                                <p className="text-sm leading-relaxed">{msg.message}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-3 sm:p-4 border-t border-white/10 bg-slate-800/30">
                        <div className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type a message..."
                                maxLength={500}
                                className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-900/50 border border-white/10 rounded-xl sm:rounded-2xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                            />
                            <button
                                type="submit"
                                disabled={!message.trim()}
                                className="px-3 sm:px-4 py-2 sm:py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl sm:rounded-2xl transition-all flex items-center justify-center gap-2 font-bold text-sm shadow-lg hover:shadow-purple-500/20 disabled:shadow-none hover:scale-105 disabled:scale-100"
                            >
                                <Send size={16} />
                                <span className="hidden sm:inline">Send</span>
                            </button>
                        </div>
                        {message.length > 450 && (
                            <p className="text-xs text-slate-500 mt-2 text-right">
                                {500 - message.length} characters remaining
                            </p>
                        )}
                    </form>
                </div>
            )}
        </div>
    );
};
