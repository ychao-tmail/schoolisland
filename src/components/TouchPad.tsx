import React from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";

interface TouchPadProps {
  touchVectorRef: React.MutableRefObject<{ x: number; y: number }>;
}

export const TouchPad: React.FC<TouchPadProps> = ({ touchVectorRef }) => {
  const setDir = (x: number, y: number) => {
    touchVectorRef.current.x = x;
    touchVectorRef.current.y = y;
  };

  const btnClass =
    "w-11 h-11 flex items-center justify-center rounded-lg bg-white/90 border border-slate-200 text-slate-700 active:bg-teal-800 active:text-white shadow-sm touch-none";

  return (
    <div
      aria-label="方向鍵操作板"
      className="fixed left-4 bottom-24 z-20 md:hidden grid grid-cols-3 gap-1.5 w-[144px]"
    >
      <div />
      <button
        type="button"
        aria-label="向前走"
        className={btnClass}
        onPointerDown={() => setDir(0, -1)}
        onPointerUp={() => setDir(0, 0)}
        onPointerLeave={() => setDir(0, 0)}
        onPointerCancel={() => setDir(0, 0)}
      >
        <ArrowUp className="w-4 h-4" />
      </button>
      <div />

      <button
        type="button"
        aria-label="向左走"
        className={btnClass}
        onPointerDown={() => setDir(-1, 0)}
        onPointerUp={() => setDir(0, 0)}
        onPointerLeave={() => setDir(0, 0)}
        onPointerCancel={() => setDir(0, 0)}
      >
        <ArrowLeft className="w-4 h-4" />
      </button>
      <button
        type="button"
        aria-label="向後走"
        className={btnClass}
        onPointerDown={() => setDir(0, 1)}
        onPointerUp={() => setDir(0, 0)}
        onPointerLeave={() => setDir(0, 0)}
        onPointerCancel={() => setDir(0, 0)}
      >
        <ArrowDown className="w-4 h-4" />
      </button>
      <button
        type="button"
        aria-label="向右走"
        className={btnClass}
        onPointerDown={() => setDir(1, 0)}
        onPointerUp={() => setDir(0, 0)}
        onPointerLeave={() => setDir(0, 0)}
        onPointerCancel={() => setDir(0, 0)}
      >
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
