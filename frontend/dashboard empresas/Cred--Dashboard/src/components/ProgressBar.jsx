function ProgressBar({ label, value, colorScheme = 'green' }) {
    const colors = { green: 'bg-cred-green-medium', orange: 'bg-cred-orange' };
    return (
        <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-white">{label}</span>
                <span className="text-sm font-semibold text-white">{value}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                    className={`${colors[colorScheme]} h-2.5 rounded-full transition-all duration-500`}
                    style={{ width: `${value}%` }}
                ></div>
            </div>
        </div>
    );
}

export default ProgressBar;