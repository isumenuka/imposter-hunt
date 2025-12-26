import React from 'react';
import { Button } from './Button';
import {
    Gamepad2,
    X,
    Sparkles,
    Code2,
    Zap,
    Github,
    Server,
    Cloud,
    MessageCircle,
    Palette
} from 'lucide-react';

interface CreditsProps {
    onClose: () => void;
}

export const Credits: React.FC<CreditsProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Credits Modal */}
            <div className="relative w-full max-w-xs sm:max-w-sm glass-panel rounded-xl sm:rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
                {/* Animated Background Gradient */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-16 -right-16 w-48 h-48 bg-purple-900/20 rounded-full mix-blend-screen filter blur-3xl animate-pulse" />
                    <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-blue-900/20 rounded-full mix-blend-screen filter blur-3xl animate-pulse animation-delay-2000" />
                </div>

                {/* Content - Scrollable */}
                <div className="relative z-10 overflow-y-auto flex-1 p-2 sm:p-3">
                    {/* Close Button - Sticky */}
                    <button
                        onClick={onClose}
                        className="sticky top-0 float-right text-slate-500 hover:text-white transition-colors w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/5 z-20 bg-black/50 backdrop-blur-sm"
                        aria-label="Close"
                    >
                        <X size={14} />
                    </button>

                    {/* Header */}
                    <div className="text-center mb-3 sm:mb-4">
                        <div className="flex items-center justify-center mb-1.5 sm:mb-2">
                            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-lg sm:rounded-xl border border-purple-800/40 animate-pulse">
                                <Gamepad2 size={24} className="text-purple-500 sm:w-7 sm:h-7" strokeWidth={2} />
                            </div>
                        </div>
                        <h2 className="text-lg sm:text-xl font-black text-white mb-0.5 sm:mb-1">
                            Imposter Hunt
                        </h2>
                        <p className="text-slate-500 text-[10px] sm:text-xs flex items-center justify-center gap-0.5 sm:gap-1">
                            <Sparkles size={10} className="text-purple-500" />
                            Multiplayer Party Game
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent mb-3 sm:mb-4" />

                    {/* Credits Section */}
                    <div className="space-y-1.5 sm:space-y-2">
                        {/* Created By */}
                        <div className="text-center space-y-1 sm:space-y-1.5">
                            <p className="text-[9px] sm:text-[10px] text-slate-600 uppercase tracking-wider font-semibold">
                                Created By
                            </p>
                            <div className="relative inline-block">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-md sm:rounded-lg blur-sm opacity-40" />
                                <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-sm sm:text-base px-3 py-1.5 sm:px-4 sm:py-2 rounded-md sm:rounded-lg">
                                    isumenuka
                                </div>
                            </div>
                            <p className="text-slate-500 text-[9px] sm:text-[10px] mt-0.5 sm:mt-1 flex items-center justify-center gap-0.5">
                                <Palette size={10} className="text-purple-500" />
                                Developer & Designer
                            </p>
                        </div>

                        {/* Divider */}
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

                        {/* Tech Stack */}
                        <div className="space-y-2 sm:space-y-2.5">
                            <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-widest font-bold text-center">
                                Built With
                            </p>
                            <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-xs sm:text-sm">
                                <div className="flex items-center gap-1.5 sm:gap-2 bg-white/5 rounded-md sm:rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 border border-white/10 hover:border-purple-500/30 transition-colors">
                                    <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center flex-shrink-0">
                                        <svg viewBox="0 0 24 24" className="w-full h-full text-cyan-400">
                                            <path fill="currentColor" d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z" />
                                        </svg>
                                    </div>
                                    <span className="text-slate-300 text-[11px] sm:text-sm">React</span>
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2 bg-white/5 rounded-md sm:rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 border border-white/10 hover:border-blue-500/30 transition-colors">
                                    <Code2 size={14} className="text-blue-400 sm:w-[18px] sm:h-[18px] flex-shrink-0" />
                                    <span className="text-slate-300 text-[11px] sm:text-sm">TypeScript</span>
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2 bg-white/5 rounded-md sm:rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 border border-white/10 hover:border-green-500/30 transition-colors">
                                    <MessageCircle size={14} className="text-green-400 sm:w-[18px] sm:h-[18px] flex-shrink-0" />
                                    <span className="text-slate-300 text-[11px] sm:text-sm">Socket.IO</span>
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2 bg-white/5 rounded-md sm:rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 border border-white/10 hover:border-purple-500/30 transition-colors">
                                    <Zap size={14} className="text-purple-400 sm:w-[18px] sm:h-[18px] flex-shrink-0" />
                                    <span className="text-slate-300 text-[11px] sm:text-sm">Vite</span>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent" />

                        {/* Special Thanks */}
                        <div className="text-center space-y-1.5 sm:space-y-2">
                            <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-widest font-bold">
                                Special Thanks
                            </p>
                            <div className="space-y-0.5 sm:space-y-1 text-xs sm:text-sm text-slate-400">
                                <p className="flex items-center justify-center gap-1.5 sm:gap-2">
                                    <Server size={12} className="text-pink-400 sm:w-4 sm:h-4" />
                                    <span className="text-[11px] sm:text-sm">Render - Backend Hosting</span>
                                </p>
                                <p className="flex items-center justify-center gap-1.5 sm:gap-2">
                                    <Cloud size={12} className="text-blue-400 sm:w-4 sm:h-4" />
                                    <span className="text-[11px] sm:text-sm">Vercel - Frontend Hosting</span>
                                </p>
                                <p className="flex items-center justify-center gap-1.5 sm:gap-2">
                                    <MessageCircle size={12} className="text-green-400 sm:w-4 sm:h-4" />
                                    <span className="text-[11px] sm:text-sm">Socket.IO - Real-time Magic</span>
                                </p>
                            </div>
                        </div>

                        {/* Version & GitHub */}
                        <div className="text-center space-y-2 sm:space-y-2.5 pt-2 sm:pt-3">
                            <p className="text-[10px] sm:text-xs text-slate-500">
                                Version 3.0.0
                            </p>
                            <a
                                href="https://github.com/isumenuka/imposter-hunt"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 rounded-md sm:rounded-lg transition-all hover:scale-105 text-xs sm:text-sm text-white font-semibold border border-white/20 hover:border-purple-500/50"
                            >
                                <Github size={14} className="sm:w-[18px] sm:h-[18px]" />
                                <span className="text-[11px] sm:text-sm">View on GitHub</span>
                            </a>
                        </div>
                    </div>

                    {/* Close Button at Bottom */}
                    <div className="mt-3 sm:mt-5 pb-1 sm:pb-2">
                        <Button fullWidth onClick={onClose}>
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
