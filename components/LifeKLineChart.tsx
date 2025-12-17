import React, { useState, useEffect } from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
  Area,
  Line
} from 'recharts';
import { KLinePoint } from '../types';

interface LifeKLineChartProps {
  data: KLinePoint[];
}

// ----------------------------------------------------------------------
// Constants & Styles
// ----------------------------------------------------------------------
const COLORS = {
  up: '#FA2C37',       // 鲜亮红 (涨)
  upDark: '#8B1A20',
  down: '#00CF99',     // 青翠绿 (跌) - 类似 Webull/Futu 色调
  downDark: '#006F52',
  text: '#E5E7EB',
  grid: '#2A2A35',
  bgGradientStart: '#13131F',
  bgGradientEnd: '#09090E'
};

// Hook for mobile detection
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
};

// ----------------------------------------------------------------------
// Custom Components
// ----------------------------------------------------------------------

// 1. Premium Tooltip
const CustomTooltip = ({ active, payload, isMobile }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as KLinePoint;
    const isUp = data.close >= data.open;
    const change = data.close - data.open;
    const changePercent = ((change / data.open) * 100).toFixed(2);
    const colorClass = isUp ? 'text-[#FA2C37]' : 'text-[#00CF99]';
    const bgBadge = isUp ? 'bg-[#FA2C37]/10 border-[#FA2C37]/30' : 'bg-[#00CF99]/10 border-[#00CF99]/30';

    return (
      <div className={`bg-[#1E1E2A]/95 backdrop-blur-md p-3 md:p-4 rounded-lg border border-gray-700/50 shadow-2xl ${isMobile ? 'w-[260px] text-xs' : 'min-w-[280px]'}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-2 md:mb-3 pb-2 border-b border-gray-700/50">
          <span className="text-white font-bold md:text-lg">
            {data.year}年 · {data.age}岁
          </span>
          <span className={`px-1.5 py-0.5 md:px-2 md:py-1 rounded text-xs font-bold border ${colorClass} ${bgBadge}`}>
            {isUp ? '▲ 涨' : '▼ 跌'} {changePercent}%
          </span>
        </div>

        {/* Data Grid */}
        <div className="flex gap-2 mb-2 md:mb-3 text-[10px] md:text-sm">
          <div className="flex-1 bg-black/20 rounded p-1.5 md:p-2 grid grid-cols-2 gap-y-1">
            <span className="text-gray-500">大运</span> <span className="text-yellow-500 font-bold ml-auto">{data.daYun}</span>
            <span className="text-gray-500">流年</span> <span className="text-cyan-400 font-bold ml-auto">{data.ganZhi}</span>
          </div>

          <div className="flex-[1.5] bg-black/20 rounded p-1.5 md:p-2 grid grid-cols-4 gap-1 text-center">
            <div className="flex flex-col"><span className="text-gray-600 scale-90 origin-center">开</span><span className="text-gray-300 font-mono">{data.open}</span></div>
            <div className="flex flex-col"><span className="text-gray-600 scale-90 origin-center">高</span><span className="text-[#FA2C37] font-mono">{data.high}</span></div>
            <div className="flex flex-col"><span className="text-gray-600 scale-90 origin-center">低</span><span className="text-[#00CF99] font-mono">{data.low}</span></div>
            <div className="flex flex-col"><span className="text-gray-600 scale-90 origin-center">收</span><span className={`${colorClass} font-mono font-bold`}>{data.close}</span></div>
          </div>
        </div>

        {/* Reason */}
        <div className="text-gray-400 text-[10px] md:text-sm leading-relaxed border-t border-gray-700/30 pt-2">
          {data.reason}
        </div>
      </div>
    );
  }
  return null;
};

// 2. Premium Candle Shape with Anti-aliasing Feel
const CandleShape = (props: any) => {
  const { x, y, width, height, payload, yAxis } = props;
  const isUp = payload.close >= payload.open;

  const bodyColor = isUp ? COLORS.up : COLORS.down;
  const wickColor = isUp ? COLORS.up : COLORS.down;

  // Calculate coordinates
  let highY = y;
  let lowY = y + height;

  if (yAxis && typeof yAxis.scale === 'function') {
    try {
      highY = yAxis.scale(payload.high);
      lowY = yAxis.scale(payload.low);
    } catch { /* fallback */ }
  }

  const center = x + width / 2;
  const minBodyHeight = 3; // slightly thinner min height for crisper look
  const bodyHeight = Math.max(Math.abs(height), minBodyHeight);
  // Cleaner width calculation
  const bodyWidth = Math.max(width * 0.65, 3);
  const bodyX = x + (width - bodyWidth) / 2;
  const bodyY = y;

  return (
    <g>
      {/* Wick (Line) */}
      <line x1={center} y1={highY} x2={center} y2={lowY} stroke={wickColor} strokeWidth={1} />

      {/* Body (Rect) with subtle glow effect logic if needed, kept simple for performance */}
      <rect
        x={bodyX}
        y={bodyY}
        width={bodyWidth}
        height={bodyHeight}
        fill={bodyColor}
        stroke={wickColor}
        strokeWidth={0}
        opacity={isUp ? 0.9 : 1} // Hollow feel for 'Up' candles? No, standard solid for mobile visibility is better.
        rx={1} // Slight rounded corner
      />
    </g>
  );
};

// ----------------------------------------------------------------------
// Logic
// ----------------------------------------------------------------------

const calculateMA = (dayCount: number, data: KLinePoint[]) => {
  return data.map((entry, index) => {
    if (index < dayCount - 1) return { ...entry, [`MA${dayCount}`]: null };
    let sum = 0;
    for (let i = 0; i < dayCount; i++) sum += data[index - i].close;
    return { ...entry, [`MA${dayCount}`]: sum / dayCount };
  });
};

const LifeKLineChart: React.FC<LifeKLineChartProps> = ({ data }) => {
  const isMobile = useIsMobile();

  // Data prep
  const dataWithMA5 = calculateMA(5, data);
  const dataWithMA = calculateMA(10, dataWithMA5);
  const transformedData = dataWithMA.map(d => ({
    ...d,
    bodyRange: [Math.min(d.open, d.close), Math.max(d.open, d.close)],
  }));

  const daYunChanges = data.filter((d, i) => {
    if (i === 0) return true;
    return d.daYun !== data[i - 1].daYun;
  });

  const minVal = Math.min(...data.map(d => d.low));
  const maxVal = Math.max(...data.map(d => d.high));
  const yDomainMin = Math.max(0, Math.floor(minVal - 10));
  const yDomainMax = Math.min(100, Math.ceil(maxVal + 10));

  if (!data || data.length === 0) {
    return <div className="h-[400px] flex items-center justify-center text-gray-500">暂无运势数据</div>;
  }

  return (
    <div
      className="w-full rounded-xl border border-[#2A2A35] shadow-2xl overflow-hidden"
      style={{
        background: `linear-gradient(180deg, ${COLORS.bgGradientStart} 0%, ${COLORS.bgGradientEnd} 100%)`
      }}
    >
      {/* Header */}
      <div className="p-3 md:p-5 border-b border-[#2A2A35]">
        <div className="flex flex-row justify-between items-center">
          <h3 className="text-lg md:text-xl font-bold text-gray-100 flex items-center gap-2">
            流年运势
            <span className="hidden md:inline text-xs text-gray-500 font-normal">K-Line Chart</span>
          </h3>

          {/* Mobile-friendly Legend */}
          <div className="flex gap-2 md:gap-4 text-[10px] md:text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#FA2C37]"></div>
              <span className="text-gray-300">涨(吉)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#00CF99]"></div>
              <span className="text-gray-300">跌(凶)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-[#fbbf24]"></div>
              <span>MA5</span>
            </div>
            <div className="flex items-center gap-1 hidden md:flex">
              <div className="w-3 h-0.5 bg-[#a78bfa]"></div>
              <span>MA10</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[350px] md:h-[500px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={transformedData} margin={{ top: 20, right: 0, left: -10, bottom: 5 }}>
            <defs>
              <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.down} stopOpacity={0.15} />
                <stop offset="95%" stopColor={COLORS.down} stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="2 4"
              stroke={COLORS.grid}
              strokeOpacity={0.8}
              vertical={false}
            />

            <XAxis
              dataKey="age"
              tick={{ fontSize: 10, fill: '#6B7280' }}
              interval={isMobile ? "preserveStartEnd" : 4} // Smarter interval for mobile
              axisLine={false}
              tickLine={false}
              dy={10}
              minTickGap={20}
            />

            <YAxis
              domain={[yDomainMin, yDomainMax]}
              tick={{ fontSize: 10, fill: '#6B7280' }}
              axisLine={false}
              tickLine={false}
              width={25}
              orientation="right" // Put Price on Right like professional charts
            />

            <Tooltip
              content={<CustomTooltip isMobile={isMobile} />}
              cursor={{ stroke: '#6B7280', strokeWidth: 1, strokeDasharray: '4 4' }}
              isAnimationActive={false}
              // On mobile, fix tooltip to top left to avoid blocking touch (approximate safe area)
              position={isMobile ? { x: 10, y: 0 } : undefined}
              wrapperStyle={{ outline: 'none', zIndex: 50 }}
            />

            {/* Da Yun Separation Lines */}
            {daYunChanges.map((point, index) => (
              <ReferenceLine
                key={`dayun-${index}`}
                x={point.age}
                stroke="#374151"
                strokeDasharray="2 2"
                strokeOpacity={0.4}
              >
                {!isMobile && (
                  <Label
                    value={point.daYun}
                    position="insideTopLeft"
                    fill="#4B5563"
                    fontSize={10}
                  />
                )}
              </ReferenceLine>
            ))}

            <Area
              type="monotone"
              dataKey="close"
              stroke="none"
              fill="url(#colorClose)"
              isAnimationActive={false}
            />

            <Line type="monotone" dataKey="MA5" stroke="#fbbf24" dot={false} strokeWidth={1} strokeOpacity={0.8} />
            <Line type="monotone" dataKey="MA10" stroke="#a78bfa" dot={false} strokeWidth={1} strokeOpacity={0.8} />

            <Bar
              dataKey="bodyRange"
              shape={<CandleShape />}
              isAnimationActive={true}
              animationDuration={500}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LifeKLineChart;