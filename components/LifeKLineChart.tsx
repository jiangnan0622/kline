import React from 'react';
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

// 专业 Tooltip - 东方财富风格
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as KLinePoint;
    const isUp = data.close >= data.open;
    const change = data.close - data.open;
    const changePercent = ((change / data.open) * 100).toFixed(2);

    return (
      <div className="bg-[#1a1a2e] p-4 rounded border border-gray-700 shadow-2xl min-w-[280px]">
        {/* 标题栏 */}
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-700">
          <span className="text-white font-bold text-lg">
            {data.year}年 · {data.age}岁
          </span>
          <span className={`px-2 py-1 rounded text-sm font-bold ${isUp ? 'bg-red-600/20 text-red-400' : 'bg-green-600/20 text-green-400'}`}>
            {isUp ? '▲ 吉' : '▼ 凶'} {changePercent}%
          </span>
        </div>

        {/* 大运流年 */}
        <div className="flex gap-4 mb-3 text-sm">
          <span className="text-gray-400">大运：<span className="text-yellow-400 font-bold">{data.daYun}</span></span>
          <span className="text-gray-400">流年：<span className="text-cyan-400 font-bold">{data.ganZhi}</span></span>
        </div>

        {/* OHLC 数据 */}
        <div className="grid grid-cols-4 gap-2 mb-3 p-2 bg-black/30 rounded">
          <div className="text-center">
            <div className="text-gray-500 text-xs">开</div>
            <div className="text-white font-mono">{data.open}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500 text-xs">高</div>
            <div className="text-red-400 font-mono">{data.high}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500 text-xs">低</div>
            <div className="text-green-400 font-mono">{data.low}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500 text-xs">收</div>
            <div className={`font-mono font-bold ${isUp ? 'text-red-400' : 'text-green-400'}`}>{data.close}</div>
          </div>
        </div>

        {/* 流年详批 */}
        <div className="text-gray-300 text-sm leading-relaxed">
          {data.reason}
        </div>
      </div>
    );
  }
  return null;
};

// 专业 K线蜡烛 - 东方财富风格（中国市场：红涨绿跌）
const CandleShape = (props: any) => {
  const { x, y, width, height, payload, yAxis } = props;

  const isUp = payload.close >= payload.open;
  // 中国市场惯例：红色阳线（涨），绿色阴线（跌）
  const bodyColor = isUp ? '#ef4444' : '#22c55e';
  const wickColor = isUp ? '#dc2626' : '#16a34a';

  // 计算影线位置
  let highY = y;
  let lowY = y + height;

  if (yAxis && typeof yAxis.scale === 'function') {
    try {
      highY = yAxis.scale(payload.high);
      lowY = yAxis.scale(payload.low);
    } catch {
      highY = y;
      lowY = y + height;
    }
  }

  const center = x + width / 2;
  // 实体最小高度
  const minBodyHeight = 4;
  const bodyHeight = Math.max(Math.abs(height), minBodyHeight);
  // 蜡烛体宽度 (东方财富风格偏宽)
  const bodyWidth = Math.max(width * 0.75, 5);
  const bodyX = x + (width - bodyWidth) / 2;
  const bodyY = isUp ? y : y;

  return (
    <g>
      {/* 上影线 */}
      <line
        x1={center}
        y1={highY}
        x2={center}
        y2={bodyY}
        stroke={wickColor}
        strokeWidth={1.5}
      />
      {/* 下影线 */}
      <line
        x1={center}
        y1={bodyY + bodyHeight}
        x2={center}
        y2={lowY}
        stroke={wickColor}
        strokeWidth={1.5}
      />
      {/* 蜡烛实体 */}
      <rect
        x={bodyX}
        y={bodyY}
        width={bodyWidth}
        height={bodyHeight}
        fill={isUp ? bodyColor : bodyColor}
        stroke={wickColor}
        strokeWidth={1}
      />
    </g>
  );
};

// 移动平均线计算
const calculateMA = (dayCount: number, data: KLinePoint[]) => {
  return data.map((entry, index) => {
    if (index < dayCount - 1) {
      return { ...entry, [`MA${dayCount}`]: null };
    }
    let sum = 0;
    for (let i = 0; i < dayCount; i++) {
      sum += data[index - i].close;
    }
    return { ...entry, [`MA${dayCount}`]: sum / dayCount };
  });
};

const LifeKLineChart: React.FC<LifeKLineChartProps> = ({ data }) => {
  // 1. 计算均线
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

  // Calculate dynamic domain for Y-axis
  const minVal = Math.min(...data.map(d => d.low));
  const maxVal = Math.max(...data.map(d => d.high));
  // Relax padding to make small changes look small
  const yDomainMin = Math.max(0, Math.floor(minVal - 10));
  const yDomainMax = Math.min(100, Math.ceil(maxVal + 10));

  if (!data || data.length === 0) {
    return <div className="h-[500px] flex items-center justify-center text-gray-500">暂无运势数据</div>;
  }

  return (
    <div className="w-full bg-[#0d0d1a] p-6 rounded-xl border border-gray-800 shadow-2xl">
      {/* Header matching image style */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            流年运势 K 线
            <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-xs rounded-full border border-indigo-500/30">建禄格</span>
          </h3>
          <div className="flex gap-4 mt-2 text-xs text-gray-400">
            <span>格局基准分: <span className="text-white font-mono">72</span></span>
            <span className="w-[1px] h-3 bg-gray-700"></span>
            <span>大运周期: 10年一变</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-900/50 p-1 rounded-lg border border-gray-800">
          <button className="px-4 py-1.5 bg-indigo-600 text-white rounded text-sm font-medium shadow-sm flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
            总运势
          </button>
          {['财运', '事业', '感情', '子孙', '健康'].map(tab => (
            <button key={tab} className="px-4 py-1.5 text-gray-500 hover:text-gray-300 text-sm font-medium transition-colors">
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="text-xs text-gray-500 mb-2 flex gap-4">
        <span className="flex items-center gap-1.5 text-green-400">
          <span className="w-3 h-3 bg-green-500 rounded-sm"></span>
          <span>绿色K线 代表运势上涨 (吉)</span>
        </span>
        <span className="flex items-center gap-1.5 text-red-400">
          <span className="w-3 h-3 bg-red-500 rounded-sm"></span>
          <span>红色K线 代表运势下跌 (凶)</span>
        </span>
      </div>

      {/* K线图主体 */}
      <div className="h-[500px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={transformedData} margin={{ top: 20, right: 10, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.05} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" strokeOpacity={0.3} vertical={false} />

            <XAxis
              dataKey="age"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              interval={9}
              axisLine={false}
              tickLine={false}
              dy={10}
            />

            <YAxis
              domain={[yDomainMin, yDomainMax]}
              tick={{ fontSize: 11, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
              width={35}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: '#4b5563', strokeWidth: 1, strokeDasharray: '4 4' }}
              isAnimationActive={false}
            />

            {/* Da Yun Labels at Top */}
            {daYunChanges.map((point, index) => (
              <ReferenceLine
                key={`dayun-${index}`}
                x={point.age}
                stroke="#374151"
                strokeDasharray="2 2"
                strokeOpacity={0.3}
              >
                <Label
                  value={point.daYun}
                  position="insideTop"
                  fill="#9ca3af"
                  fontSize={11}
                  offset={10}
                />
              </ReferenceLine>
            ))}

            {/* Background Area Trend */}
            <Area
              type="monotone"
              dataKey="close"
              stroke="none"
              fill="url(#colorClose)"
            />

            {/* MA Lines */}
            <Line type="monotone" dataKey="MA5" stroke="#fbbf24" dot={false} strokeWidth={1} strokeOpacity={0.7} />
            <Line type="monotone" dataKey="MA10" stroke="#a78bfa" dot={false} strokeWidth={1} strokeOpacity={0.7} />

            {/* Candlesticks */}
            <Bar
              dataKey="bodyRange"
              shape={<CandleShape />}
              isAnimationActive={true}
              animationDuration={800}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LifeKLineChart;