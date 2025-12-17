
import React, { useState } from 'react';
import BaziForm from './components/BaziForm';
import LifeKLineChart from './components/LifeKLineChart';
import AnalysisResult from './components/AnalysisResult';
import Loading from './components/Loading';
import HelpModal from './components/HelpModal';
import { UserInput, LifeDestinyResult } from './types';
import { generateLifeAnalysis } from './services/geminiService';
import { API_STATUS } from './constants';
import { Sparkles, BookOpen, Key, AlertTriangle, HelpCircle } from 'lucide-react';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LifeDestinyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleFormSubmit = async (data: UserInput) => {
    // 检查系统状态
    if (API_STATUS === 0) {
      setError("当前服务器繁忙，使用的用户过多导致API堵塞，请择时再来");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setUserName(data.name || '');

    try {
      const analysis = await generateLifeAnalysis(data);
      setResult(analysis);
    } catch (err: any) {
      setError(err.message || "命理测算过程中发生了意外错误，请重试。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper bg-paper-pattern text-ink font-serif-sc flex flex-col items-center">
      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Header */}
      <header className="w-full bg-paper-dark/80 backdrop-blur-sm border-b border-indigo-dye/10 py-6 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-cinnabar text-white p-2 rounded-sm shadow-md border-2 border-white/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-calligraphy text-ink tracking-widest">人生K线</h1>
              <p className="text-xs text-indigo-dye/60 uppercase tracking-[0.3em] font-serif-sc">Life Destiny K-Line</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsHelpOpen(true)}
              className="md:hidden p-2 text-indigo-dye hover:bg-black/5 rounded-full"
            >
              <HelpCircle className="w-6 h-6" />
            </button>
            <div className="hidden md:block text-xs text-indigo-dye/80 font-medium bg-indigo-dye/5 px-4 py-1.5 rounded-full border border-indigo-dye/10 tracking-wider">
              AI 大模型驱动 | 📕 nathanJ
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full container mx-auto px-4 md:px-8 lg:px-6 py-8 md:py-12 flex flex-col gap-12 relative">
        {/* Decorational Background Elements */}
        {!result && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-cinnabar/5 rounded-full blur-[120px] -z-10 pointer-events-none mix-blend-multiply"></div>
        )}

        {/* If no result, show intro and form with Centered Layout */}
        {!result && !loading && (
          <div className="min-h-[70vh] flex flex-col items-center justify-center animate-fade-in my-8 relative z-10 text-center">

            {/* Hero Section */}
            <div className="max-w-4xl mx-auto space-y-8 mb-12 relative">
              {/* Decorative Seal Background Centered */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cinnabar/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

              <div className="flex flex-col items-center space-y-6">
                <div className="flex items-center gap-2 text-cinnabar/80 font-bold tracking-[0.5em] text-sm uppercase">
                  <span className="w-8 h-[1px] bg-cinnabar/50"></span>
                  <span>探索命运的 K 线图</span>
                  <span className="w-8 h-[1px] bg-cinnabar/50"></span>
                </div>

                <h2 className="text-5xl md:text-7xl font-calligraphy text-ink leading-tight drop-shadow-sm">
                  洞悉<span className="text-cinnabar mx-2">乾坤</span>造化 <br />
                  预见<span className="text-indigo-dye mx-2">人生</span>轨迹
                </h2>

                <p className="text-xl text-indigo-dye/80 leading-loose max-w-2xl mx-auto font-serif-sc">
                  结合<strong className="text-ink border-b border-cinnabar/30 mx-1">传统八字命理</strong>与<strong className="text-ink border-b border-cinnabar/30 mx-1">AI大数据分析</strong>，
                  为您绘制一生运势起伏K线。
                  <span className="block mt-2 text-base text-indigo-dye/60">助您发现人生牛市，规避风险熊市，把握关键转折点。</span>
                </p>
              </div>

              {/* Feature Pills Centered */}
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-2 bg-white/60 px-5 py-2 rounded-full border border-indigo-dye/5 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-indigo-dye"></div>
                  <span className="text-sm font-bold text-indigo-dye/80">古法八字</span>
                </div>
                <div className="flex items-center gap-2 bg-white/60 px-5 py-2 rounded-full border border-indigo-dye/5 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-gold"></div>
                  <span className="text-sm font-bold text-indigo-dye/80">AI 深度解析</span>
                </div>
                <div className="flex items-center gap-2 bg-white/60 px-5 py-2 rounded-full border border-indigo-dye/5 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-cinnabar"></div>
                  <span className="text-sm font-bold text-indigo-dye/80">量化趋势</span>
                </div>
              </div>

              {/* Tutorial Links Centered -> Changed to Help Modal Trigger */}
              <div className="flex items-center justify-center gap-8 pt-2 text-sm font-medium opacity-80">
                <button
                  onClick={() => setIsHelpOpen(true)}
                  className="flex items-center gap-2 text-indigo-dye hover:text-cinnabar transition-colors group cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="border-b border-dashed border-indigo-dye/30 group-hover:border-cinnabar">使用教程 & 常见问题</span>
                </button>
                <a
                  href="https://platform.deepseek.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-indigo-dye hover:text-cinnabar transition-colors group"
                >
                  <Key className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="border-b border-dashed border-indigo-dye/30 group-hover:border-cinnabar">获取 DeepSeek Key</span>
                </a>
              </div>
            </div>

            {/* Bazi Form Centered */}
            <div className="w-full max-w-lg relative bg-white/40 p-2 md:p-8 rounded-sm shadow-lg backdrop-blur-md border border-indigo-dye/10 mt-4">
              {/* Corner Decors */}
              <div className="absolute -top-3 -left-3 w-8 h-8 border-t-2 border-l-2 border-cinnabar/40 rounded-tl-lg"></div>
              <div className="absolute -top-3 -right-3 w-8 h-8 border-t-2 border-r-2 border-cinnabar/40 rounded-tr-lg"></div>
              <div className="absolute -bottom-3 -left-3 w-8 h-8 border-b-2 border-l-2 border-cinnabar/40 rounded-bl-lg"></div>
              <div className="absolute -bottom-3 -right-3 w-8 h-8 border-b-2 border-r-2 border-cinnabar/40 rounded-br-lg"></div>

              <BaziForm onSubmit={handleFormSubmit} isLoading={loading} />
            </div>

          </div>
        )}

        {/* Loading and Error States remain same... */}
        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in relative z-10 top-0">
            <Loading />
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center min-h-[40vh] animate-fade-in">
            <div className="bg-cinnabar/10 border border-cinnabar/30 rounded-sm p-8 max-w-md text-center">
              <AlertTriangle className="w-12 h-12 text-cinnabar mx-auto mb-4" />
              <h3 className="text-xl font-calligraphy text-cinnabar mb-2">出现错误</h3>
              <p className="text-ink/70 font-serif-sc mb-4">{error}</p>
              <button
                onClick={() => setError(null)}
                className="seal-button text-sm px-4 py-2"
              >
                重试
              </button>
            </div>
          </div>
        )}

        {/* Results View */}
        {result && (
          <div className="animate-fade-in space-y-12 bg-paper-dark/50 p-8 rounded-sm shadow-inner border border-white/50">

            <div className="flex justify-between items-center border-b border-dashed border-indigo-dye/20 pb-6">
              <h2 className="text-3xl font-bold font-calligraphy text-ink">
                {userName ? `${userName} 的` : ''}命盘分析报告
              </h2>
              <button
                onClick={() => setResult(null)}
                className="text-indigo-dye hover:text-cinnabar font-medium text-sm flex items-center gap-1 transition-colors border border-indigo-dye/20 px-3 py-1 rounded-sm hover:border-cinnabar/50"
              >
                ← 重新排盘
              </button>
            </div>

            {/* The Chart */}
            <section className="space-y-6">
              <h3 className="text-2xl font-calligraphy text-ink flex items-center gap-3">
                <span className="w-1.5 h-6 bg-cinnabar rounded-full"></span>
                流年大运走势图 (1-80岁)
              </h3>
              <p className="text-sm text-indigo-dye/70 mb-2 font-serif-sc bg-paper px-4 py-2 rounded-sm inline-block border border-indigo-dye/10">
                <span className="text-cinnabar font-bold">红色K线</span> 代表运势上涨（吉），
                <span className="text-green-600 font-bold">绿色K线</span> 代表运势下跌（凶）。
                <span className="text-indigo-dye/60 ml-2">(包含 MA5/MA10 均线趋势)</span>
              </p>
              <div className="bg-white/60 p-4 rounded-sm border border-indigo-dye/5 shadow-sm">
                <LifeKLineChart data={result.chartData} />
              </div>
            </section>

            {/* The Text Report */}
            <section>
              <AnalysisResult analysis={result.analysis} />
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-ink text-paper-dark py-10 mt-auto border-t-4 border-cinnabar">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="mb-4">
            <Sparkles className="w-6 h-6 mx-auto text-cinnabar alpha-50" />
          </div>
          <p className="font-serif-sc tracking-widest text-sm opacity-80">&copy; {new Date().getFullYear()} 人生K线项目 | 仅供娱乐与文化研究，请勿迷信</p>
          <p className="text-xs mt-2 opacity-40 font-mono">Designed by 📕 nathanJ</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
