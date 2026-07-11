/**
 * STAFF 活动报名与考勤系统 - 核心路由映射与应用入口
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./app/stores/authStore";

// Guards
import { RoleGuard, AnnouncementGuard } from "./app/guards/Guards";

// Pages
import { Login } from "./pages/public/Login";
import { ActivityApply } from "./pages/public/ActivityApply";
import { ApplicationForm } from "./pages/public/ApplicationForm";

import { ApplicantDashboard } from "./pages/applicant/ApplicantDashboard";
import { InterviewQrCode } from "./pages/applicant/InterviewQrCode";

import { StaffDashboard } from "./pages/staff/StaffDashboard";
import { AttendanceCheck } from "./pages/staff/AttendanceCheck";
import { AttendanceHistory } from "./pages/staff/AttendanceHistory";

import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { ApplicationReview } from "./pages/admin/ApplicationReview";
import { ApplicationDetail } from "./pages/admin/ApplicationDetail";
import { InterviewSessions } from "./pages/admin/InterviewSessions";
import { RealtimeAttendance } from "./pages/admin/RealtimeAttendance";

export default function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <BrowserRouter>
      <AnnouncementGuard>
        <Routes>
          {/* ========================================================
              1. 游客/公用公开路由
             ======================================================== */}
          <Route path="/login" element={<Login />} />
          
          {/* 活动宣传展示 Landing Page */}
          <Route path="/activities/:activityId/apply" element={<ActivityApply />} />

          {/* 动态步骤报名表填写 (游客/报名人员可访问，表单内支持自动建档登录) */}
          <Route path="/activities/:activityId/application-form" element={<ApplicationForm />} />

          {/* ========================================================
              2. 报名候选人专属路由 (APPLICANT 权限)
             ======================================================== */}
          <Route 
            path="/applicant/dashboard" 
            element={
              <RoleGuard allowedRoles={["APPLICANT"]}>
                <ApplicantDashboard />
              </RoleGuard>
            } 
          />
          <Route 
            path="/applicant/interview-qrcode" 
            element={
              <RoleGuard allowedRoles={["APPLICANT"]}>
                <InterviewQrCode />
              </RoleGuard>
            } 
          />

          {/* ========================================================
              3. STAFF 临时工作人员考勤及组内通信路由 (STAFF/LEADER 权限)
             ======================================================== */}
          <Route 
            path="/staff/dashboard" 
            element={
              <RoleGuard allowedRoles={["STAFF", "LEADER"]}>
                <StaffDashboard />
              </RoleGuard>
            } 
          />
          <Route 
            path="/staff/attendance/check" 
            element={
              <RoleGuard allowedRoles={["STAFF", "LEADER"]}>
                <AttendanceCheck />
              </RoleGuard>
            } 
          />
          <Route 
            path="/staff/attendance" 
            element={
              <RoleGuard allowedRoles={["STAFF", "LEADER"]}>
                <AttendanceHistory />
              </RoleGuard>
            } 
          />

          {/* ========================================================
              4. 展会会务考勤及后台管理员路由 (ADMIN 权限)
             ======================================================== */}
          <Route 
            path="/admin/dashboard" 
            element={
              <RoleGuard allowedRoles={["ACTIVITY_ADMIN", "SUPER_ADMIN"]}>
                <AdminDashboard />
              </RoleGuard>
            } 
          />
          <Route 
            path="/admin/applications" 
            element={
              <RoleGuard allowedRoles={["ACTIVITY_ADMIN", "SUPER_ADMIN"]}>
                <ApplicationReview />
              </RoleGuard>
            } 
          />
          <Route 
            path="/admin/applications/:applicationId" 
            element={
              <RoleGuard allowedRoles={["ACTIVITY_ADMIN", "SUPER_ADMIN"]}>
                <ApplicationDetail />
              </RoleGuard>
            } 
          />
          <Route 
            path="/admin/interviews" 
            element={
              <RoleGuard allowedRoles={["ACTIVITY_ADMIN", "SUPER_ADMIN", "LEADER"]}>
                <InterviewSessions />
              </RoleGuard>
            } 
          />
          <Route 
            path="/admin/attendance/realtime" 
            element={
              <RoleGuard allowedRoles={["ACTIVITY_ADMIN", "SUPER_ADMIN"]}>
                <RealtimeAttendance />
              </RoleGuard>
            } 
          />

          {/* ========================================================
              5. 统一默认重定向路由
             ======================================================== */}
          <Route 
            path="*" 
            element={
              isAuthenticated && user ? (
                user.role === "APPLICANT" ? (
                  <Navigate to="/applicant/dashboard" replace />
                ) : user.role === "STAFF" || user.role === "LEADER" ? (
                  <Navigate to="/staff/dashboard" replace />
                ) : (
                  <Navigate to="/admin/dashboard" replace />
                )
              ) : (
                // 默认去往嘉年华首发报名活动页
                <Navigate to="/activities/ACT_2026_01/apply" replace />
              )
            } 
          />
        </Routes>
      </AnnouncementGuard>
    </BrowserRouter>
  );
}
