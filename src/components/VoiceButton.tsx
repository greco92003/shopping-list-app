import { useEffect, useRef, useState } from 'react';
import { Mic, Lock, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { cn } from '@/lib/utils';

interface VoiceButtonProps {
  onAudioRecorded: (audioBlob: Blob) => void;
  darkMode?: boolean;
  disabled?: boolean;
}

export function VoiceButton({ onAudioRecorded, darkMode = false, disabled = false }: VoiceButtonProps) {
  const {
    recordingState,
    audioBlob,
    startRecording,
    stopRecording,
    lockRecording,
    cancelRecording,
    error,
  } = useVoiceRecorder();

  const [touchStartY, setTouchStartY] = useState<number>(0);
  const [currentY, setCurrentY] = useState<number>(0);
  const [showLockHint, setShowLockHint] = useState<boolean>(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const LOCK_THRESHOLD = 100; // pixels para arrastar para cima e travar

  // Quando o áudio estiver pronto, chama o callback
  useEffect(() => {
    if (audioBlob && recordingState === 'processing') {
      onAudioRecorded(audioBlob);
    }
  }, [audioBlob, recordingState, onAudioRecorded]);

  // Handlers para touch (mobile)
  const handleTouchStart = async (e: React.TouchEvent) => {
    if (disabled || recordingState !== 'idle') return;
    
    e.preventDefault();
    const touch = e.touches[0];
    setTouchStartY(touch.clientY);
    setCurrentY(touch.clientY);
    setShowLockHint(true);
    await startRecording();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (recordingState !== 'recording') return;
    
    const touch = e.touches[0];
    setCurrentY(touch.clientY);

    const dragDistance = touchStartY - touch.clientY;

    // Se arrastar para cima além do threshold, trava a gravação
    if (dragDistance > LOCK_THRESHOLD) {
      lockRecording();
      setShowLockHint(false);
    }
  };

  const handleTouchEnd = () => {
    setShowLockHint(false);
    
    if (recordingState === 'recording') {
      // Se soltar sem travar, para a gravação
      stopRecording();
    }
    
    setTouchStartY(0);
    setCurrentY(0);
  };

  // Handlers para mouse (desktop)
  const handleMouseDown = async () => {
    if (disabled || recordingState !== 'idle') return;
    await startRecording();
  };

  const handleMouseUp = () => {
    if (recordingState === 'recording') {
      stopRecording();
    }
  };

  // Handler para cancelar gravação travada
  const handleCancel = () => {
    cancelRecording();
  };

  // Handler para parar gravação travada
  const handleStopLocked = () => {
    stopRecording();
  };

  const dragDistance = touchStartY - currentY;
  const isNearLock = dragDistance > LOCK_THRESHOLD * 0.7;

  return (
    <div className="relative">
      {/* Indicador de arrastar para travar (mobile) */}
      {showLockHint && recordingState === 'recording' && (
        <div
          className={cn(
            'absolute bottom-full mb-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-opacity',
            isNearLock ? 'opacity-100' : 'opacity-50'
          )}
        >
          <div
            className={cn(
              'p-3 rounded-full transition-colors',
              isNearLock
                ? 'bg-green-500 text-white'
                : darkMode
                ? 'bg-gray-700 text-white'
                : 'bg-gray-200 text-gray-700'
            )}
          >
            <Lock className="w-5 h-5" />
          </div>
          <div className="text-xs text-center whitespace-nowrap">
            {isNearLock ? 'Solte para travar' : 'Arraste para cima'}
          </div>
        </div>
      )}

      {/* Botão principal */}
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        disabled={disabled || recordingState === 'processing'}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={cn(
          'relative transition-all',
          recordingState === 'recording' && 'bg-red-500 hover:bg-red-600 scale-110',
          recordingState === 'locked' && 'bg-red-500 hover:bg-red-600',
          recordingState === 'processing' && 'opacity-50 cursor-not-allowed'
        )}
      >
        {recordingState === 'processing' ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Mic
            className={cn(
              'w-5 h-5',
              (recordingState === 'recording' || recordingState === 'locked') && 'text-white'
            )}
          />
        )}

        {/* Animação de pulso durante gravação */}
        {(recordingState === 'recording' || recordingState === 'locked') && (
          <span className="absolute inset-0 rounded-md animate-ping bg-red-500 opacity-75" />
        )}
      </Button>

      {/* Controles quando gravação está travada */}
      {recordingState === 'locked' && (
        <div
          className={cn(
            'absolute top-full mt-2 left-1/2 -translate-x-1/2 flex gap-2 p-2 rounded-lg shadow-lg',
            darkMode ? 'bg-gray-800' : 'bg-white'
          )}
        >
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            className="text-red-500 hover:text-red-600"
          >
            <X className="w-4 h-4 mr-1" />
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleStopLocked}
            className="bg-green-500 hover:bg-green-600"
          >
            <Mic className="w-4 h-4 mr-1" />
            Enviar
          </Button>
        </div>
      )}

      {/* Mensagem de erro */}
      {error && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <div className="bg-red-500 text-white text-xs px-3 py-2 rounded-lg shadow-lg">
            {error}
          </div>
        </div>
      )}
    </div>
  );
}

