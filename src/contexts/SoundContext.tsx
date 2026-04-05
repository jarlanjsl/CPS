import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

type FrequencyType = 'MANUAL' | 'RANDOM' | '30MIN';

interface SoundContextType {
  playAirplaneSound: () => void;
  isSoundEnabled: boolean;
  toggleSoundEnabled: () => void;
  soundFrequency: FrequencyType;
  setSoundFrequency: (freq: FrequencyType) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [soundFrequency, setSoundFrequency] = useState<FrequencyType>('MANUAL');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Tenta carregar o arquivo real (que o usuário deve colocar na pasta public/aviao.mp3)
    audioRef.current = new Audio('/aviao.mp3');
  }, []);

  const generateSyntheticAirplane = () => {
    // Fallback: Sintetizador de som simulando um alerta/avião caso não haja arquivo de áudio.
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sawtooth';
      
      // Simula uma queda ou variação de pitch suave (som de avião passando)
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 2.5);
      
      // Volume fade in / fade out
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 3);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 3);
    } catch (e) {
      console.log('AudioAPI not supported', e);
    }
  };

  const playAirplaneSound = () => {
    if (!isSoundEnabled) return;
    
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Se falhar (ex: arquivo aviao.mp3 não existe), usa o fallback sintetizado.
        generateSyntheticAirplane();
      });
    } else {
      generateSyntheticAirplane();
    }
  };

  useEffect(() => {
    if (!isSoundEnabled || soundFrequency === 'MANUAL') return;

    let timeoutId: ReturnType<typeof setTimeout>;
    
    const scheduleNext = () => {
      let delay = 0;
      
      if (soundFrequency === '30MIN') {
        delay = 30 * 60 * 1000;
      } else if (soundFrequency === 'RANDOM') {
        // Entre 15 e 45 minutos no cenário real, usaremos entre 5 e 15 segundos aqui para teste rápido!
        // IMPORTANTE: Em prod deveria ser `Math.random() * (45 - 15) + 15 * 60 * 1000`
        delay = Math.floor(Math.random() * (15 - 5 + 1) + 5) * 1000;
        console.log(`Próximo avião automático em ${delay/1000} segundos...`);
      }

      timeoutId = setTimeout(() => {
        playAirplaneSound();
        scheduleNext();
      }, delay);
    };

    scheduleNext();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isSoundEnabled, soundFrequency]);

  return (
    <SoundContext.Provider value={{
      playAirplaneSound, 
      isSoundEnabled, 
      toggleSoundEnabled: () => setIsSoundEnabled(!isSoundEnabled),
      soundFrequency, 
      setSoundFrequency 
    }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) throw new Error('useSound must be used within a Provider');
  return context;
};
