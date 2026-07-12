import React from "react";
import { 
  LeaderDashboard, LeaderMembers, LeaderInterviewScan, 
  LeaderLeaveReviews, LeaderCorrectionSuggestions,
  LeaderAttendance, LeaderInterviewReviews, LeaderInviteLinks,
  LeaderTransferSuggestions, LeaderAnnouncements
} from "../../pages/leader/LeaderPages";
import { RoleGuard } from "../guards/Guards";
import { RouteConfig } from "./public.routes";

export const leaderRoutes: RouteConfig[] = [
  { 
    path: "/leader/dashboard", 
    element: (
      <RoleGuard allowedRoles={["LEADER"]}>
        <LeaderDashboard />
      </RoleGuard>
    )
  },
  { 
    path: "/leader/members", 
    element: (
      <RoleGuard allowedRoles={["LEADER"]}>
        <LeaderMembers />
      </RoleGuard>
    )
  },
  { 
    path: "/leader/interview-scan", 
    element: (
      <RoleGuard allowedRoles={["LEADER"]}>
        <LeaderInterviewScan />
      </RoleGuard>
    )
  },
  { 
    path: "/leader/leave-reviews", 
    element: (
      <RoleGuard allowedRoles={["LEADER"]}>
        <LeaderLeaveReviews />
      </RoleGuard>
    )
  },
  { 
    path: "/leader/correction-suggestions", 
    element: (
      <RoleGuard allowedRoles={["LEADER"]}>
        <LeaderCorrectionSuggestions />
      </RoleGuard>
    )
  },
  { 
    path: "/leader/attendance", 
    element: (
      <RoleGuard allowedRoles={["LEADER"]}>
        <LeaderAttendance />
      </RoleGuard>
    )
  },
  { 
    path: "/leader/attendance/:attendanceId", 
    element: (
      <RoleGuard allowedRoles={["LEADER"]}>
        <LeaderAttendance />
      </RoleGuard>
    )
  },
  { 
    path: "/leader/interview-reviews", 
    element: (
      <RoleGuard allowedRoles={["LEADER"]}>
        <LeaderInterviewReviews />
      </RoleGuard>
    )
  },
  { 
    path: "/leader/invite-links", 
    element: (
      <RoleGuard allowedRoles={["LEADER"]}>
        <LeaderInviteLinks />
      </RoleGuard>
    )
  },
  { 
    path: "/leader/transfer-suggestions", 
    element: (
      <RoleGuard allowedRoles={["LEADER"]}>
        <LeaderTransferSuggestions />
      </RoleGuard>
    )
  },
  { 
    path: "/leader/announcements", 
    element: (
      <RoleGuard allowedRoles={["LEADER"]}>
        <LeaderAnnouncements />
      </RoleGuard>
    )
  },
];
