import { useState, useEffect } from 'react';
import { Leaf, MapPin, Star } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import MetricCard from '../components/MetricCard';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Spinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-4 border-cred-green-dark border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function Dashboard() {
  const { empresa } = useAuth();
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/cred/dashboard')
      .then(setDados)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
        ⚠️ Erro ao carregar dashboard: {error}
      </div>
    );
  }

  const SCORE_BAR_DATA = [
    { label: 'Excelente (90-100)', value: dados.distribuicaoScore.excelente, fill: '#2D5016' },
    { label: 'Bom (70-89)', value: dados.distribuicaoScore.bom, fill: '#4A7C2F' },
    { label: 'Regular (<70)', value: dados.distribuicaoScore.regular, fill: '#F59E0B' },
  ];

  return (
    <div className="space-y-8">
      {/* Boas-vindas */}
      <div>
        <h1 className="text-2xl font-bold text-cred-gray-text">
          Bem-vinda,{' '}
          <span className="text-cred-green-dark">
            {empresa?.nome ?? empresa?.email ?? 'sua empresa'}
          </span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Veja as safras disponíveis de produtores amazônicos verificados.
        </p>
      </div>

      {/* Métricas — 3 cards */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard
            title="Safras Ativas"
            value={dados.safrasAtivas}
            subtitle="Em todo o sistema"
            icon={Leaf}
            colorScheme="green"
          />
          <MetricCard
            title="Score Médio"
            value={`${dados.agroScoreMedio}/100`}
            subtitle="AgroScore médio das safras"
            icon={Star}
            colorScheme="green"
          />
          <MetricCard
            title="Hectares Totais"
            value={`${dados.areaTotalHectares.toLocaleString('pt-BR')} ha`}
            subtitle="Área monitorada"
            icon={MapPin}
            colorScheme="orange"
          />
        </div>
      </section>

      {/* Gráficos */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Distribuição AgroScore */}
        <div className="bg-white rounded-2xl p-6 border border-cred-gray-border shadow-sm">
          <h2 className="text-base font-semibold text-cred-gray-text mb-1">
            📊 Distribuição de AgroScore
          </h2>
          <p className="text-xs text-gray-400 mb-5">Quantidade de safras por faixa de pontuação</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={SCORE_BAR_DATA} barSize={48}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#555' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#555' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: '#F5F5F5' }}
                contentStyle={{ borderRadius: 8, border: '1px solid #E0E0E0', fontSize: 13 }}
                formatter={(v) => [`${v} safras`, 'Quantidade']}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {SCORE_BAR_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Mapa placeholder */}
        <div className="bg-white rounded-2xl p-6 border border-cred-gray-border shadow-sm">
          <h2 className="text-base font-semibold text-cred-gray-text mb-1">
            🗺️ Regiões com Safras Disponíveis
          </h2>
          <p className="text-xs text-gray-400 mb-5">Distribuição geográfica das associações</p>
          <div className="h-[200px] bg-cred-gray-neutral rounded-xl flex flex-col items-center justify-center gap-3 border-2 border-dashed border-cred-gray-border">
            <span className="text-4xl">🗺️</span>
            <p className="text-sm text-gray-400 font-medium">Mapa interativo em desenvolvimento</p>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-cred-gray-border">
              <span className="w-2 h-2 rounded-full bg-cred-green-medium" />
              <span className="text-xs text-gray-500">
                Moju-PA · {dados.safrasAtivas} safra{dados.safrasAtivas !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Atalho para catálogo */}
      <section className="bg-cred-green-dark rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">Explore o Catálogo de Safras</h2>
          <p className="text-sm text-white/75 mt-1">
            Veja todas as safras disponíveis, filtre por produto, AgroScore e região.
          </p>
        </div>
        <a
          href="/safras"
          className="px-6 py-2.5 bg-white text-cred-green-dark font-semibold rounded-lg hover:bg-cred-beige transition-colors text-sm whitespace-nowrap"
        >
          Ver Catálogo →
        </a>
      </section>
    </div>
  );
}
