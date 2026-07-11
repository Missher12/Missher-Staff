import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { 
  LayoutDashboard, Users, Calendar, BarChart2, 
  LogOut, ShieldAlert, Laptop, UserCheck
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, loginAsRole, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { path: "/admin/dashboard", label: "活动大盘", icon: <LayoutDashboard size={18} /> },
    { path: "/admin/applications", label: "报名审核", icon: <Users size={18} /> },
    { path: "/admin/interviews", label: "面试场次", icon: <Calendar size={18} /> },
    { path: "/admin/attendance/realtime", label: "实时考勤", icon: <BarChart2 size={18} /> },
  ];

  const demoRoles = [
    { role: "APPLICANT", label: "报名人员" },
    { role: "STAFF", label: "STAFF" },
    { role: "LEADER", label: "组长" },
    { role: "ACTIVITY_ADMIN", label: "管理员" },
    { role: "SUPER_ADMIN", label: "超管" }
  ] as const;

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans flex overflow-hidden">
      {/* 1. 左侧 Sidebar - Mac 设计 */}
      <aside className="w-[240px] border-r border-black/6 bg-white/80 backdrop-blur-xl flex flex-col justify-between p-4 shrink-0 hidden md:flex">
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-3 py-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0A84FF] to-[#BF5AF2] flex items-center justify-center text-white font-bold text-sm">
              S
            </div>
            <div>
              <h1 className="font-semibold text-sm leading-none">STAFF 管理系统</h1>
              <span className="text-[10px] text-[#86868B] font-medium tracking-wide uppercase mt-1 block">Convention Pro</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = location.pathname === item.path || (item.path === "/admin/applications" && location.pathname.startsWith("/admin/applications/"));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    active 
                      ? "bg-[#0A84FF] text-white shadow-sm shadow-[#0A84FF]/20" 
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

        {/* 体验账号快捷切换面板 (开发测试用) */}
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 border border-black/5 rounded-[18px] space-y-1.5">
            <span className="text-[10px] font-bold text-[#86868B] tracking-wide block flex items-center gap-1">
              <Laptop size={11} className="text-[#0A84FF]" /> 快速体验切换
            </span>
            <div className="grid grid-cols-2 gap-1">
              {demoRoles.map((dr) => (
                <button
                  key={dr.role}
                  onClick={() => {
                    loginAsRole(dr.role);
                    if (dr.role === "APPLICANT") navigate("/applicant/dashboard");
                    else if (dr.role === "STAFF" || dr.role === "LEADER") navigate("/staff/dashboard");
                    else navigate("/admin/dashboard");
                  }}
                  className={`px-1.5 py-1 text-[9px] font-semibold rounded-md border text-left truncate transition-all cursor-pointer ${
                    user?.role === dr.role
                      ? "bg-[#0A84FF]/10 text-[#0A84FF] border-[#0A84FF]"
                      : "bg-white border-black/5 hover:bg-slate-100"
                  }`}
                  title={`切换到 ${dr.label} 角色`}
                >
                  ● {dr.label}
                </button>
              ))}
            </div>
          </div>

          {/* User profile section */}
          <div className="pt-4 border-t border-black/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-black/5 flex items-center justify-center font-bold text-xs text-[#0A84FF] overflow-hidden shrink-0">
                {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="" /> : user?.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate leading-tight">{user?.name}</p>
                <span className="text-[10px] text-[#86868B] font-medium leading-none mt-0.5 block truncate">
                  {user?.role === "SUPER_ADMIN" ? "超级管理员" : "活动管理员"}
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
      </aside>

      {/* 2. 右侧 Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-[68px] border-b border-black/6 bg-white/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2">
            {/* 移动端菜单按钮可以在后面补充，这里保持简洁 */}
            <div className="px-3 py-1 bg-green-50 border border-green-100 rounded-full text-[10px] font-semibold text-[#30D158] flex items-center gap-1">
              <UserCheck size={11} /> 前端 Mock 沙盒已就绪
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-semibold text-[#1D1D1F]">
            <span>当前会场: 杭州国际博览中心</span>
            <div className="h-4 w-px bg-zinc-200" />
            <span className="text-[#86868B]">11:59 (系统时间)</span>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
