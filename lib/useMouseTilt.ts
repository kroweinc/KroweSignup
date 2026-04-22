import { useRef, useState, useCallback, type CSSProperties, type MouseEvent } from "react";

type TiltState = { rotateX: number; rotateY: number };

export function useMouseTilt(maxDegrees = 2) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<TiltState>({ rotateX: 0, rotateY: 0 });

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) / (rect.width / 2);
      const deltaY = (e.clientY - centerY) / (rect.height / 2);
      setTilt({
        rotateX: -deltaY * maxDegrees,
        rotateY: deltaX * maxDegrees,
      });
    },
    [maxDegrees]
  );

  const onMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0 });
  }, []);

  const style: CSSProperties = {
    transform: `perspective(700px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
    transition:
      tilt.rotateX === 0 && tilt.rotateY === 0
        ? "transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)"
        : "transform 80ms linear",
  };

  return { ref, style, onMouseMove, onMouseLeave };
}
