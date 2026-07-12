import React from "react";
import { ApplicantDashboard } from "../../pages/applicant/ApplicantDashboard";
import { InterviewQrCode } from "../../pages/applicant/InterviewQrCode";
import { ApplicantProfile, ApplicantInterview, ApplicantNotifications } from "../../pages/applicant/ApplicantPages";
import { RoleGuard } from "../guards/Guards";
import { RouteConfig } from "./public.routes";

export const applicantRoutes: RouteConfig[] = [
  { 
    path: "/applicant", 
    element: (
      <RoleGuard allowedRoles={["APPLICANT"]}>
        <ApplicantDashboard />
      </RoleGuard>
    )
  },
  { 
    path: "/applicant/profile", 
    element: (
      <RoleGuard allowedRoles={["APPLICANT"]}>
        <ApplicantProfile />
      </RoleGuard>
    )
  },
  { 
    path: "/applicant/interview", 
    element: (
      <RoleGuard allowedRoles={["APPLICANT"]}>
        <ApplicantInterview />
      </RoleGuard>
    )
  },
  { 
    path: "/applicant/qrcode", 
    element: (
      <RoleGuard allowedRoles={["APPLICANT"]}>
        <InterviewQrCode />
      </RoleGuard>
    )
  },
  { 
    path: "/applicant/notifications", 
    element: (
      <RoleGuard allowedRoles={["APPLICANT"]}>
        <ApplicantNotifications />
      </RoleGuard>
    )
  },
];
