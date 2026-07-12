import React from "react";
import { Login } from "../../pages/public/Login";
import { ActivityApply } from "../../pages/public/ActivityApply";
import { ApplicationForm } from "../../pages/public/ApplicationForm";

export interface RouteConfig {
  path: string;
  element: React.ReactNode;
}

export const publicRoutes: RouteConfig[] = [
  { path: "/login", element: <Login /> },
  { path: "/activities/:activityId/apply", element: <ActivityApply /> },
  { path: "/activities/:activityId/application-form", element: <ApplicationForm /> },
];
