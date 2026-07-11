import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { LogOut, Laptop } from "lucide-react";

interface MobileLayoutProps {
  children: React.ReactNode;
  title?: string;
  onBack?: () => void;
  actions?: React.ReactNode;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children, title = "STAFF 考勤中心", onBack, actions }) => {
  const { user, loginAsRole, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const demoRoles = [
    { role: "APPLICANT", label: "报名" },
    { role: "STAFF", label: "员工" },
    { role: "LEADER", label: "组长" },
    { role: "ACTIVITY_ADMIN", label: "管理" }
  ] as const;

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col max-w-md mx-auto relative border-x border-black/5 shadow-2xl overflow-hidden">
      {/* 1. iOS Translucent Top Header */}
      <header className="sticky top-0 z-30 h-14 border-b border-black/5 bg-white/80 backdrop-blur-xl flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          {onBack ? (
            <button 
              onClick={onBack} 
              className="p-1.5 rounded-full hover:bg-black/5 text-[#0A84FF] font-semibold text-sm cursor-pointer"
            >
              ← 返回
            </button>
          ) : (
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#0A84FF] to-[#BF5AF2] flex items-center justify-center text-white font-bold text-xs">
              S
            </div>
          )}
          <span className="font-bold text-sm tracking-tight">{title}</span>
        </div>

        <div className="flex items-center gap-2.5">
          {actions}
          <button
            onClick={handleLogout}
            className="p-2 rounded-full hover:bg-red-50 text-zinc-400 hover:text-[#FF453A] transition-colors cursor-pointer"
            title="退出登录"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* 2. Scrollable Body Content */}
      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-24">
        {children}
      </main>

      {/* 3. Floating Quick Demo Role Switcher Bar (Mobile view helper) */}
      <div className="absolute bottom-16 left-3 right-3 z-40 p-2.5 bg-white/90 backdrop-blur-md border border-black/8 rounded-2xl shadow-xl flex items-center justify-between">
        <span className="text-[9px] font-bold text-[#86868B] tracking-tight flex items-center gap-1 shrink-0">
          <Laptop size={11} className="text-[#0A84FF]" /> 角色切换:
        </span>
        <div className="flex gap-1 overflow-x-auto min-w-0">
          {demoRoles.map((dr) => (
            <button
              key={dr.role}
              onClick={() => {
                loginAsRole(dr.role);
                if (dr.role === "APPLICANT") navigate("/applicant/dashboard");
                else if (dr.role === "STAFF" || dr.role === "LEADER") navigate("/staff/dashboard");
                else navigate("/admin/dashboard");
              }}
              className={`px-2 py-1 text-[9px] font-semibold rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                user?.role === dr.role
                  ? "bg-[#0A84FF] text-white border-[#0A84FF]"
                  : "bg-white text-[#1D1D1F]/80 border-black/5 hover:bg-slate-50"
              }`}
            >
              {dr.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
