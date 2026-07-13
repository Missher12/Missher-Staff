import React from "react";
import { AdminDashboard } from "../../pages/admin/AdminDashboard";
import { ApplicationReview } from "../../pages/admin/ApplicationReview";
import { ApplicationDetail } from "../../pages/admin/ApplicationDetail";
import { 
  AdminGroups, AdminLeave, AdminAnnouncements, AdminImports, 
  ActivityList, FormBuilder,
  AdminInterviews, AdminAttendanceRealtime, AdminAdmissions,
  AdminPeople, AdminAssignments, AdminAttendance,
  AdminAttendanceDetail, AdminAttendanceCorrections
} from "../../pages/admin/AdminPages";
import { RoleGuard } from "../guards/Guards";
import { RouteConfig } from "./public.routes";

export const adminRoutes: RouteConfig[] = [
  { 
    path: "/admin", 
    element: (
      <RoleGuard allowedRoles={["ACTIVITY_ADMIN", "SUPER_ADMIN"]}>
        <AdminDashboard />
      </RoleGuard>
    )
  },
  { 
    path: "/admin/dashboard", 
    element: (
      <RoleGuard allowedRoles={["ACTIVITY_ADMIN", "SUPER_ADMIN"]}>
        <AdminDashboard />
      </RoleGuard>
    )
  },
  { 
    path: "/admin/activities", 
    element: (
      <RoleGuard allowedRoles={["ACTIVITY_ADMIN", "SUPER_ADMIN"]}>
        <ActivityList />
      </RoleGuard>
    )
  },
  { 
    path: "/admin/applications", 
    element: (
      <RoleGuard allowedRoles={["ACTIVITY_ADMIN", "SUPER_ADMIN"]}>
        <ApplicationReview />
      </RoleGuard>
    )
  },
  { 
    path: "/admin/applications/:applicationId", 
    element: (
      <RoleGuard allowedRoles={["ACTIVITY_ADMIN", "SUPER_ADMIN"]}>
        <ApplicationDetail />
      </RoleGuard>
    )
  },
  { 
    path: "/admin/interviews", 
    element: (
      <RoleGuard allowedRoles={["ACTIVITY_ADMIN", "SUPER_ADMIN"]}>
        <AdminInterviews />
      </RoleGuard>
    )
  },
  { 
    path: "/admin/admissions", 
    element: (
      <RoleGuard allowedRoles={["ACTIVITY_ADMIN", "SUPER_ADMIN"]}>
        <AdminAdmissions />
      </RoleGuard>
    )
  },
  { 
    path: "/admin/people", 
    element: (
      <RoleGuard allowedRoles={["ACTIVITY_ADMIN", "SUPER_ADMIN"]}>
        <AdminPeople />
      </RoleGuard>
    )
  },
  { 
    path: "/admin/assignments", 
    element: (
      <RoleGuard allowedRoles={["ACTIVITY_ADMIN", "SUPER_ADMIN"]}>
        <AdminAssignments />
      </RoleGuard>
    )
  },
  { 
    path: "/admin/attendance/realtime", 
    element: (
      <RoleGuard allowedRoles={["ACTIVITY_ADMIN", "SUPER_ADMIN"]}>
        <AdminAttendanceRealtime />
      </RoleGuard>
    )
  },
  { 
    path: "/admin/attendance", 
    element: (
      <RoleGuard allowedRoles={["ACTIVITY_ADMIN", "SUPER_ADMIN"]}>
        <AdminAttendance />
      </RoleGuard>
    )
  },
  { 
    path: "/admin/attendance/:attendanceId", 
    element: (
      <RoleGuard allowedRoles={["ACTIVITY_ADMIN", "SUPER_ADMIN"]}>
        <AdminAttendanceDetail />
      </RoleGuard>
    )
  },
  { 
    path: "/admin/attendance/corrections", 
    element: (
      <RoleGuard allowedRoles={["ACTIVITY_ADMIN", "SUPER_ADMIN"]}>
        <AdminAttendanceCorrections />
      </RoleGuard>
    )
  },
  { 
    path: "/admin/form-builder", 
    element: (
      <RoleGuard allowedRoles={["ACTIVITY_ADMIN", "SUPER_ADMIN"]}>
        <FormBuilder />
      </RoleGuard>
    )
  },
  { 
    path: "/admin/groups", 
    element: (
      <RoleGuard allowedRoles={["ACTIVITY_ADMIN", "SUPER_ADMIN"]}>
        <AdminGroups />
      </RoleGuard>
    )
  },
  { 
    path: "/admin/leave", 
    element: (
      <RoleGuard allowedRoles={["ACTIVITY_ADMIN", "SUPER_ADMIN"]}>
        <AdminLeave />
      </RoleGuard>
    )
  },
  { 
    path: "/admin/announcements", 
    element: (
      <RoleGuard allowedRoles={["ACTIVITY_ADMIN", "SUPER_ADMIN"]}>
        <AdminAnnouncements />
      </RoleGuard>
    )
  },
  { 
    path: "/admin/imports", 
    element: (
      <RoleGuard allowedRoles={["ACTIVITY_ADMIN", "SUPER_ADMIN"]}>
        <AdminImports />
      </RoleGuard>
    )
  },
];
