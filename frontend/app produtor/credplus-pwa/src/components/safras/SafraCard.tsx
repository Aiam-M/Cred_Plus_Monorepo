import { useNavigate } from 'react-router';
import { MapPin, Calendar, Leaf } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Safra } from '@/data/mockData';
import { tiposCultura } from '@/data/mockData';
import StatusBadge from '@/components/common/StatusBadge';

interface SafraCardProps {
  safra: Safra;
}

export default function SafraCard({ safra }: SafraCardProps) {
  const navigate = useNavigate();

  const plantacoesText = safra.plantacoes
    .map((p) => {
      const tipo = tiposCultura.find((t) => t.value === p.tipo);
      return `${tipo?.label ?? p.tipo}: ${p.quantidade} ${p.unidade}`;
    })
    .join(' · ');

  const dataFormatada = format(new Date(safra.createdAt), "d 'de' MMM 'de' yyyy", {
    locale: ptBR,
  });

  return (
    <div
      onClick={() => navigate(`/safra/${safra.id}`)}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 active:scale-[0.98] transition-transform cursor-pointer"
    >
      {safra.imagens[0] ? (
        <img
          src={safra.imagens[0].uri}
          alt={safra.nome}
          className="w-full h-36 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <div className="w-full h-36 bg-green-50 flex items-center justify-center">
          <Leaf size={40} className="text-green-200" />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-semibold text-gray-900 text-base leading-tight">{safra.nome}</h3>
          <StatusBadge status={safra.status} size="sm" />
        </div>

        <div className="space-y-1.5 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="shrink-0" />
            <span>{safra.areaHectares} hectares</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="shrink-0" />
            <span>{dataFormatada}</span>
          </div>
          {plantacoesText && (
            <p className="text-xs text-gray-400 pt-1 border-t border-gray-50 truncate">
              {plantacoesText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
