import React, { useState, useEffect, useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot
} from 'recharts';
import { KLinePoint } from '../types';

interface LifeKLineChartProps {
  data: KLinePoint[];
}

// ----------------------------------------------------------------------
// Constants & Styles - Matching lifekline.cn style
// ----------------------------------------------------------------------
const COLORS = {
  up: '#ef4444',      // 红色 = 吉运(涨) - 中国A股惯例
  down: '#22c55e',    // 绿色 = 凶运(跌) - 中国A股惯例
  grid: '#e5e7eb',
  text: '#6b7280',
  background: '#ffffff'
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

// Tooltip matching reference style - Mobile optimized
const CustomTooltip = ({ active, payload, isMobile }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as KLinePoint;
    const isUp = data.close >= data.open;

    return (
      <div className={`bg-white rounded-lg border border-gray-200 shadow-lg ${isMobile ? 'p-2 min-w-[160px] text-xs' : 'p-3 min-w-[200px]'}`}>
        <div className="flex justify-between items-center mb-1.5 pb-1.5 border-b border-gray-100">
          <span className="text-gray-800 font-bold">
            {data.age}岁
          </span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isUp ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-600'}`}>
            {isUp ? '吉' : '凶'} {data.close}分
          </span>
        </div>

        <div className="flex gap-2 text-[10px] mb-1">
          <span className="text-gray-500">大运:<span className="text-amber-600 font-medium ml-0.5">{data.daYun}</span></span>
          <span className="text-gray-500">流年:<span className="text-blue-600 font-medium ml-0.5">{data.ganZhi}</span></span>
        </div>

        {data.reason && (
          <div className="text-gray-400 text-[10px] truncate">
            {data.reason}
          </div>
        )}
      </div>
    );
  }
  return null;
};

// Simple bar shape - NO wicks, just body (matching reference exactly)
const SimpleBarShape = (props: any) => {
  const { x, y, width, height, payload } = props;
  const isUp = payload.close >= payload.open;
  const color = isUp ? COLORS.up : COLORS.down;

  // Make bars thinner to match reference
  const barWidth = Math.max(width * 0.6, 2);
  const barX = x + (width - barWidth) / 2;
  const barHeight = Math.max(Math.abs(height), 2);

  return (
    <rect
      x={barX}
      y={y}
      width={barWidth}
      height={barHeight}
      fill={color}
    />
  );
};

// Star marker for max score
const MaxScoreStar = ({ cx, cy, payload }: any) => {
  return (
    <g>
      <text x={cx} y={cy - 15} textAnchor="middle" fill="#ef4444" fontSize={12} fontWeight="bold">
        {payload.close}
      </text>
      <text x={cx} y={cy - 5} textAnchor="middle" fill="#ef4444" fontSize={10}>
        ★
      </text>
    </g>
  );
};

const LifeKLineChart: React.FC<LifeKLineChartProps> = ({ data }) => {
  const isMobile = useIsMobile();

  // Find max score point
  const maxPoint = useMemo(() => {
    if (!data || data.length === 0) return null;
    return data.reduce((max, point) => point.close > max.close ? point : max, data[0]);
  }, [data]);

  // Transform data for bar chart
  const transformedData = useMemo(() => {
    return data.map(d => ({
      ...d,
      bodyRange: [Math.min(d.open, d.close), Math.max(d.open, d.close)],
    }));
  }, [data]);

  if (!data || data.length === 0) {
    return <div className="h-[400px] flex items-center justify-center text-gray-500">暂无运势数据</div>;
  }

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header - Mobile optimized */}
      <div className="p-3 md:p-4 border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
          {/* Title */}
          <h3 className="text-sm md:text-lg font-bold text-gray-800">
            人生流年大运K线图
            <span className="hidden md:inline text-xs text-gray-400 font-normal ml-2">(评分仅和自身比较)</span>
          </h3>

          {/* Legend - Compact on mobile */}
          <div className="flex gap-3 text-[10px] md:text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-sm"></div>
              <span className="text-red-500 font-medium">吉</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-sm"></div>
              <span className="text-green-600 font-medium">凶</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[300px] md:h-[450px] w-full px-1 py-2 md:p-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={transformedData} margin={{ top: 25, right: isMobile ? 5 : 10, left: isMobile ? -15 : 0, bottom: 15 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={COLORS.grid}
              vertical={true}
            />

            <XAxis
              dataKey="age"
              tick={{ fontSize: isMobile ? 9 : 11, fill: COLORS.text }}
              interval={isMobile ? 29 : 9}
              axisLine={{ stroke: COLORS.grid }}
              tickLine={false}
            />

            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: isMobile ? 9 : 11, fill: COLORS.text }}
              axisLine={{ stroke: COLORS.grid }}
              tickLine={false}
              ticks={[0, 50, 100]}
              width={isMobile ? 20 : 30}
            />

            <Tooltip
              content={<CustomTooltip isMobile={isMobile} />}
              cursor={{ fill: 'rgba(0,0,0,0.03)' }}
              isAnimationActive={false}
              position={isMobile ? { x: 10, y: 5 } : undefined}
            />

            {/* K-Line Bars */}
            <Bar
              dataKey="bodyRange"
              shape={<SimpleBarShape />}
              isAnimationActive={true}
              animationDuration={500}
            />

            {/* Max Score Star Marker */}
            {maxPoint && (
              <ReferenceDot
                x={maxPoint.age}
                y={maxPoint.close}
                shape={<MaxScoreStar />}
                isFront={true}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LifeKLineChart;