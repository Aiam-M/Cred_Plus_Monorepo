function MetricCard({ title, value, subtitle, icon: Icon, colorScheme }) {
    const colors = {
        green: { bg: 'bg-cred-green-dark', text: 'text-white', iconBg: 'bg-white/10' },
        orange: { bg: 'bg-gradient-to-br from-cred-orange to-cred-orange-light', text: 'text-white', iconBg: 'bg-white/10' },
    };
    const current = colors[colorScheme] || colors.green;

    return (
        <div className={`${current.bg} ${current.text} rounded-2xl p-6 card-hover`}>
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-sm font-medium opacity-90 mb-1">{title}</h3>
                    <p className="text-3xl font-bold mb-2">{value}</p>
                    <p className="text-xs opacity-75">{subtitle}</p>
                </div>
                <div className={`${current.iconBg} p-3 rounded-xl`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
}

export default MetricCard;