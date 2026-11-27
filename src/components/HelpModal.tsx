import React from "react";
import { X } from "lucide-react";

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-title"
      className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/45 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 mb-4">
          <h2 id="help-title" className="text-lg font-bold text-slate-900">
            探索操作指南
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉說明"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">1. 人物移動方式</h3>
            <p>
              使用鍵盤 <span className="font-mono-num text-xs bg-slate-100 px-1.5 py-0.5 rounded">WASD</span> 或{" "}
              <span className="font-mono-num text-xs bg-slate-100 px-1.5 py-0.5 rounded">方向鍵</span> 自由走訪各座校島與跨河橋樑，按住{" "}
              <span className="font-mono-num text-xs bg-slate-100 px-1.5 py-0.5 rounded">Shift</span> 加速奔跑、
              <span className="font-mono-num text-xs bg-slate-100 px-1.5 py-0.5 rounded">Space</span> 跳躍。
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-1">2. 點擊島嶼自動尋路</h3>
            <p>
              直接點擊 3D 場景中的學校島嶼、名牌標籤或左側名錄，探索者會自動沿著最短橋樑路徑走到該校並開啟介紹。
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-1">3. 視角旋轉與集章</h3>
            <p>
              拖曳畫面可 360° 旋轉視角、滾輪縮放遠近；抵達學校後回答卡片內的在地探索題即可解鎖該校星號徽章。
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-700 rounded-lg transition-colors"
          >
            開始探索宜蘭市
          </button>
        </div>
      </div>
    </div>
  );
};
