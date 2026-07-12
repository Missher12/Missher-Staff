import { create } from "zustand";
import { Activity, Application, InterviewSlot, AttendanceRecord, Group, Announcement, AttendanceStatus, ApplicationStatus, InterviewStatus, EmploymentStatus } from "../../shared/types";
import { mockActivities, mockApplications, mockInterviewSlots, mockGroups, mockAttendanceRecords, mockAnnouncements, mockUsers } from "../../shared/mocks/data";

interface EventState {
  activities: Activity[];
  applications: Application[];
  interviewSlots: InterviewSlot[];
  groups: Group[];
  attendanceRecords: AttendanceRecord[];
  announcements: Announcement[];

  // 报名人员操作
  submitApplication: (appData: Omit<Application, "id" | "submittedAt" | "status" | "interviewStatus" | "employmentStatus" | "auditHistory">) => Promise<Application>;
  bookInterview: (applicationId: string, slotId: string) => Promise<boolean>;

  // STAFF 操作
  submitAttendance: (recordData: Omit<AttendanceRecord, "id" | "riskLevel" | "status">) => Promise<AttendanceRecord>;
  confirmAnnouncement: (announcementId: string, userId: string) => void;

  // 管理员审核操作
  auditApplication: (applicationId: string, status: ApplicationStatus, operatorName: string, comment: string) => void;
  evaluateInterview: (applicationId: string, interviewStatus: InterviewStatus, comment: string) => void;
  employStaff: (applicationId: string, isEmployed: boolean, groupName?: string, positionName?: string) => void;

  // 面试扫码签到 (通过二维码签到)
  scanInterviewQrCode: (userId: string, slotId: string) => Promise<{ success: boolean; message: string }>;

  // 补卡/打卡管理
  updateAttendanceStatus: (recordId: string, status: AttendanceStatus) => void;

  // 面试场次创建
  createInterviewSlot: (slot: Omit<InterviewSlot, "id" | "reservedCount" | "attendedCount">) => void;
}

export const useEventStore = create<EventState>((set, get) => {
  return {
    activities: mockActivities,
    applications: mockApplications,
    interviewSlots: mockInterviewSlots,
    groups: mockGroups,
    attendanceRecords: mockAttendanceRecords,
    announcements: mockAnnouncements,

    submitApplication: async (appData) => {
      const newApp: Application = {
        ...appData,
        id: `APP_${Date.now()}`,
        status: "SUBMITTED",
        interviewStatus: "UNSCHEDULED",
        employmentStatus: "PENDING",
        submittedAt: new Date().toISOString().replace("T", " ").substring(0, 19),
        auditHistory: [
          {
            status: "SUBMITTED",
            operatorName: appData.userName,
            comment: "新报名提交",
            time: new Date().toISOString().replace("T", " ").substring(0, 19)
          }
        ]
      };

      set((state) => ({
        applications: [newApp, ...state.applications]
      }));

      return newApp;
    },

    bookInterview: async (applicationId, slotId) => {
      const { interviewSlots, applications } = get();
      const slot = interviewSlots.find(s => s.id === slotId);
      const app = applications.find(a => a.id === applicationId);

      if (!slot || !app || slot.reservedCount >= slot.limit) {
        return false;
      }

      // 更新场次预约人数
      const updatedSlots = interviewSlots.map(s => {
        if (s.id === slotId) {
          return { ...s, reservedCount: s.reservedCount + 1 };
        }
        return s;
      });

      // 更新报名件的面试状态
      const updatedApps = applications.map(a => {
        if (a.id === applicationId) {
          return {
            ...a,
            status: "APPROVED" as ApplicationStatus,
            interviewStatus: "SCHEDULED" as InterviewStatus,
            comment: `已预约面试：${slot.date} ${slot.timeRange} @ ${slot.location}`
          };
        }
        return a;
      });

      set({ interviewSlots: updatedSlots, applications: updatedApps });
      return true;
    },

    submitAttendance: async (recordData) => {
      const { attendanceRecords } = get();

      // 判断是否有迟到风险
      // 假设 09:00 之后打卡算 LATE
      const checkHour = recordData.checkInTime ? parseInt(recordData.checkInTime.split(":")[0]) : 0;
      const checkMinute = recordData.checkInTime ? parseInt(recordData.checkInTime.split(":")[1]) : 0;
      const isLate = checkHour > 9 || (checkHour === 9 && checkMinute > 0);

      // 计算位置风险
      const isOutRange = (recordData.checkInDistance ?? 0) > 100;

      let status: AttendanceStatus = "NORMAL";
      let riskLevel: "LOW" | "MEDIUM" | "HIGH" = "LOW";
      let riskReason = "";

      if (isLate) {
        status = "LATE";
      }

      if (isOutRange) {
        status = "EXCEPTIONAL";
        riskLevel = "HIGH";
        riskReason = "打卡坐标超出场馆范围（距离 > 100米）";
      } else if (isLate) {
        riskLevel = "MEDIUM";
        riskReason = "迟于今日规定签到时间打卡";
      }

      // 看看今天是否已经打过卡了 (如果是签退则更新已有的)
      const existingIdx = attendanceRecords.findIndex(r => r.userId === recordData.userId && r.date === recordData.date);

      let record: AttendanceRecord;

      if (existingIdx !== -1) {
        // 签退
        const oldRecord = attendanceRecords[existingIdx];
        record = {
          ...oldRecord,
          checkOutTime: recordData.checkOutTime || oldRecord.checkOutTime,
          checkOutPhoto: recordData.checkOutPhoto || oldRecord.checkOutPhoto,
          checkOutLocation: recordData.checkOutLocation || oldRecord.checkOutLocation,
          checkOutDistance: recordData.checkOutDistance ?? oldRecord.checkOutDistance,
          status: oldRecord.status === "LATE" ? "LATE" : (isOutRange ? "EXCEPTIONAL" : "NORMAL")
        };

        const updated = [...attendanceRecords];
        updated[existingIdx] = record;
        set({ attendanceRecords: updated });
      } else {
        // 签到
        record = {
          ...recordData,
          id: `ATT_${Date.now()}`,
          status,
          riskLevel,
          riskReason
        };
        set({ attendanceRecords: [record, ...attendanceRecords] });
      }

      return record;
    },

    confirmAnnouncement: (announcementId, userId) => {
      set((state) => ({
        announcements: state.announcements.map((ann) => {
          if (ann.id === announcementId) {
            if (!ann.confirmedUserIds.includes(userId)) {
              return { ...ann, confirmedUserIds: [...ann.confirmedUserIds, userId] };
            }
          }
          return ann;
        })
      }));
    },

    auditApplication: (applicationId, status, operatorName, comment) => {
      set((state) => ({
        applications: state.applications.map((app) => {
          if (app.id === applicationId) {
            return {
              ...app,
              status,
              comment,
              auditHistory: [
                ...app.auditHistory,
                {
                  status,
                  operatorName,
                  comment,
                  time: new Date().toISOString().replace("T", " ").substring(0, 19)
                }
              ]
            };
          }
          return app;
        })
      }));
    },

    evaluateInterview: (applicationId, interviewStatus, comment) => {
      set((state) => ({
        applications: state.applications.map((app) => {
          if (app.id === applicationId) {
            return {
              ...app,
              interviewStatus,
              comment
            };
          }
          return app;
        })
      }));
    },

    employStaff: (applicationId, isEmployed, groupName = "后勤机动组", positionName = "后勤机动岗") => {
      const { applications, groups, activities } = get();
      const app = applications.find(a => a.id === applicationId);
      if (!app) return;

      const updatedApps = applications.map((a) => {
        if (a.id === applicationId) {
          return {
            ...a,
            employmentStatus: (isEmployed ? "EMPLOYED" : "REJECTED") as EmploymentStatus,
            comment: isEmployed ? `审核终审通过，已录用并分配到 [${groupName}] - [${positionName}]` : "终审未通过"
          };
        }
        return a;
      });

      // 如果录用了，要把这个人设为 STAFF 并加入到小组中去
      if (isEmployed) {
        // 查找这个用户，把他的角色改写为 STAFF 角色
        const u = mockUsers.find((user: any) => user.id === app.userId);
        if (u) {
          u.role = "STAFF";
        }

        // 同时在 db 实例中也把其角色改写为 STAFF
        import("../../shared/api/mock-adapter").then(({ db }) => {
          const du = db.users.find(user => user.id === app.userId);
          if (du) {
            du.role = "STAFF";
          }
        });

        // 检查这个 Group 是否存在，不存在就新建一个
        const groupExists = groups.find(g => g.name === groupName);
        let updatedGroups = [...groups];

        if (groupExists) {
          updatedGroups = groups.map(g => {
            if (g.name === groupName) {
              return { ...g, memberIds: Array.from(new Set([...g.memberIds, app.userId])) };
            }
            return g;
          });
        } else {
          updatedGroups.push({
            id: `GRP_${Date.now()}`,
            activityId: app.activityId,
            name: groupName,
            leaderId: "U_LEADER",
            leaderName: "陈大伟",
            leaderPhone: "13511112222",
            memberIds: [app.userId]
          });
        }

        set({ applications: updatedApps, groups: updatedGroups });
      } else {
        set({ applications: updatedApps });
      }
    },

    scanInterviewQrCode: async (userId, slotId) => {
      const { interviewSlots, applications } = get();
      const slot = interviewSlots.find(s => s.id === slotId);
      if (!slot) return { success: false, message: "找不到该面试场次" };

      const app = applications.find(a => a.userId === userId && a.activityId === slot.activityId);
      if (!app) return { success: false, message: "找不到该用户的报名表信息" };

      // 更新报名表的面试状态为“已到场/面试完成”
      const updatedApps = applications.map(a => {
        if (a.id === app.id) {
          return { ...a, interviewStatus: "ATTENDED" as InterviewStatus, comment: "已签到完成，进入候考区" };
        }
        return a;
      });

      // 增加面试签到数
      const updatedSlots = interviewSlots.map(s => {
        if (s.id === slotId) {
          return { ...s, attendedCount: s.attendedCount + 1 };
        }
        return s;
      });

      set({ applications: updatedApps, interviewSlots: updatedSlots });
      return { success: true, message: `签到成功：${app.userName} 已登记进入 ${slot.timeRange} 场次。` };
    },

    updateAttendanceStatus: (recordId, status) => {
      set((state) => ({
        attendanceRecords: state.attendanceRecords.map((r) => {
          if (r.id === recordId) {
            return { ...r, status, riskLevel: status === "NORMAL" ? "LOW" : "MEDIUM" };
          }
          return r;
        })
      }));
    },

    createInterviewSlot: (slot) => {
      set((state) => ({
        interviewSlots: [
          ...state.interviewSlots,
          {
            ...slot,
            id: `SLOT_${Date.now()}`,
            reservedCount: 0,
            attendedCount: 0
          }
        ]
      }));
    }
  };
});
