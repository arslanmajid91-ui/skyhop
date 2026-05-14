"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

export default function ConfettiBurst() {
  useEffect(() => {
    const duration = 1400;
    const end = Date.now() + duration;

    const colors = ["#22d3ee", "#fde047", "#fb923c", "#a78bfa", "#f43f5e"];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 70,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 70,
        origin: { x: 1, y: 0.7 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    // Big middle burst once
    confetti({
      particleCount: 90,
      spread: 110,
      startVelocity: 38,
      origin: { y: 0.45 },
      colors,
      scalar: 1.1,
    });
  }, []);

  return null;
}
