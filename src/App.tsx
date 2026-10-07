import React, { useState, useEffect, useRef } from 'react';

// CSS base y reseteo absoluto
const terminalStyles = `
  :root, body, html {
    background-color: black !important;
    margin: 0;
    padding: 0;
    color-scheme: dark;
    overflow: hidden; /* Prohibimos el scroll global */
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
  .cursor-blink {
    animation: blink 1s step-end infinite;
    display: inline-block;
    width: 8px;
    height: 1.2em;
    background-color: #22c55e;
    vertical-align: text-bottom;
    margin-left: 2px;
  }
  .scanline {
    width: 100%;
    height: 100px;
    z-index: 9999;
    position: absolute;
    pointer-events: none;
    background: linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(34,197,94,0.2) 50%, rgba(0,0,0,0) 100%);
    opacity: 0.1;
    animation: scanline 8s linear infinite;
  }
  @keyframes scanline {
    0% { transform: translateY(-100vh); }
    100% { transform: translateY(100vh); }
  }
  .crt-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    pointer-events: none;
    background: radial-gradient(circle, rgba(0,0,0,0) 60%, rgba(0,0,0,0.4) 100%);
    z-index: 10;
  }
  
  /* Esconder barra de scroll webkit para que se vea limpio */
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

interface TypewriterProps {
  text: string;
  delay?: number;
  onComplete?: () => void;
  fastForward?: boolean;
  onType?: () => void;
}

interface HistoryItem {
  type: 'system' | 'input' | 'output' | 'seminar-reveal';
  content: string;
}

const renderTextWithLinks = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  
  return parts.map((part, i) => 
    urlRegex.test(part) ? (
      <a 
        key={i} 
        href={part} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-cyan-400 underline hover:text-cyan-300 transition-all z-50 relative"
      >
        {part}
      </a>
    ) : (
      part
    )
  );
};

const Typewriter: React.FC<TypewriterProps> = ({ text, delay = 25, onComplete, fastForward = false, onType }) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
        if (onType) onType();
      }, fastForward ? 5 : delay);
      
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      const completeTimeout = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(completeTimeout);
    }
  }, [currentIndex, delay, text, onComplete, fastForward, onType]);

  // CAMBIO CLAVE: whitespace-pre mantiene la forma del texto intacta siempre
  return <span className="whitespace-pre">{renderTextWithLinks(currentText)}</span>;
};

export default function App() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([
    { type: 'system', content: 'Iniciando sistema operativo UMG (v9.4.1)...' },
    { type: 'system', content: 'Conexión segura establecida.' },
    { type: 'system', content: 'Escribe "help" para ver los comandos disponibles o "run seminario.exe" para acceder a la información confidencial.' }
  ]);
  const [isLocked, setIsLocked] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null); // Referencia al contenedor con scroll

  // Nuevo sistema de scroll infalible
  const scrollToBottom = () => {
    if (containerRef.current) {
      // Usamos requestAnimationFrame para asegurar que el DOM ya se actualizó
      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      });
    }
  };

  const asciiArt = `
   _____                _                  _       
  / ____|              (_)                (_)      
 | (___   ___ _ __ ___  _ _ __   __ _ _ __ _  ___  
  \\___ \\ / _ \\ '_ \` _ \\| | '_ \\ / _\` | '__| |/ _ \\ 
  ____) |  __/ | | | | | | | | | (_| | |  | | (_) |
 |_____/ \\___|_| |_| |_|_|_| |_|\\__,_|_|  |_|\\___/ 
  `;

  const seminarDetails = `
========================================
${asciiArt}
========================================
> TÍTULO:    Seminario de Ing. en Sistemas 2026
> FECHA:     Sábado, 24 de Octubre de 2026
> LUGAR:     Hostal Las Marias, Taxisco
> UBICACIÓN: https://lix.li/ZUOz6 (Maps)
             https://lix.li/kCWXCi (Waze)
> HORA:      06:00 PM
> CÓDIGO:    ACCESO-CONCEDIDO-0x9F

AGENDA DEL EVENTO:
----------------------------------------
[08:00 AM] - Inicialización y Registro
[09:00 AM] - Keynote: El Futuro de la IA
[10:30 AM] - Coffee Break
[11:00 AM] - Taller: Ciberseguridad
[01:00 PM] - System.exit(0): Almuerzo
========================================
¡Te esperamos, Ingeniero!
`;

  const handleCommand = (cmd: string) => {
    const cleanCmd = cmd.trim().toLowerCase();
    if (!cleanCmd) return;

    const newHistory: HistoryItem[] = [...history, { type: 'input', content: cmd }];

    switch (cleanCmd) {
      case 'help':
        newHistory.push({ type: 'output', content: 'Comandos disponibles:\n  run seminario.exe  - Desencripta y muestra la invitación del evento\n  start              - Alias para "run seminario.exe"\n  whoami             - Muestra la identidad del usuario actual\n  clear              - Limpia la pantalla de la terminal\n  help               - Muestra este mensaje de ayuda' });
        setHistory(newHistory);
        scrollToBottom();
        break;
      case 'clear':
        setHistory([]);
        break;
      case 'whoami':
        newHistory.push({ type: 'output', content: 'invitado_ingenieria_001' });
        setHistory(newHistory);
        scrollToBottom();
        break;
      case 'start':
      case 'run seminario.exe':
        setIsLocked(true);
        newHistory.push({ type: 'system', content: 'Ejecutando script de desencriptación...' });
        setHistory(newHistory);
        scrollToBottom();
        
        setTimeout(() => {
          setHistory(prev => [...prev, { type: 'system', content: '[████████████████████] 100% Completado' }]);
          scrollToBottom();
          
          setTimeout(() => {
             setHistory(prev => [...prev, { type: 'system', content: 'Acceso Concedido. Desplegando información...' }]);
             scrollToBottom();
             
             setTimeout(() => {
               setHistory(prev => [...prev, { type: 'seminar-reveal', content: seminarDetails }]);
             }, 800);
          }, 800);
        }, 1200);
        break;
      default:
        newHistory.push({ type: 'output', content: "bash: " + cmd + ": orden no encontrada. Escribe 'help' para ayuda." });
        setHistory(newHistory);
        scrollToBottom();
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLocked) return;
    handleCommand(input);
    setInput('');
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const handleContainerClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName.toLowerCase() === 'a') return;
    if (inputRef.current && !isLocked) {
      inputRef.current.focus();
    }
  };

  return (
    <>
      <style>{terminalStyles}</style>
      
      {/* USO DE h-[100dvh]: Altura dinámica que se adapta al teclado del celular */}
      <div 
        className="h-[100dvh] bg-black text-green-500 font-mono text-[10px] sm:text-xs md:text-sm flex flex-col relative w-full overflow-hidden"
        onClick={handleContainerClick}
        style={{ textShadow: '0 0 5px rgba(34, 197, 94, 0.4)' }}
      >
        <div className="crt-overlay pointer-events-none"></div>
        <div className="scanline pointer-events-none"></div>

        {/* CONTENEDOR INTERNO DE SCROLL: Esto soluciona el problema en celulares */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-y-auto overflow-x-auto hide-scrollbar z-20 w-full p-3 sm:p-6 pb-2"
        >
          <div className="max-w-4xl mx-auto flex flex-col space-y-2">
            {history.map((item, index) => (
              <div key={index}>
                {item.type === 'input' && (
                  <div className="whitespace-pre-wrap">
                    <span className="text-green-300">invitado@sistemas:~$</span> {item.content}
                  </div>
                )}
                {item.type === 'system' && (
                  <div className="text-gray-400 italic whitespace-pre-wrap">
                    {item.content}
                  </div>
                )}
                {item.type === 'output' && (
                  <div className="whitespace-pre-wrap">
                    {item.content}
                  </div>
                )}
                {item.type === 'seminar-reveal' && (
                  <div className="text-green-400 font-bold overflow-x-auto w-full hide-scrollbar">
                    <Typewriter 
                      text={item.content} 
                      delay={12} 
                      onComplete={() => setIsLocked(false)} 
                      onType={scrollToBottom}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* INPUT ESTÁTICO EN LA PARTE INFERIOR */}
        <div className="z-20 w-full p-3 sm:p-6 pt-0 flex-shrink-0 bg-black">
          <div className="max-w-4xl mx-auto">
            {!isLocked && (
              <form onSubmit={handleSubmit} className="flex items-center relative w-full">
                <span className="text-green-300 mr-2 whitespace-nowrap">invitado@sistemas:~$</span>
                <div className="flex-grow flex items-center relative overflow-hidden">
                  <span className="pointer-events-none whitespace-pre break-all">
                    {input}
                  </span>
                  <span className="cursor-blink flex-shrink-0"></span>
                  
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="opacity-0 absolute inset-0 w-full h-full text-base"
                    spellCheck="false"
                    autoComplete="off"
                    autoCapitalize="none"
                    autoFocus
                  />
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}