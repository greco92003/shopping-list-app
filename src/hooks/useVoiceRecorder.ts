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

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setAudioBlob(null);
      audioChunksRef.current = [];

      // Solicita permissão para usar o microfone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Cria o MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current = mediaRecorder;

      // Coleta os chunks de áudio
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Quando a gravação parar, cria o blob final
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
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
