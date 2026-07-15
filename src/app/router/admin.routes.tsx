import React from "react";
import { AdminDashboard } from "../../pages/admin/AdminDashboard";
import { ApplicationReview } from "../../pages/admin/ApplicationReview";
import { ApplicationDetail } from "../../pages/admin/ApplicationDetail";
import { AdminSettingsCenter } from "../../pages/admin/AdminSettingsCenter";
import { 
  AdminGroups, AdminLeave, AdminAnnouncements, AdminImports, 
  ActivityList, FormBuilder,
  AdminInterviews, AdminAttendanceRealtime, AdminAdmissions,
  AdminPeople, AdminAssignments, AdminAttendance,
  AdminAttendanceDetail, AdminAttendanceCorrections
} from "../../pages/admin/AdminPages";
import { RoleGuard, PermissionGuard } from "../guards/Guards";
import { RouteConfig } from "./public.routes";

export const adminRoutes: RouteConfig[] = [
  { 
    path: "/admin", 
    element: (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <AdminDashboard />
      </RoleGuard>
    )
  },
  { 
    path: "/admin/dashboard", 
    element: (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <AdminDashboard />
      </RoleGuard>
    )
  },
  { 
    path: "/admin/settings", 
    element: (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <AdminSettingsCenter />
      </RoleGuard>
    )
  },
  { 
    path: "/admin/settings/:category", 
    element: (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <AdminSettingsCenter />
      </RoleGuard>
    )
  },
  { 
    path: "/admin/activities", 
    element: (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <PermissionGuard permission="activity.edit">
          <ActivityList />
        </PermissionGuard>
      </RoleGuard>
    )
  },
  { 
    path: "/admin/activities/create", 
    element: (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <PermissionGuard permission="activity.create">
          <ActivityList />
        </PermissionGuard>
      </RoleGuard>
    )
  },
  { 
    path: "/admin/activities/:activityId", 
    element: (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <PermissionGuard permission="activity.edit">
          <ActivityList />
        </PermissionGuard>
      </RoleGuard>
    )
  },
  { 
    path: "/admin/activities/:activityId/settings", 
    element: (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <PermissionGuard permission="activity.edit">
          <ActivityList />
        </PermissionGuard>
      </RoleGuard>
    )
  },
  { 
    path: "/admin/work-dates", 
    element: (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <PermissionGuard permission="activity.edit">
          <ActivityList />
        </PermissionGuard>
      </RoleGuard>
    )
  },
  { 
    path: "/admin/applications", 
    element: (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <PermissionGuard permission="application.view">
          <ApplicationReview />
        </PermissionGuard>
      </RoleGuard>
    )
  },
  { 
    path: "/admin/applications/:applicationId", 
    element: (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <PermissionGuard permission="application.view">
          <ApplicationDetail />
        </PermissionGuard>
      </RoleGuard>
    )
  },
  { 
    path: "/admin/interviews", 
    element: (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <PermissionGuard permission="interview.view">
          <AdminInterviews />
        </PermissionGuard>
      </RoleGuard>
    )
  },
  { 
    path: "/admin/interview-checkins", 
    element: (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <PermissionGuard permission="interview.scan">
          <AdminInterviews />
        </PermissionGuard>
      </RoleGuard>
    )
  },
  { 
    path: "/admin/admissions", 
    element: (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <PermissionGuard permission="admission.view">
          <AdminAdmissions />
        </PermissionGuard>
      </RoleGuard>
    )
  },
  { 
    path: "/admin/people", 
    element: (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <PermissionGuard permission="people.view">
          <AdminPeople />
        </PermissionGuard>
      </RoleGuard>
    )
  },
  { 
    path: "/admin/people/:personId", 
    element: (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <PermissionGuard permission="people.view">
          <AdminPeople />
        </PermissionGuard>
      </RoleGuard>
    )
  },
  { 
    path: "/admin/assignments", 
    element: (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <PermissionGuard permission="staff.assign">
          <AdminAssignments />
        </PermissionGuard>
      </RoleGuard>
    )
  },
  { 
    path: "/admin/staff-assignments", 
    element: (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <PermissionGuard permission="staff.assign">
          <AdminAssignments />
        </PermissionGuard>
      </RoleGuard>
    )
  },
  { 
    path: "/admin/attendance/realtime", 
    element: (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <PermissionGuard permission="attendance.view">
          <AdminAttendanceRealtime />
        </PermissionGuard>
      </RoleGuard>
    )
  },
  { 
    path: "/admin/attendance/risks", 
    element: (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <PermissionGuard permission="attendance.view">
          <AdminAttendanceRealtime />
        </PermissionGuard>
      </RoleGuard>
    )
  },
  { 
    path: "/admin/attendance", 
    element: (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <PermissionGuard permission="attendance.view">
          <AdminAttendance />
        </PermissionGuard>
      </RoleGuard>
    )
  },
  { 
    path: "/admin/attendance/:attendanceId", 
    element: (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <PermissionGuard permission="attendance.view">
          <AdminAttendanceDetail />
        </PermissionGuard>
      </RoleGuard>
    )
  },
  { 
    path: "/admin/attendance/corrections", 
    element: (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <PermissionGuard permission="attendance.correct">
          <AdminAttendanceCorrections />
        </PermissionGuard>
      </RoleGuard>
    )
  },
  { 
    path: "/admin/form-builder", 
    element: (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <PermissionGuard permission="form.view">
          <FormBuilder />
        </PermissionGuard>
      </RoleGuard>
    )
  },
  { 
    path: "/admin/forms", 
    element: (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <PermissionGuard permission="form.view">
          <FormBuilder />
        </PermissionGuard>
      </RoleGuard>
    )
  },
  { 
    path: "/admin/groups", 
    element: (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <PermissionGuard permission="group.view">
          <AdminGroups />
        </PermissionGuard>
      </RoleGuard>
    )
  },
  { 
    path: "/admin/positions", 
    element: (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <PermissionGuard permission="position.manage">
          <AdminGroups />
        </PermissionGuard>
      </RoleGuard>
    )
  },
  { 
    path: "/admin/leaders", 
    element: (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <PermissionGuard permission="group.manage">
          <AdminGroups />
        </PermissionGuard>
      </RoleGuard>
    )
  },
  { 
    path: "/admin/leave", 
    element: (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <PermissionGuard permission="leave.view">
          <AdminLeave />
        </PermissionGuard>
      </RoleGuard>
    )
  },
  { 
    path: "/admin/announcements", 
    element: (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <PermissionGuard permission="announcement.view">
          <AdminAnnouncements />
        </PermissionGuard>
      </RoleGuard>
    )
  },
  { 
    path: "/admin/notifications", 
    element: (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <PermissionGuard permission="announcement.view">
          <AdminAnnouncements />
        </PermissionGuard>
      </RoleGuard>
    )
  },
  { 
    path: "/admin/imports", 
    element: (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <PermissionGuard permission="data.import">
          <AdminImports />
        </PermissionGuard>
      </RoleGuard>
    )
  },
  { 
    path: "/admin/exports", 
    element: (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <PermissionGuard permission="attendance.export">
          <AdminImports />
        </PermissionGuard>
      </RoleGuard>
    )
  },
];
