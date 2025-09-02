import { cn } from "@cartridge/ui";

interface ChartData {
  day: number;
  bal7hazar: number;
  clicksave: number;
  flipper: number;
}

export function VaultPage() {
  // Generate 7 days of mock data ending with today
  const generateMockData = (): ChartData[] => {
    const data: ChartData[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const day = date.getDate();

      data.push({
        day,
        bal7hazar: 16 + Math.random() * 8,
        clicksave: 8 + Math.random() * 6,
        flipper: 4 + Math.random() * 6,
      });
    }

    return data;
  };

  const chartData = generateMockData();

  // Calculate SVG path for a line
  const createPath = (data: number[], maxValue: number) => {
    const width = 800;
    const height = 300;
    const padding = 40;

    const xStep = (width - padding * 2) / (data.length - 1);
    const yScale = (height - padding * 2) / maxValue;

    let path = "";

    data.forEach((value, index) => {
      const x = padding + index * xStep;
      const y = height - padding - value * yScale;

      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    });

    return path;
  };

  const maxValue = 28;

  return (
    <div className={cn("w-full flex flex-col gap-4 lg:p-6 lg:pb-0 p-4")}>
      <div className="bg-gray-900 rounded-lg p-6 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <pattern
                id="diagonalHatch"
                patternUnits="userSpaceOnUse"
                width="8"
                height="8"
              >
                <path
                  d="M0,8 L8,0"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  opacity="0.3"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#diagonalHatch)" />
          </svg>
        </div>

        {/* Legend */}
        <div className="flex gap-6 mb-6 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            <span className="text-white text-sm">bal7hazar</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-400"></div>
            <span className="text-white text-sm">clicksave</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span className="text-white text-sm">flipper</span>
          </div>
        </div>

        {/* Chart Container */}
        <div className="relative h-80">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 800 300"
            className="relative z-10"
          >
            {/* Y-axis labels */}
            <g className="text-gray-400 text-xs">
              <text x="10" y="60" textAnchor="start">
                24%
              </text>
              <text x="10" y="120" textAnchor="start">
                16%
              </text>
              <text x="10" y="180" textAnchor="start">
                12%
              </text>
              <text x="10" y="240" textAnchor="start">
                8%
              </text>
              <text x="10" y="280" textAnchor="start">
                4%
              </text>
            </g>

            {/* X-axis labels (days) */}
            <g className="text-gray-400 text-xs">
              {chartData.map((item, index) => (
                <text
                  key={index}
                  x={40 + index * (720 / (chartData.length - 1))}
                  y="295"
                  textAnchor="middle"
                >
                  {item.day}
                </text>
              ))}
            </g>

            {/* Grid lines */}
            <g stroke="rgba(255,255,255,0.1)" strokeWidth="1">
              {[60, 120, 180, 240].map((y) => (
                <line key={y} x1="40" y1={y} x2="760" y2={y} />
              ))}
            </g>

            {/* Chart lines */}
            {/* bal7hazar line (blue) */}
            <path
              d={createPath(
                chartData.map((d) => d.bal7hazar),
                maxValue,
              )}
              fill="none"
              stroke="#60A5FA"
              strokeWidth="2"
              className="drop-shadow-sm"
            />

            {/* clicksave line (orange) */}
            <path
              d={createPath(
                chartData.map((d) => d.clicksave),
                maxValue,
              )}
              fill="none"
              stroke="#FB923C"
              strokeWidth="2"
              className="drop-shadow-sm"
            />

            {/* flipper line (green) */}
            <path
              d={createPath(
                chartData.map((d) => d.flipper),
                maxValue,
              )}
              fill="none"
              stroke="#4ADE80"
              strokeWidth="2"
              className="drop-shadow-sm"
            />

            {/* Data points */}
            {chartData.map((item, index) => {
              const x = 40 + index * (720 / (chartData.length - 1));
              const yScale = 220 / maxValue;

              return (
                <g key={index}>
                  {/* bal7hazar point */}
                  <circle
                    cx={x}
                    cy={260 - item.bal7hazar * yScale}
                    r="3"
                    fill="#60A5FA"
                    className="drop-shadow-sm"
                  />

                  {/* clicksave point */}
                  <circle
                    cx={x}
                    cy={260 - item.clicksave * yScale}
                    r="3"
                    fill="#FB923C"
                    className="drop-shadow-sm"
                  />

                  {/* flipper point */}
                  <circle
                    cx={x}
                    cy={260 - item.flipper * yScale}
                    r="3"
                    fill="#4ADE80"
                    className="drop-shadow-sm"
                  />
                </g>
              );
            })}
          </svg>

          {/* Current values display */}
          <div className="absolute top-4 right-4 text-right space-y-1">
            <div className="text-blue-400 text-lg font-semibold">
              {chartData[chartData.length - 1]?.bal7hazar.toFixed(0)}%
            </div>
            <div className="text-orange-400 text-lg font-semibold">
              {chartData[chartData.length - 1]?.clicksave.toFixed(0)}%
            </div>
            <div className="text-green-400 text-lg font-semibold">
              {chartData[chartData.length - 1]?.flipper.toFixed(0)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
