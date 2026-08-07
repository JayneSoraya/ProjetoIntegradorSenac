import React, { useEffect, useRef } from 'react';
import { useMotionValue } from 'framer-motion';

const SpaceBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface Cloud {
      x: number; y: number; radius: number;
      color: string; vx: number; vy: number;
    }

    const clouds: Cloud[] = [];
    
    // Gerando "nuvens" difusas com as cores EconoWay
    for (let i = 0; i < 40; i++) {
      const isMint = Math.random() > 0.5;
      // Cores com opacidade bem baixa para dar o efeito de céu/nuvem
      const color = isMint 
        ? `rgba(46, 204, 113, ${Math.random() * 0.04 + 0.01})` // Verde Menta (#2ECC71)
        : `rgba(11, 83, 69, ${Math.random() * 0.08 + 0.02})`;   // Verde Adam Banks (#0B5345)

      clouds.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 150 + 100, // Raios grandes e fofos
        color: color,
        vx: Math.random() * 0.3 - 0.15, // Movimento suave
        vy: Math.random() * 0.2 - 0.1
      });
    }

    let mouseXPos = window.innerWidth / 2;
    let mouseYPos = window.innerHeight / 2;

    const handleMouseMove = (e: MouseEvent) => {
      mouseXPos = e.clientX;
      mouseYPos = e.clientY;
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Renderiza as nuvens de fundo que são atraídas pelo mouse
      clouds.forEach((cloud) => {
        const dx = mouseXPos - cloud.x;
        const dy = mouseYPos - cloud.y;
        const distance = Math.max(0.1, Math.sqrt(dx * dx + dy * dy));
        
        // Atração magnética suave das nuvens para o cursor
        const force = Math.min(200 / (distance + 1), 1.2);

        cloud.x += cloud.vx + (dx / distance) * force * 0.05;
        cloud.y += cloud.vy + (dy / distance) * force * 0.05;

        // Loop infinito nas bordas da tela
        if (cloud.x < -cloud.radius) cloud.x = canvas.width + cloud.radius;
        if (cloud.x > canvas.width + cloud.radius) cloud.x = -cloud.radius;
        if (cloud.y < -cloud.radius) cloud.y = canvas.height + cloud.radius;
        if (cloud.y > canvas.height + cloud.radius) cloud.y = -cloud.radius;

        const safeRadius = Math.max(0.1, cloud.radius);
        const gradient = ctx.createRadialGradient(
          cloud.x, cloud.y, 0,
          cloud.x, cloud.y, safeRadius
        );
        gradient.addColorStop(0, cloud.color);
        gradient.addColorStop(1, 'rgba(17, 24, 39, 0)'); // Desaparece no Slate Black

        ctx.fillStyle = gradient;
        ctx.fillRect(
          cloud.x - safeRadius,
          cloud.y - safeRadius,
          safeRadius * 2,
          safeRadius * 2
        );
      });

      // Renderiza a "Bolinha/Nuvem" principal que persegue e brilha exatamente no mouse
      ctx.beginPath();
      const cursorGradient = ctx.createRadialGradient(mouseXPos, mouseYPos, 0, mouseXPos, mouseYPos, 80);
      cursorGradient.addColorStop(0, 'rgba(46, 204, 113, 0.15)'); // Brilho Menta no centro
      cursorGradient.addColorStop(1, 'rgba(46, 204, 113, 0)');    // Transparente nas bordas
      
      ctx.fillStyle = cursorGradient;
      ctx.arc(mouseXPos, mouseYPos, 80, 0, Math.PI * 2);
      ctx.fill();

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [mouseX, mouseY]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: '#111827' }} // Fundo Background Dark (Slate Black)
    />
  );
};

export default SpaceBackground;