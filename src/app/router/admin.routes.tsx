import React from "react";
import { AdminDashboard } from "../../pages/admin/AdminDashboard";
import { ApplicationReview } from "../../pages/admin/ApplicationReview";
import { ApplicationDetail } from "../../pages/admin/ApplicationDetail";
import { 
  AdminGroups, AdminLeave, AdminAnnouncements, AdminImports, 
  ActivityList, FormBuilder 
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
    path: "/admin/applications/:id", 
    element: (
      <RoleGuard allowedRoles={["ACTIVITY_ADMIN", "SUPER_ADMIN"]}>
        <ApplicationDetail />
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
