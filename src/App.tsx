/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HelpCircle, List, Maximize2, Volume2, VolumeX } from "lucide-react";
import { BottomDock } from "./components/BottomDock";
import { HelpModal } from "./components/HelpModal";
import { CameraAction, LearningIslandViewport, WalkCommand } from "./components/LearningIslandViewport";
import { SchoolCard } from "./components/SchoolCard";
import { SchoolDrawer } from "./components/SchoolDrawer";
import { TouchPad } from "./components/TouchPad";
import { SchoolInfo, SchoolLevel, YILAN_SCHOOLS } from "./data/schools";
import { TimePreset } from "./scene/environment";
import { createLearningSound } from "./scene/sound";

export default function App() {
  const [timePreset, setTimePreset] = useState<TimePreset>("day");
  const [levelFilter, setLevelFilter] = useState<"all" | SchoolLevel>("all");
  const [cameraFollow, setCameraFollow] = useState<boolean>(true);
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);

  const [currentIslandId, setCurrentIslandId] = useState<string | null>("yilan-es");
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [visitedIds, setVisitedIds] = useState<Set<string>>(() => new Set(["yilan-es"]));
  const [stampedIds, setStampedIds] = useState<Set<string>>(() => new Set());

  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [helpOpen, setHelpOpen] = useState<boolean>(false);
  const [soundOn, setSoundOn] = useState<boolean>(false);

  const [walkCommand, setWalkCommand] = useState<WalkCommand | null>(null);
  const [cameraAction, setCameraAction] = useState<CameraAction | null>(null);

  const touchVectorRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const sound = useMemo(() => createLearningSound(), []);

  useEffect(() => {
    return () => sound.dispose();
  }, [sound]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT") return;
      if (e.key === "h" || e.key === "H") {
        setDockCollapsed((prev) => !prev);
      } else if (e.key === "Escape") {
        if (helpOpen) setHelpOpen(false);
        else if (selectedSchoolId) setSelectedSchoolId(null);
        else if (drawerOpen) setDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen, helpOpen, selectedSchoolId]);

  const schoolMap = useMemo(() => new Map(YILAN_SCHOOLS.map((s) => [s.id, s])), []);

  const currentSchool = currentIslandId ? schoolMap.get(currentIslandId) ?? null : null;
  const selectedSchool = selectedSchoolId ? schoolMap.get(selectedSchoolId) ?? null : null;

  const remainingCount = YILAN_SCHOOLS.length - visitedIds.size;

  const handleArriveSchool = useCallback((schoolId: string) => {
    setCurrentIslandId(schoolId);
    setSelectedSchoolId(schoolId);
    setVisitedIds((prev) => {
      if (prev.has(schoolId)) return prev;
      const next = new Set(prev);
      next.add(schoolId);
      return next;
    });
  }, []);

  const handleCurrentIslandChange = useCallback((schoolId: string | null) => {
    setCurrentIslandId(schoolId);
  }, []);

  const handleSelectSchool = useCallback((schoolId: string) => {
    setSelectedSchoolId(schoolId);
  }, []);

  const handleWalkToSchool = useCallback((schoolId: string) => {
    setWalkCommand({ targetSchoolId: schoolId, nonce: Date.now() });
    setSelectedSchoolId(schoolId);
  }, []);

  const handleSelectFromDrawer = useCallback(
    (school: SchoolInfo) => {
      handleWalkToSchool(school.id);
      if (window.innerWidth < 768) {
        setDrawerOpen(false);
      }
    },
    [handleWalkToSchool],
  );

  const handleUnlockStamp = useCallback(
    (schoolId: string) => {
      setStampedIds((prev) => {
        if (prev.has(schoolId)) return prev;
        const next = new Set(prev);
        next.add(schoolId);
        sound.playStamp();
        return next;
      });
    },
    [sound],
  );

  const handleWalkNextUnvisited = useCallback(() => {
    const pool = YILAN_SCHOOLS.filter((s) => levelFilter === "all" || s.level === levelFilter);
    const unvisited = pool.find((s) => !visitedIds.has(s.id));
    if (unvisited) {
      handleWalkToSchool(unvisited.id);
      return;
    }
    const currentIdx = pool.findIndex((s) => s.id === currentIslandId);
    const nextSchool = pool[(currentIdx + 1) % pool.length];
    if (nextSchool) {
      handleWalkToSchool(nextSchool.id);
    }
  }, [currentIslandId, handleWalkToSchool, levelFilter, visitedIds]);

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    sound.setEnabled(next);
  };

  const handleOverview = () => {
    setCameraAction({ kind: "overview", nonce: Date.now() });
  };

  const handleToggleCameraFollow = (follow: boolean) => {
    setCameraFollow(follow);
    if (follow) {
      setCameraAction({ kind: "followExplorer", nonce: Date.now() });
    }
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-100">
      {/* 100% Unobstructed 3D Learning Island Viewport */}
      <LearningIslandViewport
        timePreset={timePreset}
        levelFilter={levelFilter}
        cameraFollow={cameraFollow}
        visitedIds={visitedIds}
        stampedIds={stampedIds}
        selectedSchoolId={selectedSchoolId}
        walkCommand={walkCommand}
        cameraAction={cameraAction}
        touchVectorRef={touchVectorRef}
        sound={sound}
        onArriveSchool={handleArriveSchool}
        onCurrentIslandChange={handleCurrentIslandChange}
        onSelectSchool={handleSelectSchool}
        onCameraFollowChange={setCameraFollow}
      />

      {/* Minimal Top Bar: Brand + Progress on left, concise single-line actions on right */}
      <header className="fixed top-4 left-4 right-4 z-20 flex items-start justify-between gap-4 pointer-events-none">
        <div className="pointer-events-auto rounded-xl bg-white/95 border border-slate-200 shadow-sm px-4 py-2.5">
          <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
            宜蘭市中小學學習島
          </h1>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 tabular-nums">
            <span>{currentSchool ? `目前位置：${currentSchool.shortName}` : "探索漫步中"}</span>
            <span aria-hidden="true">·</span>
            <span>
              已訪 {visitedIds.size} / {YILAN_SCHOOLS.length} 校
            </span>
            <span aria-hidden="true">·</span>
            <span>
              集章 {stampedIds.size} / {YILAN_SCHOOLS.length}
            </span>
          </div>
        </div>

        <nav
          aria-label="地圖工具"
          className="pointer-events-auto flex items-center gap-1.5 rounded-xl bg-white/95 border border-slate-200 shadow-sm p-1.5"
        >
          <button
            type="button"
            onClick={() => setDrawerOpen((o) => !o)}
            aria-expanded={drawerOpen}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              drawerOpen ? "bg-teal-800 text-white" : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>學校名錄</span>
          </button>

          <button
            type="button"
            onClick={handleOverview}
            className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">鳥瞰全景</span>
          </button>

          <button
            type="button"
            onClick={handleToggleSound}
            aria-pressed={soundOn}
            aria-label={soundOn ? "關閉音效" : "開啟音效"}
            className="w-9 h-8 flex items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-teal-800" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            aria-label="操作指南"
            className="w-9 h-8 flex items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </nav>
      </header>

      {/* Left School Directory Drawer */}
      <SchoolDrawer
        open={drawerOpen}
        levelFilter={levelFilter}
        visitedIds={visitedIds}
        stampedIds={stampedIds}
        currentIslandId={currentIslandId}
        onClose={() => setDrawerOpen(false)}
        onSelectAndWalk={handleSelectFromDrawer}
      />

      {/* Right School Discovery & Challenge Card */}
      <SchoolCard
        school={selectedSchool}
        isVisited={selectedSchool ? visitedIds.has(selectedSchool.id) : false}
        isStamped={selectedSchool ? stampedIds.has(selectedSchool.id) : false}
        isExplorerHere={selectedSchool ? currentIslandId === selectedSchool.id : false}
        onClose={() => setSelectedSchoolId(null)}
        onWalkHere={handleWalkToSchool}
        onUnlockStamp={handleUnlockStamp}
      />

      {/* Mobile Touch D-pad */}
      <TouchPad touchVectorRef={touchVectorRef} />

      {/* Collapsible Bottom Control Dock */}
      <BottomDock
        collapsed={dockCollapsed}
        onToggleCollapse={() => setDockCollapsed((c) => !c)}
        timePreset={timePreset}
        onChangeTimePreset={setTimePreset}
        levelFilter={levelFilter}
        onChangeLevelFilter={setLevelFilter}
        cameraFollow={cameraFollow}
        onToggleCameraFollow={handleToggleCameraFollow}
        onWalkNextUnvisited={handleWalkNextUnvisited}
        remainingCount={remainingCount}
      />

      {/* Help Modal */}
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </main>
  );
}
