import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { AttendanceStatus, AttendanceRecord } from "../types";

// --- ATTENDANCE ---

export function useAttendanceRecords(filters: {
  activityId?: string;
  groupId?: string;
  date?: string;
  userId?: string;
  status?: AttendanceStatus;
  onlyRisky?: boolean;
  search?: string;
}) {
  return useQuery({
    queryKey: ["attendanceRecords", filters],
    queryFn: () => apiClient.getAttendanceRecords(filters),
    refetchInterval: 10000, // Optional: Poll every 10s for live-feel
  });
}

export function useAttendanceById(id: string) {
  return useQuery({
    queryKey: ["attendance", id],
    queryFn: () => apiClient.getAttendanceById(id),
    enabled: !!id,
  });
}

export function useAttendanceCorrections(attendanceId?: string) {
  return useQuery({
    queryKey: ["attendanceCorrections", attendanceId],
    queryFn: () => apiClient.getAttendanceCorrections(attendanceId),
  });
}

export function useSubmitAttendanceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: any }) =>
      apiClient.submitAttendance(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendanceRecords"] });
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
}

export function useCorrectAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      attendanceId,
      update,
      operatorId,
      operatorName,
    }: {
      attendanceId: string;
      update: {
        status: AttendanceStatus;
        checkInTime?: string;
        checkOutTime?: string;
        reason: string;
      };
      operatorId: string;
      operatorName: string;
    }) => apiClient.correctAttendance(attendanceId, update, operatorId, operatorName),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["attendanceRecords"] });
      queryClient.invalidateQueries({ queryKey: ["attendance", variables.attendanceId] });
      queryClient.invalidateQueries({ queryKey: ["attendanceCorrections"] });
    },
  });
}

export function useSubmitCorrectionSuggestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      attendanceId,
      leaderId,
      update,
    }: {
      attendanceId: string;
      leaderId: string;
      update: {
        suggestedStatus: AttendanceStatus;
        suggestedTime?: string;
        type: "CHECK_IN" | "CHECK_OUT";
        reason: string;
      };
    }) => apiClient.submitCorrectionSuggestion(attendanceId, leaderId, update),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendanceRecords"] });
      queryClient.invalidateQueries({ queryKey: ["correctionSuggestions"] });
    },
  });
}

export function useCorrectionSuggestions(filters: { leaderId?: string; status?: "PENDING" | "APPROVED" | "REJECTED" }) {
  return useQuery({
    queryKey: ["correctionSuggestions", filters],
    queryFn: () => apiClient.getCorrectionSuggestions(filters),
  });
}

export function useApproveCorrectionSuggestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      suggestionId,
      status,
      adminId,
    }: {
      suggestionId: string;
      status: "APPROVED" | "REJECTED";
      adminId: string;
    }) => apiClient.approveCorrectionSuggestion(suggestionId, status, adminId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendanceRecords"] });
      queryClient.invalidateQueries({ queryKey: ["correctionSuggestions"] });
    },
  });
}

// --- GROUPS ---

export function useGroups(activityId?: string) {
  return useQuery({
    queryKey: ["groups", activityId],
    queryFn: () => apiClient.getGroups(activityId),
  });
}

// --- APPLICATIONS & ADMISSIONS ---

export function useApplications(filters: any) {
  return useQuery({
    queryKey: ["applications", filters],
    queryFn: async () => {
      const res = await apiClient.getApplications(filters);
      if (Array.isArray(res)) {
        return res;
      }
      if (res && Array.isArray(res.items)) {
        return res.items;
      }
      return [];
    },
  });
}

export function useFinalAdmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      applicationId,
      status,
      groupId,
      positionId,
      assignedDates,
      adminId,
    }: {
      applicationId: string;
      status: "EMPLOYED" | "REJECTED";
      groupId?: string;
      positionId?: string;
      assignedDates?: string[];
      adminId?: string;
    }) => apiClient.finalAdmission(applicationId, status, groupId, positionId, assignedDates, adminId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["attendanceRecords"] });
    },
  });
}

// --- INTERVIEWS ---

export function useInterviewCheckin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      tokenOrSlotId,
      operatorIdOrApplicant,
      maybeOperatorId,
    }: {
      tokenOrSlotId: string;
      operatorIdOrApplicant: string;
      maybeOperatorId?: string;
    }) => apiClient.checkinInterview(tokenOrSlotId, operatorIdOrApplicant, maybeOperatorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["interviewSlots"] });
    },
  });
}

export function useInterviewSlots() {
  return useQuery({
    queryKey: ["interviewSlots"],
    queryFn: () => apiClient.getInterviewSlots(),
  });
}

// --- INVITE LINKS ---

export function useInviteLinks(activityId: string) {
  return useQuery({
    queryKey: ["inviteLinks", activityId],
    queryFn: () => apiClient.getInviteLinks(activityId),
    enabled: !!activityId,
  });
}

export function useCreateInviteLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      activityId,
      groupId,
      creatorId,
    }: {
      activityId: string;
      groupId: string;
      creatorId: string;
    }) => apiClient.createInviteLink(activityId, groupId, creatorId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["inviteLinks", variables.activityId] });
    },
  });
}

// --- ANNOUNCEMENTS ---

export function useAnnouncements() {
  return useQuery({
    queryKey: ["announcements"],
    queryFn: () => apiClient.getAnnouncements(),
  });
}

export function useConfirmAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      announcementId,
      userId,
    }: {
      announcementId: string;
      userId: string;
    }) => apiClient.confirmAnnouncement(announcementId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ann: any) => apiClient.createAnnouncement(ann),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
}

// --- LEAVE REQUESTS ---

export function useLeaveRequests(filters: {
  activityId?: string;
  userId?: string;
  status?: "PENDING_LEADER" | "PENDING_ADMIN" | "APPROVED" | "REJECTED";
}) {
  return useQuery({
    queryKey: ["leaveRequests", filters],
    queryFn: () => apiClient.getLeaveRequests(filters),
  });
}

export function useSubmitLeaveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, leave }: { userId: string; leave: any }) =>
      apiClient.submitLeaveRequest(userId, leave),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
    },
  });
}

export function useAuditLeaveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      comment,
      auditorId,
      role,
    }: {
      id: string;
      status: string;
      comment: string;
      auditorId: string;
      role: string;
    }) => apiClient.auditLeaveRequest(id, status, comment, auditorId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
      queryClient.invalidateQueries({ queryKey: ["attendanceRecords"] });
    },
  });
}

// --- INTERVIEW REVIEW ---

export function useSubmitInterviewReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      applicationId,
      rating,
      comment,
      leaderId,
    }: {
      applicationId: string;
      rating: "RECOMMENDED" | "WAITING" | "NOT_RECOMMENDED";
      comment: string;
      leaderId: string;
    }) => apiClient.submitInterviewReview(applicationId, rating, comment, leaderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });
}

// --- GROUPS CREATION ---

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      activityId,
      name,
      leaderId,
    }: {
      activityId: string;
      name: string;
      leaderId: string;
    }) => apiClient.createGroup(activityId, name, leaderId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["groups", variables.activityId] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

// --- INTERVIEW SLOTS ---

export function useCreateInterviewSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slot: any) => {
      // In mock DB, we can append to db.interviewSlots directly via adapter/mockDb if needed
      // Or define createInterviewSlot in apiClient
      // Let's check if apiClient.createInterviewSlot is needed or already exists.
      // Wait, let's look at client.ts or mock-adapter.ts to see if it supports creating slots.
      // If mockApiAdapter has it, we can call it. Let's make sure.
      return apiClient.createInterviewSlot ? (apiClient as any).createInterviewSlot(slot) : Promise.resolve(slot);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interviewSlots"] });
    },
  });
}

// --- PEOPLE ---

export function usePeople() {
  return useQuery({
    queryKey: ["people"],
    queryFn: () => apiClient.getPeople(),
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      apiClient.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

