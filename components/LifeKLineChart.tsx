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

// Tooltip matching reference style
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as KLinePoint;
    const isUp = data.close >= data.open;
    const colorClass = isUp ? 'text-red-500' : 'text-green-600';

    return (
      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-lg min-w-[200px]">
        <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-100">
          <span className="text-gray-800 font-bold">
            {data.year}年 · {data.age}岁
          </span>
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${isUp ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-600'}`}>
            {isUp ? '吉运' : '凶运'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm mb-2">
          <div><span className="text-gray-500">大运：</span><span className="text-amber-600 font-medium">{data.daYun}</span></div>
          <div><span className="text-gray-500">流年：</span><span className="text-blue-600 font-medium">{data.ganZhi}</span></div>
        </div>

        <div className="flex justify-between items-center bg-gray-50 rounded p-2">
          <span className="text-gray-500 text-sm">运势分</span>
          <span className={`text-xl font-bold ${colorClass}`}>{data.close}</span>
        </div>

        {data.reason && (
          <div className="text-gray-500 text-xs mt-2 pt-2 border-t border-gray-100">
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
      {/* Header - matching reference */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex flex-row justify-between items-center">
          <h3 className="text-base md:text-lg font-bold text-gray-800">
            人生流年大运K线图
            <span className="text-xs text-gray-400 font-normal ml-2">(评分仅和自身比较)</span>
          </h3>

          {/* Legend matching reference exactly - 红涨绿跌 */}
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1.5 border border-gray-200 rounded px-2 py-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-red-500 font-medium">吉运</span>
              <span className="text-gray-400">(涨)</span>
            </div>
            <div className="flex items-center gap-1.5 border border-gray-200 rounded px-2 py-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-600 font-medium">凶运</span>
              <span className="text-gray-400">(跌)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[350px] md:h-[450px] w-full p-2 md:p-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={transformedData} margin={{ top: 30, right: 10, left: 0, bottom: 20 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={COLORS.grid}
              vertical={true}
            />

            <XAxis
              dataKey="age"
              tick={{ fontSize: 11, fill: COLORS.text }}
              interval={isMobile ? 19 : 9}
              axisLine={{ stroke: COLORS.grid }}
              tickLine={false}
              label={{ value: '年龄', position: 'insideBottomRight', offset: -5, fontSize: 11, fill: COLORS.text }}
            />

            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: COLORS.text }}
              axisLine={{ stroke: COLORS.grid }}
              tickLine={false}
              ticks={[0, 25, 50, 75, 100]}
              label={{ value: '运势分', angle: -90, position: 'insideLeft', fontSize: 11, fill: COLORS.text }}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
              isAnimationActive={false}
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