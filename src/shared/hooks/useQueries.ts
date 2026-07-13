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
    queryFn: () => apiClient.getApplications(filters),
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
