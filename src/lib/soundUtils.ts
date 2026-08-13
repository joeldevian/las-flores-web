/**
 * Utilidad de Sonido y Feedback Auditivo para Restaurante Las Flores
 * Utiliza Web Audio API nativo para garantizar compatibilidad 100% en móviles y navegadores
 * sin depender de archivos de audio externos.
 */

export function playSuccessChime(): void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    
    // Oscilador 1: Tono cálido 523.25 Hz (C5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // C5 -> E5

    gain1.gain.setValueAtTime(0.15, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    // Oscilador 2: Armónico 783.99 Hz (G5) con ligero retraso
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(783.99, ctx.currentTime + 0.1);
    osc2.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.35); // G5 -> C6

    gain2.gain.setValueAtTime(0.001, ctx.currentTime);
    gain2.gain.setValueAtTime(0.12, ctx.currentTime + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.5);

    osc2.start(ctx.currentTime + 0.1);
    osc2.stop(ctx.currentTime + 0.6);
  } catch (err) {
    // Si la interacción previa no ha ocurrido, ignorar silenciosamente
  }
}
