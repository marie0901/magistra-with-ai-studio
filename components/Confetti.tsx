
import React, { useState, useEffect } from 'react';

const CONFETTI_COUNT = 150;
const COLORS = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];

interface ConfettiPiece {
  id: number;
  style: React.CSSProperties;
}

export const Confetti: React.FC = () => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    const newPieces = Array.from({ length: CONFETTI_COUNT }).map((_, i) => {
      const x = Math.random() * 100;
      const y = Math.random() * 100 - 110;
      const rotation = Math.random() * 360;
      const scale = Math.random() * 0.5 + 0.5;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const delay = Math.random() * 2;
      const duration = Math.random() * 3 + 2;

      return {
        id: i,
        style: {
          position: 'absolute',
          left: `${x}vw`,
          top: `${y}vh`,
          width: '8px',
          height: '16px',
          backgroundColor: color,
          transform: `rotate(${rotation}deg) scale(${scale})`,
          transition: `transform ${duration}s cubic-bezier(0.1, 0.9, 0.9, 0.1), opacity ${duration}s ease-in`,
          transitionDelay: `${delay}s`,
          opacity: 1,
        } as React.CSSProperties,
      };
    });
    setPieces(newPieces);

    const timer = setTimeout(() => {
      setPieces(currentPieces =>
        currentPieces.map(p => ({
          ...p,
          style: {
            ...p.style,
            transform: `translateY(120vh) rotate(${parseFloat(p.style.transform?.toString().split('(')[1] || '0') + 360}deg)`,
            opacity: 0,
          },
        }))
      );
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[200]">
      {pieces.map(piece => (
        <div key={piece.id} style={piece.style} />
      ))}
    </div>
  );
};
