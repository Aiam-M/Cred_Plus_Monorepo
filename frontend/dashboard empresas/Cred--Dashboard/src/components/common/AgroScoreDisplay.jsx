function getScoreColor(score) {
  if (score >= 90) return { bg: '#2D5016', text: 'white' };
  if (score >= 70) return { bg: '#4A7C2F', text: 'white' };
  if (score >= 50) return { bg: '#F59E0B', text: 'white' };
  return { bg: '#D97706', text: 'white' };
}

const SIZE_CLASSES = {
  small: { wrap: 'w-12 h-12', text: 'text-sm font-bold', label: 'text-xs mt-0.5' },
  medium: { wrap: 'w-16 h-16', text: 'text-lg font-bold', label: 'text-xs mt-1' },
  large: { wrap: 'w-24 h-24', text: 'text-2xl font-bold', label: 'text-xs mt-1' },
};

export default function AgroScoreDisplay({ score, size = 'medium', showLabel = true }) {
  const color = getScoreColor(score);
  const sz = SIZE_CLASSES[size] ?? SIZE_CLASSES.medium;

  return (
    <div className="flex flex-col items-center">
      <div
        className={`${sz.wrap} rounded-full flex flex-col items-center justify-center shadow-sm`}
        style={{ backgroundColor: color.bg, color: color.text }}
      >
        <span className={sz.text}>{score}</span>
      </div>
      {showLabel && (
        <span className={`text-gray-500 ${sz.label}`}>AgroScore</span>
      )}
    </div>
  );
}
