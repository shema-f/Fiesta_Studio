/**
 * FIesta Studio - Audio Recording & Waveform Analysis
 */

import { audioEngine } from './audioEngine';

export class MicRecorder {
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;

  public async start(): Promise<void> {
    this.audioChunks = [];
    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });

    this.mediaRecorder = new MediaRecorder(this.mediaStream);
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(100); // 100ms slice
    this.isRecording = true;
  }

  public async stop(): Promise<{ blob: Blob; buffer: AudioBuffer; waveform: number[] }> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        return reject(new Error('Recorder not active'));
      }

      this.mediaRecorder.onstop = async () => {
        try {
          const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
          const arrayBuffer = await blob.arrayBuffer();
          const audioBuffer = await audioEngine.decodeAudioData(arrayBuffer);
          const waveform = extractWaveformPoints(audioBuffer, 100);

          // Stop mic tracks
          this.mediaStream?.getTracks().forEach((track) => track.stop());
          this.mediaStream = null;
          this.mediaRecorder = null;
          this.isRecording = false;

          resolve({ blob, buffer: audioBuffer, waveform });
        } catch (err) {
          reject(err);
        }
      };

      this.mediaRecorder.stop();
    });
  }

  public getIsRecording(): boolean {
    return this.isRecording;
  }
}

export function extractWaveformPoints(buffer: AudioBuffer, numPoints: number = 80): number[] {
  const data = buffer.getChannelData(0);
  const step = Math.floor(data.length / numPoints);
  const points: number[] = [];

  for (let i = 0; i < numPoints; i++) {
    const start = i * step;
    let max = 0;
    for (let j = 0; j < step; j++) {
      const val = Math.abs(data[start + j]);
      if (val > max) max = val;
    }
    points.push(Math.min(1.0, max));
  }

  return points;
}

export const micRecorder = new MicRecorder();
