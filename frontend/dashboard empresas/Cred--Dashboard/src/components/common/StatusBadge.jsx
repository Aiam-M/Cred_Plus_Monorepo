const STATUS_CONFIG = {
  ATIVA: {
    label: 'Ativa',
    classes: 'bg-green-100 text-green-800',
    icon: '✅',
  },
  VALIDADA: {
    label: 'Validada',
    classes: 'bg-emerald-100 text-emerald-900',
    icon: '✓',
  },
  AGUARDANDO_VALIDACAO: {
    label: 'Aguardando',
    classes: 'bg-yellow-100 text-yellow-800',
    icon: '⏳',
  },
  REPROVADA: {
    label: 'Reprovada',
    classes: 'bg-red-100 text-red-700',
    icon: '✗',
  },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    classes: 'bg-gray-100 text-gray-600',
    icon: '•',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${config.classes}`}>
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
}
