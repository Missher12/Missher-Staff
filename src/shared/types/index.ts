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
export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: "URGENT" | "NORMAL" | "ATTENDANCE" | "INTERVIEW";
  publishDate: string;
  isRequiredConfirm: boolean; // 是否需要强制确认阻塞
  confirmedUserIds: string[]; // 已确认的用户ID列表
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
