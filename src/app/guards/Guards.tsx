import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useEventStore } from "../stores/eventStore";
import { AlertCircle, FileText, Check } from "lucide-react";

// ==========================================
// 1. RoleGuard (角色安全路由守卫)
// ==========================================
interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Array<"APPLICANT" | "STAFF" | "LEADER" | "ACTIVITY_ADMIN" | "SUPER_ADMIN">;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    // 没登录，回到 /login，并保存当前尝试访问的路径
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 特殊机制：SUPER_ADMIN 拥有任何页面的访问权限
  if (user.role === "SUPER_ADMIN") {
    return <>{children}</>;
  }

  if (!allowedRoles.includes(user.role as any)) {
    // 角色不符，重定向到他们应该去的首页
    if (user.role === "APPLICANT") {
      return <Navigate to="/applicant/dashboard" replace />;
    } else if (user.role === "STAFF") {
      return <Navigate to="/staff/dashboard" replace />;
    } else if (user.role === "LEADER") {
      return <Navigate to="/leader/dashboard" replace />;
    } else {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

// ==========================================
// 2. AnnouncementGuard (公告强制确认阻挡器)
// ==========================================
export const AnnouncementGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  const { announcements, confirmAnnouncement } = useEventStore();
  const location = useLocation();

  // 如果没有登录，或者在登录页，或者访问的是公开路由，放行
  const isPublicRoute = 
    location.pathname === "/login" || 
    location.pathname === "/" || 
    location.pathname.startsWith("/activities/");

  if (!user || isPublicRoute) {
    return <>{children}</>;
  }

  // 检索当前用户是否有“必须确认且尚未确认”的紧急公告，并进行精准条件匹配
  const pendingUrgentAnn = announcements.find((ann) => {
    // 必须是强制确认
    const isConf = ann.isRequiredConfirm || ann.requiredConfirm;
    if (!isConf) return false;
    
    // 已经确认则跳过
    if (ann.confirmedUserIds.includes(user.id)) return false;

    // 1. 匹配角色 (如果是针对特定角色)
    if (ann.audienceRoles && !ann.audienceRoles.includes(user.role)) {
      return false;
    }

    // 2. 匹配特定用户 ID (如果限定了用户)
    if (ann.userIds && !ann.userIds.includes(user.id)) {
      return false;
    }

    // 3. 匹配特定活动 (如果是针对特定活动)
    if (ann.activityId && ann.activityId !== "ACT_2026_01") {
      return false;
    }

    return true;
  });

  if (pendingUrgentAnn) {
    // 渲染全屏强制阅读遮罩
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#F5F5F7]/95 backdrop-blur-md">
        <div className="bg-white/80 backdrop-blur-2xl border border-black/8 rounded-[32px] max-w-lg w-full p-8 shadow-2xl flex flex-col justify-between max-h-[85vh] animate-scale-up">
          <div className="space-y-4 overflow-y-auto pr-2">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-red-100 rounded-full text-[#FF453A] animate-pulse">
                <AlertCircle size={22} />
              </span>
              <span className="text-xs font-bold text-[#FF453A] tracking-wider uppercase">重要考勤公告强制确认</span>
            </div>
            
            <h2 className="text-xl font-bold text-[#1D1D1F] leading-tight">
              {pendingUrgentAnn.title}
            </h2>
            
            <div className="text-xs text-[#86868B] flex items-center gap-2">
              <span>发布日期: {pendingUrgentAnn.publishDate}</span>
              <span>•</span>
              <span className="text-[#FF9F0A] font-semibold">阻挡确认后方可解锁考勤定位</span>
            </div>

            <div className="h-px bg-zinc-100" />

            <div className="text-sm text-[#1D1D1F] leading-relaxed whitespace-pre-wrap py-2 font-medium bg-slate-50/50 p-4 rounded-2xl border border-black/5">
              {pendingUrgentAnn.content}
            </div>

            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-100/50 text-xs text-[#FF9F0A] flex gap-2">
              <FileText size={16} className="shrink-0 mt-0.5" />
              <span>根据会场考勤规则：未完成安全守则及打卡规则确认，打卡系统定位接口将暂时对您的账户进行物理挂起。</span>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-black/5 flex justify-end">
            <button
              onClick={() => confirmAnnouncement(pendingUrgentAnn.id, user.id)}
              className="w-full md:w-auto px-8 py-3.5 bg-[#0A84FF] text-white font-bold text-xs rounded-full hover:bg-[#0A84FF]/90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.98]"
            >
              <Check size={16} />
              我已阅读并完全知悉以上公告规则
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
