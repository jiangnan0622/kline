import React from 'react';
import { X, AlertTriangle, Terminal, Info, Zap } from 'lucide-react';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div
                className="bg-[#fdfbf7] w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-lg shadow-2xl border-2 border-[#8b4513]/20 relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-[#fdfbf7] z-10 px-6 py-4 border-b border-[#8b4513]/10 flex justify-between items-center">
                    <h2 className="text-xl font-bold font-calligraphy text-[#2c1810] flex items-center gap-2">
                        <Info className="w-5 h-5 text-[#c0392b]" />
                        使用指南 & 常见问题
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-[#8b4513]/10 rounded-full transition-colors text-[#5d4037]"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8 font-serif-sc text-[#3e2723]">

                    {/* Troubleshooting Section */}
                    <section className="space-y-4">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-[#c0392b] border-b border-[#c0392b]/20 pb-2">
                            <AlertTriangle className="w-5 h-5" />
                            报错问题总结
                        </h3>

                        <div className="space-y-4 text-sm leading-relaxed">
                            <div className="bg-red-50 p-4 rounded border border-red-100">
                                <p className="font-bold text-[#c0392b] mb-1">1. 提示【Failed to fetch】</p>
                                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-1">
                                    <li>大概率是 <strong>网络或 VPN 问题</strong>。</li>
                                    <li>请自行查询 API 的情况或关闭/更换 VPN。</li>
                                </ul>
                                <div className="mt-2 text-xs text-gray-500 bg-white/50 p-2 rounded">
                                    注：API 可能堵塞或发送超时（超过 200 秒会失败），建议用 API 提供商给的网站查询使用情况，堵塞则换个时间点或模型。
                                </div>
                            </div>

                            <div className="bg-amber-50 p-4 rounded border border-amber-100">
                                <p className="font-bold text-[#d35400] mb-1">2. 提示【Unexpected token... JSON】</p>
                                <p className="text-gray-700 ml-1">
                                    建议更换模型，本人实测 <strong>DeepSeek</strong> 模型没问题（推荐使用）。
                                </p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded border border-gray-100">
                                <p className="font-bold text-gray-700 mb-1">3. 点击【生成人生K线】无反应</p>
                                <p className="text-gray-600 ml-1">
                                    如果显示相关错误提示，可能说明作者暂时关停了网站或 API 余额不足，请联系作者。
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Version Info Section */}
                    <section className="space-y-4">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-[#2c1810] border-b border-[#8b4513]/20 pb-2">
                            <Zap className="w-5 h-5 text-[#f59e0b]" />
                            版本升级说明
                        </h3>

                        <div className="bg-white p-5 rounded border border-[#8b4513]/10 shadow-sm text-sm">
                            <p className="mb-4 text-gray-500 italic">本版本基于原作者 @0xsakura666 的项目进行了深度升级：</p>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-bold text-[#8b4513] mb-2 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#8b4513]"></span>
                                        阶段一：核心重构 (Core Refactoring)
                                    </h4>
                                    <ul className="list-disc list-inside space-y-1 text-gray-700 pl-4">
                                        <li><strong>数据结构重构</strong>: 支持多维评分、用户校准信息、格局层次。</li>
                                        <li><strong>AI 服务升级</strong>: 优化 Prompt 不在针对币圈人士，更加普适。</li>
                                        <li><strong>可视化升级</strong>: 支持多条 K 线均线，Tooltip 展示详细流年批注与五维评分。</li>
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="font-bold text-[#8b4513] mb-2 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#8b4513]"></span>
                                        阶段二：算法精修 (Algorithm Polish)
                                    </h4>
                                    <ul className="list-disc list-inside space-y-1 text-gray-700 pl-4">
                                        <li><strong>真太阳时校正</strong>: 引入 AI 自动校正指令。</li>
                                        <li><strong>地利与人和</strong>: 增加城市方位与姓名五行的加权逻辑。</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Footer */}
                    <div className="text-center pt-4 text-xs text-gray-400 border-t border-gray-100">
                        Life K-Line Pro v2.0 · Upgrade by nathanJ
                    </div>

                </div>
            </div>
        </div>
    );
};

export default HelpModal;
