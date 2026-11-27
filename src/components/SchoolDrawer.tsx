import React, { useMemo, useState } from "react";
import { Check, Navigation, Search, Star, X } from "lucide-react";
import { SchoolDistrict, SchoolInfo, SchoolLevel, YILAN_SCHOOLS } from "../data/schools";

interface SchoolDrawerProps {
  open: boolean;
  levelFilter: "all" | SchoolLevel;
  visitedIds: Set<string>;
  stampedIds: Set<string>;
  currentIslandId: string | null;
  onClose: () => void;
  onSelectAndWalk: (school: SchoolInfo) => void;
}

const DISTRICT_ORDER: SchoolDistrict[] = ["北津河畔", "舊城核心", "東區文教", "南區縣政"];

export const SchoolDrawer: React.FC<SchoolDrawerProps> = ({
  open,
  levelFilter,
  visitedIds,
  stampedIds,
  currentIslandId,
  onClose,
  onSelectAndWalk,
}) => {
  const [query, setQuery] = useState("");

  const grouped = useMemo(() => {
    const q = query.trim();
    const list = YILAN_SCHOOLS.filter((s) => {
      if (levelFilter !== "all" && s.level !== levelFilter) return false;
      if (!q) return true;
      return (
        s.name.includes(q) ||
        s.shortName.includes(q) ||
        s.district.includes(q) ||
        s.tagline.includes(q) ||
        s.highlights.some((h) => h.includes(q))
      );
    });

    return DISTRICT_ORDER.map((district) => ({
      district,
      schools: list.filter((s) => s.district === district),
    })).filter((g) => g.schools.length > 0);
  }, [levelFilter, query]);

  if (!open) return null;

  return (
    <aside
      aria-label="宜蘭市中小學名錄"
      className="fixed left-4 top-20 z-20 w-[min(340px,calc(100vw-2rem))] max-h-[calc(100vh-11rem)] flex flex-col rounded-xl bg-white/95 border border-slate-200 shadow-xl text-slate-900"
    >
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <div className="text-xs font-medium text-slate-500">宜蘭市公辦中小學</div>
            <h2 className="text-base font-bold text-slate-900">13 所學校導覽名錄</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉學校清單"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <label className="relative block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜尋校名、區域或特色…"
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-700"
          />
        </label>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {grouped.length === 0 && (
          <p className="text-xs text-slate-500 text-center py-6">找不到符合關鍵字的學校</p>
        )}

        {grouped.map((group) => (
          <section key={group.district}>
            <h3 className="text-xs font-semibold text-slate-500 mb-2 flex items-center justify-between">
              <span>{group.district}</span>
              <span className="tabular-nums">{group.schools.length} 校</span>
            </h3>
            <div className="space-y-1.5">
              {group.schools.map((school) => {
                const isHere = currentIslandId === school.id;
                const isVisited = visitedIds.has(school.id);
                const isStamped = stampedIds.has(school.id);

                return (
                  <button
                    key={school.id}
                    type="button"
                    onClick={() => onSelectAndWalk(school)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-colors flex items-center justify-between gap-2 ${
                      isHere
                        ? "bg-teal-50 border-teal-600/40 text-teal-950"
                        : "bg-white border-slate-200/80 hover:bg-slate-50 text-slate-800"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-semibold">
                        <span className="truncate">{school.shortName}</span>
                        <span className="text-[11px] font-normal text-slate-400">
                          {school.level === "elementary" ? "國小" : "國中"}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">{school.tagline}</div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5 text-xs">
                      {isStamped ? (
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" aria-label="已集章" />
                      ) : isVisited ? (
                        <Check className="w-3.5 h-3.5 text-teal-700" aria-label="已造訪" />
                      ) : (
                        <Navigation className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
};
