import React from 'react';
import { Loader2 } from 'lucide-react';

const Loading: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
                {/* Outer rotating ring */}
                <div className="absolute inset-0 border-4 border-dashed border-indigo-dye/30 rounded-full animate-spin-slow"></div>

                {/* Inner pulsing ink blot */}
                <div className="absolute inset-4 bg-ink rounded-full animate-pulse opacity-80 shadow-lg shadow-indigo-dye/50"></div>

                {/* Center Character (optional, or just an icon) */}
                <div className="z-10 text-paper text-2xl font-calligraphy">
                    运
                </div>
            </div>

            <div className="text-center space-y-2">
                <h3 className="text-2xl font-calligraphy text-ink">天机测算中...</h3>
                <p className="text-indigo-dye/60 font-serif-sc text-sm tracking-widest">
                    排盘 · 分析 · 推演
                </p>
            </div>
        </div>
    );
};

export default Loading;
