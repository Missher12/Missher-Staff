import React from "react";
import { 
  LeaderDashboard, LeaderMembers, LeaderInterviewScan, 
  LeaderLeaveReviews, LeaderCorrectionSuggestions 
} from "../../pages/leader/LeaderPages";
import { RoleGuard } from "../guards/Guards";
import { RouteConfig } from "./public.routes";

export const leaderRoutes: RouteConfig[] = [
  { 
    path: "/leader", 
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
    path: "/leader/scan", 
    element: (
      <RoleGuard allowedRoles={["LEADER"]}>
        <LeaderInterviewScan />
      </RoleGuard>
    )
  },
  { 
    path: "/leader/leaves", 
    element: (
      <RoleGuard allowedRoles={["LEADER"]}>
        <LeaderLeaveReviews />
      </RoleGuard>
    )
  },
  { 
    path: "/leader/correction", 
    element: (
      <RoleGuard allowedRoles={["LEADER"]}>
        <LeaderCorrectionSuggestions />
      </RoleGuard>
    )
  },
];
