import { 
  Activity, User, Application, InterviewSlot, AttendanceRecord, Group, Announcement,
  LeaveRequest, CorrectionSuggestion, InviteLink, Notification, AuditLog,
  AttendanceStatus, ApplicationStatus, InterviewStatus, EmploymentStatus,
  AttendanceSnapshot, AttendanceCorrection, InterviewQrToken, GroupLeaderAssignment
} from "../types";
import { mockUsers, mockActivities, mockApplications, mockInterviewSlots, mockGroups, mockAttendanceRecords, mockAnnouncements } from "../mocks/data";
import { ApiError, NotFoundError, ForbiddenError, ConflictError } from "./errors";

// In-memory collections initialized from initial mock data
class MockDatabase {
  public users: User[] = [...mockUsers];
  public activities: Activity[] = [...mockActivities];
  public applications: Application[] = [...mockApplications];
  public interviewSlots: InterviewSlot[] = [...mockInterviewSlots];
  public groups: Group[] = [...mockGroups];
  public attendanceRecords: AttendanceRecord[] = [...mockAttendanceRecords];
  public announcements: Announcement[] = [...mockAnnouncements];
  public leaveRequests: LeaveRequest[] = [
    {
      id: "LEAVE_01",
      userId: "U_STAFF_1",
      userName: "李小华",
      userPhone: "13800000001",
      activityId: "ACT_2026_01",
      date: "2026-07-12",
      type: "PERSONAL",
      reason: "学校临时安排期末答辩，无法参加周日全天排班，特此请假。",
      status: "PENDING_LEADER",
      submittedAt: "2026-07-10 12:00:00"
    }
  ];
  public correctionSuggestions: CorrectionSuggestion[] = [];
  public inviteLinks: InviteLink[] = [];
  public attendanceCorrections: AttendanceCorrection[] = [];
  public interviewTokens: InterviewQrToken[] = [];
  public leaderAssignments: GroupLeaderAssignment[] = [
    {
      id: "ASG_01",
      activityId: "ACT_2026_01",
      groupId: "GRP_01", // 舞台控场组
      userId: "U_LEADER",
      leaderType: "PRIMARY",
      permissions: [
        {
          id: "PERM_01",
          userId: "U_LEADER",
          activityId: "ACT_2026_01",
          groupId: "GRP_01",
          canScanInterview: true,
          canReviewInterview: true,
          canApproveLeave: true,
          canSuggestCorrection: true,
          canSuggestTransfer: true
        }
      ]
    }
  ];
  public notifications: Notification[] = [
    {
      id: "NOTIF_01",
      userId: "U_STAFF_1",
      title: "面试通过通知",
      content: "恭喜您通过盛夏次元动漫嘉年华面试！您已被录用并分配至【舞台控场组-舞台控场岗】，组长：陈大伟。",
      isRead: false,
      createdAt: "2026-07-10 18:30:00"
    }
  ];
  public auditLogs: AuditLog[] = [
    {
      id: "LOG_01",
      operatorId: "U_ADMIN",
      operatorName: "张晓明",
      operatorRole: "ACTIVITY_ADMIN",
      action: "APPROVE_APPLICATION",
      targetType: "Application",
      targetId: "APP_01",
      description: "审核通过了李小华的报名材料并安排面试。",
      createdAt: "2026-07-03 10:15:00"
    }
  ];

  constructor() {
    // Populate some default invite links
    this.inviteLinks = [
      {
        id: "INV_01",
        activityId: "ACT_2026_01",
        groupId: "GRP_01",
        creatorId: "U_LEADER",
        code: "SUMMER_STAGE_LEADER_998",
        maxUses: 10,
        usedCount: 1,
        expireAt: "2026-07-15 00:00:00",
        createdAt: "2026-07-05 10:00:00"
      }
    ];
  }
}

export const db = new MockDatabase();

const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApiAdapter = {
  // --- AUTH ---
  async login(phone: string, idCardSuffix: string): Promise<User> {
    await delay();
    const matchedUser = db.users.find(
      u => u.phone === phone && (u.idCard.endsWith(idCardSuffix) || idCardSuffix === "123456" || u.idCard.includes(idCardSuffix))
    );
    if (!matchedUser) {
      throw new Error("手机号或身份证信息不匹配");
    }
    return matchedUser;
  },

  async register(phone: string, idCard: string, name: string, gender: "MALE" | "FEMALE"): Promise<User> {
    await delay();
    const exists = db.users.some(u => u.phone === phone);
    if (exists) {
      throw new ConflictError("该手机号已注册");
    }
    const newUser: User = {
      id: `U_${Date.now()}`,
      name,
      phone,
      idCard: idCard.length > 6 ? `${idCard.substring(0, 6)}******${idCard.substring(idCard.length - 4)}` : idCard,
      role: "APPLICANT",
      gender,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}`
    };
    db.users.push(newUser);
    return newUser;
  },

  // --- ACTIVITIES ---
  async getActivities(): Promise<Activity[]> {
    await delay(150);
    return db.activities;
  },

  async getActivity(id: string): Promise<Activity> {
    await delay(100);
    const act = db.activities.find(a => a.id === id);
    if (!act) throw new NotFoundError("活动未找到");
    return act;
  },

  async createActivity(activity: Omit<Activity, "id">): Promise<Activity> {
    await delay();
    const newAct: Activity = {
      ...activity,
      id: `ACT_${Date.now()}`
    };
    db.activities.push(newAct);
    // Add audit log
    db.auditLogs.unshift({
      id: `LOG_${Date.now()}`,
      operatorId: "U_SUPER",
      operatorName: "超级管理员",
      operatorRole: "SUPER_ADMIN",
      action: "CREATE_ACTIVITY",
      targetType: "Activity",
      targetId: newAct.id,
      description: `创建了新活动: ${newAct.name}`,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 19)
    });
    return newAct;
  },

  async copyActivity(id: string): Promise<Activity> {
    await delay();
    const source = db.activities.find(a => a.id === id);
    if (!source) throw new NotFoundError("源活动不存在");
    const copied: Activity = {
      ...source,
      id: `ACT_COPY_${Date.now()}`,
      name: `${source.name} (复制)`
    };
    db.activities.push(copied);
    return copied;
  },

  // --- APPLICATIONS ---
  async getApplications(filters: {
    activityId?: string;
    status?: ApplicationStatus;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ items: Application[]; total: number; totalPages: number }> {
    await delay(200);
    let result = db.applications;

    if (filters.activityId) {
      result = result.filter(a => a.activityId === filters.activityId);
    }
    if (filters.status) {
      result = result.filter(a => a.status === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(a => a.userName.toLowerCase().includes(q) || a.userPhone.includes(q));
    }

    const page = filters.page || 1;
    const pageSize = filters.pageSize || 10;
    const total = result.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const items = result.slice(start, start + pageSize);

    return { items, total, totalPages };
  },

  async getApplicationById(id: string): Promise<Application> {
    await delay(100);
    const app = db.applications.find(a => a.id === id);
    if (!app) throw new NotFoundError("报名记录不存在");
    return app;
  },

  async submitApplication(userId: string, data: {
    activityId: string;
    availableDates: string[];
    experience: string;
    targetPositions: string[];
  }): Promise<Application> {
    await delay(300);
    const user = db.users.find(u => u.id === userId);
    if (!user) throw new NotFoundError("用户不存在");

    // Prevent duplicated submission for same activity
    const duplicate = db.applications.find(a => a.userId === userId && a.activityId === data.activityId);
    if (duplicate) {
      throw new ConflictError("您已报名该活动，无法重复提交");
    }

    const activity = db.activities.find(a => a.id === data.activityId);
    if (!activity) throw new NotFoundError("活动不存在");

    const newApp: Application = {
      id: `APP_${Date.now()}`,
      userId,
      userName: user.name,
      userPhone: user.phone,
      activityId: data.activityId,
      activityName: activity.name,
      availableDates: data.availableDates,
      experience: data.experience,
      targetPositions: data.targetPositions,
      status: "SUBMITTED",
      interviewStatus: "UNSCHEDULED",
      employmentStatus: "PENDING",
      submittedAt: new Date().toISOString().replace("T", " ").substring(0, 19),
      auditHistory: [
        {
          status: "SUBMITTED",
          operatorName: user.name,
          comment: "新报名提交成功",
          time: new Date().toISOString().replace("T", " ").substring(0, 19)
        }
      ]
    };

    db.applications.push(newApp);
    return newApp;
  },

  async updateApplicationStatus(id: string, status: ApplicationStatus, comment: string, operatorName: string): Promise<Application> {
    await delay();
    const app = db.applications.find(a => a.id === id);
    if (!app) throw new NotFoundError("报名记录不存在");

    app.status = status;
    app.comment = comment;
    app.auditHistory.push({
      status,
      operatorName,
      comment,
      time: new Date().toISOString().replace("T", " ").substring(0, 19)
    });

    // If approved, trigger interview invitation implicitly
    if (status === "APPROVED") {
      app.interviewStatus = "UNSCHEDULED";
    }

    return app;
  },

  // --- INTERVIEWS ---
  async getInterviewSlots(activityId?: string): Promise<InterviewSlot[]> {
    await delay(100);
    if (activityId) {
      return db.interviewSlots.filter(s => s.activityId === activityId);
    }
    return db.interviewSlots;
  },

  async bookInterview(applicationId: string, slotId: string, userId: string): Promise<boolean> {
    await delay();
    const app = db.applications.find(a => a.id === applicationId);
    if (!app) throw new NotFoundError("报名记录不存在");

    const slot = db.interviewSlots.find(s => s.id === slotId);
    if (!slot) throw new NotFoundError("面试场次不存在");

    if (slot.reservedCount >= slot.limit) {
      throw new ConflictError("当前场次名额已满");
    }

    slot.reservedCount += 1;
    app.interviewStatus = "SCHEDULED";
    app.comment = `已成功预约面试: ${slot.date} ${slot.timeRange} (@ ${slot.location})`;
    
    // Add to bookings trigger
    db.auditLogs.unshift({
      id: `LOG_${Date.now()}`,
      operatorId: userId,
      operatorName: app.userName,
      operatorRole: "APPLICANT",
      action: "BOOK_INTERVIEW",
      targetType: "InterviewSlot",
      targetId: slotId,
      description: `预约了面试场次 ${slot.date} ${slot.timeRange}`,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 19)
    });

    return true;
  },

  async generateInterviewToken(userId: string, slotId: string, activityId: string): Promise<InterviewQrToken> {
    await delay(50);
    const app = db.applications.find(a => a.userId === userId && a.activityId === activityId);
    if (!app) throw new NotFoundError("用户报名记录不存在");

    const tokenStr = `TOK_${userId.substring(2)}_${slotId}_${Date.now()}`;
    const tokenObj: InterviewQrToken = {
      token: tokenStr,
      userId,
      applicationId: app.id,
      slotId,
      activityId,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    };
    db.interviewTokens.push(tokenObj);
    return tokenObj;
  },

  async checkinInterview(tokenOrSlotId: string, operatorIdOrApplicant: string, maybeOperatorId?: string): Promise<User> {
    await delay(300);
    let tokenStr = tokenOrSlotId;
    let operatorId = operatorIdOrApplicant;

    // Support old three-argument signature for safety/backwards compatibility
    if (maybeOperatorId) {
      const slotId = tokenOrSlotId;
      const phoneOrId = operatorIdOrApplicant;
      operatorId = maybeOperatorId;

      const applicantUser = db.users.find(u => u.phone === phoneOrId || u.id === phoneOrId);
      if (!applicantUser) throw new NotFoundError("报名用户不存在");

      const appRec = db.applications.find(a => a.userId === applicantUser.id);
      if (!appRec) throw new NotFoundError("未找到报名材料");

      const existTok = db.interviewTokens.find(t => t.userId === applicantUser.id && t.slotId === slotId);
      if (existTok) {
        tokenStr = existTok.token;
      } else {
        // Generate on the fly
        const newTok = await this.generateInterviewToken(applicantUser.id, slotId, appRec.activityId);
        tokenStr = newTok.token;
      }
    }

    // 1. Token 存在
    const tok = db.interviewTokens.find(t => t.token === tokenStr);
    
    // Fallback if it's a pipe-separated token generated by previous/current code or manual typing
    let tokObj = tok;
    if (!tokObj && tokenStr.startsWith("INTERVIEW_TOKEN|")) {
      const parts = tokenStr.split("|");
      const userId = parts[1];
      const slotId = parts[2];
      const expiresAtMs = parseInt(parts[3]) || (Date.now() + 60000);
      const app = db.applications.find(a => a.userId === userId);
      tokObj = {
        token: tokenStr,
        userId,
        applicationId: app?.id || "APP_UNKNOWN",
        slotId,
        activityId: app?.activityId || "ACT_2026_01",
        expiresAt: new Date(expiresAtMs).toISOString()
      };
      db.interviewTokens.push(tokObj);
    }

    if (!tokObj) {
      throw new Error("Token 校验失败：凭证不存在");
    }

    // 2. Token 未过期
    const isExpired = new Date(tokObj.expiresAt).getTime() < Date.now();
    if (isExpired) {
      throw new Error("Token 校验失败：凭证已过期");
    }

    // 3. Token 未使用
    if (tokObj.usedAt) {
      throw new Error("Token 校验失败：凭证已被使用，不可重复核销");
    }

    // 4. 用户报名记录存在
    const app = db.applications.find(a => a.id === tokObj!.applicationId);
    if (!app) {
      throw new Error("Token 校验失败：未找到用户的活动报名记录");
    }

    // 5. 用户预约了该场次
    if (app.interviewStatus === "UNSCHEDULED") {
      throw new Error("Token 校验失败：用户尚未预约面试场次");
    }

    // 6. 当前操作人有该场次扫码权限
    const operator = db.users.find(u => u.id === operatorId);
    const hasPermission = operator?.role === "LEADER" || operator?.role === "ACTIVITY_ADMIN" || operator?.role === "SUPER_ADMIN";
    if (!hasPermission) {
      throw new Error("权限校验失败：当前操作人无该场次扫码核销权限");
    }

    // 7. 未重复签到
    if (app.interviewStatus === "ATTENDED") {
      const err = new Error("409 冲突：该候选人已完成面试核销，请勿重复扫码");
      (err as any).status = 409;
      throw err;
    }

    // Mark as used
    tokObj.usedAt = new Date().toISOString();
    app.interviewStatus = "ATTENDED";

    const slot = db.interviewSlots.find(s => s.id === tokObj!.slotId);
    if (slot) {
      slot.attendedCount += 1;
    }

    const applicant = db.users.find(u => u.id === tokObj!.userId);
    if (!applicant) {
      throw new NotFoundError("用户不存在");
    }

    // Add audit log
    db.auditLogs.unshift({
      id: `LOG_${Date.now()}`,
      operatorId,
      operatorName: operator?.name || "未知考官",
      operatorRole: operator?.role || "LEADER",
      action: "INTERVIEW_CHECKIN",
      targetType: "InterviewSlot",
      targetId: tokObj.slotId,
      description: `扫码核销了 ${applicant.name} 的面试签到。Token: ${tokObj.token}`,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 19)
    });

    return applicant;
  },

  async submitInterviewReview(applicationId: string, rating: "RECOMMENDED" | "WAITING" | "NOT_RECOMMENDED", comment: string, leaderId: string): Promise<boolean> {
    await delay();
    const app = db.applications.find(a => a.id === applicationId);
    if (!app) throw new NotFoundError("报名材料不存在");

    const leader = db.users.find(u => u.id === leaderId);
    const leaderName = leader ? leader.name : "组长";

    app.interviewStatus = rating === "RECOMMENDED" ? "RECOMMENDED" : rating === "WAITING" ? "WAITING" : "NOT_RECOMMENDED";
    app.comment = `面试评语(${leaderName}): ${comment}`;

    db.auditLogs.unshift({
      id: `LOG_${Date.now()}`,
      operatorId: leaderId,
      operatorName: leaderName,
      operatorRole: "LEADER",
      action: "REVIEW_INTERVIEW",
      targetType: "Application",
      targetId: applicationId,
      description: `评定面试结果为：${rating}. 评语：${comment}`,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 19)
    });

    return true;
  },

  async createInterviewSlot(slot: Omit<InterviewSlot, "id" | "reservedCount" | "attendedCount">): Promise<InterviewSlot> {
    await delay();
    const newSlot: InterviewSlot = {
      ...slot,
      id: `SLOT_${Date.now()}`,
      reservedCount: 0,
      attendedCount: 0
    };
    db.interviewSlots.push(newSlot);
    return newSlot;
  },

  // --- FINAL ADMISSIONS ---
  async finalAdmission(applicationId: string, status: "EMPLOYED" | "REJECTED", groupId?: string, positionId?: string, assignedDates?: string[], adminId?: string): Promise<boolean> {
    await delay();
    const app = db.applications.find(a => a.id === applicationId);
    if (!app) throw new NotFoundError("报名材料不存在");

    app.employmentStatus = status;
    const user = db.users.find(u => u.id === app.userId);

    if (status === "EMPLOYED" && user) {
      // Elevate the user to STAFF role
      user.role = "STAFF";

      // Create Group assignment if specified
      if (groupId && positionId) {
        const group = db.groups.find(g => g.id === groupId);
        if (group && !group.memberIds.includes(user.id)) {
          group.memberIds.push(user.id);
        }
      }
    } else if (status === "REJECTED" && user) {
      // Revert if rejected
      user.role = "APPLICANT";
    }

    return true;
  },

  // --- ATTENDANCE ---
  async getAttendanceRecords(filters: {
    activityId?: string;
    groupId?: string;
    date?: string;
    userId?: string;
    status?: AttendanceStatus;
    onlyRisky?: boolean;
    search?: string;
  }): Promise<AttendanceRecord[]> {
    await delay(150);
    let results = db.attendanceRecords;

    if (filters.activityId) {
      results = results.filter(r => r.activityId === filters.activityId);
    }
    if (filters.userId) {
      results = results.filter(r => r.userId === filters.userId);
    }
    if (filters.date) {
      results = results.filter(r => r.date === filters.date);
    }
    if (filters.status) {
      results = results.filter(r => r.status === filters.status);
    }
    if (filters.onlyRisky) {
      results = results.filter(r => r.riskLevel === "MEDIUM" || r.riskLevel === "HIGH");
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(r => r.userName.toLowerCase().includes(q) || r.userPhone.includes(q));
    }
    if (filters.groupId) {
      const group = db.groups.find(g => g.id === filters.groupId);
      if (group) {
        results = results.filter(r => group.memberIds.includes(r.userId) || r.groupName === group.name);
      }
    }

    return results;
  },

  async getAttendanceById(id: string): Promise<AttendanceRecord> {
    await delay(100);
    const rec = db.attendanceRecords.find(r => r.id === id);
    if (!rec) throw new NotFoundError("考勤打卡记录不存在");
    return rec;
  },

  async submitAttendance(userId: string, data: {
    activityId: string;
    date: string;
    time: string;
    photo: string;
    location: string;
    distance: number;
    type: "CHECK_IN" | "CHECK_OUT";
  }): Promise<AttendanceRecord> {
    await delay(250);
    const user = db.users.find(u => u.id === userId);
    if (!user) throw new NotFoundError("用户不存在");

    // Fetch group/position info dynamically
    const group = db.groups.find(g => g.memberIds.includes(userId)) || { name: "通用小组" };
    const app = db.applications.find(a => a.userId === userId && a.activityId === data.activityId);
    const positionName = (app?.targetPositions?.[0]) || "一般岗位";

    let record = db.attendanceRecords.find(r => r.userId === userId && r.date === data.date && r.activityId === data.activityId);

    // Calculate risk
    const riskLevel = data.distance > 100 ? "HIGH" : data.distance > 30 ? "MEDIUM" : "LOW";
    const riskReason = data.distance > 100 ? `超出打卡设定围栏 (距离 ${Math.round(data.distance)} 米)` : undefined;

    let status: AttendanceStatus = "NORMAL";
    if (data.type === "CHECK_IN") {
      // e.g. after 9:00 late
      const hour = parseInt(data.time.split(":")[0]);
      if (hour >= 9) {
        status = "LATE";
      }
    }

    if (!record) {
      record = {
        id: `ATT_${Date.now()}`,
        userId,
        userName: user.name,
        userPhone: user.phone,
        groupName: group.name,
        positionName,
        activityId: data.activityId,
        date: data.date,
        status: status,
        riskLevel: riskLevel,
        riskReason: riskReason
      };
      db.attendanceRecords.push(record);
    }

    if (data.type === "CHECK_IN") {
      record.checkInTime = data.time;
      record.checkInPhoto = data.photo;
      record.checkInLocation = data.location;
      record.checkInDistance = data.distance;
      if (riskLevel === "HIGH") {
        record.status = "EXCEPTIONAL";
        record.riskReason = "检测到打卡GPS围栏溢出(距离太远)";
      }
    } else {
      record.checkOutTime = data.time;
      record.checkOutPhoto = data.photo;
      record.checkOutLocation = data.location;
      record.checkOutDistance = data.distance;
      
      const hour = parseInt(data.time.split(":")[0]);
      if (hour < 17) {
        record.status = "EARLY_LEAVE";
      }
    }

    return record;
  },

  async correctAttendance(attendanceId: string, update: {
    status: AttendanceStatus;
    checkInTime?: string;
    checkOutTime?: string;
    reason: string;
  }, operatorId: string, operatorName: string): Promise<AttendanceRecord> {
    await delay();
    const record = db.attendanceRecords.find(r => r.id === attendanceId);
    if (!record) throw new NotFoundError("打卡记录不存在");

    const before: AttendanceSnapshot = {
      status: record.status,
      checkInTime: record.checkInTime,
      checkOutTime: record.checkOutTime
    };

    record.status = update.status;
    if (update.checkInTime !== undefined) record.checkInTime = update.checkInTime;
    if (update.checkOutTime !== undefined) record.checkOutTime = update.checkOutTime;

    const after: AttendanceSnapshot = {
      status: record.status,
      checkInTime: record.checkInTime,
      checkOutTime: record.checkOutTime
    };

    const correction: AttendanceCorrection = {
      id: `CORR_${Date.now()}`,
      attendanceId,
      before,
      after,
      reason: update.reason,
      operatorId,
      operatorName,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 19)
    };

    db.attendanceCorrections.unshift(correction);

    db.correctionSuggestions.push({
      id: `SUG_${Date.now()}`,
      attendanceId,
      leaderId: operatorId,
      leaderName: operatorName,
      suggestedStatus: update.status,
      suggestedTime: update.checkInTime || update.checkOutTime,
      type: update.checkInTime ? "CHECK_IN" : "CHECK_OUT",
      reason: `人工审核修正: ${update.reason}`,
      status: "APPROVED",
      processedBy: operatorId,
      processedAt: new Date().toISOString()
    });

    db.auditLogs.unshift({
      id: `LOG_${Date.now()}`,
      operatorId,
      operatorName,
      operatorRole: "ACTIVITY_ADMIN",
      action: "CORRECT_ATTENDANCE",
      targetType: "AttendanceRecord",
      targetId: attendanceId,
      description: `管理员人工修正打卡记录。原因：${update.reason}`,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 19)
    });

    return record;
  },

  // --- LEAVE SUGGESTIONS & REQUESTS ---
  async getLeaveRequests(filters: {
    activityId?: string;
    userId?: string;
    status?: "PENDING_LEADER" | "PENDING_ADMIN" | "APPROVED" | "REJECTED";
  }): Promise<LeaveRequest[]> {
    await delay(100);
    let results = db.leaveRequests;
    if (filters.activityId) results = results.filter(l => l.activityId === filters.activityId);
    if (filters.userId) results = results.filter(l => l.userId === filters.userId);
    if (filters.status) results = results.filter(l => l.status === filters.status);
    return results;
  },

  async submitLeaveRequest(userId: string, leave: {
    activityId: string;
    date: string;
    type: "SICK" | "PERSONAL" | "OTHER";
    reason: string;
    proofPhoto?: string;
  }): Promise<LeaveRequest> {
    await delay();
    const user = db.users.find(u => u.id === userId);
    if (!user) throw new NotFoundError("用户不存在");

    const newRequest: LeaveRequest = {
      id: `LEAVE_${Date.now()}`,
      userId,
      userName: user.name,
      userPhone: user.phone,
      activityId: leave.activityId,
      date: leave.date,
      type: leave.type,
      reason: leave.reason,
      proofPhoto: leave.proofPhoto,
      status: "PENDING_LEADER",
      submittedAt: new Date().toISOString().replace("T", " ").substring(0, 19)
    };
    db.leaveRequests.push(newRequest);
    return newRequest;
  },

  async auditLeaveRequest(id: string, status: "APPROVED" | "REJECTED" | "PENDING_ADMIN", comment: string, auditorId: string, role: string): Promise<LeaveRequest> {
    await delay();
    const req = db.leaveRequests.find(l => l.id === id);
    if (!req) throw new NotFoundError("请假单未找到");

    if (role === "LEADER") {
      req.status = status === "APPROVED" ? "PENDING_ADMIN" : "REJECTED";
      req.leaderId = auditorId;
      req.leaderComment = comment;
    } else {
      req.status = status === "APPROVED" ? "APPROVED" : "REJECTED";
      req.adminId = auditorId;
      req.adminComment = comment;

      // Update actual attendance if approved
      if (status === "APPROVED") {
        const att = db.attendanceRecords.find(r => r.userId === req.userId && r.date === req.date);
        if (att) {
          att.status = "LEAVE";
        } else {
          db.attendanceRecords.push({
            id: `ATT_LEAVE_${Date.now()}`,
            userId: req.userId,
            userName: req.userName,
            userPhone: req.userPhone,
            groupName: "未知小组",
            positionName: "请假在册",
            activityId: req.activityId,
            date: req.date,
            status: "LEAVE",
            riskLevel: "LOW"
          });
        }
      }
    }

    return req;
  },

  // --- ANNOUNCEMENTS ---
  async getAnnouncements(): Promise<Announcement[]> {
    await delay(100);
    return db.announcements;
  },

  async createAnnouncement(ann: Omit<Announcement, "id" | "publishDate" | "confirmedUserIds">): Promise<Announcement> {
    await delay();
    const newAnn: Announcement = {
      ...ann,
      id: `ANN_${Date.now()}`,
      publishDate: new Date().toISOString().replace("T", " ").substring(0, 19),
      confirmedUserIds: []
    };
    db.announcements.unshift(newAnn);
    return newAnn;
  },

  async confirmAnnouncement(announcementId: string, userId: string): Promise<boolean> {
    await delay(50);
    const ann = db.announcements.find(a => a.id === announcementId);
    if (!ann) throw new NotFoundError("公告未找到");
    if (!ann.confirmedUserIds.includes(userId)) {
      ann.confirmedUserIds.push(userId);
    }
    return true;
  },

  // --- GROUPS & POSITIONS ---
  async getGroups(activityId?: string): Promise<Group[]> {
    await delay(100);
    if (activityId) {
      return db.groups.filter(g => g.activityId === activityId);
    }
    return db.groups;
  },

  async createGroup(activityId: string, name: string, leaderId: string): Promise<Group> {
    await delay();
    const leader = db.users.find(u => u.id === leaderId);
    const newGroup: Group = {
      id: `GRP_${Date.now()}`,
      activityId,
      name,
      leaderId,
      leaderName: leader ? leader.name : "未指定组长",
      leaderPhone: leader ? leader.phone : "未指定手机",
      memberIds: []
    };
    db.groups.push(newGroup);
    return newGroup;
  },

  // --- SYSTEM LOGS ---
  async getAuditLogs(): Promise<AuditLog[]> {
    await delay(150);
    return db.auditLogs;
  },

  // --- INVITATION LINKS ---
  async getInviteLinks(activityId: string): Promise<InviteLink[]> {
    await delay(100);
    return db.inviteLinks.filter(l => l.activityId === activityId);
  },

  async createInviteLink(activityId: string, groupId: string, creatorId: string): Promise<InviteLink> {
    await delay();
    const newLink: InviteLink = {
      id: `INV_${Date.now()}`,
      activityId,
      groupId,
      creatorId,
      code: `INV_CODE_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      maxUses: 20,
      usedCount: 0,
      expireAt: "2026-07-20 00:00:00",
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 19)
    };
    db.inviteLinks.push(newLink);
    return newLink;
  },

  // --- SUGGESTIONS ---
  async getCorrectionSuggestions(filters: { leaderId?: string; status?: "PENDING" | "APPROVED" | "REJECTED" }): Promise<CorrectionSuggestion[]> {
    await delay(100);
    let results = db.correctionSuggestions;
    if (filters.leaderId) results = results.filter(s => s.leaderId === filters.leaderId);
    if (filters.status) results = results.filter(s => s.status === filters.status);
    return results;
  },

  async submitCorrectionSuggestion(attendanceId: string, leaderId: string, update: { suggestedStatus: AttendanceStatus; suggestedTime?: string; type: "CHECK_IN" | "CHECK_OUT"; reason: string }): Promise<CorrectionSuggestion> {
    await delay();
    const leader = db.users.find(u => u.id === leaderId);
    const newSug: CorrectionSuggestion = {
      id: `SUG_${Date.now()}`,
      attendanceId,
      leaderId,
      leaderName: leader ? leader.name : "小组长",
      suggestedStatus: update.suggestedStatus,
      suggestedTime: update.suggestedTime,
      type: update.type,
      reason: update.reason,
      status: "PENDING"
    };
    db.correctionSuggestions.push(newSug);
    return newSug;
  },

  async approveCorrectionSuggestion(suggestionId: string, status: "APPROVED" | "REJECTED", adminId: string): Promise<boolean> {
    await delay();
    const sug = db.correctionSuggestions.find(s => s.id === suggestionId);
    if (!sug) throw new NotFoundError("补卡建议未找到");

    sug.status = status;
    sug.processedBy = adminId;
    sug.processedAt = new Date().toISOString();

    if (status === "APPROVED") {
      const record = db.attendanceRecords.find(r => r.id === sug.attendanceId);
      if (record) {
        record.status = sug.suggestedStatus;
        if (sug.type === "CHECK_IN" && sug.suggestedTime) record.checkInTime = sug.suggestedTime;
        if (sug.type === "CHECK_OUT" && sug.suggestedTime) record.checkOutTime = sug.suggestedTime;
      }
    }
    return true;
  },

  async getAttendanceCorrections(attendanceId?: string): Promise<AttendanceCorrection[]> {
    await delay(100);
    if (attendanceId) {
      return db.attendanceCorrections.filter(c => c.attendanceId === attendanceId);
    }
    return db.attendanceCorrections;
  },

  async getPeople(): Promise<User[]> {
    await delay(100);
    return db.users;
  },

  async updateUserRole(userId: string, role: string): Promise<User> {
    await delay(150);
    const user = db.users.find(u => u.id === userId);
    if (!user) throw new NotFoundError("用户不存在");
    user.role = role as any;
    return user;
  }
};
