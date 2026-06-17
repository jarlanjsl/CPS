import { useEffect, useRef, useState } from 'react';
import type { Vitamina } from '../services/db';
import '../styles/roleta-vitaminas.css';

// Roleta circular animada em CSS puro (sem Framer Motion).
// O pai controla o giro via prop `girando` e é notificado do resultado via `onResult`.
// Para resetar a roleta entre giros, o pai deve passar uma `key` mutável (prop reservada do React).
interface RoletaVitaminasProps {
  vitaminas: Vitamina[];
  onResult: (v: Vitamina) => void;
  girando: boolean;
  key: string;
}

const DURACAO_ANIMACAO_MS = 2500;

export default function RoletaVitaminas({ vitaminas, onResult, girando }: RoletaVitaminasProps) {
  const [rotacao, setRotacao] = useState(0);
  const timerRef = useRef<number | null>(null);

  const total = vitaminas.length;
  const anguloSetor = total > 0 ? 360 / total : 360;

  // Fundo em conic-gradient: um setor por vitamina, cores por hue rotation.
  const conicGradient = total > 0
    ? `conic-gradient(${vitaminas
        .map((_, i) => {
          const start = i * anguloSetor;
          const end = (i + 1) * anguloSetor;
          const hue = Math.round((i * 360) / total);
          return `hsl(${hue}, 72%, 52%) ${start}deg ${end}deg`;
        })
        .join(', ')})`
    : 'conic-gradient(#334155 0deg 360deg)';

  // Posiciona cada label no centro do seu setor (texto sempre horizontal).
  const raioLabel = 96;
  const labelStyle = (centro: number): React.CSSProperties => {
    const rad = ((centro - 90) * Math.PI) / 180; // 0° = topo, sentido horário
    const x = Math.cos(rad) * raioLabel;
    const y = Math.sin(rad) * raioLabel;
    return { transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` };
  };

  useEffect(() => {
    if (!girando || total === 0) return;

    // Sortear a vitamina vencedora
    const indiceVencedor = Math.floor(Math.random() * total);
    const centroVencedor = (indiceVencedor + 0.5) * anguloSetor;

    // Offset aleatório dentro do setor para variar a posição de parada
    const offset = (Math.random() - 0.5) * anguloSetor * 0.6;

    // Voltas extras (5-7) + delta até o alvo — sempre incremental (não retrocede)
    const voltas = 5 + Math.floor(Math.random() * 3);
    const rotacaoAtualNorm = ((rotacao % 360) + 360) % 360;
    const alvo = (((360 - centroVencedor + offset) % 360) + 360) % 360;
    const delta = ((alvo - rotacaoAtualNorm) % 360 + 360) % 360;
    const novaRotacao = rotacao + 360 * voltas + delta;

    setRotacao(novaRotacao);

    // Notifica o resultado ao final da animação (desaceleração natural)
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      onResult(vitaminas[indiceVencedor]);
    }, DURACAO_ANIMACAO_MS);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
    // Dispara apenas na transição de `girando` (controlado pelo pai).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [girando]);

  if (total === 0) {
    return (
      <div className="roleta-container">
        <div className="roleta-inner" />
      </div>
    );
  }

  return (
    <div className="roleta-container">
      <div className="roleta-ponteiro" />
      <div
        className={`roleta-inner ${girando ? 'is-spinning' : 'is-idle'}`}
        style={{ background: conicGradient, transform: `rotate(${rotacao}deg)` }}
      >
        {vitaminas.map((v, i) => {
          const centro = (i + 0.5) * anguloSetor;
          return (
            <div key={v.id} className="roleta-setor-label" style={labelStyle(centro)}>
              {v.nome}
            </div>
          );
        })}
      </div>
    </div>
  );
}
