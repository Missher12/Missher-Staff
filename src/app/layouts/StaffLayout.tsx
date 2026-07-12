import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { MapPin, Users, Megaphone, User, Shield, LogOut, Laptop } from "lucide-react";

interface StaffLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const StaffLayout: React.FC<StaffLayoutProps> = ({ children, title = "STAFF 工作端" }) => {
  const { user, loginAsRole, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { path: "/staff/dashboard", label: "考勤打卡", icon: <MapPin size={18} /> },
    { path: "/staff/group", label: "小组通讯", icon: <Users size={18} /> },
    { path: "/staff/announcements", label: "公告消息", icon: <Megaphone size={18} /> },
    { path: "/staff/profile", label: "我的资料", icon: <User size={18} /> },
    { path: "/staff/security", label: "安全设置", icon: <Shield size={18} /> },
  ];

  const demoRoles = [
    { role: "APPLICANT", label: "报名" },
    { role: "STAFF", label: "员工" },
    { role: "LEADER", label: "组长" },
    { role: "ACTIVITY_ADMIN", label: "管理" }
  ] as const;

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col max-w-md mx-auto relative border-x border-black/5 shadow-2xl overflow-hidden pb-16">
      {/* 1. iOS Translucent Top Header */}
      <header className="sticky top-0 z-30 h-14 border-b border-black/5 bg-white/80 backdrop-blur-xl flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#30D158] to-[#0A84FF] flex items-center justify-center text-white font-bold text-xs">
            S
          </div>
          <div className="min-w-0">
            <span className="font-bold text-sm tracking-tight block leading-tight">{title}</span>
            <span className="text-[9px] text-[#86868B] font-bold block">小组：舞台控场组 • STAFF</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {children}
      </main>

      {/* 3. Floating Quick Demo Role Switcher Bar (Mobile view helper) */}
      <div className="absolute bottom-20 left-3 right-3 z-40 p-2.5 bg-white/90 backdrop-blur-md border border-black/8 rounded-2xl shadow-xl flex items-center justify-between">
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

      {/* 4. Translucent Tab Bar (Bottom persistent navigation) */}
      <nav className="absolute bottom-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-2xl border-t border-black/5 flex items-center justify-around px-1 z-50">
        {navItems.map((item) => {
          const active = location.pathname === item.path || (item.path === "/staff/dashboard" && location.pathname.startsWith("/staff/attendance"));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-1 w-14 h-12 rounded-xl transition-all ${
                active 
                  ? "text-[#30D158] scale-105" 
                  : "text-[#86868B] hover:text-[#1D1D1F]"
              }`}
            >
              {item.icon}
              <span className="text-[8px] font-bold tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
