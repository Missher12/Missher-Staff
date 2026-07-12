export const queryKeys = {
  auth: {
    user: ["auth", "user"] as const,
  },
  activities: {
    list: () => ["activities", "list"] as const,
    detail: (id: string) => ["activities", "detail", id] as const,
  },
  applications: {
    list: (filters: any) => ["applications", "list", filters] as const,
    detail: (id: string) => ["applications", "detail", id] as const,
  },
  interviews: {
    slots: (activityId?: string) => ["interviews", "slots", activityId] as const,
  },
  attendance: {
    list: (filters: any) => ["attendance", "list", filters] as const,
    detail: (id: string) => ["attendance", "detail", id] as const,
    suggestions: (filters: any) => ["attendance", "suggestions", filters] as const,
  },
  leaves: {
    list: (filters: any) => ["leaves", "list", filters] as const,
  },
  announcements: {
    list: ["announcements", "list"] as const,
  },
  groups: {
    list: (activityId?: string) => ["groups", "list", activityId] as const,
  },
  auditLogs: {
    list: ["audit-logs"] as const,
  },
  inviteLinks: {
    list: (activityId: string) => ["invite-links", "list", activityId] as const,
  }
};
