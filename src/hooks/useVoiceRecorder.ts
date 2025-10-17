import { useState, useRef, useCallback } from "react";

export type RecordingState = "idle" | "recording" | "locked" | "processing";

export interface UseVoiceRecorderReturn {
  recordingState: RecordingState;
  audioBlob: Blob | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  lockRecording: () => void;
  cancelRecording: () => void;
  resetRecording: () => void;
  error: string | null;
}

export function useVoiceRecorder(): UseVoiceRecorderReturn {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartTimeRef = useRef<number>(0);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setAudioBlob(null);
      audioChunksRef.current = [];
      recordingStartTimeRef.current = Date.now();

      // Solicita permissão para usar o microfone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      // Detecta o melhor formato de áudio suportado pelo navegador
      // Safari/iOS não suporta webm, então usa mp4
      let mimeType = "audio/webm;codecs=opus";

      if (!MediaRecorder.isTypeSupported(mimeType)) {
        // Tenta outros formatos em ordem de preferência
        const formats = [
          "audio/mp4",
          "audio/webm",
          "audio/ogg;codecs=opus",
          "audio/wav",
        ];

        for (const format of formats) {
          if (MediaRecorder.isTypeSupported(format)) {
            mimeType = format;
            console.log("Usando formato de áudio:", mimeType);
            break;
          }
        }
      }

      // Cria o MediaRecorder com o formato detectado
      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      mediaRecorderRef.current = mediaRecorder;

      // Coleta os chunks de áudio
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Quando a gravação parar, cria o blob final
      mediaRecorder.onstop = () => {
        const recordingDuration = Date.now() - recordingStartTimeRef.current;

        // Valida duração mínima (500ms)
        if (recordingDuration < 500) {
          setError(
            "Gravação muito curta. Mantenha pressionado por pelo menos 1 segundo."
          );
          setRecordingState("idle");
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, {
          type: mimeType,
        });

        // Valida tamanho mínimo do blob
        if (audioBlob.size < 1000) {
          setError(
            "Áudio muito pequeno. Tente falar mais alto ou verificar o microfone."
          );
          setRecordingState("idle");
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        console.log(
          "Áudio gravado:",
          audioBlob.size,
          "bytes,",
          recordingDuration,
          "ms,",
          "formato:",
          mimeType
        );
        setAudioBlob(audioBlob);

        // Para todas as tracks do stream
        stream.getTracks().forEach((track) => track.stop());

        setRecordingState("processing");
      };

      // Inicia a gravação
      mediaRecorder.start();
      setRecordingState("recording");
    } catch (err) {
      console.error("Erro ao iniciar gravação:", err);

      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setError(
          "Permissão de microfone negada. Por favor, permita o acesso ao microfone."
        );
      } else {
        setError(
          "Erro ao acessar o microfone. Verifique se seu dispositivo possui um microfone."
        );
      }

      setRecordingState("idle");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const lockRecording = useCallback(() => {
    if (recordingState === "recording") {
      setRecordingState("locked");
    }
  }, [recordingState]);

  const cancelRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    audioChunksRef.current = [];
    setAudioBlob(null);
    setRecordingState("idle");
  }, []);

  const resetRecording = useCallback(() => {
    audioChunksRef.current = [];
    setAudioBlob(null);
    setRecordingState("idle");
    setError(null);
  }, []);

  return {
    recordingState,
    audioBlob,
    startRecording,
    stopRecording,
    lockRecording,
    cancelRecording,
    resetRecording,
    error,
  };
}
