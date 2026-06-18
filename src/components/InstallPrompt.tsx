import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './InstallPrompt.css';

/**
 * Type for the BeforeInstallPromptEvent (não nativo no TypeScript).
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Detecta se o dispositivo é iOS (Safari).
 * iOS não suporta `beforeinstallprompt`, então exibimos instruções manuais.
 */
function isIOS(): boolean {
  return (
    ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(navigator.platform) ||
    (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
  );
}

/**
 * Verifica se o app já está instalado (executando em standalone).
 */
function isInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOSDevice] = useState(isIOS);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isInstalled()) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Se for iOS e não estiver instalado, exibe instruções após um delay
    if (isIOSDevice) {
      const timer = setTimeout(() => {
        if (!isInstalled()) {
          setShowPrompt(true);
        }
      }, 5000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handler);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [isIOSDevice]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      setShowPrompt(false);
      setDismissed(true);
    }
    
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
  };

  if (dismissed || !showPrompt) return null;

  return (
    <div className="install-prompt glass-effect" role="alert">
      <button
        className="install-prompt__close"
        onClick={handleDismiss}
        aria-label="Fechar prompt de instalação"
      >
        <X size={16} />
      </button>

      <div className="install-prompt__content">
        <div className="install-prompt__icon">
          <svg width="40" height="24" viewBox="0 0 200 60" aria-hidden="true">
            <circle cx="30" cy="30" r="16" fill="none" stroke="#F59E0B" strokeWidth="3.5" />
            <circle cx="42" cy="30" r="16" fill="none" stroke="#F59E0B" strokeWidth="3.5"
              strokeDasharray="25 75" strokeDashoffset="20" />
          </svg>
        </div>

        <p className="install-prompt__title">
          {isIOSDevice
            ? 'Instale o CPS no seu iPhone'
            : 'Instale o Casados Para Sempre'}
        </p>

        <p className="install-prompt__description">
          {isIOSDevice
            ? 'No Safari, toque em Compartilhar e depois em "Adicionar à Tela de Início"'
            : 'Adicione à tela inicial para acessar rapidamente como um app nativo'}
        </p>

        {!isIOSDevice && deferredPrompt && (
          <button className="install-prompt__button" onClick={handleInstall}>
            Instalar App
          </button>
        )}

        {!isIOSDevice && !deferredPrompt && (
          <p className="install-prompt__note">
            Seu navegador não suporta instalação automática.
            No Chrome, acesse o menu → "Instalar Casados Para Sempre"
          </p>
        )}

        <button className="install-prompt__later" onClick={handleDismiss}>
          Agora não
        </button>
      </div>
    </div>
  );
}
