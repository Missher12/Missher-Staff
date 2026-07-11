import { Activity, User, Application, InterviewSlot, AttendanceRecord, Group, Announcement } from "../types";

// 1. 模拟用户数据
export let mockUsers: User[] = [
  {
    id: "U_ADMIN",
    name: "张晓明",
    phone: "18888888888",
    idCard: "110101******8888",
    role: "ACTIVITY_ADMIN",
    gender: "MALE",
    email: "admin@acgconvention.com"
  },
  {
    id: "U_SUPER",
    name: "王博",
    phone: "19999999999",
    idCard: "110101******9999",
    role: "SUPER_ADMIN",
    gender: "MALE"
  },
  {
    id: "U_LEADER",
    name: "陈大伟",
    phone: "13511112222",
    idCard: "330102******4512",
    role: "LEADER",
    gender: "MALE",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=leader"
  },
  {
    id: "U_STAFF_1",
    name: "李小华",
    phone: "13800000001",
    idCard: "330103******1234",
    role: "STAFF",
    gender: "FEMALE",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=staff1",
    bankCard: "622202******8899",
    bankName: "中国工商银行",
    bankBranch: "杭州市西湖支行"
  },
  {
    id: "U_STAFF_2",
    name: "赵雷",
    phone: "13800000002",
    idCard: "330103******5678",
    role: "STAFF",
    gender: "MALE",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=staff2",
    bankCard: "621700******3344",
    bankName: "招商银行",
    bankBranch: "杭州城西支行"
  },
  {
    id: "U_APPLICANT",
    name: "林可儿",
    phone: "13911112222",
    idCard: "330104******9876",
    role: "APPLICANT",
    gender: "FEMALE",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=applicant",
    bankCard: "622848******2211",
    bankName: "中国农业银行",
    bankBranch: "杭州钱江支行"
  }
];

// 2. 模拟活动数据
export let mockActivities: Activity[] = [
  {
    id: "ACT_2026_01",
    name: "2026 盛夏次元动漫嘉年华 (Summer ACG Carnival)",
    cover: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60",
    startDate: "2026-07-11",
    endDate: "2026-07-12",
    venue: "杭州国际博览中心 (1A、1B展厅)",
    applyDeadline: "2026-07-08",
    recruitCount: 80,
    description: "2026年暑期最大型的动漫嘉年华，特邀超人气COSER、人气画师，预计日均客流超3万人次。本次招聘主要面向在杭高校在校生及有展会STAFF经验的年轻人。提供丰富的工作餐、纪念限定徽章、STAFF专属T恤，以及完备的志愿服务及出勤证明，表现优秀者可纳入长期重点骨干库。",
    dates: ["2026-07-11", "2026-07-12"],
    positions: [
      { id: "P_01", name: "门禁检票岗", description: "负责核对游客购票信息，刷码过闸机，发放展会手环、宣传册。", requireCount: 20 },
      { id: "P_02", name: "舞台控场岗", description: "维护主副舞台秩序，协调嘉宾入场，保障现场签售队伍有序排队。", requireCount: 15 },
      { id: "P_03", name: "后勤机动岗", description: "现场紧急物资调配，展商咨询指引，以及突发情况联络反馈。", requireCount: 15 },
      { id: "P_04", name: "秩序疏导岗", description: "展馆出入口、通道转角分流引导，保障消防通道通畅，安全巡查。", requireCount: 20 },
      { id: "P_05", name: "摄影/自媒体岗", description: "负责展会官方花絮拍摄、自媒体直播配合、游客互动素材采写。", requireCount: 10 }
    ]
  }
];

// 3. 模拟报名数据
export let mockApplications: Application[] = [
  {
    id: "APP_01",
    userId: "U_STAFF_1",
    userName: "李小华",
    userPhone: "13800000001",
    activityId: "ACT_2026_01",
    activityName: "2026 盛夏次元动漫嘉年华 (Summer ACG Carnival)",
    availableDates: ["2026-07-11", "2026-07-12"],
    experience: "曾担任2025年秋季漫展舞台协助，熟悉舞台排队指引流程。性格活泼开朗，沟通能力强。",
    targetPositions: ["舞台控场岗", "门禁检票岗"],
    status: "APPROVED",
    interviewStatus: "COMPLETED",
    employmentStatus: "EMPLOYED",
    idCardPhoto: "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100&auto=format&fit=crop&q=60",
    submittedAt: "2026-07-02 14:22:10",
    comment: "面试表现极佳，具有漫展舞台协助经验，推荐录用并分配到舞台控场组。",
    auditHistory: [
      { status: "SUBMITTED", operatorName: "李小华", comment: "新报名提交", time: "2026-07-02 14:22:10" },
      { status: "PENDING_REVIEW", operatorName: "系统", comment: "资料自动格式校验通过", time: "2026-07-02 14:23:00" },
      { status: "APPROVED", operatorName: "张晓明", comment: "资料审核通过，邀请参加面试", time: "2026-07-03 10:15:00" }
    ]
  },
  {
    id: "APP_02",
    userId: "U_STAFF_2",
    userName: "赵雷",
    userPhone: "13800000002",
    activityId: "ACT_2026_01",
    activityName: "2026 盛夏次元动漫嘉年华 (Summer ACG Carnival)",
    availableDates: ["2026-07-11", "2026-07-12"],
    experience: "有2年大型博览会安防和分流引导经验，熟悉场馆应急疏散路线，服从调配。",
    targetPositions: ["门禁检票岗", "秩序疏导岗"],
    status: "APPROVED",
    interviewStatus: "COMPLETED",
    employmentStatus: "EMPLOYED",
    idCardPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60",
    submittedAt: "2026-07-02 16:45:00",
    comment: "身材高大挺拔，责任心强，适合做入口检票和外围人流疏导。",
    auditHistory: [
      { status: "SUBMITTED", operatorName: "赵雷", comment: "新报名提交", time: "2026-07-02 16:45:00" },
      { status: "APPROVED", operatorName: "张晓明", comment: "资料审核通过，邀请面试", time: "2026-07-03 11:30:00" }
    ]
  },
  {
    id: "APP_03",
    userId: "U_APPLICANT",
    userName: "林可儿",
    userPhone: "13911112222",
    activityId: "ACT_2026_01",
    activityName: "2026 盛夏次元动漫嘉年华 (Summer ACG Carnival)",
    availableDates: ["2026-07-11"],
    experience: "漫展爱好者，多次参加同人展，热情耐心。擅长拍照，想要报摄影岗或舞台岗。",
    targetPositions: ["摄影/自媒体岗", "舞台控场岗"],
    status: "SUBMITTED",
    interviewStatus: "UNSCHEDULED",
    employmentStatus: "PENDING",
    submittedAt: "2026-07-10 10:05:00",
    auditHistory: [
      { status: "SUBMITTED", operatorName: "林可儿", comment: "新报名提交", time: "2026-07-10 10:05:00" }
    ]
  }
];

// 4. 模拟面试场次
export let mockInterviewSlots: InterviewSlot[] = [
  {
    id: "SLOT_01",
    activityId: "ACT_2026_01",
    date: "2026-07-09",
    timeRange: "10:00 - 11:30",
    location: "线上腾讯会议 (会议号：332-908-112)",
    leaderId: "U_LEADER",
    leaderName: "陈大伟",
    limit: 30,
    reservedCount: 22,
    attendedCount: 18
  },
  {
    id: "SLOT_02",
    activityId: "ACT_2026_01",
    date: "2026-07-09",
    timeRange: "14:00 - 16:30",
    location: "杭州国际博览中心 B馆 3F-08会议室",
    leaderId: "U_LEADER",
    leaderName: "陈大伟",
    limit: 40,
    reservedCount: 35,
    attendedCount: 30
  },
  {
    id: "SLOT_03",
    activityId: "ACT_2026_01",
    date: "2026-07-10",
    timeRange: "14:00 - 15:30",
    location: "杭州国际博览中心 B馆 3F-08会议室",
    leaderId: "U_LEADER",
    leaderName: "陈大伟",
    limit: 20,
    reservedCount: 12,
    attendedCount: 0
  }
];

// 5. 工作小组
export let mockGroups: Group[] = [
  {
    id: "GRP_01",
    activityId: "ACT_2026_01",
    name: "舞台控场组",
    leaderId: "U_LEADER",
    leaderName: "陈大伟",
    leaderPhone: "13511112222",
    memberIds: ["U_STAFF_1"]
  },
  {
    id: "GRP_02",
    activityId: "ACT_2026_01",
    name: "门禁检票A组",
    leaderId: "U_LEADER",
    leaderName: "陈大伟",
    leaderPhone: "13511112222",
    memberIds: ["U_STAFF_2"]
  }
];

// 6. 考勤记录数据
export let mockAttendanceRecords: AttendanceRecord[] = [
  {
    id: "ATT_01",
    userId: "U_STAFF_1",
    userName: "李小华",
    userPhone: "13800000001",
    groupName: "舞台控场组",
    positionName: "舞台控场岗",
    activityId: "ACT_2026_01",
    date: "2026-07-11",
    checkInTime: "08:12:14",
    checkOutTime: "18:05:00",
    checkInPhoto: "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=200&auto=format&fit=crop&q=60",
    checkOutPhoto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=60",
    checkInLocation: "杭州国际博览中心南大门(误差 5m)",
    checkOutLocation: "杭州国际博览中心 1A 馆西侧(误差 8m)",
    checkInDistance: 5,
    checkOutDistance: 8,
    status: "NORMAL",
    riskLevel: "LOW"
  },
  {
    id: "ATT_02",
    userId: "U_STAFF_2",
    userName: "赵雷",
    userPhone: "13800000002",
    groupName: "门禁检票A组",
    positionName: "门禁检票岗",
    activityId: "ACT_2026_01",
    date: "2026-07-11",
    checkInTime: "09:05:22", // 迟到打卡
    checkInPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=60",
    checkInLocation: "杭州国际博览中心北入口(误差 14m)",
    checkInDistance: 14,
    status: "LATE",
    riskLevel: "LOW"
  }
];

// 7. 模拟公告数据
export let mockAnnouncements: Announcement[] = [
  {
    id: "ANN_01",
    title: "【紧急通知】盛夏次元漫展 7月11日 门禁系统升级与打卡位置微调公告",
    content: "各位 STAFF 小伙伴们好：由于展馆临时安保升级，明日 (7/11) 现场游客入口大门提前于 8:30 开启。请各门禁检票小组的 STAFF 在 8:00 前完成自拍打卡定位并到岗，打卡定位围栏已微调至博览中心主广场 50 米圈内。请进入页面确认此通知，避免明早考勤产生异常打卡记录。收到请点击“我已阅读并知悉”！",
    type: "URGENT",
    publishDate: "2026-07-10 18:00:00",
    isRequiredConfirm: true,
    confirmedUserIds: [] // 初始无人确认，可以用其触发 AnnouncementGuard 阻挡层
  },
  {
    id: "ANN_02",
    title: "漫展 STAFF 现场行为准则及服装发放说明",
    content: "1. 请所有录取人员明早 7:30 在博览中心 B3 休息室找各组组长集合，凭本人身份证后六位和姓名签领 STAFF T恤和工作证件。\n2. 现场工作期间，禁止在工作岗位上聚众聊天、玩手机或长时间拍摄 Cosplay 嘉宾，必须服从现场管理调配。\n3. 提供全天饮用水和两顿午晚餐，午休时间采用轮班制。感谢大家的付出！",
    type: "NORMAL",
    publishDate: "2026-07-09 10:00:00",
    isRequiredConfirm: false,
    confirmedUserIds: ["U_STAFF_1"]
  }
];
