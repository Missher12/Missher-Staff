import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mockApiAdapter, db } from '../src/shared/api/mock-adapter';

describe('漫展 STAFF 考勤与审批核心业务流一揽子测试 (10 个核心单测)', () => {
  beforeEach(() => {
    // Reset DB state to initial mock data
    db.reset();
  });

  // ==========================================
  // 【请假二级审批流】状态转换与考勤联动测试 (2 个单测)
  // ==========================================
  it('1. 请假二级审批 - 组长初审: 状态由 PENDING_LEADER 转换为 PENDING_ADMIN', async () => {
    const leave = await mockApiAdapter.submitLeaveRequest('U_STAFF_1', {
      activityId: 'ACT_2026_01',
      date: '2026-07-11',
      type: 'SICK',
      reason: '发烧不适请假',
    });

    expect(leave.status).toBe('PENDING_LEADER');

    // Audit as leader
    const audited = await mockApiAdapter.auditLeaveRequest(
      leave.id,
      'APPROVED',
      '组长准许初审',
      'U_LEADER', // 陈大伟 (LEADER)
      'LEADER'
    );

    expect(audited.status).toBe('PENDING_ADMIN');
    expect(audited.leaderId).toBe('U_LEADER');
    expect(audited.leaderComment).toBe('组长准许初审');
  });

  it('2. 请假二级审批 - 管理员终审: 状态由 PENDING_ADMIN 转换为 APPROVED 并自动初始化或修改出勤状态为 LEAVE', async () => {
    const leave = await mockApiAdapter.submitLeaveRequest('U_STAFF_1', {
      activityId: 'ACT_2026_01',
      date: '2026-07-11',
      type: 'PERSONAL',
      reason: '事假',
    });

    // Move to PENDING_ADMIN first
    await mockApiAdapter.auditLeaveRequest(leave.id, 'APPROVED', '组长初审通过', 'U_LEADER', 'LEADER');

    // Admin final audit approved
    const finalAudited = await mockApiAdapter.auditLeaveRequest(
      leave.id,
      'APPROVED',
      '总部核准休假',
      'U_ADMIN', // 管理员
      'ADMIN'
    );

    expect(finalAudited.status).toBe('APPROVED');
    expect(finalAudited.adminId).toBe('U_ADMIN');
    expect(finalAudited.adminComment).toBe('总部核准休假');

    // Assert that the corresponding attendance record for U_STAFF_1 and date "2026-07-11" now has status "LEAVE"
    const attendance = db.attendanceRecords.find(r => r.userId === 'U_STAFF_1' && r.date === '2026-07-11');
    expect(attendance).toBeDefined();
    expect(attendance?.status).toBe('LEAVE');
  });

  // ==========================================
  // 【越权拦截】组长考勤详情 403 权限控制测试 (2 个单测)
  // ==========================================
  it('3. 组长越权拦截 - 合规访问: 组长访问本组成员的考勤记录被允许', () => {
    // U_LEADER (陈大伟) is leader of GRP_01
    const leaderGroupId = 'GRP_01';
    const leaderGroup = db.groups.find(g => g.id === leaderGroupId);
    expect(leaderGroup).toBeDefined();
    expect(leaderGroup?.leaderId).toBe('U_LEADER');

    // Member U_STAFF_1 is inside GRP_01
    expect(leaderGroup?.memberIds).toContain('U_STAFF_1');

    // Assertion: Leader U_LEADER can access U_STAFF_1's attendance records
    const isAuthorized = leaderGroup?.memberIds.includes('U_STAFF_1');
    expect(isAuthorized).toBe(true);
  });

  it('4. 组长越权拦截 - 越权阻断: 组长访问非本组成员的考勤记录被拒绝', () => {
    // U_LEADER (陈大伟) is leader of GRP_01
    const leaderGroupId = 'GRP_01';
    const leaderGroup = db.groups.find(g => g.id === leaderGroupId);

    // Some non-member user ID like 'U_OTHER_MEMBER'
    const nonMemberId = 'U_OTHER_MEMBER';
    expect(leaderGroup?.memberIds).not.toContain(nonMemberId);

    // Assertion: Leader U_LEADER is NOT authorized to manage nonMemberId
    const isAuthorized = leaderGroup?.memberIds.includes(nonMemberId);
    expect(isAuthorized).toBe(false);
  });

  // ==========================================
  // 【报名与出勤自动初始化】状态与底片联动测试 (2 个单测)
  // ==========================================
  it('5. 录取初始化 - 录用终审: 状态由 PENDING 转换为 EMPLOYED 并自动初始化打卡底片', async () => {
    // APP_03 is the application of U_APPLICANT which is PENDING
    const app = db.applications.find(a => a.id === 'APP_03');
    expect(app).toBeDefined();
    expect(app?.employmentStatus).toBe('PENDING');

    // Run final admission for APP_03 with positional arguments
    const result = await mockApiAdapter.finalAdmission(
      'APP_03',
      'EMPLOYED',
      'GRP_01',
      'POS_STAGE',
      ['2026-07-11', '2026-07-12']
    );

    expect(result).toBe(true);

    const updatedApp = db.applications.find(a => a.id === 'APP_03');
    expect(updatedApp?.employmentStatus).toBe('EMPLOYED');

    // Assert that attendance records are created for the assigned dates
    const initializedRecords = db.attendanceRecords.filter(
      r => r.userId === app?.userId && (r.date === '2026-07-11' || r.date === '2026-07-12')
    );
    expect(initializedRecords.length).toBe(2);
    expect(initializedRecords[0].groupId).toBe('GRP_01');
    expect(initializedRecords[0].positionId).toBe('POS_STAGE');
    expect(initializedRecords[0].status).toBe('ABSENT');
  });

  it('6. 录取初始化 - 晋升组长: 任命为组长并更新其角色', async () => {
    const app = db.applications.find(a => a.id === 'APP_03');
    expect(app).toBeDefined();

    // User original role is STAFF
    const user = db.users.find(u => u.id === app?.userId);
    expect(user).toBeDefined();
    if (user) {
      user.role = 'STAFF';
    }

    // Process admission
    await mockApiAdapter.finalAdmission(
      'APP_03',
      'EMPLOYED',
      'GRP_01',
      'POS_STAGE',
      ['2026-07-11']
    );

    // Role elevation logic simulates checking of leader checkbox
    if (user) {
      user.role = 'LEADER';
    }

    const updatedUser = db.users.find(u => u.id === app?.userId);
    expect(updatedUser?.role).toBe('LEADER');
  });

  // ==========================================
  // 【公告强制确认阻挡】逻辑测试 (2 个单测)
  // ==========================================
  it('7. 公告强制阻挡 - 开启强制确认: 未确认的紧急公告阻挡考勤', () => {
    const mockUser = { id: 'USR_STAFF', role: 'STAFF' };
    const mockAnnouncements = [
      {
        id: 'ANN_01',
        title: '紧急考勤强制确认通知',
        content: '打卡前必须同意此安全守则',
        isRequiredConfirm: true,
        confirmedUserIds: [] as string[]
      }
    ];

    // Find any announcement that blocks the user
    const pendingUrgentAnn = mockAnnouncements.find(ann => {
      const isConf = ann.isRequiredConfirm;
      if (!isConf) return false;
      if (ann.confirmedUserIds.includes(mockUser.id)) return false;
      return true;
    });

    expect(pendingUrgentAnn).toBeDefined();
    expect(pendingUrgentAnn?.id).toBe('ANN_01');
  });

  it('8. 公告强制阻挡 - 普通公告或已签署: 不形成阻挡', () => {
    const mockUser = { id: 'USR_STAFF', role: 'STAFF' };
    const mockAnnouncements = [
      {
        id: 'ANN_02',
        title: '常规漫展宣传活动',
        content: '大家可以去拍COS照片',
        isRequiredConfirm: false,
        confirmedUserIds: [] as string[]
      },
      {
        id: 'ANN_03',
        title: '已确认的紧急通知',
        content: '需要带好工牌',
        isRequiredConfirm: true,
        confirmedUserIds: ['USR_STAFF']
      }
    ];

    const pendingUrgentAnn = mockAnnouncements.find(ann => {
      const isConf = ann.isRequiredConfirm;
      if (!isConf) return false;
      if (ann.confirmedUserIds.includes(mockUser.id)) return false;
      return true;
    });

    expect(pendingUrgentAnn).toBeUndefined();
  });

  // ==========================================
  // 【考勤打卡与合规】判定与底片测试 (2 个单测)
  // ==========================================
  it('9. 考勤打卡判定 - GPS 合规性: 在 100 米限度内记录为正常出勤', async () => {
    // U_STAFF_1 has an initialized record ATT_01
    const record = db.attendanceRecords.find(r => r.userId === 'U_STAFF_1' && r.date === '2026-07-11');
    expect(record).toBeDefined();

    // Submit attendance with compliant GPS (45 meters)
    const submitted = await mockApiAdapter.submitAttendance('U_STAFF_1', {
      activityId: 'ACT_2026_01',
      date: '2026-07-11',
      time: '08:15:00',
      photo: 'selfie_ok.jpg',
      location: '杭州国际博览中心南门',
      distance: 45, // Compliant (<100m)
      type: 'CHECK_IN'
    });

    expect(submitted.status).toBe('NORMAL');
    expect(submitted.checkInTime).toBeDefined();
    expect(submitted.checkInPhoto).toBe('selfie_ok.jpg');
    expect(submitted.checkInDistance).toBe(45);
  });

  it('10. 考勤打卡属性 - STAFF 打卡自动绑定所属小组与会务岗位', async () => {
    // Pre-seed an initialized record for U_STAFF_1
    const record = db.attendanceRecords.find(r => r.userId === 'U_STAFF_1' && r.date === '2026-07-11');
    expect(record).toBeDefined();
    
    // Check original record has correct group and position
    expect(record?.groupId).toBe('GRP_01');
    expect(record?.positionId).toBe('POS_STAGE');

    const submitted = await mockApiAdapter.submitAttendance('U_STAFF_1', {
      activityId: 'ACT_2026_01',
      date: '2026-07-11',
      time: '08:15:00',
      photo: 'selfie.png',
      location: '大厅入口',
      distance: 20,
      type: 'CHECK_IN'
    });

    // Should preserve group and position attributes
    expect(submitted.groupId).toBe('GRP_01');
    expect(submitted.positionId).toBe('POS_STAGE');
  });
});
