import { MapPin, Maximize2 } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import AgroScoreDisplay from '../common/AgroScoreDisplay';

const TIPO_LABEL = {
  CACAU: 'Cacau',
  ACAI: 'Açaí',
  PIMENTA: 'Pimenta-do-Reino',
  MANDIOCA: 'Mandioca',
};

export default function SafraCard({ safra, onVerDetalhes, onDemonstrarInteresse }) {
  return (
    <div className="bg-white rounded-2xl border border-cred-gray-border shadow-sm card-hover flex flex-col">
      {/* Imagem placeholder */}
      <div className="h-36 rounded-t-2xl bg-gradient-to-br from-cred-green-dark to-cred-green-medium flex items-center justify-center flex-shrink-0">
        <span className="text-5xl">🌱</span>
      </div>

      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Título + Score */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-cred-gray-text leading-snug">
              Safra #{safra.id} — {safra.nome}
            </h3>
          </div>
          <AgroScoreDisplay score={safra.agroScore} size="small" showLabel={false} />
        </div>

        {/* AgroScore label */}
        <p className="text-xs font-medium text-cred-green-medium">
          ⭐ AgroScore: {safra.agroScore}/100
        </p>

        {/* Infos */}
        <div className="space-y-1 text-sm text-gray-600">
          <p>📍 {safra.associacao.nome}</p>
          <p>👤 Produtor: {safra.produtor.nome}</p>
          <div className="flex items-center gap-1">
            <Maximize2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span>{safra.areaHectares} hectares</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span>{safra.associacao.municipio} — {safra.associacao.estado}</span>
          </div>
        </div>

        {/* Plantações */}
        <div className="flex flex-wrap gap-1.5">
          {safra.plantacoes.map((p, i) => (
            <span
              key={i}
              className="px-2.5 py-1 bg-cred-beige text-cred-green-dark text-xs rounded-lg font-medium"
            >
              🏷️ {TIPO_LABEL[p.tipo] ?? p.tipo}: {p.quantidade} {p.unidade}
            </span>
          ))}
        </div>

        {/* Status */}
        <div>
          <StatusBadge status={safra.status} />
        </div>

        {/* Ações */}
        <div className="flex gap-2 mt-auto pt-1">
          <button
            type="button"
            onClick={() => onVerDetalhes?.(safra.id)}
            className="flex-1 py-2 px-3 text-sm font-medium border-2 border-cred-green-dark text-cred-green-dark rounded-lg hover:bg-cred-green-dark hover:text-white transition-colors"
          >
            Ver Detalhes
          </button>
          <button
            type="button"
            onClick={() => onDemonstrarInteresse?.(safra)}
            className="flex-1 py-2 px-3 text-sm font-medium bg-cred-green-medium text-white rounded-lg hover:bg-cred-green-dark transition-colors"
          >
            Demonstrar Interesse
          </button>
        </div>
      </div>
    </div>
  );
}
