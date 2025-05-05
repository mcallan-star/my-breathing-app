import React, { useState, useEffect, useRef } from 'react';

const durations = {
  normal: { inhale: 4000, hold1: 4000, exhale: 6000 },
  box: { inhale: 4000, hold1: 4000, exhale: 4000, hold2: 4000 }
};

const phaseColors = {
  inhale: '#80b3ff',  // Sky Blue
  hold1: '#b299ff',   // Lavender
  exhale: '#99ccff',  // Periwinkle
  hold2: '#cc99ff'    // Soft Violet
};

function easeInOutSine(t) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

export default function BreathingCircle() {
  const [isRunning, setIsRunning] = useState(false);
  const [isBoxMode, setIsBoxMode] = useState(false);
  const [phase, setPhase] = useState('inhale');
  const [progress, setProgress] = useState(0);

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const minRadius = 60;
  const maxRadius = 120;

  const getPhaseDuration = (p) =>
    isBoxMode ? durations.box[p] : durations.normal[p] || 4000;

  useEffect(() => {
    if (!isRunning) return;
    startPhase(phase);
    return () => clearTimeout(timerRef.current);
  }, [isRunning, phase, isBoxMode]);

  const startPhase = (currentPhase) => {
    const duration = getPhaseDuration(currentPhase);
    startTimeRef.current = performance.now();

    const animate = (now) => {
      const elapsed = now - startTimeRef.current;
      const t = Math.min(elapsed / duration, 1);
      setProgress(easeInOutSine(t));

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        const next = getNextPhase(currentPhase);
        setPhase(next);
      }
    };

    requestAnimationFrame(animate);
  };

  const getNextPhase = (current) => {
    const seq = isBoxMode
      ? ['inhale', 'hold1', 'exhale', 'hold2']
      : ['inhale', 'hold1', 'exhale'];
    const idx = seq.indexOf(current);
    return seq[(idx + 1) % seq.length];
  };

  const radius = (() => {
    if (phase === 'inhale') return minRadius + (maxRadius - minRadius) * progress;
    if (phase === 'exhale') return maxRadius - (maxRadius - minRadius) * progress;
    return phase === 'hold2' ? minRadius : maxRadius;
  })();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <svg width={300} height={300}>
        <circle
          cx="150"
          cy="150"
          r={radius}
          fill={phaseColors[phase] || 'white'}
          opacity={0.8}
        />
        <text
          x="150"
          y="160"
          textAnchor="middle"
          fill="white"
          fontSize="24"
          fontFamily="sans-serif"
        >
          {phase === 'hold1' || phase === 'hold2' ? 'Hold' : phase.charAt(0).toUpperCase() + phase.slice(1)}
        </text>
      </svg>

      <div className="mt-6 flex gap-4">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
        >
          {isRunning ? 'Stop' : 'Start'}
        </button>
        <button
          onClick={() => setIsBoxMode(!isBoxMode)}
          className="px-4 py-2 bg-purple-500 rounded hover:bg-purple-600"
        >
          Mode: {isBoxMode ? 'Box' : 'Normal'}
        </button>
      </div>
    </div>
  );
}
