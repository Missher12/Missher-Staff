import React from "react";
import { 
  SuperAdminDashboard, SuperAdminActivities, SuperAdminAdministrators, 
  SuperAdminGlobalSettings, SuperAdminAuditLogs, SuperAdminSystemHealth 
} from "../../pages/super-admin/SuperAdminPages";
import { RoleGuard } from "../guards/Guards";
import { RouteConfig } from "./public.routes";

export const superAdminRoutes: RouteConfig[] = [
  { 
    path: "/super-admin", 
    element: (
      <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
        <SuperAdminDashboard />
      </RoleGuard>
    )
  },
  { 
    path: "/super-admin/dashboard", 
    element: (
      <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
        <SuperAdminDashboard />
      </RoleGuard>
    )
  },
  { 
    path: "/super-admin/activities", 
    element: (
      <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
        <SuperAdminActivities />
      </RoleGuard>
    )
  },
  { 
    path: "/super-admin/administrators", 
    element: (
      <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
        <SuperAdminAdministrators />
      </RoleGuard>
    )
  },
  { 
    path: "/super-admin/global-settings", 
    element: (
      <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
        <SuperAdminGlobalSettings />
      </RoleGuard>
    )
  },
  { 
    path: "/super-admin/audit-logs", 
    element: (
      <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
        <SuperAdminAuditLogs />
      </RoleGuard>
    )
  },
  { 
    path: "/super-admin/system-health", 
    element: (
      <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
        <SuperAdminSystemHealth />
      </RoleGuard>
    )
  },
];
