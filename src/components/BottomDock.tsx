import React from "react";
import { ChevronDown, ChevronUp, Compass, Eye, Navigation, Sun, Sunrise, Sunset, Moon } from "lucide-react";
import { SchoolLevel } from "../data/schools";
import { TimePreset } from "../scene/environment";

interface BottomDockProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  timePreset: TimePreset;
  onChangeTimePreset: (t: TimePreset) => void;
  levelFilter: "all" | SchoolLevel;
  onChangeLevelFilter: (f: "all" | SchoolLevel) => void;
  cameraFollow: boolean;
  onToggleCameraFollow: (follow: boolean) => void;
  onWalkNextUnvisited: () => void;
  remainingCount: number;
}

const TIME_OPTIONS: { id: TimePreset; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { id: "dawn", label: "清晨", Icon: Sunrise },
  { id: "day", label: "白天", Icon: Sun },
  { id: "sunset", label: "黃昏", Icon: Sunset },
  { id: "night", label: "夜晚", Icon: Moon },
];

export const BottomDock: React.FC<BottomDockProps> = ({
  collapsed,
  onToggleCollapse,
  timePreset,
  onChangeTimePreset,
  levelFilter,
  onChangeLevelFilter,
  cameraFollow,
  onToggleCameraFollow,
  onWalkNextUnvisited,
  remainingCount,
}) => {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center max-w-[min(920px,94vw)] pointer-events-none">
      <button
        type="button"
        onClick={onToggleCollapse}
        aria-expanded={!collapsed}
        className="pointer-events-auto mb-1.5 px-3 py-1 flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-white/95 border border-slate-200 rounded-t-lg rounded-b-sm shadow-sm hover:bg-white transition-colors whitespace-nowrap shrink-0"
      >
        {collapsed ? (
          <>
            <ChevronUp className="w-3.5 h-3.5" />
            展開工具列
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5" />
            收合工具列
          </>
        )}
      </button>

      {!collapsed && (
        <div className="pointer-events-auto w-full rounded-xl bg-white/95 border border-slate-200 shadow-lg px-3 py-2.5 flex flex-wrap items-center justify-center gap-3">
          {/* Time of Day */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg" role="group" aria-label="時段切換">
            {TIME_OPTIONS.map(({ id, label, Icon }) => {
              const active = timePreset === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onChangeTimePreset(id)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                    active ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden sm:block w-px h-6 bg-slate-200" aria-hidden="true" />

          {/* Level Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg" role="group" aria-label="學制篩選">
            {(
              [
                { id: "all", label: "全部 13 校" },
                { id: "elementary", label: "國小 9 校" },
                { id: "junior", label: "國中 4 校" },
              ] as const
            ).map((item) => {
              const active = levelFilter === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onChangeLevelFilter(item.id)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    active ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="hidden sm:block w-px h-6 bg-slate-200" aria-hidden="true" />

          {/* Camera Follow vs Free Orbit */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg" role="group" aria-label="視角模式">
            <button
              type="button"
              onClick={() => onToggleCameraFollow(true)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                cameraFollow ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>跟隨角色</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleCameraFollow(false)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                !cameraFollow ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>自由環視</span>
            </button>
          </div>

          {/* Primary Exploration CTA */}
          <button
            type="button"
            onClick={onWalkNextUnvisited}
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>
              {remainingCount > 0 ? `前往下一未探索校 (${remainingCount})` : "再巡禮任一學校"}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
