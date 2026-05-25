import { CheckCircle, Clock, Satellite, Eye, XCircle, MinusCircle } from 'lucide-react';
import type { StatusSafra } from '@/data/mockData';

const config: Record<
  StatusSafra,
  { label: string; Icon: React.ElementType; bg: string; text: string; border: string }
> = {
  AGUARDANDO_SYNC: {
    label: 'Aguardando Sync',
    Icon: Clock,
    bg: 'bg-yellow-50',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
  },
  AGUARDANDO_VALIDACAO_SATELITE: {
    label: 'Verificando por Satélite',
    Icon: Satellite,
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
  },
  AGUARDANDO_VALIDACAO_CAMPO: {
    label: 'Em Verificação de Campo',
    Icon: Eye,
    bg: 'bg-orange-50',
    text: 'text-orange-800',
    border: 'border-orange-200',
  },
  ATIVA: {
    label: 'Validada',
    Icon: CheckCircle,
    bg: 'bg-green-50',
    text: 'text-green-800',
    border: 'border-green-200',
  },
  REPROVADA: {
    label: 'Reprovada',
    Icon: XCircle,
    bg: 'bg-red-50',
    text: 'text-red-800',
    border: 'border-red-200',
  },
  ENCERRADA: {
    label: 'Encerrada',
    Icon: MinusCircle,
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    border: 'border-gray-200',
  },
};

interface StatusBadgeProps {
  status: StatusSafra;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const { label, Icon, bg, text, border } = config[status];
  const iconSize = size === 'sm' ? 12 : 14;
  const textClass = size === 'sm' ? 'text-[11px]' : 'text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-medium border ${bg} ${text} ${border} ${textClass}`}
    >
      <Icon size={iconSize} />
      {label}
    </span>
  );
}
