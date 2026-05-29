const STATUS_CONFIG = {
  ATIVA: {
    label: 'Ativa',
    classes: 'bg-green-100 text-green-800',
  },
  VALIDADA: {
    label: 'Validada',
    classes: 'bg-emerald-100 text-emerald-900',
  },
  AGUARDANDO_VALIDACAO: {
    label: 'Aguardando',
    classes: 'bg-yellow-100 text-yellow-800',
  },
  REPROVADA: {
    label: 'Reprovada',
    classes: 'bg-red-100 text-red-700',
  },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    classes: 'bg-gray-100 text-gray-600',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${config.classes}`}>
      {config.label}
    </span>
  );
}
