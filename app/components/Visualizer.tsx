'use client';

import React, { useEffect, useRef } from 'react';

interface VisualizerProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  theme: string;
}

export default function Visualizer({ audioRef, isPlaying, theme }: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set dimensions
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || 300;
      canvas.height = canvas.parentElement?.clientHeight || 80;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Setup real analyzer if possible on user interaction
    const setupRealAudio = () => {
      if (!audioRef.current || audioContextRef.current) return;
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContextClass();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 64; // small fft for clean bar look

        // Connect source
        // Note: some browsers block cross-origin audio from Web Audio API. 
        // We catch errors and let the simulator handle it if blocked.
        const source = audioContext.createMediaElementSource(audioRef.current);
        source.connect(analyser);
        analyser.connect(audioContext.destination);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        sourceRef.current = source;
      } catch (err) {
        console.warn("Web Audio API blocked or failed, using visualizer simulation.", err);
      }
    };

    // Try setup on click anywhere or play
    const handleInteraction = () => {
      setupRealAudio();
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    };
    window.addEventListener('click', handleInteraction);
    if (isPlaying) {
      handleInteraction();
    }

    // Set up variables for simulation
    const barCount = 32;
    const barHeights = new Array(barCount).fill(5);
    const targetHeights = new Array(barCount).fill(5);

    // Render loop
    const render = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const barWidth = (width / barCount) - 2;

      let dataArray: Uint8Array | null = null;
      if (analyserRef.current) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray as any);
      }

      // Determine accent colors based on theme
      let primaryColor = '#1db954'; // default neon green
      let secondaryColor = 'rgba(29, 185, 84, 0.2)';
      if (theme === 'electric-pulse') {
        primaryColor = '#d946ef';
        secondaryColor = 'rgba(217, 70, 239, 0.2)';
      } else if (theme === 'pure-minimalist') {
        primaryColor = '#ffffff';
        secondaryColor = 'rgba(255, 255, 255, 0.2)';
      } else if (theme === 'retro-futurist') {
        primaryColor = '#00f0ff';
        secondaryColor = 'rgba(0, 240, 255, 0.2)';
      }

      for (let i = 0; i < barCount; i++) {
        let value = 0;

        if (dataArray && dataArray.length > 0) {
          // Use real data
          // Map analyser frequency bins to our display bars
          const binIndex = Math.floor((i / barCount) * dataArray.length);
          value = dataArray[binIndex] / 255; // normalize to 0-1
        } else {
          // Simulated data
          if (isPlaying) {
            // Random target heights when playing
            if (Math.random() > 0.8) {
              targetHeights[i] = Math.random() * (height - 10) + 5;
            }
            // Linear interpolation to target
            barHeights[i] += (targetHeights[i] - barHeights[i]) * 0.15;
            value = barHeights[i] / height;
          } else {
            // Settle to small flat visualizer when paused
            barHeights[i] += (4 - barHeights[i]) * 0.1;
            value = barHeights[i] / height;
          }
        }

        const barHeight = Math.max(4, value * height);
        const x = i * (barWidth + 2);
        const y = height - barHeight;

        // Draw glowing effect if retro-futurist or electric-pulse
        if (theme === 'retro-futurist' || theme === 'electric-pulse') {
          ctx.shadowBlur = 10;
          ctx.shadowColor = primaryColor;
        } else {
          ctx.shadowBlur = 0;
        }

        // Draw bar
        const grad = ctx.createLinearGradient(x, y, x, height);
        grad.addColorStop(0, primaryColor);
        grad.addColorStop(1, secondaryColor);

        ctx.fillStyle = grad;
        // Rounded top bars
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
        } else {
          ctx.rect(x, y, barWidth, barHeight);
        }
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('click', handleInteraction);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioRef, isPlaying, theme]);

  return (
    <div className="w-full h-full flex items-end opacity-85 hover:opacity-100 transition-opacity duration-300">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
