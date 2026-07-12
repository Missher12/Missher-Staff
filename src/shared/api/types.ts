import { ApiResponse, PaginatedResponse, Role, User, Activity, Application, InterviewSlot, AttendanceRecord, Group, Announcement, LeaveRequest, CorrectionSuggestion, InviteLink, Notification, AuditLog } from "../types";

export * from "../types";

export interface LoginRequest {
  phone: string;
  idCardSuffix: string;
}

export interface RegisterRequest {
  phone: string;
  idCard: string;
  name: string;
  gender: "MALE" | "FEMALE";
}

export interface ApplicationSubmitRequest {
  activityId: string;
  availableDates: string[];
  experience: string;
  targetPositions: string[];
}

export interface InterviewBookRequest {
  applicationId: string;
  slotId: string;
}

export interface AttendanceSubmitRequest {
  activityId: string;
  date: string;
  time: string;
  photo: string;
  location: string;
  distance: number;
  type: "CHECK_IN" | "CHECK_OUT";
}

export interface ReviewApplicationRequest {
  status: "APPROVED" | "WAITLIST" | "REJECTED";
  comment: string;
}

export interface GroupCreateRequest {
  name: string;
  activityId: string;
  leaderId: string;
}
