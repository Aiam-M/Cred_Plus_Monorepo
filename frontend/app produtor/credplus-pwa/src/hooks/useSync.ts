import { useState, useEffect, useCallback, useRef } from 'react';
import { sincronizar, type ResultadoSync } from '@/services/syncService';

/**
 * Evento global disparado quando as safras mudam após uma sincronização.
 * As páginas escutam esse evento para recarregar a lista automaticamente.
 */
export const SAFRAS_CHANGED_EVENT = 'safras:changed';

/** Avisa o app inteiro que as safras mudaram (ex.: após sync ou novo cadastro). */
export function notificarSafrasMudaram(): void {
  window.dispatchEvent(new Event(SAFRAS_CHANGED_EVENT));
}

/**
 * Hook central de sincronização. Deve ser usado uma vez na shell do app.
 *
 * - Escuta o evento `online` do navegador e sincroniza automaticamente.
 * - Expõe `sincronizarAgora()` para o botão manual de sincronização.
 * - Evita execuções simultâneas com um "trava" (ref).
 */
export function useSync() {
  const [sincronizando, setSincronizando] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const emAndamento = useRef(false);

  const sincronizarAgora = useCallback(async (): Promise<ResultadoSync> => {
    if (emAndamento.current) return { enviadas: 0 };
    emAndamento.current = true;
    setSincronizando(true);
    try {
      const resultado = await sincronizar();
      if (resultado.enviadas > 0) {
        notificarSafrasMudaram();
      }
      return resultado;
    } finally {
      emAndamento.current = false;
      setSincronizando(false);
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      void sincronizarAgora();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [sincronizarAgora]);

  return { sincronizando, isOnline, sincronizarAgora };
}

/**
 * Hook auxiliar: executa `onChange` sempre que as safras mudarem em qualquer
 * parte do app. Útil para as páginas recarregarem a lista após uma sync.
 * Passe um callback estável (useCallback) para evitar reinscrições.
 * @param onChange função chamada quando o evento de mudança dispara
 */
export function useSafrasChanged(onChange: () => void): void {
  useEffect(() => {
    window.addEventListener(SAFRAS_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(SAFRAS_CHANGED_EVENT, onChange);
  }, [onChange]);
}
