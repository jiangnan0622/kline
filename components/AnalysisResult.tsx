
import React from 'react';
import { AnalysisData } from '../types';
import { ScrollText, Briefcase, Coins, Heart, Activity, Users, Star, Info } from 'lucide-react';

interface AnalysisResultProps {
  analysis: AnalysisData;
}

const ScoreBar = ({ score }: { score: number }) => {
  // Color based on score (Using traditional palette approximation)
  let colorClass = "bg-gray-300";
  if (score >= 9) colorClass = "bg-emerald-600"; // Jade
  else if (score >= 7) colorClass = "bg-indigo-dye"; // Indigo
  else if (score >= 5) colorClass = "bg-gold"; // Gold
  else if (score >= 3) colorClass = "bg-orange-400"; // Amber
  else colorClass = "bg-cinnabar"; // Cinnabar

  return (
    <div className="flex items-center gap-3 mt-3">
      <div className="flex-1 h-2 bg-indigo-dye/10 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClass} transition-all duration-1000 ease-out`}
          style={{ width: `${score * 10}%` }}
        />
      </div>
      <span className="text-sm font-bold text-ink min-w-[2.5rem] text-right font-serif-sc">
        {score} / 10
      </span>
    </div>
  );
};

const Card = ({ title, icon: Icon, content, score, colorClass }: any) => (
  <div className="scroll-card h-full hover:shadow-2xl transition-shadow flex flex-col">
    <div className={`flex items-center justify-between mb-4 pb-2 border-b border-dashed border-indigo-dye/20 ${colorClass}`}>
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5" />
        <h3 className="font-calligraphy font-bold text-xl text-ink tracking-wider">{title}</h3>
      </div>
      <Star className="w-4 h-4 opacity-50 text-gold" />
    </div>
    <div className="text-ink/80 text-sm leading-loose whitespace-pre-wrap flex-grow font-serif-sc text-justify">
      {content}
    </div>
    {typeof score === 'number' && (
      <div className="pt-4 mt-4 border-t border-indigo-dye/5">
        <div className="text-xs text-indigo-dye/40 font-medium mb-1 uppercase tracking-widest text-center">— 评分 —</div>
        <ScoreBar score={score} />
      </div>
    )}
  </div>
);

const AnalysisResult: React.FC<AnalysisResultProps> = ({ analysis }) => {
  return (
    <div className="w-full space-y-10 animate-fade-in">
      {/* Bazi Pillars */}
      <div className="flex justify-center gap-4 md:gap-8 bg-ink text-paper p-8 rounded-sm shadow-xl overflow-x-auto relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gold opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gold opacity-50"></div>

        {analysis.bazi.map((pillar, index) => {
          const labels = ['年柱', '月柱', '日柱', '时柱'];
          return (
            <div key={index} className="text-center min-w-[80px] flex flex-col items-center">
              <div className="text-xs text-gold/80 mb-2 writing-vertical-rl tracking-widest opacity-70 border border-gold/30 px-1 py-2 rounded-sm">{labels[index]}</div>
              <div className="text-3xl md:text-4xl font-calligraphy font-bold tracking-widest text-paper bg-white/5 px-4 py-2 rounded-sm border border-white/10">{pillar}</div>
            </div>
          );
        })}
      </div>

      {/* Summary with Score */}
      <div className="bg-paper-dark p-8 rounded-sm border-y-4 border-double border-indigo-dye/20 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <ScrollText className="w-32 h-32 text-indigo-dye" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 relative z-10">
          <h3 className="flex items-center gap-3 font-calligraphy font-bold text-3xl text-ink">
            <span className="bg-cinnabar text-white rounded-full p-1"><ScrollText className="w-5 h-5" /></span>
            命理总评
          </h3>
          <div className="w-full md:w-1/3 min-w-[200px]">
            <ScoreBar score={analysis.summaryScore} />
          </div>
        </div>
        <p className="text-ink/90 text-lg leading-loose whitespace-pre-wrap indent-8 font-serif-sc relative z-10 text-justify border-l-2 border-cinnabar/30 pl-4">
          {analysis.summary}
        </p>
      </div>

      {/* Grid for categorical analysis with Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card
          title="事业行业"
          icon={Briefcase}
          content={analysis.industry}
          score={analysis.industryScore}
          colorClass="text-indigo-dye"
        />
        <Card
          title="财富层级"
          icon={Coins}
          content={analysis.wealth}
          score={analysis.wealthScore}
          colorClass="text-gold"
        />
        <Card
          title="婚姻情感"
          icon={Heart}
          content={analysis.marriage}
          score={analysis.marriageScore}
          colorClass="text-cinnabar"
        />
        <Card
          title="身体健康"
          icon={Activity}
          content={analysis.health}
          score={analysis.healthScore}
          colorClass="text-emerald-700"
        />
        <Card
          title="六亲关系"
          icon={Users}
          content={analysis.family}
          score={analysis.familyScore}
          colorClass="text-purple-800"
        />

        {/* Static Score Explanation Card */}
        <Card
          title="评分讲解"
          icon={Info}
          colorClass="text-gray-600"
          content={
            <div className="space-y-4">
              <ul className="space-y-2 font-mono text-xs md:text-sm">
                <li className="flex justify-between items-center border-b border-indigo-dye/10 pb-1">
                  <span>0-2分</span>
                  <span className="text-xs px-2 py-0.5 bg-cinnabar/10 text-cinnabar rounded font-bold border border-cinnabar/20">下下 (凶)</span>
                </li>
                <li className="flex justify-between items-center border-b border-indigo-dye/10 pb-1">
                  <span>3-4分</span>
                  <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-600 rounded font-bold border border-orange-200">中下 (耗)</span>
                </li>
                <li className="flex justify-between items-center border-b border-indigo-dye/10 pb-1">
                  <span>5-6分</span>
                  <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded font-bold border border-yellow-200">中平 (稳)</span>
                </li>
                <li className="flex justify-between items-center border-b border-indigo-dye/10 pb-1">
                  <span>7-8分</span>
                  <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded font-bold border border-indigo-200">中上 (吉)</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>9-10分</span>
                  <span className="text-xs px-2 py-0.5 bg-green-100 text-emerald-700 rounded font-bold border border-emerald-200">上上 (大吉)</span>
                </li>
              </ul>
              <p className="text-xs text-ink/60 leading-relaxed border-t border-indigo-dye/10 pt-2 text-justify italic">
                “命由天定，运由己造”。数据仅供参考，切勿执着。
              </p>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default AnalysisResult;
