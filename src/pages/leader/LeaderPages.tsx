import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { LeaderLayout } from "../../app/layouts/LeaderLayout";
import { useAuthStore } from "../../app/stores/authStore";
import { useEventStore } from "../../app/stores/eventStore";
import { 
  useGroups,
  useAttendanceRecords,
  useSubmitCorrectionSuggestion,
  useCorrectionSuggestions,
  useAttendanceById,
  useAttendanceCorrections,
  usePeople,
  useAnnouncements,
  useConfirmAnnouncement,
  useLeaveRequests,
  useAuditLeaveRequest
} from "../../shared/hooks/useQueries";
import { 
  Users, MapPin, Scan, CheckCircle, Clock, 
  Send, AlertTriangle, Play, RefreshCw, Star, MessageSquare, ArrowLeft, Smartphone, ShieldCheck
} from "lucide-react";

// ==========================================
// 1. LeaderDashboard (组长工作大盘)
// ==========================================
export const LeaderDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { data: groups, isLoading: isLoadingGroups } = useGroups("ACT_2026_01");
  const leaderGroup = groups?.find(g => g.leaderId === user?.id);

  const { data: attendanceRecords = [], isLoading: isLoadingAttendance } = useAttendanceRecords({
    activityId: "ACT_2026_01"
  });

  if (isLoadingGroups || isLoadingAttendance) {
    return (
      <LeaderLayout title="组长管理工作台">
        <div className="text-center py-20 text-xs text-zinc-400 font-semibold">
          正在加载小组与考勤数据...
        </div>
      </LeaderLayout>
    );
  }

  if (!leaderGroup) {
    return (
      <LeaderLayout title="403 无管理权限">
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white/80 backdrop-blur-xl border border-black/5 rounded-[28px] p-8 max-w-sm shadow-sm space-y-4">
            <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-full flex items-center justify-center mx-auto text-[#FF453A]">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-lg font-black text-[#1D1D1F]">403 - 组长权限受限</h1>
            <p className="text-xs text-[#86868B] leading-relaxed font-semibold">
              当前活动、GroupLeaderAssignment、GroupMembership 校验未通过：您未被授权负责该会期的任何小组。
            </p>
          </div>
        </div>
      </LeaderLayout>
    );
  }

  // Filter records belonging to members of leader's group
  const groupRecords = attendanceRecords.filter(r => 
    leaderGroup.memberIds.includes(r.userId)
  );

  const presentCount = groupRecords.filter(r => r.status === "NORMAL").length;
  const lateCount = groupRecords.filter(r => r.status === "LATE").length;
  const absentCount = groupRecords.filter(r => r.status === "ABSENT").length;

  return (
    <LeaderLayout title="组长管理工作台">
      <div className="space-y-4">
        {/* Statistics Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white border border-black/5 rounded-2xl p-3 text-center">
            <span className="text-[10px] font-bold text-zinc-400 block mb-0.5">应到人数</span>
            <span className="text-xl font-black text-zinc-800 font-mono">{leaderGroup.memberIds.length}</span>
          </div>
          <div className="bg-white border border-black/5 rounded-2xl p-3 text-center">
            <span className="text-[10px] font-bold text-[#30D158] block mb-0.5">正常签到</span>
            <span className="text-xl font-black text-[#30D158] font-mono">{presentCount}</span>
          </div>
          <div className="bg-white border border-black/5 rounded-2xl p-3 text-center">
            <span className="text-[10px] font-bold text-[#FF9F0A] block mb-0.5">迟到/异常</span>
            <span className="text-xl font-black text-[#FF9F0A] font-mono">{lateCount}</span>
          </div>
        </div>

        {/* Quick Operations Menu */}
        <div className="space-y-2">
          <span className="text-[10px] font-extrabold text-[#86868B] tracking-wide uppercase block">组长专属功能</span>
          <div className="grid grid-cols-2 gap-2">
            <Link to="/leader/attendance" className="bg-white border border-black/5 rounded-2xl p-3 flex items-center gap-3 hover:bg-slate-50 transition-colors">
              <div className="p-2 bg-amber-50 text-[#FF9F0A] rounded-xl"><Clock size={16} /></div>
              <div className="text-left">
                <span className="text-xs font-bold text-zinc-800 block">本组考勤</span>
                <span className="text-[9px] text-zinc-400 block font-medium">成员上下班打卡</span>
              </div>
            </Link>
            <Link to="/leader/interview-reviews" className="bg-white border border-black/5 rounded-2xl p-3 flex items-center gap-3 hover:bg-slate-50 transition-colors">
              <div className="p-2 bg-green-50 text-[#30D158] rounded-xl"><Users size={16} /></div>
              <div className="text-left">
                <span className="text-xs font-bold text-zinc-800 block">录用初审</span>
                <span className="text-[9px] text-zinc-400 block font-medium">面试录用评审</span>
              </div>
            </Link>
            <Link to="/leader/invite-links" className="bg-white border border-black/5 rounded-2xl p-3 flex items-center gap-3 hover:bg-slate-50 transition-colors">
              <div className="p-2 bg-blue-50 text-[#0A84FF] rounded-xl"><Send size={16} /></div>
              <div className="text-left">
                <span className="text-xs font-bold text-zinc-800 block">注册邀约</span>
                <span className="text-[9px] text-zinc-400 block font-medium">免审直接录用</span>
              </div>
            </Link>
            <Link to="/leader/announcements" className="bg-white border border-black/5 rounded-2xl p-3 flex items-center gap-3 hover:bg-slate-50 transition-colors">
              <div className="p-2 bg-purple-50 text-[#BF5AF2] rounded-xl"><MessageSquare size={16} /></div>
              <div className="text-left">
                <span className="text-xs font-bold text-zinc-800 block">考务公告</span>
                <span className="text-[9px] text-zinc-400 block font-medium">消息公告及动态</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Group Quick actions */}
        <div className="bg-white/80 backdrop-blur-xl border border-black/5 rounded-[22px] p-4.5 shadow-sm space-y-2.5">
          <h3 className="text-xs font-extrabold text-[#1D1D1F] uppercase tracking-wide">考务组安全提醒</h3>
          <p className="text-[11px] text-[#86868B] font-medium leading-relaxed">
            今日下午14:00会场有突发人流冲击演习，请组长陈大伟务必安排所有组员携带高音喇叭到达B1安检口列队待命。
          </p>
        </div>

        {/* Live records */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-extrabold text-[#86868B] tracking-wide uppercase block">今日组员签到日志</span>
          
          {groupRecords.length === 0 ? (
            <div className="text-center p-6 bg-white border border-black/5 rounded-2xl text-zinc-400 text-xs font-semibold">
              今日尚未有组员打卡记录
            </div>
          ) : (
            groupRecords.map((r) => (
              <div key={r.id} className="bg-white border border-black/5 rounded-xl p-3.5 flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold text-[#1D1D1F]">{r.userName}</h4>
                  <p className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                    <Clock size={11} /> 打卡时间：{r.checkInTime || "未签"}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  r.status === "NORMAL" 
                    ? "bg-green-50 text-[#30D158]" 
                    : "bg-amber-50 text-[#FF9F0A]"
                }`}>
                  {r.status === "NORMAL" ? "正常打卡" : "异常打卡"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </LeaderLayout>
  );
};

// ==========================================
// 2. LeaderMembers (组员详情及考勤卡片)
// ==========================================
export const LeaderMembers: React.FC = () => {
  const { user } = useAuthStore();
  const { data: groups, isLoading: isLoadingGroups } = useGroups("ACT_2026_01");
  const { data: people = [], isLoading: isLoadingPeople } = usePeople();

  const leaderGroup = groups?.find(g => g.leaderId === user?.id);

  if (isLoadingGroups || isLoadingPeople) {
    return (
      <LeaderLayout title="本小组组员通讯录">
        <div className="text-center py-20 text-xs text-zinc-400 font-semibold">
          正在读取小组与成员名单...
        </div>
      </LeaderLayout>
    );
  }

  if (!leaderGroup) {
    return (
      <LeaderLayout title="403 无管理权限">
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white/80 backdrop-blur-xl border border-black/5 rounded-[28px] p-8 max-w-sm shadow-sm space-y-4">
            <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-full flex items-center justify-center mx-auto text-[#FF453A]">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-lg font-black text-[#1D1D1F]">403 - 组长权限受限</h1>
            <p className="text-xs text-[#86868B] leading-relaxed font-semibold">
              当前活动、GroupLeaderAssignment、GroupMembership 校验未通过：您未被授权负责该会期的任何小组。
            </p>
          </div>
        </div>
      </LeaderLayout>
    );
  }

  // Map member IDs to user profiles
  const members = (people || []).filter(p => leaderGroup.memberIds.includes(p.id)).map(p => {
    return {
      id: p.id,
      name: p.name,
      phone: p.phone,
      position: p.role === "LEADER" ? "小组长" : "本组 STAFF",
      insurance: "太平洋商业险已参保",
      attendanceRate: p.id === "U_03" ? "50%" : "100%" // Mock dynamic metrics
    };
  });

  return (
    <LeaderLayout title="本小组组员通讯录">
      <div className="space-y-3">
        {isLoadingPeople ? (
          <div className="text-center py-10 text-xs text-zinc-400 font-semibold">
            正在读取小组成员名单...
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-10 bg-white border border-black/5 rounded-[22px] text-xs text-zinc-400 font-semibold">
            本小组暂未分配组员。可以通过分享本组邀请链接招募组员。
          </div>
        ) : (
          members.map((m) => (
            <div key={m.id} className="bg-white/80 backdrop-blur-xl border border-black/5 rounded-[22px] p-4.5 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-sm text-[#0A84FF]">
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1D1D1F]">{m.name}</h4>
                    <p className="text-[10px] text-zinc-400 font-semibold">{m.position}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-zinc-400 block font-mono">首期出勤率</span>
                  <span className="text-xs font-black text-[#30D158] font-mono">{m.attendanceRate}</span>
                </div>
              </div>

              <div className="h-px bg-zinc-100" />

              <div className="flex justify-between text-[11px] font-semibold">
                <span className="text-zinc-500">实名电话</span>
                <a href={`tel:${m.phone}`} className="text-[#0A84FF] font-mono">{m.phone}</a>
              </div>
              <div className="flex justify-between text-[11px] font-semibold">
                <span className="text-zinc-500">商业意外险</span>
                <span className="text-[#30D158]">{m.insurance}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </LeaderLayout>
  );
};

// ==========================================
// 3. LeaderInterviewScan (面试动态扫码、评价与面试底片录入)
// ==========================================
export const LeaderInterviewScan: React.FC = () => {
  const { scanInterviewQrCode, evaluateInterview, applications, showToast } = useEventStore();
  const [candidateId, setCandidateId] = useState("U_APPLICANT"); // Default sandbox applicant
  const [scanResult, setScanResult] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [evalComment, setEvalComment] = useState("");
  const [submittingEval, setSubmittingEval] = useState(false);

  const candidates = applications.filter(a => a.status === "APPROVED" || a.status === "SUBMITTED");

  React.useEffect(() => {
    if (candidates.length > 0 && !candidates.some(c => c.userId === candidateId) && candidateId === "U_APPLICANT") {
      setCandidateId(candidates[0].userId);
    }
  }, [applications]);

  // 1. Simulating Camera Scanner
  const triggerScan = async () => {
    setScanResult(null);
    // Find slot
    const slotId = "SLOT_01"; 
    const res = await scanInterviewQrCode(candidateId, slotId);
    
    // Find user details
    const app = applications.find(a => a.userId === candidateId);

    if (res.success && app) {
      setScanResult({
        success: true,
        message: res.message,
        userName: app.userName,
        appId: app.id,
        positions: app.targetPositions
      });
    } else {
      setScanResult({
        success: false,
        message: res.message || "找不到对应的面试档案，请让候选人检查预约信息"
      });
    }
  };

  // 2. Submitting Evaluation
  const submitEval = () => {
    if (!scanResult) return;
    setSubmittingEval(true);
    evaluateInterview(scanResult.appId, "RECOMMENDED", `【面评得分：${rating}星】${evalComment}`);
    setTimeout(() => {
      setSubmittingEval(false);
      setScanResult(null);
      setEvalComment("");
      showToast("评价提交成功！面试成绩已自动记录并流转到会务考务总监待批录用。", "success");
    }, 1500);
  };

  return (
    <LeaderLayout title="面试现场扫码与评价">
      <div className="space-y-4">
        {/* simulated camera viewport */}
        {!scanResult ? (
          <div className="bg-black rounded-[28px] overflow-hidden p-6 text-center space-y-4 relative shadow-inner h-64 flex flex-col justify-center items-center border-4 border-zinc-900">
            {/* Pulsing Scan viewport box */}
            <div className="absolute w-44 h-44 border-2 border-dashed border-[#FF9F0A] rounded-2xl flex items-center justify-center animate-pulse">
              <Scan size={44} className="text-[#FF9F0A] animate-spin" />
            </div>

            <div className="relative z-10 space-y-2 mt-40">
              <span className="text-[10px] font-extrabold text-[#FF9F0A] bg-[#FF9F0A]/10 border border-[#FF9F0A]/30 px-3 py-1 rounded-full uppercase tracking-widest block">
                摄像头扫码框已对焦
              </span>
              <p className="text-[10px] text-zinc-500 font-medium">请将候选人手机展示的面试二维码放入框内</p>
            </div>
          </div>
        ) : (
          /* Scan success and Evaluation panel */
          <div className="bg-white border border-black/5 rounded-[22px] p-5 shadow-sm space-y-4 animate-scale-up">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-green-50 text-[#30D158] border border-green-100 rounded-full">
                <CheckCircle size={18} />
              </span>
              <div>
                <h3 className="text-xs font-black text-[#1D1D1F]">已现场验证签到</h3>
                <p className="text-[10px] text-zinc-400">APP ID: {scanResult.appId}</p>
              </div>
            </div>

            <div className="p-3 bg-zinc-50 rounded-2xl text-xs space-y-1 font-semibold text-[#1D1D1F]">
              <p>候选人姓名：{scanResult.userName}</p>
              <p>意向工作岗位：{scanResult.positions.join("、")}</p>
            </div>

            <div className="h-px bg-zinc-100" />

            {/* Face to Face Evaluation */}
            <div className="space-y-3.5">
              <span className="text-[10px] font-extrabold text-[#86868B] uppercase tracking-wider block">小组长面评打分</span>
              
              <div className="flex gap-1.5 items-center">
                <span className="text-xs font-semibold text-zinc-500">专业评级:</span>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button 
                    key={s} 
                    onClick={() => setRating(s)}
                    className="cursor-pointer text-[#FF9F0A] hover:scale-110 transition-transform"
                  >
                    <Star size={18} fill={s <= rating ? "#FF9F0A" : "none"} />
                  </button>
                ))}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500">现场表现评语</label>
                <textarea
                  placeholder="例如：性格阳光开朗，普通话流利。曾经出过漫展，抗压能力和应变素质极强，建议优先分配舞台或检票岗位录用..."
                  value={evalComment}
                  onChange={e => setEvalComment(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 bg-zinc-50 border border-black/5 rounded-xl text-xs font-medium outline-none resize-none"
                />
              </div>

              <button
                onClick={submitEval}
                disabled={submittingEval}
                className="w-full py-3 bg-[#FF9F0A] hover:bg-[#FF9F0A]/90 text-white text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {submittingEval ? (
                  <RefreshCw className="animate-spin" size={14} />
                ) : (
                  <MessageSquare size={14} />
                )}
                提交面试评定结果
              </button>
            </div>
          </div>
        )}

        {/* Manual triggering sandboxed simulation (for UI Prototype evaluation) */}
        {!scanResult && (
          <div className="bg-zinc-50 border border-black/5 rounded-2xl p-4 space-y-3">
            <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest block">原型沙盒快捷控制（模拟扫码）</span>
            <div className="flex gap-2">
              <select 
                value={candidateId} 
                onChange={e => setCandidateId(e.target.value)}
                className="flex-1 p-2 bg-white border border-black/5 rounded-xl text-xs font-semibold outline-none"
              >
                {candidates.map(c => (
                  <option key={c.userId} value={c.userId}>
                    {c.userName} ({c.status === "SUBMITTED" ? "待资料审" : "待面核销"})
                  </option>
                ))}
                {!candidates.some(c => c.userId === "U_APPLICANT") && (
                  <option value="U_APPLICANT">林可儿 (待面试)</option>
                )}
                <option value="U_TEMP_999">张小黑 (非预定异常用户)</option>
              </select>
              <button 
                onClick={triggerScan}
                className="px-4 py-2 bg-[#FF9F0A] text-white text-xs font-bold rounded-xl hover:bg-[#FF9F0A]/90 transition-all cursor-pointer flex items-center gap-1"
              >
                <Play size={12} fill="currentColor" /> 触发模拟扫码
              </button>
            </div>
          </div>
        )}
      </div>
    </LeaderLayout>
  );
};

// ==========================================
// 4. LeaderLeaveReviews (组员请假审批)
// ==========================================
export const LeaderLeaveReviews: React.FC = () => {
  const { user } = useAuthStore();
  const { showToast } = useEventStore();
  const { data: groups = [], isLoading: isLoadingGroups } = useGroups("ACT_2026_01");
  const { data: leaves = [], isLoading: isLoadingLeaves } = useLeaveRequests({});
  const auditMutation = useAuditLeaveRequest();

  const leaderGroup = groups.find((g) => g.leaderId === user?.id);

  if (isLoadingGroups || isLoadingLeaves) {
    return (
      <LeaderLayout title="初审组员请假申请">
        <div className="text-center py-20 text-xs text-zinc-400 font-semibold animate-pulse">
          正在读取请假申请档案...
        </div>
      </LeaderLayout>
    );
  }

  if (!leaderGroup) {
    return (
      <LeaderLayout title="初审组员请假申请">
        <div className="text-center py-12 bg-white border border-black/5 rounded-[22px] text-zinc-400 text-xs font-semibold">
          您当前没有管理任何小组，无权初审请假。
        </div>
      </LeaderLayout>
    );
  }

  // Filter leave requests: User must be in leader's group
  const groupLeaves = leaves.filter((l) => leaderGroup.memberIds.includes(l.userId));
  const pendingLeaves = groupLeaves.filter((l) => l.status === "PENDING_LEADER");
  const historyLeaves = groupLeaves.filter((l) => l.status !== "PENDING_LEADER");

  const handleAudit = async (id: string, accept: boolean) => {
    try {
      await auditMutation.mutateAsync({
        id,
        status: accept ? "APPROVED" : "REJECTED", // approved by leader becomes PENDING_ADMIN in the mock adapter
        comment: accept ? "组长初审通过" : "组长初审驳回",
        auditorId: user?.id || "",
        role: "LEADER",
      });
      showToast(
        accept
          ? "请假初审批准通过！已流转至总后台会务总监进行终审确认。"
          : "请假初审驳回，对应组员的请假单已被拒绝。",
        accept ? "success" : "info"
      );
    } catch (err: any) {
      showToast(err.message || "请假审批操作失败", "error");
    }
  };

  return (
    <LeaderLayout title="初审组员请假申请">
      <div className="space-y-6">
        <div className="space-y-3">
          <span className="text-[10px] font-extrabold text-[#86868B] uppercase tracking-wider block">
            待初审的请假条 ({pendingLeaves.length})
          </span>

          {pendingLeaves.length === 0 ? (
            <div className="text-center py-8 bg-white border border-black/5 rounded-[22px] text-zinc-400 text-xs font-medium">
              本组目前暂无待初审的请假申请
            </div>
          ) : (
            pendingLeaves.map((r) => (
              <div key={r.id} className="bg-white border border-black/5 rounded-[22px] p-4.5 shadow-sm space-y-3 animate-scale-up">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-red-50 text-[#FF453A] flex items-center justify-center font-bold text-xs">
                      {r.userName.charAt(0)}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-[#1D1D1F]">{r.userName}</h4>
                      <p className="text-[9px] text-zinc-400 font-mono">请假日期：{r.date}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-[#FF9F0A]">
                    待组长初审
                  </span>
                </div>

                <div className="p-3 bg-zinc-50 rounded-2xl text-xs text-zinc-700 leading-relaxed whitespace-pre-wrap font-medium">
                  事由：{r.reason}
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleAudit(r.id, true)}
                    disabled={auditMutation.isPending}
                    className="flex-1 py-2.5 bg-[#FF9F0A] text-white font-bold text-xs rounded-xl hover:bg-[#FF9F0A]/95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    批准同意并呈交终审
                  </button>
                  <button
                    onClick={() => handleAudit(r.id, false)}
                    disabled={auditMutation.isPending}
                    className="py-2.5 px-4 bg-red-50 border border-red-200 text-[#FF453A] font-bold text-xs rounded-xl hover:bg-red-100 transition-all cursor-pointer disabled:opacity-50"
                  >
                    驳回
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* History / Handled Leaves */}
        {historyLeaves.length > 0 && (
          <div className="space-y-3">
            <span className="text-[10px] font-extrabold text-[#86868B] uppercase tracking-wider block">
              已处理的请假历史记录 ({historyLeaves.length})
            </span>
            <div className="space-y-2">
              {historyLeaves.map((r) => (
                <div key={r.id} className="bg-white border border-black/5 rounded-[22px] p-4 shadow-sm flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-bold text-[#1D1D1F]">{r.userName}</h4>
                    <p className="text-[9px] text-zinc-400 font-semibold mt-0.5">请假日期: {r.date} | 事由: {r.reason}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    r.status === "PENDING_ADMIN" ? "bg-blue-50 text-[#0A84FF]" :
                    r.status === "APPROVED" ? "bg-green-50 text-[#30D158]" : "bg-red-50 text-[#FF453A]"
                  }`}>
                    {r.status === "PENDING_ADMIN" ? "待管理员终审" :
                     r.status === "APPROVED" ? "终审已批准" : "已驳回"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </LeaderLayout>
  );
};

// ==========================================
// 5. LeaderCorrectionSuggestions (补卡、调岗建议)
// ==========================================
export const LeaderCorrectionSuggestions: React.FC = () => {
  const { showToast } = useEventStore();
  const [member, setMember] = useState("林可儿");
  const [type, setType] = useState("补签打卡");
  const [detail, setDetail] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail) {
      showToast("请填写详细建议说明", "warning");
      return;
    }
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setDetail("");
    }, 4000);
  };

  return (
    <LeaderLayout title="提交班期补卡调岗建议">
      <div className="space-y-4">
        {success && (
          <div className="p-3.5 bg-green-50 border border-green-200 rounded-2xl text-xs text-[#30D158] font-bold">
            💡 <strong>提交成功：</strong> 该调整建议已成功提交至后台，会务总监审批确认后，对应组员的班期和考勤将被强制更新。
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-xl border border-black/5 rounded-[22px] p-5 shadow-sm space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">目标组员</label>
            <select 
              value={member} 
              onChange={e => setMember(e.target.value)}
              className="w-full p-3 bg-zinc-50 border border-black/5 rounded-2xl text-xs font-bold outline-none"
            >
              <option value="林可儿">林可儿</option>
              <option value="张小豪">张小豪</option>
              <option value="苏苏">苏苏</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">建议调整类型</label>
            <select 
              value={type} 
              onChange={e => setType(e.target.value)}
              className="w-full p-3 bg-zinc-50 border border-black/5 rounded-2xl text-xs font-bold outline-none"
            >
              <option value="补签打卡">现场漏打卡，协助补签打卡</option>
              <option value="小组调任">小组跨岗位调任</option>
              <option value="排班调休">出勤日排班增加/调休</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">具体调整理由说明</label>
            <textarea
              placeholder="请详细描述调整内容。例如：林可儿下午因舞台设备搬运无法脱开打卡，实际在岗出勤，申请由迟到改为正常..."
              value={detail}
              onChange={e => setDetail(e.target.value)}
              rows={3}
              className="w-full p-3 bg-zinc-50 border border-black/5 rounded-2xl text-xs font-medium outline-none resize-none"
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-3.5 bg-[#FF9F0A] text-white font-bold text-xs rounded-full hover:bg-[#FF9F0A]/90 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Send size={14} /> 提交修改建议
          </button>
        </form>
      </div>
    </LeaderLayout>
  );
};

// ==========================================
// 6. LeaderAttendance (考勤底片归档)
// ==========================================
export const LeaderAttendance: React.FC = () => {
  const { user } = useAuthStore();
  const { showToast } = useEventStore();
  const { attendanceId } = useParams<{ attendanceId: string }>();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"ALL" | "NORMAL" | "LATE" | "ABSENT" | "EXCEPTIONAL">("ALL");

  // Fetch groups and find leader's group
  const { data: groups, isLoading: isLoadingGroups } = useGroups("ACT_2026_01");
  const leaderGroup = groups?.find(g => g.leaderId === user?.id);

  // Fetch attendance records specifically for leader's group
  const { data: attendanceRecords = [], isLoading: isLoadingAttendance } = useAttendanceRecords({
    groupId: leaderGroup?.id
  });

  // Fetch single record if attendanceId is present
  const { data: record, isLoading: isLoadingRecord } = useAttendanceById(attendanceId || "");
  const { data: recordCorrections = [] } = useAttendanceCorrections(attendanceId || "");

  // Fetch suggestions submitted by this leader to show status on card
  const { data: suggestions } = useCorrectionSuggestions({
    leaderId: user?.id
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  
  // Suggestion form state
  const [suggestedStatus, setSuggestedStatus] = useState<any>("NORMAL");
  const [suggestedTime, setSuggestedTime] = useState("");
  const [suggestedType, setSuggestedType] = useState<"CHECK_IN" | "CHECK_OUT">("CHECK_IN");
  const [reason, setReason] = useState("");

  const submitMutation = useSubmitCorrectionSuggestion();

  if (isLoadingGroups || isLoadingAttendance) {
    return (
      <LeaderLayout title="组员考勤底片与归档">
        <div className="text-center py-20 text-xs text-zinc-400 font-semibold">
          正在读取考勤数据...
        </div>
      </LeaderLayout>
    );
  }

  if (!leaderGroup) {
    return (
      <LeaderLayout title="403 无管理权限">
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white/80 backdrop-blur-xl border border-black/5 rounded-[28px] p-8 max-w-sm shadow-sm space-y-4">
            <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-full flex items-center justify-center mx-auto text-[#FF453A]">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-lg font-black text-[#1D1D1F]">403 - 组长权限受限</h1>
            <p className="text-xs text-[#86868B] leading-relaxed font-semibold">
              当前活动、GroupLeaderAssignment、GroupMembership 校验未通过：您未被授权负责该会期的任何小组。
            </p>
          </div>
        </div>
      </LeaderLayout>
    );
  }

  const filteredRecords = (attendanceRecords || []).filter(r => 
    filter === "ALL" || r.status === filter
  );

  const handleOpenDrawer = (rec: any) => {
    setSelectedRecord(rec);
    setSuggestedStatus("NORMAL");
    setSuggestedTime(rec.checkInTime || "09:00");
    setSuggestedType("CHECK_IN");
    setReason("");
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedRecord(null);
  };

  const handleSubmitSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      showToast("请填写申请修正的真实原因！", "error");
      return;
    }
    const targetRecord = selectedRecord || record;
    if (!targetRecord) return;

    submitMutation.mutate({
      attendanceId: targetRecord.id,
      leaderId: user?.id || "U_LEADER",
      update: {
        suggestedStatus,
        suggestedTime: suggestedTime || undefined,
        type: suggestedType,
        reason
      }
    }, {
      onSuccess: () => {
        showToast("已成功提交补卡建议，等待管理员审核处理！", "success");
        handleCloseDrawer();
      },
      onError: (err: any) => {
        showToast(`提交失败: ${err.message}`, "error");
      }
    });
  };

  // 1. Render single record details if attendanceId is present
  if (attendanceId) {
    if (isLoadingRecord) {
      return (
        <LeaderLayout title="考勤底片详情">
          <div className="p-10 text-center text-zinc-400 font-semibold text-xs">
            正在读取考勤打卡原始底片及审计底账...
          </div>
        </LeaderLayout>
      );
    }

    if (!record) {
      return (
        <LeaderLayout title="考勤底片详情">
          <div className="p-10 text-center text-zinc-400 font-semibold text-xs space-y-4">
            <p>未找到该条考勤记录</p>
            <button 
              onClick={() => navigate("/leader/attendance")}
              className="px-4 py-2 bg-zinc-100 rounded-xl text-xs font-bold"
            >
              返回列表
            </button>
          </div>
        </LeaderLayout>
      );
    }

    // Security: Leader can only view records of members in their group
    const isMemberOfGroup = leaderGroup && record.groupId === leaderGroup.id;
    if (!isMemberOfGroup) {
      return (
        <LeaderLayout title="403 权限越界限制">
          <div className="p-10 text-center text-red-500 font-bold text-xs space-y-3">
            <AlertTriangle className="mx-auto" size={28} />
            <p>403 - 权限越界限制</p>
            <p className="text-zinc-500 font-semibold">
              根据沙盒数据安全策略，您仅被授权查看和修正您负责的小组【{leaderGroup?.name || "未知小组"}】的成员底片，无权越权访问其他组员。
            </p>
            <button 
              onClick={() => navigate("/leader/attendance")}
              className="mt-2 px-4 py-2 bg-zinc-100 rounded-xl text-zinc-600 font-bold"
            >
              返回我的小组考勤
            </button>
          </div>
        </LeaderLayout>
      );
    }

    const pendingSug = (suggestions || []).find(s => s.attendanceId === record.id && s.status === "PENDING");

    return (
      <LeaderLayout title="考勤底片详情">
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-black/5 pb-4">
            <button 
              onClick={() => navigate("/leader/attendance")}
              className="p-1.5 hover:bg-slate-100 rounded-full text-zinc-600 transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className="text-lg font-extrabold text-[#1D1D1F]">考勤底片细节与修正建议</h2>
              <p className="text-[10px] text-zinc-400 font-medium">考勤ID: {record.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-black/5 rounded-[22px] p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-50 text-[#0A84FF] rounded-full flex items-center justify-center font-black text-sm">
                  {record.userName.substring(0, 1)}
                </div>
                <div>
                  <h3 className="text-sm font-black text-zinc-800">{record.userName}</h3>
                  <span className="text-[10px] text-zinc-400 block font-mono mt-0.5">{record.positionName}</span>
                </div>
              </div>

              <div className="divide-y divide-zinc-50 pt-2 text-xs font-semibold">
                <div className="py-2.5 flex justify-between">
                  <span className="text-zinc-400">所属小组</span>
                  <span className="text-zinc-800">{record.groupName}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-zinc-400">排班日期</span>
                  <span className="text-zinc-800 font-mono">{record.date}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-zinc-400">当前考勤状态</span>
                  <span className="inline-block scale-90 origin-right">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                      record.status === "NORMAL" 
                        ? "bg-green-50 text-[#30D158]" 
                        : record.status === "LATE"
                          ? "bg-amber-50 text-[#FF9F0A]"
                          : record.status === "EXCEPTIONAL"
                            ? "bg-purple-50 text-[#BF5AF2]"
                            : "bg-red-50 text-[#FF453A]"
                    }`}>
                      {record.status === "NORMAL" ? "正常" : record.status === "LATE" ? "迟到" : record.status === "EXCEPTIONAL" ? "异常" : "缺勤"}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Timings and Selfies */}
            <div className="bg-white border border-black/5 rounded-[22px] p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-black text-zinc-800 flex items-center gap-1.5 border-b border-zinc-50 pb-2">
                <Clock size={14} className="text-[#0A84FF]" /> 签到/签退底片明细
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 border border-black/5 rounded-2xl text-xs font-medium space-y-2">
                  <span className="text-[9px] text-zinc-400 block uppercase">上午签到</span>
                  <p className="text-xs font-black text-zinc-800">{record.checkInTime || "未签到"}</p>
                  <p className="text-[10px] text-zinc-400">定位偏差: {record.checkInDistance !== undefined ? `${record.checkInDistance}m` : "无"}</p>
                  {record.checkInPhoto && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-black/5">
                      <img src={record.checkInPhoto} alt="签到照片" className="w-full h-24 object-cover" referrerPolicy="no-referrer" />
                    </div>
                  )}
                </div>

                <div className="p-3 bg-slate-50 border border-black/5 rounded-2xl text-xs font-medium space-y-2">
                  <span className="text-[9px] text-zinc-400 block uppercase">下午签退</span>
                  <p className="text-xs font-black text-zinc-800">{record.checkOutTime || "未签退"}</p>
                  <p className="text-[10px] text-zinc-400">定位偏差: {record.checkOutDistance !== undefined ? `${record.checkOutDistance}m` : "无"}</p>
                  {record.checkOutPhoto && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-black/5">
                      <img src={record.checkOutPhoto} alt="签退照片" className="w-full h-24 object-cover" referrerPolicy="no-referrer" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* GPS Metrics & Correction trigger */}
            <div className="bg-white border border-black/5 rounded-[22px] p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-black text-zinc-800 flex items-center gap-1.5 border-b border-zinc-50 pb-2">
                <MapPin size={14} className="text-[#0A84FF]" /> 硬件及GPS环境指纹
              </h4>

              <div className="text-xs font-semibold text-zinc-500 space-y-2">
                <div className="flex justify-between">
                  <span>GPS 原始经纬度</span>
                  <span className="text-zinc-800 font-mono text-[10px]">30.1234° N, 120.5678° E</span>
                </div>
                <div className="flex justify-between">
                  <span>物理设备指纹</span>
                  <span className="text-zinc-800 text-[10px]">Safari Mobile, Apple Device</span>
                </div>
                <div className="flex justify-between">
                  <span>网络模拟 IP</span>
                  <span className="text-zinc-800 font-mono text-[10px]">192.168.4.120</span>
                </div>
              </div>

              {record.riskReason && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-[10px] text-red-600 font-bold">
                  ⚠️ 异常警报: {record.riskReason}
                </div>
              )}

              <div className="pt-2">
                {pendingSug ? (
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-[11px] text-[#FF9F0A] font-bold text-center animate-pulse">
                    ⏳ 补卡申请修正中，请等待管理员终审...
                  </div>
                ) : (
                  <button
                    onClick={() => handleOpenDrawer(record)}
                    className="w-full py-3 bg-[#FF9F0A]/10 hover:bg-[#FF9F0A]/20 text-[#FF9F0A] font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    💡 提交补卡或修正建议
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Audit Timeline */}
          <div className="bg-white border border-black/5 rounded-[22px] p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-black text-zinc-800 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#30D158]" /> 修正审计日志记录
            </h4>

            {recordCorrections.length === 0 ? (
              <p className="text-xs text-zinc-400 font-semibold text-center py-4">
                当前数据为直接自排产生的原始底片数据，无人工修改历史。
              </p>
            ) : (
              <div className="space-y-3">
                {recordCorrections.map((corr: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 border border-zinc-100 p-3.5 rounded-2xl text-xs space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-zinc-800">经办修正人: {corr.operatorName}</span>
                      <span className="text-zinc-400 font-mono">{corr.createdAt}</span>
                    </div>
                    <p className="text-zinc-500 font-medium">
                      <strong>更正事由:</strong> {corr.reason}
                    </p>
                    <div className="text-[10px] text-[#0A84FF] font-bold">
                      出勤判定状态更正为：{corr.after.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Suggestion Form Modal inside detail */}
        {isDrawerOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
            <div className="bg-white w-full sm:max-w-md rounded-t-[30px] sm:rounded-[30px] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-slide-up">
              <div className="flex justify-between items-center border-b border-black/5 pb-3">
                <div>
                  <h3 className="text-base font-black text-zinc-950">申请修正考勤记录</h3>
                  <p className="text-[10px] text-zinc-400 mt-0.5">组员: {record.userName}</p>
                </div>
                <button 
                  onClick={handleCloseDrawer}
                  className="text-zinc-400 hover:text-zinc-600 text-lg font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitSuggestion} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-wide block mb-1.5">修改目标打卡</label>
                  <div className="flex gap-2">
                    {(["CHECK_IN", "CHECK_OUT"] as const).map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setSuggestedType(t)}
                        className={`flex-1 py-2 rounded-xl border text-center font-bold transition-all ${
                          suggestedType === t
                            ? "border-[#0A84FF] bg-[#0A84FF]/10 text-[#0A84FF]"
                            : "border-zinc-200 text-zinc-500"
                        }`}
                      >
                        {t === "CHECK_IN" ? "签到打卡" : "签退打卡"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-wide block mb-1.5">建议更正状态</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["NORMAL", "LATE", "ABSENT"] as const).map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setSuggestedStatus(s)}
                        className={`py-2 rounded-xl border text-center font-bold transition-all ${
                          suggestedStatus === s
                            ? "border-[#30D158] bg-[#30D158]/10 text-[#30D158]"
                            : "border-zinc-200 text-zinc-500"
                        }`}
                      >
                        {s === "NORMAL" ? "正常" : s === "LATE" ? "迟到" : "缺勤"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-wide block mb-1.5">建议打卡时间</label>
                  <input
                    type="text"
                    value={suggestedTime}
                    onChange={(e) => setSuggestedTime(e.target.value)}
                    placeholder="e.g. 09:00 或 18:30"
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-mono text-zinc-800"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-wide block mb-1.5">
                    补卡原因 <span className="text-red-500 font-bold">*必填</span>
                  </label>
                  <textarea
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="请输入真实原因..."
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-medium leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#FF9F0A] text-white font-bold text-xs rounded-xl hover:bg-[#FF9F0A]/90 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  确认并提交补卡建议
                </button>
              </form>
            </div>
          </div>
        )}
      </LeaderLayout>
    );
  }

  return (
    <LeaderLayout title="组员考勤底片与归档">
      <div className="space-y-4">
        {/* Info panel */}
        {leaderGroup && (
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-3.5 text-xs text-blue-700 font-semibold flex items-start gap-2 animate-fade-in">
            <span className="text-base">ℹ️</span>
            <div>
              <p>您当前正在管理【{leaderGroup.name}】的考勤数据。</p>
              <p className="font-normal text-blue-600 mt-0.5">根据安全考勤守则，组长仅具有查看与提交修正建议权限，所有补卡需管理员终审。</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {(["ALL", "NORMAL", "LATE", "ABSENT", "EXCEPTIONAL"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                filter === f 
                  ? "bg-white text-zinc-900 shadow-sm" 
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              {f === "ALL" ? "全部" : f === "NORMAL" ? "正常" : f === "LATE" ? "迟到" : f === "ABSENT" ? "缺勤" : "异常"}
            </button>
          ))}
        </div>

        {/* List of attendance records */}
        <div className="space-y-2.5">
          {isLoadingAttendance ? (
            <div className="text-center py-10 text-zinc-400 text-xs font-semibold">
              正在加载组员考勤数据...
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-10 bg-white border border-black/5 rounded-[22px] text-zinc-400 text-xs font-medium">
              无符合筛选条件的考勤记录
            </div>
          ) : (
            filteredRecords.map((record) => {
              // Find if there's a pending suggestion for this record
              const pendingSug = (suggestions || []).find(s => s.attendanceId === record.id && s.status === "PENDING");
              return (
                <div key={record.id} className="bg-white border border-black/5 rounded-[22px] p-4 shadow-sm space-y-3 animate-scale-up">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-extrabold text-[#1D1D1F]">{record.userName}</h4>
                      <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{record.positionName}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {pendingSug && (
                        <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded text-[8px] font-black animate-pulse">
                          ⏳ 修正审核中
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                        record.status === "NORMAL" 
                          ? "bg-green-50 text-[#30D158]" 
                          : record.status === "LATE"
                            ? "bg-amber-50 text-[#FF9F0A]"
                            : record.status === "EXCEPTIONAL"
                              ? "bg-purple-50 text-[#BF5AF2]"
                              : "bg-red-50 text-[#FF453A]"
                      }`}>
                        {record.status === "NORMAL" ? "正常" : record.status === "LATE" ? "迟到" : record.status === "EXCEPTIONAL" ? "异常" : "缺勤"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1 text-xs font-semibold">
                    <div className="p-2.5 bg-slate-50 border border-black/5 rounded-xl">
                      <span className="text-[9px] text-zinc-400 block mb-0.5">签到打卡</span>
                      <span className="text-zinc-800 font-mono">{record.checkInTime || "（未打卡）"}</span>
                      {record.checkInDistance !== undefined && (
                        <span className="text-[9px] text-zinc-400 block mt-1 font-mono">偏差: {record.checkInDistance} 米</span>
                      )}
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-black/5 rounded-xl">
                      <span className="text-[9px] text-zinc-400 block mb-0.5">签退打卡</span>
                      <span className="text-zinc-800 font-mono">{record.checkOutTime || "（未打卡）"}</span>
                      {record.checkOutDistance !== undefined && (
                        <span className="text-[9px] text-zinc-400 block mt-1 font-mono">偏差: {record.checkOutDistance} 米</span>
                      )}
                    </div>
                  </div>

                  {record.status !== "NORMAL" && (
                    <div className="flex gap-2 pt-2 border-t border-black/5 mt-1">
                      <button
                        onClick={() => handleOpenDrawer(record)}
                        disabled={!!pendingSug}
                        className={`flex-1 py-2 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 ${
                          pendingSug 
                            ? "bg-zinc-100 text-zinc-400 cursor-not-allowed" 
                            : "bg-[#FF9F0A]/10 hover:bg-[#FF9F0A]/20 text-[#FF9F0A] cursor-pointer"
                        }`}
                      >
                        💡 {pendingSug ? "已提交修正建议，请等待" : "提交补签或修正出勤建议"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Correction Suggestion Form Modal/Drawer */}
        {isDrawerOpen && selectedRecord && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
            <div className="bg-white w-full sm:max-w-md rounded-t-[30px] sm:rounded-[30px] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-slide-up">
              <div className="flex justify-between items-center border-b border-black/5 pb-3">
                <div>
                  <h3 className="text-base font-black text-zinc-950">申请修正考勤记录</h3>
                  <p className="text-[10px] text-zinc-400 mt-0.5">组员: {selectedRecord.userName} ({selectedRecord.positionName})</p>
                </div>
                <button 
                  onClick={handleCloseDrawer}
                  className="text-zinc-400 hover:text-zinc-600 text-lg font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitSuggestion} className="space-y-4 text-xs font-semibold">
                {/* Type Selection */}
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-wide block mb-1.5">修改目标打卡</label>
                  <div className="flex gap-2">
                    {(["CHECK_IN", "CHECK_OUT"] as const).map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setSuggestedType(t)}
                        className={`flex-1 py-2 rounded-xl border text-center font-bold transition-all ${
                          suggestedType === t
                            ? "border-[#0A84FF] bg-[#0A84FF]/10 text-[#0A84FF]"
                            : "border-zinc-200 text-zinc-500"
                        }`}
                      >
                        {t === "CHECK_IN" ? "签到打卡" : "签退打卡"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Selection */}
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-wide block mb-1.5">建议更正状态</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["NORMAL", "LATE", "ABSENT"] as const).map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setSuggestedStatus(s)}
                        className={`py-2 rounded-xl border text-center font-bold transition-all ${
                          suggestedStatus === s
                            ? "border-[#30D158] bg-[#30D158]/10 text-[#30D158]"
                            : "border-zinc-200 text-zinc-500"
                        }`}
                      >
                        {s === "NORMAL" ? "正常" : s === "LATE" ? "迟到" : "缺勤"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time input */}
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-wide block mb-1.5">建议打卡时间</label>
                  <input
                    type="text"
                    value={suggestedTime}
                    onChange={(e) => setSuggestedTime(e.target.value)}
                    placeholder="格式 e.g. 09:00 或 18:30"
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-mono text-zinc-800"
                  />
                </div>

                {/* Reason input */}
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-wide block mb-1.5">
                    补卡或修正原因 <span className="text-red-500 font-bold">*必填</span>
                  </label>
                  <textarea
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="必须写明真实修正原因，如：展会现场GPS定位漂移、由于设备故障无法打卡、由组长人工核实等..."
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-medium leading-relaxed"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="w-full py-3.5 bg-[#FF9F0A] text-white font-bold text-xs rounded-xl hover:bg-[#FF9F0A]/90 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {submitMutation.isPending ? "正在提交建议..." : "⚡ 确认并提交建议给管理员"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </LeaderLayout>
  );
};

// ==========================================
// 7. LeaderInterviewReviews (面试录用审核)
// ==========================================
export const LeaderInterviewReviews: React.FC = () => {
  const { applications } = useEventStore();
  
  // Pending interview / review applicants
  const pendingCandidates = applications.filter(a => (a.status === "APPROVED" && (a.interviewStatus === "COMPLETED" || a.interviewStatus === "RECOMMENDED")) || a.status === "SUBMITTED");

  return (
    <LeaderLayout title="面试候选人审核">
      <div className="space-y-3">
        <span className="text-[10px] font-extrabold text-[#86868B] uppercase tracking-wider block">等待录用初审的候选人</span>
        {pendingCandidates.length === 0 ? (
          <div className="text-center py-10 bg-white border border-black/5 rounded-[22px] text-zinc-400 text-xs font-medium">
            暂无等待审核的候选人
          </div>
        ) : (
          pendingCandidates.map((c) => (
            <div key={c.id} className="bg-white border border-black/5 rounded-[22px] p-4.5 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-bold text-[#1D1D1F]">{c.userName}</h4>
                  <p className="text-[10px] text-zinc-400 font-mono mt-0.5">意向岗位: {c.targetPositions.join(", ")}</p>
                </div>
                <span className="px-2 py-0.5 bg-blue-50 text-[#0A84FF] rounded-full text-[9px] font-black">
                  {c.status === "SUBMITTED" ? "已报名待面" : "面试完待定"}
                </span>
              </div>
              {c.comment && (
                <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-zinc-600 font-medium leading-relaxed">
                  <strong>组长面评：</strong>{c.comment}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </LeaderLayout>
  );
};

// ==========================================
// 8. LeaderInviteLinks (生成注册邀请码)
// ==========================================
export const LeaderInviteLinks: React.FC = () => {
  const [links, setLinks] = useState([
    { id: "L_LINK_01", groupName: "舞台控场组", role: "STAFF", code: "STAGE_STAFF_INV_X7", expiredAt: "2026-07-20", count: 12 }
  ]);
  const [message, setMessage] = useState("");

  const generateLink = () => {
    const newCode = `STAGE_STAFF_INV_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setLinks(prev => [
      ...prev,
      {
        id: `L_LINK_${Date.now()}`,
        groupName: "舞台控场组",
        role: "STAFF",
        code: newCode,
        expiredAt: "2026-07-25",
        count: 0
      }
    ]);
    setMessage("成功生成一条全新 STAFF 注册邀请码！已自动同步分发至云数据库中。");
    setTimeout(() => setMessage(""), 4000);
  };

  return (
    <LeaderLayout title="生成组员注册专属邀请码">
      <div className="space-y-4">
        {message && (
          <div className="p-3.5 bg-green-50 border border-green-200 rounded-2xl text-xs text-[#30D158] font-bold">
            💡 {message}
          </div>
        )}

        <div className="bg-white border border-black/5 rounded-[22px] p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-bold text-[#1D1D1F]">内部推荐规则</h3>
            <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">
              漫展内部推荐专属邀请码。通过该邀请码报名的候选人，其报名表将自动绑定您的“推荐渠道（舞台控场组推荐）”，并在报名筛选中享有极速通道。新用户需<b>进入统一待审核状态</b>，并依次通过<b>报名审核、实名面试、组长评价、管理员终审</b>四级安全流程后，方可录用上岗，严禁绕过面试直接入职。
            </p>
          </div>

          <button
            onClick={generateLink}
            className="w-full py-3 bg-[#FF9F0A] text-white text-xs font-bold rounded-full hover:bg-[#FF9F0A]/95 transition-all cursor-pointer text-center"
          >
            + 立即生成本组专属内招报名码
          </button>
        </div>

        <div className="space-y-2.5">
          <span className="text-[10px] font-extrabold text-[#86868B] uppercase tracking-wider block">我已生成的邀请码</span>
          
          {links.map((link) => (
            <div key={link.id} className="bg-white border border-black/5 rounded-2xl p-4 flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-[#1D1D1F] font-mono select-all bg-zinc-50 border border-black/5 px-2 py-1 rounded-lg inline-block">{link.code}</p>
                <p className="text-[10px] text-zinc-400 mt-1 font-semibold">加入角色: {link.role} | 目标小组: {link.groupName}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-[#FF9F0A] font-mono">{link.count} 人已用</span>
                <p className="text-[9px] text-zinc-400 font-semibold mt-0.5">有效期至 {link.expiredAt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </LeaderLayout>
  );
};

// ==========================================
// 9. LeaderTransferSuggestions (异动调岗)
// ==========================================
export const LeaderTransferSuggestions: React.FC = () => {
  return <LeaderCorrectionSuggestions />;
};

// ==========================================
// 10. LeaderAnnouncements (组长公告消息)
// ==========================================
export const LeaderAnnouncements: React.FC = () => {
  const { user } = useAuthStore();
  const { data: announcements = [], isLoading } = useAnnouncements();
  const confirmMutation = useConfirmAnnouncement();

  if (isLoading) {
    return (
      <LeaderLayout title="组长及展务通知公告">
        <div className="text-center py-20 text-xs text-zinc-400 font-semibold animate-pulse">
          正在读取通知公告...
        </div>
      </LeaderLayout>
    );
  }

  const leaderAnnouncements = announcements.filter(
    (a) => a.targetRole === "ALL" || a.targetRole === "LEADER"
  );

  return (
    <LeaderLayout title="组长及展务通知公告">
      <div className="space-y-3">
        <span className="text-[10px] font-extrabold text-[#86868B] uppercase tracking-wider block">组长专用通知及展务动态</span>
        {leaderAnnouncements.length === 0 ? (
          <div className="text-center py-10 bg-white border border-black/5 rounded-[22px] text-zinc-400 text-xs font-medium">
            暂无面向组长层级的公告
          </div>
        ) : (
          leaderAnnouncements.map((a) => {
            const isConfirmed = a.confirmedUserIds?.includes(user?.id || "");
            return (
              <div key={a.id} className="bg-white border border-black/5 rounded-[22px] p-4.5 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-[#1D1D1F]">{a.title}</h4>
                  <span className="text-[9px] text-zinc-400 font-mono">{a.createdAt || a.publishDate}</span>
                </div>
                <p className="text-[11px] text-zinc-600 font-medium leading-relaxed">{a.content}</p>
                <div className="flex justify-between items-center pt-2 border-t border-zinc-50">
                  <span className="text-[9px] text-zinc-400 font-semibold">
                    确认状态：{isConfirmed ? "✅ 已签署确认" : "⏳ 待签署确认"}
                  </span>
                  {!isConfirmed && (
                    <button
                      onClick={() => confirmMutation.mutate({ announcementId: a.id, userId: user?.id || "" })}
                      className="px-3 py-1.5 bg-[#0A84FF] text-white text-[10px] font-bold rounded-lg hover:bg-[#0A84FF]/90 transition-all cursor-pointer"
                    >
                      确认并知悉
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </LeaderLayout>
  );
};
