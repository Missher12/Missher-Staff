/**
 * STAFF 活动报名与考勤系统 - 核心 TypeScript 类型定义
 */

// 1. 角色定义
export type Role = "APPLICANT" | "STAFF" | "LEADER" | "ACTIVITY_ADMIN" | "SUPER_ADMIN";

// 2. 报名流程状态定义
// 草稿 -> 已提交 -> 待审核 -> 退回补充资料 -> 审核通过(待安排面试) -> 待面试 -> 已签到(面试中) -> 面试完成 -> 待管理员终审 -> 已录用/未录用
export type ApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "PENDING_REVIEW"
  | "RETURNED"
  | "APPROVED" // 审核通过
  | "WAITLIST"  // 候补名单
  | "REJECTED"; // 已驳回

// 3. 面试状态定义
export type InterviewStatus =
  | "UNSCHEDULED"
  | "SCHEDULED"       // 已安排/已预约
  | "ATTENDED"        // 已到场
  | "COMPLETED"       // 面试完成
  | "RECOMMENDED"     // 组长推荐录用
  | "WAITING"         // 候补观察
  | "NOT_RECOMMENDED"; // 不推荐录用

// 4. 录用状态定义
export type EmploymentStatus =
  | "PENDING"  // 待终审
  | "EMPLOYED" // 已录用
  | "REJECTED"; // 未录用

// 5. 考勤状态定义
export type AttendanceStatus =
  | "NORMAL"       // 正常
  | "LATE"         // 迟到
  | "EARLY_LEAVE"  // 早退
  | "ABSENT"       // 缺勤
  | "LEAVE"        // 请假
  | "EXCEPTIONAL"  // 异常打卡(如超出范围、风险等)
  | "NONE";        // 今日未打卡

// 6. 用户基本信息
export interface User {
  id: string;
  name: string;
  phone: string;
  idCard: string; // 身份证后六位或完整(脱敏)
  avatar?: string;
  role: Role;
  gender: "MALE" | "FEMALE";
  email?: string;
  bankCard?: string; // 银行卡
  bankName?: string; // 开户行
  bankBranch?: string; // 支行
}

// 7. 岗位定义
export interface Position {
  id: string;
  name: string;
  description: string;
  requireCount: number;
}

// 8. 活动定义
export interface Activity {
  id: string;
  name: string;
  cover: string;
  startDate: string;
  endDate: string;
  venue: string; // 场馆名称
  applyDeadline: string;
  recruitCount: number;
  description: string;
  dates: string[]; // 工作日期数组 (如 ["2026-07-11", "2026-07-12"])
  positions: Position[];
}

// 9. 报名表记录
export interface Application {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  activityId: string;
  activityName: string;
  availableDates: string[]; // 选择参加的日期
  experience: string; // 工作经验
  targetPositions: string[]; // 意向岗位
  status: ApplicationStatus;
  interviewStatus: InterviewStatus;
  employmentStatus: EmploymentStatus;
  interviewSlotId?: string; // 已预约的面试场次ID
  idCardPhoto?: string; // 证件照
  submittedAt: string;
  comment?: string; // 审批意见
  auditHistory: Array<{
    status: ApplicationStatus;
    operatorName: string;
    comment: string;
    time: string;
  }>;
}

// 10. 面试场次
export interface InterviewSlot {
  id: string;
  activityId: string;
  date: string; // "2026-07-11"
  timeRange: string; // "14:00 - 15:00"
  location: string;
  leaderId: string;
  leaderName: string;
  limit: number;
  reservedCount: number;
  attendedCount: number;
}

// 11. 考勤打卡记录
export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  groupName: string;
  positionName: string;
  activityId: string;
  date: string; // "2026-07-11"
  checkInTime?: string; // "08:23:45"
  checkOutTime?: string; // "18:05:12"
  checkInPhoto?: string; // base64 自拍照
  checkOutPhoto?: string; // base64 自拍照
  checkInLocation?: string; // "南门展厅 (30.1234, 120.5678)"
  checkOutLocation?: string;
  checkInDistance?: number; // 距离场馆多少米
  checkOutDistance?: number;
  status: AttendanceStatus;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  riskReason?: string;
}

// 12. 工作小组
export interface Group {
  id: string;
  activityId: string;
  name: string; // 如 "后勤A组"
  leaderId: string;
  leaderName: string;
  leaderPhone: string;
  memberIds: string[];
}

// 13. 公告
export type AnnouncementType = "URGENT" | "NORMAL" | "ATTENDANCE" | "INTERVIEW";

export interface Announcement {
  id: string;
  activityId?: string;
  title: string;
  content: string;
  type: AnnouncementType;
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  audienceRoles?: Role[];
  groupIds?: string[];
  userIds?: string[];
  publishAt?: string;
  publishDate?: string; // backward compatibility
  expireAt?: string;
  pinned?: boolean;
  requiredConfirm?: boolean;
  isRequiredConfirm?: boolean; // backward compatibility
  confirmedUserIds: string[];
  createdAt?: string;
  targetRole?: Role | "ALL";
}

// 14. API 返回结构契约
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  requestId: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// 15. 新增业务类型
export type ActivityStatus = "PLANNING" | "RECRUITING" | "INTERVIEWING" | "ONGOING" | "COMPLETED";

export type ActivityStage = "PREPARATION" | "RECRUITMENT" | "INTERVIEW" | "ADMISSION" | "EXHIBITION" | "CLOSED";

export interface PersonProfile {
  id: string;
  userId: string;
  name: string;
  phone: string;
  idCard: string;
  gender: "MALE" | "FEMALE";
  avatar?: string;
  email?: string;
  bankCard?: string;
  bankName?: string;
  bankBranch?: string;
  experienceSummary?: string;
  tags?: string[];
  createdAt: string;
}

export interface DynamicFormField {
  id: string;
  name: string;
  label: string;
  type: "text" | "textarea" | "phone" | "idcard" | "bankcard" | "date" | "time" | "number" | "select" | "checkbox" | "radio" | "image" | "file";
  required: boolean;
  placeholder?: string;
  options?: string[]; // for select, checkbox, radio
  description?: string;
  isProfileField: boolean; // whether to sync to PersonProfile
  allowModifyBySelf: boolean; // whether applicant can modify it after submission
  visibleToLeader: boolean; // whether group leaders can see it
  isSensitive: boolean; // whether to mask/desensitize
}

export interface DynamicForm {
  id: string;
  activityId: string;
  fields: DynamicFormField[];
  createdAt: string;
}

export interface ApplicationAnswer {
  fieldId: string;
  fieldName: string;
  value: string; // JSON or plain string depending on field type
}

export interface InterviewBooking {
  id: string;
  applicationId: string;
  userId: string;
  slotId: string;
  bookedAt: string;
  status: "BOOKED" | "ATTENDED" | "CANCELLED";
}

export interface InterviewCheckin {
  id: string;
  slotId: string;
  userId: string;
  operatorId: string;
  checkinTime: string;
  qrToken: string;
}

export interface InterviewReview {
  id: string;
  applicationId: string;
  userId: string;
  leaderId: string;
  score: number; // 1-5 or 1-100
  rating: "RECOMMENDED" | "WAITING" | "NOT_RECOMMENDED";
  comment: string;
  reviewedAt: string;
}

export interface AdmissionDecision {
  id: string;
  applicationId: string;
  userId: string;
  activityId: string;
  groupId?: string;
  positionId?: string;
  assignedDates: string[];
  status: "PENDING" | "EMPLOYED" | "REJECTED";
  operatorId: string;
  decidedAt: string;
}

export interface GroupMembership {
  id: string;
  userId: string;
  activityId: string;
  groupId: string;
  positionId: string;
  isMainLeader: boolean;
  isDeputyLeader: boolean;
  isNormalLeader: boolean;
  assignedDates: string[];
}

export interface RoleAssignment {
  id: string;
  userId: string;
  activityId: string;
  role: Role;
  assignedAt: string;
}

export interface LeaderPermission {
  id: string;
  userId: string;
  activityId: string;
  groupId: string;
  canScanInterview: boolean;
  canReviewInterview: boolean;
  canApproveLeave: boolean;
  canSuggestCorrection: boolean;
  canSuggestTransfer: boolean;
}

export interface PositionAssignment {
  id: string;
  userId: string;
  activityId: string;
  positionId: string;
  positionName: string;
}

export interface StaffDateAssignment {
  id: string;
  userId: string;
  activityId: string;
  date: string; // "2026-07-11"
}

export interface AttendanceRule {
  id: string;
  activityId: string;
  lat: number;
  lng: number;
  radius: number; // in meters (e.g., 200m)
  checkInStart: string; // "07:30:00"
  checkInEnd: string; // "09:00:00"
  checkOutStart: string; // "17:30:00"
  checkOutEnd: string; // "21:00:00"
}

export interface AttendanceRisk {
  id: string;
  attendanceId: string;
  riskType: "GEO_OUT_OF_BOUNDS" | "MOCK_LOCATION" | "CAMERA_FRAUD" | "DEVICE_RISK";
  description: string;
  level: "MEDIUM" | "HIGH";
  detectedAt: string;
}

export interface AttendanceCorrection {
  id: string;
  attendanceId: string;
  operatorId: string;
  operatorName: string;
  originalStatus: AttendanceStatus;
  newStatus: AttendanceStatus;
  originalTime?: string;
  newTime?: string;
  reason: string;
  correctedAt: string;
}

export interface CorrectionSuggestion {
  id: string;
  attendanceId: string;
  leaderId: string;
  leaderName: string;
  suggestedStatus: AttendanceStatus;
  suggestedTime?: string;
  type: "CHECK_IN" | "CHECK_OUT";
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  processedBy?: string;
  processedAt?: string;
}

export type LeaveType = "SICK" | "PERSONAL" | "OTHER";

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  activityId: string;
  date: string; // "2026-07-11"
  type: LeaveType;
  reason: string;
  proofPhoto?: string;
  status: "PENDING_LEADER" | "PENDING_ADMIN" | "APPROVED" | "REJECTED";
  leaderId?: string;
  leaderComment?: string;
  adminId?: string;
  adminComment?: string;
  submittedAt: string;
}

export interface InviteLink {
  id: string;
  activityId: string;
  groupId: string;
  creatorId: string;
  code: string;
  maxUses: number;
  usedCount: number;
  expireAt: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface AnnouncementReceipt {
  id: string;
  announcementId: string;
  userId: string;
  confirmedAt: string;
}

export interface AuditLog {
  id: string;
  operatorId: string;
  operatorName: string;
  operatorRole: Role;
  action: string; // e.g. "APPROVE_APPLICATION"
  targetType: string; // e.g. "Application"
  targetId: string;
  description: string;
  ipAddress?: string;
  createdAt: string;
}
