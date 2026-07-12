import React from "react";
import { StaffDashboard } from "../../pages/staff/StaffDashboard";
import { AttendanceCheck } from "../../pages/staff/AttendanceCheck";
import { AttendanceHistory } from "../../pages/staff/AttendanceHistory";
import { 
  StaffQrCode, StaffWorkDates, StaffGroup, StaffLeave, 
  StaffAnnouncements, StaffProfile, StaffSecurity 
} from "../../pages/staff/StaffPages";
import { RoleGuard } from "../guards/Guards";
import { RouteConfig } from "./public.routes";

export const staffRoutes: RouteConfig[] = [
  { 
    path: "/staff/dashboard", 
    element: (
      <RoleGuard allowedRoles={["STAFF"]}>
        <StaffDashboard />
      </RoleGuard>
    )
  },
  { 
    path: "/staff/attendance/check", 
    element: (
      <RoleGuard allowedRoles={["STAFF"]}>
        <AttendanceCheck />
      </RoleGuard>
    )
  },
  { 
    path: "/staff/attendance", 
    element: (
      <RoleGuard allowedRoles={["STAFF"]}>
        <AttendanceHistory />
      </RoleGuard>
    )
  },
  { 
    path: "/staff/attendance/:attendanceId", 
    element: (
      <RoleGuard allowedRoles={["STAFF"]}>
        <AttendanceHistory />
      </RoleGuard>
    )
  },
  { 
    path: "/staff/qrcode", 
    element: (
      <RoleGuard allowedRoles={["STAFF"]}>
        <StaffQrCode />
      </RoleGuard>
    )
  },
  { 
    path: "/staff/work-dates", 
    element: (
      <RoleGuard allowedRoles={["STAFF"]}>
        <StaffWorkDates />
      </RoleGuard>
    )
  },
  { 
    path: "/staff/group", 
    element: (
      <RoleGuard allowedRoles={["STAFF"]}>
        <StaffGroup />
      </RoleGuard>
    )
  },
  { 
    path: "/staff/leave", 
    element: (
      <RoleGuard allowedRoles={["STAFF"]}>
        <StaffLeave />
      </RoleGuard>
    )
  },
  { 
    path: "/staff/announcements", 
    element: (
      <RoleGuard allowedRoles={["STAFF"]}>
        <StaffAnnouncements />
      </RoleGuard>
    )
  },
  { 
    path: "/staff/profile", 
    element: (
      <RoleGuard allowedRoles={["STAFF"]}>
        <StaffProfile />
      </RoleGuard>
    )
  },
  { 
    path: "/staff/security", 
    element: (
      <RoleGuard allowedRoles={["STAFF"]}>
        <StaffSecurity />
      </RoleGuard>
    )
  },
];
