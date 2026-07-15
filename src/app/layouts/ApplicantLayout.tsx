import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { Home, Calendar, QrCode, Bell, LogOut, Laptop } from "lucide-react";

interface ApplicantLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const ApplicantLayout: React.FC<ApplicantLayoutProps> = ({ children, title = "STAFF 报名服务" }) => {
  const { user, loginAsRole, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { path: "/applicant/dashboard", label: "首页", icon: <Home size={20} /> },
    { path: "/applicant/interview", label: "预约面试", icon: <Calendar size={20} /> },
    { path: "/applicant/interview-qrcode", label: "面试签到", icon: <QrCode size={20} /> },
    { path: "/applicant/notifications", label: "通知中心", icon: <Bell size={20} /> },
  ];

  const demoRoles = [
    { role: "APPLICANT", label: "报名" },
    { role: "STAFF", label: "员工" },
    { role: "LEADER", label: "组长" },
    { role: "ADMIN", label: "主管" }
  ] as const;

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col max-w-md mx-auto relative border-x border-black/5 shadow-2xl overflow-hidden pb-16">
      {/* 1. iOS Top Navigation Header */}
      <header className="sticky top-0 z-30 h-14 border-b border-black/5 bg-white/80 backdrop-blur-xl flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#0A84FF] to-[#BF5AF2] flex items-center justify-center text-white font-bold text-xs">
            A
          </div>
          <span className="font-bold text-sm tracking-tight">{title}</span>
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
                else if (dr.role === "STAFF") navigate("/staff/dashboard");
                else if (dr.role === "LEADER") navigate("/leader/dashboard");
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

      {/* 4. iOS Tab Bar (Bottom persistent navigation) */}
      <nav className="absolute bottom-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-2xl border-t border-black/5 flex items-center justify-around px-2 z-50">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-1 w-16 h-12 rounded-xl transition-all ${
                active 
                  ? "text-[#0A84FF]" 
                  : "text-[#86868B] hover:text-[#1D1D1F]"
              }`}
            >
              {item.icon}
              <span className="text-[9px] font-bold tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
