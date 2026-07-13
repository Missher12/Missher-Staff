import { mockApiAdapter } from "./mock-adapter";
import * as ApiTypes from "./types";

const isMock = () => {
  return import.meta.env.VITE_API_MODE === "mock" || !import.meta.env.VITE_API_MODE;
};

export const apiClient = {
  // --- AUTH ---
  async login(phone: string, idCardSuffix: string) {
    if (isMock()) {
      return mockApiAdapter.login(phone, idCardSuffix);
    }
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, idCardSuffix })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async register(phone: string, idCard: string, name: string, gender: "MALE" | "FEMALE") {
    if (isMock()) {
      return mockApiAdapter.register(phone, idCard, name, gender);
    }
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, idCard, name, gender })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  // --- ACTIVITIES ---
  async getActivities() {
    if (isMock()) return mockApiAdapter.getActivities();
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/activities`);
    return (await res.json()).data;
  },

  async getActivity(id: string) {
    if (isMock()) return mockApiAdapter.getActivity(id);
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/activities/${id}`);
    return (await res.json()).data;
  },

  async createActivity(activity: any) {
    if (isMock()) return mockApiAdapter.createActivity(activity);
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/activities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(activity)
    });
    return (await res.json()).data;
  },

  async copyActivity(id: string) {
    if (isMock()) return mockApiAdapter.copyActivity(id);
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/activities/${id}/copy`, {
      method: "POST"
    });
    return (await res.json()).data;
  },

  // --- APPLICATIONS ---
  async getApplications(filters: any) {
    if (isMock()) return mockApiAdapter.getApplications(filters);
    const params = new URLSearchParams(filters).toString();
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/applications?${params}`);
    return (await res.json()).data;
  },

  async getApplicationById(id: string) {
    if (isMock()) return mockApiAdapter.getApplicationById(id);
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/applications/${id}`);
    return (await res.json()).data;
  },

  async submitApplication(userId: string, data: any) {
    if (isMock()) return mockApiAdapter.submitApplication(userId, data);
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...data })
    });
    return (await res.json()).data;
  },

  async updateApplicationStatus(id: string, status: any, comment: string, operatorName: string) {
    if (isMock()) return mockApiAdapter.updateApplicationStatus(id, status, comment, operatorName);
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/applications/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, comment, operatorName })
    });
    return (await res.json()).data;
  },

  // --- INTERVIEWS ---
  async getInterviewSlots(activityId?: string) {
    if (isMock()) return mockApiAdapter.getInterviewSlots(activityId);
    const url = activityId ? `${import.meta.env.VITE_API_BASE_URL}/interviews?activityId=${activityId}` : `${import.meta.env.VITE_API_BASE_URL}/interviews`;
    const res = await fetch(url);
    return (await res.json()).data;
  },

  async bookInterview(applicationId: string, slotId: string, userId: string) {
    if (isMock()) return mockApiAdapter.bookInterview(applicationId, slotId, userId);
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/interviews/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId, slotId, userId })
    });
    return (await res.json()).success;
  },

  async generateInterviewToken(userId: string, slotId: string, activityId: string) {
    if (isMock()) return mockApiAdapter.generateInterviewToken(userId, slotId, activityId);
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/interviews/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, slotId, activityId })
    });
    return (await res.json()).data;
  },

  async checkinInterview(tokenOrSlotId: string, operatorIdOrApplicant: string, maybeOperatorId?: string) {
    if (isMock()) return mockApiAdapter.checkinInterview(tokenOrSlotId, operatorIdOrApplicant, maybeOperatorId);
    const body = maybeOperatorId 
      ? { slotId: tokenOrSlotId, applicantPhoneOrId: operatorIdOrApplicant, operatorId: maybeOperatorId }
      : { token: tokenOrSlotId, operatorId: operatorIdOrApplicant };
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/interviews/checkin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    return (await res.json()).data;
  },

  async submitInterviewReview(applicationId: string, rating: any, comment: string, leaderId: string) {
    if (isMock()) return mockApiAdapter.submitInterviewReview(applicationId, rating, comment, leaderId);
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/interviews/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId, rating, comment, leaderId })
    });
    return (await res.json()).success;
  },

  // --- FINAL ADMISSIONS ---
  async finalAdmission(applicationId: string, status: "EMPLOYED" | "REJECTED", groupId?: string, positionId?: string, assignedDates?: string[], adminId?: string) {
    if (isMock()) return mockApiAdapter.finalAdmission(applicationId, status, groupId, positionId, assignedDates, adminId);
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId, status, groupId, positionId, assignedDates, adminId })
    });
    return (await res.json()).success;
  },

  // --- ATTENDANCE ---
  async getAttendanceRecords(filters: any) {
    if (isMock()) return mockApiAdapter.getAttendanceRecords(filters);
    const params = new URLSearchParams(filters).toString();
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/attendance?${params}`);
    return (await res.json()).data;
  },

  async getAttendanceById(id: string) {
    if (isMock()) return mockApiAdapter.getAttendanceById(id);
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/attendance/${id}`);
    return (await res.json()).data;
  },

  async getAttendanceCorrections(attendanceId?: string) {
    if (isMock()) return mockApiAdapter.getAttendanceCorrections(attendanceId);
    const url = attendanceId ? `${import.meta.env.VITE_API_BASE_URL}/attendance-corrections?attendanceId=${attendanceId}` : `${import.meta.env.VITE_API_BASE_URL}/attendance-corrections`;
    const res = await fetch(url);
    return (await res.json()).data;
  },

  async submitAttendance(userId: string, data: any) {
    if (isMock()) return mockApiAdapter.submitAttendance(userId, data);
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/attendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...data })
    });
    return (await res.json()).data;
  },

  async correctAttendance(attendanceId: string, update: any, operatorId: string, operatorName: string) {
    if (isMock()) return mockApiAdapter.correctAttendance(attendanceId, update, operatorId, operatorName);
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/attendance/${attendanceId}/correct`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ update, operatorId, operatorName })
    });
    return (await res.json()).data;
  },

  // --- LEAVE SUGGESTIONS & REQUESTS ---
  async getLeaveRequests(filters: any) {
    if (isMock()) return mockApiAdapter.getLeaveRequests(filters);
    const params = new URLSearchParams(filters).toString();
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/leaves?${params}`);
    return (await res.json()).data;
  },

  async submitLeaveRequest(userId: string, leave: any) {
    if (isMock()) return mockApiAdapter.submitLeaveRequest(userId, leave);
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/leaves`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...leave })
    });
    return (await res.json()).data;
  },

  async auditLeaveRequest(id: string, status: string, comment: string, auditorId: string, role: string) {
    if (isMock()) return mockApiAdapter.auditLeaveRequest(id, status as any, comment, auditorId, role);
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/leaves/${id}/audit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, comment, auditorId, role })
    });
    return (await res.json()).data;
  },

  // --- ANNOUNCEMENTS ---
  async getAnnouncements() {
    if (isMock()) return mockApiAdapter.getAnnouncements();
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/announcements`);
    return (await res.json()).data;
  },

  async createAnnouncement(ann: any) {
    if (isMock()) return mockApiAdapter.createAnnouncement(ann);
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/announcements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ann)
    });
    return (await res.json()).data;
  },

  async confirmAnnouncement(announcementId: string, userId: string) {
    if (isMock()) return mockApiAdapter.confirmAnnouncement(announcementId, userId);
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/announcements/${announcementId}/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId })
    });
    return (await res.json()).success;
  },

  // --- GROUPS ---
  async getGroups(activityId?: string) {
    if (isMock()) return mockApiAdapter.getGroups(activityId);
    const url = activityId ? `${import.meta.env.VITE_API_BASE_URL}/groups?activityId=${activityId}` : `${import.meta.env.VITE_API_BASE_URL}/groups`;
    const res = await fetch(url);
    return (await res.json()).data;
  },

  async createGroup(activityId: string, name: string, leaderId: string) {
    if (isMock()) return mockApiAdapter.createGroup(activityId, name, leaderId);
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/groups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activityId, name, leaderId })
    });
    return (await res.json()).data;
  },

  // --- AUDIT LOGS ---
  async getAuditLogs() {
    if (isMock()) return mockApiAdapter.getAuditLogs();
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/audit-logs`);
    return (await res.json()).data;
  },

  // --- INVITATIONS ---
  async getInviteLinks(activityId: string) {
    if (isMock()) return mockApiAdapter.getInviteLinks(activityId);
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/invite-links?activityId=${activityId}`);
    return (await res.json()).data;
  },

  async createInviteLink(activityId: string, groupId: string, creatorId: string) {
    if (isMock()) return mockApiAdapter.createInviteLink(activityId, groupId, creatorId);
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/invite-links`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activityId, groupId, creatorId })
    });
    return (await res.json()).data;
  },

  // --- CORRECTION SUGGESTIONS ---
  async getCorrectionSuggestions(filters: any) {
    if (isMock()) return mockApiAdapter.getCorrectionSuggestions(filters);
    const params = new URLSearchParams(filters).toString();
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/corrections?${params}`);
    return (await res.json()).data;
  },

  async submitCorrectionSuggestion(attendanceId: string, leaderId: string, update: any) {
    if (isMock()) return mockApiAdapter.submitCorrectionSuggestion(attendanceId, leaderId, update);
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/corrections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attendanceId, leaderId, ...update })
    });
    return (await res.json()).data;
  },

  async approveCorrectionSuggestion(suggestionId: string, status: "APPROVED" | "REJECTED", adminId: string) {
    if (isMock()) return mockApiAdapter.approveCorrectionSuggestion(suggestionId, status, adminId);
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/corrections/${suggestionId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminId })
    });
    return (await res.json()).success;
  }
};
