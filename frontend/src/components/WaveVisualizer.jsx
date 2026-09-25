import { useEffect, useRef } from "react";

export default function WaveVisualizer({ playing = false, className = "", bars = 56 }) {
  const canvasRef = useRef(null);
  const playingRef = useRef(playing);
  playingRef.current = playing;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    let t = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      t += playingRef.current ? 0.16 : 0.05;
      const bw = w / bars;
      for (let i = 0; i < bars; i++) {
        const x = i * bw;
        const wave =
          Math.sin(i * 0.35 + t) * 0.5 +
          Math.sin(i * 0.13 - t * 0.6) * 0.35 +
          Math.sin(t * 0.4 + i * 0.05) * 0.25;
        const env = Math.sin((i / bars) * Math.PI);
        const barH = Math.max(2, h * 0.85 * Math.abs(wave) * env);
        const grad = ctx.createLinearGradient(0, h - barH, 0, h);
        grad.addColorStop(0, "#FF5A1F");
        grad.addColorStop(1, "rgba(255,184,0,0.2)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x + bw * 0.25, h - barH, bw * 0.5, barH, 3);
        else ctx.rect(x + bw * 0.25, h - barH, bw * 0.5, barH);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [bars]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
