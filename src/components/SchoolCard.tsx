import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  ExternalLink,
  MapPin,
  Navigation,
  X,
} from "lucide-react";
import { SchoolInfo } from "../data/schools";

interface SchoolCardProps {
  school: SchoolInfo | null;
  isVisited: boolean;
  isStamped: boolean;
  isExplorerHere: boolean;
  onClose: () => void;
  onWalkHere: (schoolId: string) => void;
  onUnlockStamp: (schoolId: string) => void;
}

type CardTab = "overview" | "timeline" | "quiz";

export const SchoolCard: React.FC<SchoolCardProps> = ({
  school,
  isVisited,
  isStamped,
  isExplorerHere,
  onClose,
  onWalkHere,
  onUnlockStamp,
}) => {
  const [activeTab, setActiveTab] = useState<CardTab>("overview");
  const [milestoneIdx, setMilestoneIdx] = useState<number>(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  useEffect(() => {
    setActiveTab("overview");
    setMilestoneIdx(0);
    setSelectedChoice(null);
    setFeedback(null);
  }, [school?.id]);

  if (!school) return null;

  const levelLabel = school.level === "elementary" ? "國民小學" : "國民中學";
  const currentYear = new Date().getFullYear();
  const schoolAge = currentYear - school.founded;
  const activeMilestone = school.milestones[milestoneIdx] || school.milestones[0];
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${school.coords.lat},${school.coords.lng}`;

  const handleAnswer = (idx: number) => {
    setSelectedChoice(idx);
    if (idx === school.quiz.answerIndex) {
      setFeedback("correct");
      onUnlockStamp(school.id);
    } else {
      setFeedback("wrong");
    }
  };

  return (
    <aside
      aria-label={`${school.shortName} 介紹卡片`}
      className="fixed right-4 top-20 z-20 w-[min(400px,calc(100vw-2rem))] max-h-[calc(100vh-11rem)] overflow-y-auto rounded-xl bg-white/95 border border-slate-200 shadow-xl text-slate-900"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 mb-1">
              <span>{levelLabel}</span>
              <span aria-hidden="true">·</span>
              <span>{school.district}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                {school.founded} 年創校（{schoolAge} 週年）
              </span>
            </div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 leading-snug">
              {school.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉學校資訊"
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm font-medium text-teal-800 mb-3">{school.tagline}</p>

        {/* Segmented Tabs: Overview / History Timeline / Stamp Quiz */}
        <div
          className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg mb-4"
          role="tablist"
          aria-label="學校資訊分頁"
        >
          {(
            [
              { id: "overview", label: "校園簡介" },
              { id: "timeline", label: "歷史年表" },
              { id: "quiz", label: isStamped ? "已集章 ★" : "集章挑戰" },
            ] as const
          ).map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={`py-1.5 px-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  active ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">{school.description}</p>

            <div className="space-y-1.5 pb-4 border-b border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <span>{school.address}</span>
              </div>
              <div className="flex items-center justify-between gap-2 pl-5">
                <span className="font-mono-num text-[11px] text-slate-400">
                  {school.coords.lat.toFixed(4)}°N, {school.coords.lng.toFixed(4)}°E
                </span>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-900 font-medium hover:underline"
                >
                  <span>在 Google 地圖查看</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="pt-4">
              <div className="text-xs font-semibold text-slate-500 mb-2">校園探索亮點</div>
              <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-slate-700">
                {school.highlights.map((item) => (
                  <li key={item} className="leading-snug">
                    — {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Tab 2: Interactive Campus History Timeline */}
        {activeTab === "timeline" && activeMilestone && (
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <Clock className="w-3.5 h-3.5 text-teal-700" />
                <span>建校沿革與重要里程碑</span>
              </div>
              <span className="text-xs text-slate-400 tabular-nums">
                {milestoneIdx + 1} / {school.milestones.length}
              </span>
            </div>

            {/* Interactive horizontal timeline nodes */}
            <div className="relative mb-4 px-1">
              <div className="absolute left-4 right-4 top-3.5 h-0.5 bg-slate-200" aria-hidden="true" />
              <div className="relative flex items-start justify-between gap-1">
                {school.milestones.map((m, idx) => {
                  const isCurrent = idx === milestoneIdx;
                  const isPast = idx < milestoneIdx;
                  return (
                    <button
                      key={`${m.year}-${idx}`}
                      type="button"
                      onClick={() => setMilestoneIdx(idx)}
                      aria-current={isCurrent ? "step" : undefined}
                      className="group flex flex-col items-center gap-1.5 min-w-[56px] focus:outline-none"
                    >
                      <span
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[11px] font-bold tabular-nums transition-transform ${
                          isCurrent
                            ? "bg-teal-800 border-teal-800 text-white scale-110 shadow-sm"
                            : isPast
                              ? "bg-teal-50 border-teal-600 text-teal-800"
                              : "bg-white border-slate-300 text-slate-500 group-hover:border-teal-600"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span
                        className={`font-mono-num text-[11px] leading-none transition-colors ${
                          isCurrent ? "text-teal-900 font-semibold" : "text-slate-500 group-hover:text-slate-800"
                        }`}
                      >
                        {m.year}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Milestone Detail Card */}
            <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-3.5 mb-3">
              <div className="text-xs font-mono-num text-teal-800 font-semibold mb-1">
                {activeMilestone.year} 年
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">{activeMilestone.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{activeMilestone.detail}</p>
            </div>

            {/* Step controls */}
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                disabled={milestoneIdx === 0}
                onClick={() => setMilestoneIdx((i) => Math.max(0, i - 1))}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>上一里程碑</span>
              </button>
              <button
                type="button"
                disabled={milestoneIdx === school.milestones.length - 1}
                onClick={() => setMilestoneIdx((i) => Math.min(school.milestones.length - 1, i + 1))}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 transition-colors"
              >
                <span>下一里程碑</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Stamp Quiz Challenge */}
        {activeTab === "quiz" && (
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-teal-700" />
                學習任務挑戰
              </span>
              {isStamped ? (
                <span className="text-xs font-semibold text-teal-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  已集章
                </span>
              ) : (
                <span className="text-xs text-slate-400">
                  {isVisited ? "已抵達校園" : "尚未造訪"}
                </span>
              )}
            </div>

            <p className="text-sm font-medium text-slate-800 mb-2.5 leading-snug">
              {school.quiz.question}
            </p>

            <div className="flex flex-col gap-2">
              {school.quiz.options.map((opt, idx) => {
                const isSelected = selectedChoice === idx;
                const isCorrectOption = idx === school.quiz.answerIndex;
                let btnStyle =
                  "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-300";
                if (isStamped && isCorrectOption) {
                  btnStyle = "border-teal-600 bg-teal-50 text-teal-900 font-semibold";
                } else if (isSelected && feedback === "correct") {
                  btnStyle = "border-teal-600 bg-teal-50 text-teal-900 font-semibold";
                } else if (isSelected && feedback === "wrong") {
                  btnStyle = "border-amber-500 bg-amber-50 text-amber-900";
                }

                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleAnswer(idx)}
                    className={`w-full text-left px-3 py-2 text-xs rounded-lg border transition-colors ${btnStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {(feedback === "correct" || isStamped) && (
              <p className="mt-2.5 text-xs text-teal-800 leading-relaxed bg-teal-50/70 p-2.5 rounded-lg">
                {school.quiz.explanation}
              </p>
            )}
            {feedback === "wrong" && !isStamped && (
              <p className="mt-2 text-xs text-amber-800">再看看校園介紹或歷史年表，換個選項試試看。</p>
            )}
          </div>
        )}

        {!isExplorerHere && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onWalkHere(school.id)}
              className="w-full py-2.5 px-4 flex items-center justify-center gap-2 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <Navigation className="w-3.5 h-3.5" />
              讓探索者走去這所學校
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
