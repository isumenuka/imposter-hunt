import React from 'react';
import { Button } from './Button';
import { Shuffle, Users, Sparkles, Eye, MessageCircle, Vote, Trophy, X } from 'lucide-react';

interface GameRulesProps {
    onClose: () => void;
}

export const GameRules: React.FC<GameRulesProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Rules Modal */}
            <div className="relative w-full max-w-2xl glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                {/* Animated Background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 rounded-full mix-blend-screen filter blur-3xl animate-pulse" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/20 rounded-full mix-blend-screen filter blur-3xl animate-pulse animation-delay-2000" />
                </div>

                {/* Content */}
                <div className="relative z-10">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-0 right-0 text-slate-400 hover:text-white transition-colors w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>

                    {/* Header */}
                    <div className="text-center mb-4 sm:mb-6">
                        <div className="inline-flex items-center justify-center p-2 sm:p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30 mb-2 sm:mb-3">
                            <Sparkles size={28} className="text-purple-400" strokeWidth={2.5} />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-white mb-1">
                            How to Play
                        </h2>
                        <p className="text-slate-400 text-xs">
                            Imposter Hunt - A Social Deduction Party Game
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent mb-3 sm:mb-4" />

                    {/* Game Flow */}
                    <div className="space-y-3 sm:space-y-4">
                        {/* Setup */}
                        <div className="space-y-1.5 sm:space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-blue-500/20 rounded-lg border border-blue-500/30">
                                    <Users size={16} className="text-blue-400" />
                                </div>
                                <h3 className="text-base sm:text-lg font-bold text-white">Setup</h3>
                            </div>
                            <div className="pl-8 space-y-0.5 text-slate-300 text-xs sm:text-sm">
                                <p>• Minimum <strong className="text-white">3 players</strong> required</p>
                                <p>• Select categories for secret words</p>
                                <p>• Choose number of imposters</p>
                                <p>• Set discussion timer</p>
                            </div>
                        </div>

                        {/* Fair Selection */}
                        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-2.5 sm:p-3 space-y-1.5 sm:space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-purple-500/20 rounded-lg border border-purple-500/30">
                                    <Shuffle size={16} className="text-purple-400" />
                                </div>
                                <h3 className="text-base sm:text-lg font-bold text-white">Fair Random Selection</h3>
                            </div>
                            <div className="pl-8 space-y-1 text-slate-300 text-xs sm:text-sm">
                                <p className="flex items-start gap-1.5">
                                    <span className="text-green-400 mt-0.5 text-xs">✓</span>
                                    <span><strong className="text-white">Imposters:</strong> Fisher-Yates shuffle - equal chance</span>
                                </p>
                                <p className="flex items-start gap-1.5">
                                    <span className="text-green-400 mt-0.5 text-xs">✓</span>
                                    <span><strong className="text-white">Secret Word:</strong> Random from categories</span>
                                </p>
                                <p className="flex items-start gap-1.5">
                                    <span className="text-green-400 mt-0.5 text-xs">✓</span>
                                    <span><strong className="text-white">First Speaker:</strong> Random selection</span>
                                </p>
                            </div>
                        </div>

                        {/* Revelation Phase */}
                        <div className="space-y-1.5 sm:space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-green-500/20 rounded-lg border border-green-500/30">
                                    <Eye size={16} className="text-green-400" />
                                </div>
                                <h3 className="text-base sm:text-lg font-bold text-white">1. Secret Revelation</h3>
                            </div>
                            <div className="pl-8 space-y-0.5 text-slate-300 text-xs sm:text-sm">
                                <p>• <strong className="text-green-400">Innocents</strong> see the secret word</p>
                                <p>• <strong className="text-red-400">Imposters</strong> see nothing (or hint)</p>
                                <p>• Keep your screen private!</p>
                            </div>
                        </div>

                        {/* Discussion Phase */}
                        <div className="space-y-1.5 sm:space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                                    <MessageCircle size={16} className="text-yellow-400" />
                                </div>
                                <h3 className="text-base sm:text-lg font-bold text-white">2. Discussion</h3>
                            </div>
                            <div className="pl-8 space-y-0.5 text-slate-300 text-xs sm:text-sm">
                                <p>• Describe word without saying it</p>
                                <p>• Listen carefully to others</p>
                                <p>• Imposters must blend in!</p>
                                <p>• Watch for suspicious behavior</p>
                            </div>
                        </div>

                        {/* Voting Phase */}
                        <div className="space-y-1.5 sm:space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-red-500/20 rounded-lg border border-red-500/30">
                                    <Vote size={16} className="text-red-400" />
                                </div>
                                <h3 className="text-base sm:text-lg font-bold text-white">3. Voting</h3>
                            </div>
                            <div className="pl-8 space-y-0.5 text-slate-300 text-xs sm:text-sm">
                                <p>• Vote for the imposter</p>
                                <p>• Cannot vote for yourself</p>
                                <p>• Most votes = eliminated</p>
                            </div>
                        </div>

                        {/* Results */}
                        <div className="space-y-1.5 sm:space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-purple-500/20 rounded-lg border border-purple-500/30">
                                    <Trophy size={16} className="text-purple-400" />
                                </div>
                                <h3 className="text-base sm:text-lg font-bold text-white">4. Results</h3>
                            </div>
                            <div className="pl-8 space-y-0.5 text-slate-300 text-xs sm:text-sm">
                                <p>• <strong className="text-green-400">Innocents win</strong> if they vote out imposter</p>
                                <p>• <strong className="text-red-400">Imposters win</strong> if they avoid being caught</p>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent my-3 sm:my-4" />

                    {/* Tips */}
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-2.5 sm:p-3">
                        <h3 className="text-sm sm:text-base font-bold text-white mb-1.5 sm:mb-2 flex items-center gap-1.5">
                            <Sparkles size={14} className="text-blue-400" />
                            Pro Tips
                        </h3>
                        <ul className="space-y-0.5 text-slate-300 text-xs sm:text-sm pl-4">
                            <li className="list-disc">Be creative with descriptions</li>
                            <li className="list-disc">Pay attention to vague answers</li>
                            <li className="list-disc">Imposters: Study the category first!</li>
                            <li className="list-disc">Use timer wisely</li>
                        </ul>
                    </div>

                    {/* Close Button */}
                    <div className="mt-3 sm:mt-4">
                        <Button fullWidth onClick={onClose}>
                            Got It!
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
