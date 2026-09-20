import confetti from "canvas-confetti";

export function launchPetConfetti() {
  const duration = 2.5 * 1000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ["#F59E0B", "#10B981", "#3B82F6", "#EC4899", "#8B5CF6"]
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ["#F59E0B", "#10B981", "#3B82F6", "#EC4899", "#8B5CF6"]
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

export function launchTreatSparkle(x = 0.5, y = 0.5) {
  confetti({
    particleCount: 15,
    spread: 60,
    origin: { x, y },
    colors: ["#F59E0B", "#FCD34D", "#FFFFFF"],
    shapes: ["circle"],
    scalar: 0.8
  });
}
