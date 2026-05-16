import { useState, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, Check } from 'lucide-react';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';
import { Language } from '../../types';

export interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => void;
  onError?: (error: Error) => void;
  maxDuration?: number;
  language?: Language;
  disabled?: boolean;
  className?: string;
}

/**
 * Voice Recorder Component
 * Allows users to record voice notes describing crop symptoms
 * Features: recording, pause/resume, playback, waveform visualization
 */
export function VoiceRecorder({
  onRecordingComplete,
  onError,
  maxDuration = 60,
  language = 'english',
  disabled = false,
  className = '',
}: VoiceRecorderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const audioRef = useState<HTMLAudioElement | null>(null)[0];

  const {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    audioUrl,
    isSupported,
    error: recorderError,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
  } = useVoiceRecorder({
    maxDuration,
    language,
    onError,
    onMaxDurationReached: () => {
      // Auto-stop notification
      console.log('Maximum recording duration reached');
    },
  });

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate remaining time
  const remainingTime = maxDuration - duration;

  // Handle playback
  const handlePlayPause = () => {
    if (!audioUrl) return;

    if (isPlaying) {
      audioRef?.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef) {
        const audio = new Audio(audioUrl);
        audio.onended = () => {
          setIsPlaying(false);
          setPlaybackTime(0);
        };
        audio.ontimeupdate = () => {
          setPlaybackTime(Math.floor(audio.currentTime));
        };
        useState<HTMLAudioElement | null>(audio);
      }
      audioRef?.play();
      setIsPlaying(true);
    }
  };

  // Handle confirm
  const handleConfirm = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob, duration);
    }
  };

  // Handle retake
  const handleRetake = () => {
    clearRecording();
    setIsPlaying(false);
    setPlaybackTime(0);
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef) {
        audioRef.pause();
        audioRef.src = '';
      }
    };
  }, [audioRef]);

  // Show error if not supported
  if (!isSupported) {
    return (
      <div className={`voice-recorder ${className}`}>
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg text-center">
          <Mic className="w-12 h-12 mx-auto text-amber-600 mb-3" />
          <p className="text-amber-800 font-medium mb-2">
            Voice recording not supported
          </p>
          <p className="text-sm text-amber-700">
            Your browser doesn't support voice recording. Please use a modern browser or skip this step.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`voice-recorder ${className}`}>
      {/* Not Recording State */}
      {!isRecording && !audioBlob && (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <Mic className="w-16 h-16 mx-auto text-green-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Record Voice Note
            </h3>
            <p className="text-sm text-gray-600">
              Describe the crop symptoms you're seeing (up to {maxDuration} seconds)
            </p>
          </div>

          <button
            onClick={startRecording}
            disabled={disabled}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Mic className="w-5 h-5" />
            <span className="font-medium">Start Recording</span>
          </button>

          {recorderError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{recorderError.message}</p>
            </div>
          )}
        </div>
      )}

      {/* Recording State */}
      {isRecording && (
        <div className="space-y-4">
          {/* Recording Indicator */}
          <div className="flex items-center justify-center gap-3 p-6 bg-red-50 border-2 border-red-500 rounded-lg">
            <div className="relative">
              <Mic className="w-8 h-8 text-red-600" />
              {!isPaused && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-red-800">
                {isPaused ? 'Paused' : 'Recording...'}
              </p>
              <p className="text-2xl font-bold text-red-600 tabular-nums">
                {formatTime(duration)}
              </p>
              <p className="text-xs text-red-600">
                {formatTime(remainingTime)} remaining
              </p>
            </div>
          </div>

          {/* Waveform Visualization (Simple) */}
          <div className="flex items-center justify-center gap-1 h-16 bg-gray-100 rounded-lg px-4">
            {!isPaused && Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="w-1 bg-green-600 rounded-full animate-pulse"
                style={{
                  height: `${Math.random() * 60 + 20}%`,
                  animationDelay: `${i * 50}ms`,
                  animationDuration: `${Math.random() * 500 + 500}ms`,
                }}
              />
            ))}
            {isPaused && Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="w-1 bg-gray-400 rounded-full"
                style={{ height: '20%' }}
              />
            ))}
          </div>

          {/* Recording Controls */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Square className="w-4 h-4" />
              <span>Stop</span>
            </button>

            <button
              onClick={isPaused ? resumeRecording : pauseRecording}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              {isPaused ? (
                <>
                  <Play className="w-4 h-4" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Playback State */}
      {!isRecording && audioBlob && audioUrl && (
        <div className="space-y-4">
          {/* Playback Info */}
          <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
            <Mic className="w-12 h-12 mx-auto text-green-600 mb-2" />
            <p className="text-sm font-medium text-green-800 mb-1">
              Recording Complete
            </p>
            <p className="text-2xl font-bold text-green-600 tabular-nums">
              {formatTime(duration)}
            </p>
          </div>

          {/* Playback Controls */}
          <div className="space-y-3">
            <button
              onClick={handlePlayPause}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-5 h-5" />
                  <span>Pause Playback</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>Play Recording</span>
                </>
              )}
            </button>

            {isPlaying && (
              <div className="text-center text-sm text-gray-600">
                {formatTime(playbackTime)} / {formatTime(duration)}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handleRetake}
              disabled={disabled}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Retake</span>
            </button>

            <button
              onClick={handleConfirm}
              disabled={disabled}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <Check className="w-5 h-5" />
              <span>Use This Recording</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Made with Bob