import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

function GaugeChart({ agroScore, sustentabilidade }) {
    const data = [
        { name: 'AgroScore', value: agroScore, color: '#D97706' },
        { name: 'Sustentabilidade', value: sustentabilidade, color: '#6B7234' },
        { name: 'Restante', value: 100 - ((agroScore + sustentabilidade) / 2), color: '#E5E7EB' },
    ];

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-cred-beige">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Geral</h3>
            <div className="relative h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={120}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-4xl font-bold text-cred-green-dark">{agroScore}%</p>
                </div>
            </div>
            <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-cred-orange"></div>
                    <span className="text-sm text-gray-600">AgroScore</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-cred-green-medium"></div>
                    <span className="text-sm text-gray-600">Sustentabilidade</span>
                </div>
            </div>
        </div>
    );
}

export default GaugeChart;