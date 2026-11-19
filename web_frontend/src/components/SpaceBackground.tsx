import React, { useEffect, useRef } from 'react';

interface Orb {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  color: string;
}

const SpaceBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();

    // Apenas 3 orbes amplos e ultra-suaves (evita manchas saturadas)
    const orbs: Orb[] = [
      {
        x: canvas.width * 0.2,
        y: canvas.height * 0.25,
        radius: 380,
        vx: 0.15,
        vy: 0.1,
        color: 'rgba(16, 185, 129, 0.055)', // Esmeralda muito sutil
      },
      {
        x: canvas.width * 0.8,
        y: canvas.height * 0.6,
        radius: 420,
        vx: -0.12,
        vy: 0.08,
        color: 'rgba(15, 23, 42, 0.045)', // Slate neutro para equilibrar
      },
      {
        x: canvas.width * 0.5,
        y: canvas.height * 0.85,
        radius: 340,
        vx: 0.1,
        vy: -0.12,
        color: 'rgba(46, 204, 113, 0.04)', // Verde EconoWay difuso
      },
    ];

    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', resize);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Orbes ambientais suaves
      orbs.forEach((orb) => {
        orb.x += orb.vx;
        orb.y += orb.vy;

        if (orb.x < -orb.radius || orb.x > canvas.width + orb.radius) orb.vx *= -1;
        if (orb.y < -orb.radius || orb.y > canvas.height + orb.radius) orb.vy *= -1;

        const gradient = ctx.createRadialGradient(
          orb.x,
          orb.y,
          0,
          orb.x,
          orb.y,
          orb.radius
        );
        gradient.addColorStop(0, orb.color);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(
          orb.x - orb.radius,
          orb.y - orb.radius,
          orb.radius * 2,
          orb.radius * 2
        );
      });

      // 2. Aura interativa discreta no cursor (4% de opacidade)
      const cursorGlow = ctx.createRadialGradient(
        mouseX,
        mouseY,
        0,
        mouseX,
        mouseY,
        180
      );
      cursorGlow.addColorStop(0, 'rgba(16, 185, 129, 0.05)');
      cursorGlow.addColorStop(1, 'rgba(16, 185, 129, 0)');

      ctx.fillStyle = cursorGlow;
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, 180, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-10 bg-bg-main overflow-hidden"
    >
      {/* Malha de pontos sutil (estilo plataforma financeira/dados) */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'radial-gradient(rgba(100, 116, 139, 0.28) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Canvas com luz ambiente leve */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

export default SpaceBackground;