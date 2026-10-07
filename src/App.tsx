import React, { useState, useEffect, useRef } from 'react';

// CSS para animaciones de la terminal y reseteo global del fondo
const terminalStyles = `
  :root, body, html {
    background-color: black !important;
    margin: 0;
    padding: 0;
    color-scheme: dark;
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
`;

// Interfaces para TypeScript
interface TypewriterProps {
  text: string;
  delay?: number;
  onComplete?: () => void;
  fastForward?: boolean;
}

interface HistoryItem {
  type: 'system' | 'input' | 'output' | 'seminar-reveal';
  content: string;
}

// Función para detectar URLs y convertirlas en enlaces clickables
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
        className="text-cyan-400 underline hover:text-cyan-300 hover:shadow-cyan-500/50 transition-all z-50 relative"
      >
        {part}
      </a>
    ) : (
      part
    )
  );
};

// Componente Typewriter
const Typewriter: React.FC<TypewriterProps> = ({ text, delay = 25, onComplete, fastForward = false }) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, fastForward ? 5 : delay);
      
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      const completeTimeout = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(completeTimeout);
    }
  }, [currentIndex, delay, text, onComplete, fastForward]);

  return <span className="whitespace-pre-wrap">{renderTextWithLinks(currentText)}</span>;
};

// Componente Principal
export default function App() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([
    { type: 'system', content: 'Iniciando sistema operativo UMG (v9.4.1)...' },
    { type: 'system', content: 'Conexión segura establecida.' },
    { type: 'system', content: 'Escribe "help" para ver los comandos disponibles o "run seminario.exe" para acceder a la información confidencial.' }
  ]);
  const [isLocked, setIsLocked] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const asciiArt = `
   _____                _                  _       
  / ____|              (_)                (_)      
 | (___   ___ _ __ ___  _ _ __   __ _ _ __ _  ___  
  \\___ \\ / _ \\ '_ \` _ \\| | '_ \\ / _\` | '__| |/ _ \\ 
  ____) |  __/ | | | | | | | | | (_| | |  | | (_) |
 |_____/ \\___|_| |_| |_|_|_| |_|\\__,_|_|  |_|\\___/ 
  `;

  const seminarDetails = `
==================================================
${asciiArt}
==================================================
> TÍTULO:    Seminario de Ingeniería en Sistemas 2026
> FECHA:     Sábado, 24 de Octubre de 2026
> LUGAR:     Hostal Las Marias, Taxisco, Santa Rosa
> UBICACIÓN: https://lix.li/ZUOz6 (googel maps) | https://lix.li/kCWXCi (waze)
> HORA:      06:00 PM
> CÓDIGO:    ACCESO-CONCEDIDO-0x9F

==================================================

¡Te esperamos, Ingeniero!

==================================================
`;

  const handleCommand = (cmd: string) => {
    const cleanCmd = cmd.trim().toLowerCase();
    
    if (!cleanCmd) return;

    const newHistory: HistoryItem[] = [...history, { type: 'input', content: cmd }];

    switch (cleanCmd) {
      case 'help':
        newHistory.push({ type: 'output', content: 'Comandos disponibles:\n  run seminario.exe  - Desencripta y muestra la invitación del evento\n  start              - Alias para "run seminario.exe"\n  whoami             - Muestra la identidad del usuario actual\n  clear              - Limpia la pantalla de la terminal\n  help               - Muestra este mensaje de ayuda' });
        setHistory(newHistory);
        break;
      
      case 'clear':
        setHistory([]);
        break;
      
      case 'whoami':
        newHistory.push({ type: 'output', content: 'invitado_ingenieria_001' });
        setHistory(newHistory);
        break;

      case 'start':
      case 'run seminario.exe':
        setIsLocked(true);
        newHistory.push({ type: 'system', content: 'Ejecutando script de desencriptación...' });
        setHistory(newHistory);
        
        setTimeout(() => {
          setHistory(prev => [...prev, { type: 'system', content: '[████████████████████] 100% Completado' }]);
          
          setTimeout(() => {
             setHistory(prev => [...prev, { type: 'system', content: 'Acceso Concedido. Desplegando información...' }]);
             
             setTimeout(() => {
               setHistory(prev => [...prev, { type: 'seminar-reveal', content: seminarDetails }]);
             }, 800);
          }, 800);
        }, 1200);
        break;

      default:
        newHistory.push({ type: 'output', content: `bash: ${cmd}: orden no encontrada. Escribe "help" para ayuda.` });
        setHistory(newHistory);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLocked) return;
    handleCommand(input);
    setInput('');
  };

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  const handleContainerClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName.toLowerCase() === 'a') {
      return;
    }
    if (inputRef.current && !isLocked) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    if (inputRef.current && !isLocked) {
      inputRef.current.focus();
    }
  }, [isLocked]);

  return (
    <>
      <style>{terminalStyles}</style>
      
      <div 
        className="min-h-screen bg-black text-green-500 font-mono text-sm sm:text-base p-4 sm:p-8 flex flex-col relative overflow-hidden"
        onClick={handleContainerClick}
        style={{ textShadow: '0 0 5px rgba(34, 197, 94, 0.4)' }}
      >
        <div className="crt-overlay"></div>
        <div className="scanline"></div>

        <div className="flex-grow flex flex-col z-20 max-w-4xl mx-auto w-full">
          
          <div className="flex flex-col space-y-2 mb-2">
            {history.map((item, index) => (
              <div key={index} className="break-words">
                {item.type === 'input' && (
                  <div>
                    <span className="text-green-300">invitado@sistemas:~$</span> {item.content}
                  </div>
                )}
                
                {item.type === 'system' && (
                  <div className="text-gray-400 italic">
                    {item.content}
                  </div>
                )}

                {item.type === 'output' && (
                  <div className="whitespace-pre-wrap">
                    {item.content}
                  </div>
                )}

                {item.type === 'seminar-reveal' && (
                  <div className="text-green-400 font-bold">
                    <Typewriter 
                      text={item.content} 
                      delay={10} 
                      onComplete={() => setIsLocked(false)} 
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {!isLocked && (
            <form onSubmit={handleSubmit} className="flex items-center flex-wrap relative z-30">
              <span className="text-green-300 mr-2 whitespace-nowrap">invitado@sistemas:~$</span>
              <div className="flex-grow flex items-center bg-transparent relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="bg-transparent text-transparent caret-transparent outline-none absolute inset-0 w-full"
                  spellCheck="false"
                  autoComplete="off"
                  autoFocus
                />
                <span className="pointer-events-none whitespace-pre">
                  {input}
                </span>
                <span className="cursor-blink"></span>
              </div>
            </form>
          )}

          <div ref={bottomRef} className="h-4 w-full"></div>
        </div>
      </div>
    </>
  );
}