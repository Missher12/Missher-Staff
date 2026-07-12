import React from "react";
import { UserCheck } from "lucide-react";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans flex flex-col justify-between">
      {/* Dynamic light gradient background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(10,132,255,0.03),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(191,90,242,0.03),transparent_40%)] pointer-events-none" />

      {/* Header bar */}
      <header className="sticky top-0 z-30 h-14 border-b border-black/5 bg-white/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#0A84FF] to-[#BF5AF2] flex items-center justify-center text-white font-bold text-xs">
            S
          </div>
          <span className="font-bold text-xs tracking-tight">STAFF 招聘公开端</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-2.5 py-0.5 bg-[#30D158]/10 border border-[#30D158]/20 rounded-full text-[10px] font-bold text-[#30D158] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#30D158] animate-pulse" />
            会场报名就绪
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[10px] text-[#86868B] border-t border-black/5 bg-white/40 backdrop-blur-md relative z-10 shrink-0">
        <p>© 2026 STAFF Convention Pro. 杭州会务组财务与考勤统筹组</p>
      </footer>
    </div>
  );
};
