/**
 * STAFF 活动报名与考勤系统 - 核心路由映射与应用入口
 */

import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { useAuthStore } from "./app/stores/authStore";

// Guards
import { AnnouncementGuard } from "./app/guards/Guards";

// Import Modular Routing Definitions
import { publicRoutes } from "./app/router/public.routes";
import { applicantRoutes } from "./app/router/applicant.routes";
import { staffRoutes } from "./app/router/staff.routes";
import { leaderRoutes } from "./app/router/leader.routes";
import { adminRoutes } from "./app/router/admin.routes";

import { ShieldAlert, HelpCircle } from "lucide-react";
import { useEventStore } from "./app/stores/eventStore";
import { Toast } from "./shared/ui";

// ==========================================
// 403 Error Page (Unauthorized Access)
// ==========================================
export const Error403: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white/80 backdrop-blur-xl border border-black/5 rounded-[28px] p-8 max-w-sm shadow-sm space-y-4">
        <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-full flex items-center justify-center mx-auto text-[#FF453A]">
          <ShieldAlert size={32} />
        </div>
        <h1 className="text-lg font-black text-[#1D1D1F]">403 - 访问凭证受限</h1>
        <p className="text-xs text-[#86868B] leading-relaxed font-semibold">
          由于系统安全沙盒策略，您的账户当前角色权限等级不足以访问该控制台，请返回登录中心。
        </p>
        <Link 
          to="/login" 
          className="w-full py-3.5 bg-[#0A84FF] text-white text-xs font-bold rounded-full block cursor-pointer hover:bg-[#0A84FF]/90 transition-all"
        >
          返回登录中心
        </Link>
      </div>
    </div>
  );
};

// ==========================================
// 404 Error Page (Not Found)
// ==========================================
export const Error404: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white/80 backdrop-blur-xl border border-black/5 rounded-[28px] p-8 max-w-sm shadow-sm space-y-4">
        <div className="w-16 h-16 bg-zinc-100 border border-zinc-200 rounded-full flex items-center justify-center mx-auto text-zinc-500">
          <HelpCircle size={32} />
        </div>
        <h1 className="text-lg font-black text-[#1D1D1F]">404 - 链接资源已丢失</h1>
        <p className="text-xs text-[#86868B] leading-relaxed font-semibold">
          系统无法定位您所请求的工作卡、岗位排班表或会务档案。可能此活动已安全归档结账。
        </p>
        <Link 
          to="/" 
          className="w-full py-3.5 bg-zinc-800 text-white text-xs font-bold rounded-full block cursor-pointer hover:bg-zinc-700 transition-all"
        >
          返回应用首页
        </Link>
      </div>
    </div>
  );
};

export default function App() {
  const { isAuthenticated, user } = useAuthStore();
  const { toast, hideToast } = useEventStore();

  return (
    <BrowserRouter>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <AnnouncementGuard>
        <Routes>
          {/* 403 and 404 error views */}
          <Route path="/403" element={<Error403 />} />
          <Route path="/404" element={<Error404 />} />

          {/* Load Public Routes */}
          {publicRoutes.map((r, idx) => {
            const RouteElement = Route as any;
            return <RouteElement key={`pub-${idx}`} path={r.path} element={r.element} />;
          })}

          {/* Load Applicant-only Routes */}
          {applicantRoutes.map((r, idx) => {
            const RouteElement = Route as any;
            return <RouteElement key={`app-${idx}`} path={r.path} element={r.element} />;
          })}

          {/* Load Staff-only Routes */}
          {staffRoutes.map((r, idx) => {
            const RouteElement = Route as any;
            return <RouteElement key={`stf-${idx}`} path={r.path} element={r.element} />;
          })}

          {/* Load Team Leader Routes */}
          {leaderRoutes.map((r, idx) => {
            const RouteElement = Route as any;
            return <RouteElement key={`ldr-${idx}`} path={r.path} element={r.element} />;
          })}

          {/* Load Activity Admin Routes */}
          {adminRoutes.map((r, idx) => {
            const RouteElement = Route as any;
            return <RouteElement key={`adm-${idx}`} path={r.path} element={r.element} />;
          })}

          {/* Compatibility Redirects for Legacy Super Admin Pages */}
          <Route path="/super-admin" element={<Navigate to="/admin/settings" replace />} />
          <Route path="/super-admin/*" element={<Navigate to="/admin/settings" replace />} />

          {/* ========================================================
              Global fallback & Role-based Redirection
              ======================================================== */}
          <Route 
            path="*" 
            element={
              isAuthenticated && user ? (
                user.role === "APPLICANT" ? (
                  <Navigate to="/applicant/dashboard" replace />
                ) : user.role === "STAFF" ? (
                  <Navigate to="/staff/dashboard" replace />
                ) : user.role === "LEADER" ? (
                  <Navigate to="/leader/dashboard" replace />
                ) : (
                  <Navigate to="/admin/dashboard" replace />
                )
              ) : (
                // If not authenticated, go straight to the default activity landing page
                <Navigate to="/activities/ACT_2026_01/apply" replace />
              )
            } 
          />
        </Routes>
      </AnnouncementGuard>
    </BrowserRouter>
  );
}
