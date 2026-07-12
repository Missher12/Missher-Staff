import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { 
  ShieldCheck, CalendarRange, Users2, Settings, 
  History, HeartPulse, LogOut, Laptop, Menu, X
} from "lucide-react";

interface SuperAdminLayoutProps {
  children: React.ReactNode;
}

export const SuperAdminLayout: React.FC<SuperAdminLayoutProps> = ({ children }) => {
  const { user, loginAsRole, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { path: "/super-admin/dashboard", label: "全局运营大盘", icon: <ShieldCheck size={18} /> },
    { path: "/super-admin/activities", label: "活动全周期管理", icon: <CalendarRange size={18} /> },
    { path: "/super-admin/administrators", label: "考务管理员授权", icon: <Users2 size={18} /> },
    { path: "/super-admin/global-settings", label: "全局防作弊参数", icon: <Settings size={18} /> },
    { path: "/super-admin/audit-logs", label: "超级安全审计日志", icon: <History size={18} /> },
    { path: "/super-admin/system-health", label: "集群容器状态监控", icon: <HeartPulse size={18} /> },
  ];

  const demoRoles = [
    { role: "APPLICANT", label: "报名人员" },
    { role: "STAFF", label: "STAFF" },
    { role: "LEADER", label: "组长" },
    { role: "ACTIVITY_ADMIN", label: "管理员" },
    { role: "SUPER_ADMIN", label: "超管" }
  ] as const;

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between p-4">
      <div className="space-y-6">
        {/* Logo and title */}
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#BF5AF2] to-[#FF453A] flex items-center justify-center text-white font-extrabold text-sm shadow-md">
            S
          </div>
          <div>
            <h1 className="font-extrabold text-sm leading-none text-[#1D1D1F]">SUPER ADMIN</h1>
            <span className="text-[9px] text-[#BF5AF2] font-bold tracking-wider uppercase mt-1 block">全局超级会务核准</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path || (item.path !== "/super-admin/dashboard" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  active 
                    ? "bg-[#BF5AF2] text-white shadow-md shadow-[#BF5AF2]/20" 
                    : "text-[#1D1D1F]/80 hover:bg-black/5 hover:text-[#1D1D1F]"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Quick switcher and User bar */}
      <div className="space-y-4">
        <div className="p-3 bg-zinc-50 border border-black/5 rounded-[18px] space-y-1.5">
          <span className="text-[9px] font-bold text-[#86868B] tracking-wide block flex items-center gap-1">
            <Laptop size={11} className="text-[#BF5AF2]" /> 沙盒快速切换
          </span>
          <div className="grid grid-cols-2 gap-1">
            {demoRoles.map((dr) => (
              <button
                key={dr.role}
                onClick={() => {
                  loginAsRole(dr.role);
                  setMobileMenuOpen(false);
                  if (dr.role === "APPLICANT") navigate("/applicant/dashboard");
                  else if (dr.role === "STAFF") navigate("/staff/dashboard");
                  else if (dr.role === "LEADER") navigate("/leader/dashboard");
                  else if (dr.role === "SUPER_ADMIN") navigate("/super-admin/dashboard");
                  else navigate("/admin/dashboard");
                }}
                className={`px-1.5 py-1 text-[8px] font-extrabold rounded-md border text-left truncate transition-all ${
                  user?.role === dr.role
                    ? "bg-[#BF5AF2]/10 text-[#BF5AF2] border-[#BF5AF2]"
                    : "bg-white border-black/5 hover:bg-slate-100"
                }`}
              >
                ● {dr.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-black/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center font-extrabold text-xs text-[#BF5AF2] overflow-hidden shrink-0">
              {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="" /> : "超"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate leading-tight">{user?.name || "超级管理员"}</p>
              <span className="text-[9px] text-[#BF5AF2] font-semibold leading-none mt-0.5 block truncate">
                SUPER_ADMIN
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-[#FF453A] hover:bg-red-50 transition-colors cursor-pointer"
            title="退出登录"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans flex overflow-hidden">
      {/* 1. Desktop Sidebar */}
      <aside className="w-[240px] border-r border-black/6 bg-white/80 backdrop-blur-xl shrink-0 hidden md:block">
        {sidebarContent}
      </aside>

      {/* 2. Responsive Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer Panel */}
          <div className="relative w-[240px] h-full bg-white flex flex-col z-10 shadow-2xl animate-slide-in">
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-1.5 bg-slate-100 rounded-full text-zinc-500 hover:text-zinc-800"
            >
              <X size={14} />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* 3. Right Content Column */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header bar */}
        <header className="h-[68px] border-b border-black/6 bg-white/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl bg-white border border-black/6 text-zinc-600 block md:hidden cursor-pointer"
            >
              <Menu size={18} />
            </button>
            <div className="px-3 py-1 bg-purple-50 border border-purple-100 rounded-full text-[10px] font-bold text-[#BF5AF2] flex items-center gap-1.5 animate-pulse">
              <ShieldCheck size={12} /> 超管底层超级视图已激活
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-semibold text-[#1D1D1F]">
            <span>全局会场数: 12 个地区</span>
            <div className="h-4 w-px bg-zinc-200" />
            <span className="text-zinc-500 font-mono">ROOT CONTROL</span>
          </div>
        </header>

        {/* Scrollable page body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
