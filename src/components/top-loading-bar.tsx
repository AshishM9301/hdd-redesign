import { useEffect, useMemo, useState } from "react";

type TopLoadingBarProps = {
  active: boolean;
  height?: number;
};

/**
 * Lightweight top loading bar that animates while `active` is true.
 * Uses simple timers to avoid adding new deps.
 */
export function TopLoadingBar({ active, height = 3 }: TopLoadingBarProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (active) {
      setProgress(0);
      const start = setTimeout(() => setProgress(30), 80);
      const mid = setTimeout(() => setProgress(65), 240);
      const near = setTimeout(() => setProgress(85), 520);
      return () => {
        clearTimeout(start);
        clearTimeout(mid);
        clearTimeout(near);
      };
    }
    setProgress(100);
    const timer = setTimeout(() => setProgress(0), 250);
    return () => clearTimeout(timer);
  }, [active]);

  const barStyle = useMemo(
    () => ({
      width: `${progress}%`,
      height,
      transition: "width 180ms ease, opacity 240ms ease",
      opacity: progress === 0 ? 0 : 1,
    }),
    [progress, height],
  );

  return (
    <div className="fixed left-0 right-0 top-0 z-50 h-[3px] w-full bg-transparent">
      <div
        style={barStyle}
        className="bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-400 shadow-[0_1px_6px_rgba(59,130,246,0.35)]"
      />
    </div>
  );
}

