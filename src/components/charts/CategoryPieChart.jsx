import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCompactCurrency } from '../../utils/currency';

const COLORS = {
    income: ['#00FF41', '#00D9FF', '#FFD700', '#FF0040', '#9D00FF'],
    expense: ['#FF0040', '#FFD700', '#00D9FF', '#00FF41', '#9D00FF']
};

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value, type }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Only show label for significant segments
    if (percent < 0.05) return null;

    return (
        <text
            x={x}
            y={y}
            fill="white"
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline="central"
            style={{
                fontSize: '10px',
                fontFamily: 'var(--font-display)',
                fontWeight: 'bold',
                textShadow: '0 1px 2px rgba(0,0,0,0.8)'
            }}
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

export default function CategoryPieChart({ data, type = 'expense' }) {
    // Prepare data for chart
    const chartData = data.map((item, index) => ({
        name: item.category.name,
        value: item.total,
        color: COLORS[type][index % COLORS[type].length]
    }));

    // Custom Tooltip
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-surface border border-border-default p-2 rounded-md shadow-lg backdrop-blur-md">
                    <p className="font-display text-xs text-text-secondary mb-1">{payload[0].name}</p>
                    <p className="font-display text-sm font-bold" style={{ color: payload[0].payload.color }}>
                        {formatCompactCurrency(payload[0].value, 'INR')}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                    >
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                style={{
                                    filter: `drop-shadow(0 0 4px ${entry.color}40)`
                                }}
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>


        </div>
    );
}
