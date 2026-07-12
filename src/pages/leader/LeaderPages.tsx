import React, { useState } from "react";
import { LeaderLayout } from "../../app/layouts/LeaderLayout";
import { useAuthStore } from "../../app/stores/authStore";
import { useEventStore } from "../../app/stores/eventStore";
import { 
  Users, MapPin, Scan, CheckCircle, Clock, 
  Send, AlertTriangle, Play, RefreshCw, Star, MessageSquare 
} from "lucide-react";

// ==========================================
// 1. LeaderDashboard (组长工作大盘)
// ==========================================
export const LeaderDashboard: React.FC = () => {
  const { attendanceRecords, groups } = useEventStore();
  const leaderGroup = groups[0] || { name: "舞台控场组", memberIds: [] };

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
  const members = [
    { id: "U_01", name: "林可儿", phone: "13800000001", position: "舞台控场岗", insurance: "太平洋已保", attendanceRate: "100%" },
    { id: "U_02", name: "张小豪", phone: "13912345678", position: "后勤协调岗", insurance: "太平洋已保", attendanceRate: "100%" },
    { id: "U_03", name: "苏苏", phone: "13111110000", position: "秩序维持岗", insurance: "太平洋已保", attendanceRate: "50%" }
  ];

  return (
    <LeaderLayout title="本小组组员通讯录">
      <div className="space-y-3">
        {members.map((m) => (
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
        ))}
      </div>
    </LeaderLayout>
  );
};

// ==========================================
// 3. LeaderInterviewScan (面试动态扫码、评价与面试底片录入)
// ==========================================
export const LeaderInterviewScan: React.FC = () => {
  const { scanInterviewQrCode, evaluateInterview, applications } = useEventStore();
  const [candidateId, setCandidateId] = useState("U_APPLICANT"); // Default sandbox applicant
  const [scanResult, setScanResult] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [evalComment, setEvalComment] = useState("");
  const [submittingEval, setSubmittingEval] = useState(false);

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
      alert("评价提交成功！面试成绩已自动记录并流转到会务考务总监待批录用。");
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
                className="flex-1 p-2 bg-white border border-black/5 rounded-xl text-xs font-semibold"
              >
                <option value="U_APPLICANT">林可儿 (待面试)</option>
                <option value="U_TEMP_999">张小黑 (非正常预约用户)</option>
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
  const [requests, setRequests] = useState([
    { id: "L_REQ_01", userName: "苏苏", date: "2026-07-12", reason: "学校有紧急论文答辩需要请假半天", status: "PENDING" }
  ]);

  const handleAudit = (id: string, accept: boolean) => {
    setRequests(prev => prev.map(r => {
      if (r.id === id) {
        return { ...r, status: accept ? "APPROVED" : "REJECTED" };
      }
      return r;
    }));
    alert(accept ? "请假批准通过！已流转至总后台会务总监进行终审确认。" : "请假驳回，已通过系统短信通知组员。");
  };

  return (
    <LeaderLayout title="初审组员请假申请">
      <div className="space-y-3">
        <span className="text-[10px] font-extrabold text-[#86868B] uppercase tracking-wider block">待初审的请假条</span>
        
        {requests.map((r) => (
          <div key={r.id} className="bg-white border border-black/5 rounded-[22px] p-4.5 shadow-sm space-y-3">
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
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                r.status === "PENDING" 
                  ? "bg-amber-50 text-[#FF9F0A]" 
                  : r.status === "APPROVED" 
                    ? "bg-green-50 text-[#30D158]" 
                    : "bg-red-50 text-[#FF453A]"
              }`}>
                {r.status === "PENDING" ? "待审核" : r.status === "APPROVED" ? "已批准" : "已驳回"}
              </span>
            </div>

            <div className="p-3 bg-zinc-50 rounded-2xl text-xs text-zinc-700 leading-relaxed whitespace-pre-wrap font-medium">
              事由：{r.reason}
            </div>

            {r.status === "PENDING" && (
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleAudit(r.id, true)}
                  className="flex-1 py-2.5 bg-[#FF9F0A] text-white font-bold text-xs rounded-xl hover:bg-[#FF9F0A]/95 transition-all cursor-pointer"
                >
                  批准同意
                </button>
                <button
                  onClick={() => handleAudit(r.id, false)}
                  className="py-2.5 px-4 bg-red-50 border border-red-200 text-[#FF453A] font-bold text-xs rounded-xl hover:bg-red-100 transition-all cursor-pointer"
                >
                  驳回
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </LeaderLayout>
  );
};

// ==========================================
// 5. LeaderCorrectionSuggestions (补卡、调岗建议)
// ==========================================
export const LeaderCorrectionSuggestions: React.FC = () => {
  const [member, setMember] = useState("林可儿");
  const [type, setType] = useState("补签打卡");
  const [detail, setDetail] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail) {
      alert("请填写详细建议说明");
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
  const { attendanceRecords } = useEventStore();
  const [filter, setFilter] = useState<"ALL" | "NORMAL" | "LATE" | "ABSENT">("ALL");

  const filteredRecords = attendanceRecords.filter(r => 
    filter === "ALL" || r.status === filter
  );

  return (
    <LeaderLayout title="组员考勤底片与归档">
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {(["ALL", "NORMAL", "LATE", "ABSENT"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                filter === f 
                  ? "bg-white text-zinc-900 shadow-sm" 
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              {f === "ALL" ? "全部" : f === "NORMAL" ? "正常" : f === "LATE" ? "迟到" : "缺勤"}
            </button>
          ))}
        </div>

        {/* List of attendance records */}
        <div className="space-y-2.5">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-10 bg-white border border-black/5 rounded-[22px] text-zinc-400 text-xs font-medium">
              无符合筛选条件的考勤记录
            </div>
          ) : (
            filteredRecords.map((record) => (
              <div key={record.id} className="bg-white border border-black/5 rounded-[22px] p-4 shadow-sm space-y-3 animate-scale-up">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-extrabold text-[#1D1D1F]">{record.userName}</h4>
                    <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{record.positionName}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                    record.status === "NORMAL" 
                      ? "bg-green-50 text-[#30D158]" 
                      : "bg-orange-50 text-[#FF9F0A]"
                  }`}>
                    {record.status === "NORMAL" ? "正常" : "异常"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-semibold">
                  <div className="p-2.5 bg-slate-50 border border-black/5 rounded-xl">
                    <span className="text-[9px] text-zinc-400 block mb-0.5">签到打卡</span>
                    <span className="text-zinc-800">{record.checkInTime || "（未打卡）"}</span>
                    {record.checkInDistance !== undefined && (
                      <span className="text-[9px] text-zinc-400 block mt-1 font-mono">偏差: {record.checkInDistance} 米</span>
                    )}
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-black/5 rounded-xl">
                    <span className="text-[9px] text-zinc-400 block mb-0.5">签退打卡</span>
                    <span className="text-zinc-800">{record.checkOutTime || "（未打卡）"}</span>
                    {record.checkOutDistance !== undefined && (
                      <span className="text-[9px] text-zinc-400 block mt-1 font-mono">偏差: {record.checkOutDistance} 米</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
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
  const pendingCandidates = applications.filter(a => a.status === "SUBMITTED" || a.status === "INTERVIEWED");

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
            <h3 className="text-xs font-bold text-[#1D1D1F]">快捷邀请规则</h3>
            <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">
              动漫展现场由于人员流动巨大，组长可在此直接生成小组专属注册码。通过该码注册的用户，其系统级别将自动晋升为 <b>STAFF 级别</b> 且免审加入您的“舞台控场组”。
            </p>
          </div>

          <button
            onClick={generateLink}
            className="w-full py-3 bg-[#FF9F0A] text-white text-xs font-bold rounded-full hover:bg-[#FF9F0A]/95 transition-all cursor-pointer text-center"
          >
            + 立即生成本组专属 STAFF 注册码
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
  const { announcements } = useEventStore();
  const leaderAnnouncements = announcements.filter(a => a.targetRole === "ALL" || a.targetRole === "LEADER");

  return (
    <LeaderLayout title="组长及展务通知公告">
      <div className="space-y-3">
        <span className="text-[10px] font-extrabold text-[#86868B] uppercase tracking-wider block">组长专用通知及展务动态</span>
        {leaderAnnouncements.length === 0 ? (
          <div className="text-center py-10 bg-white border border-black/5 rounded-[22px] text-zinc-400 text-xs font-medium">
            暂无面向组长层级的公告
          </div>
        ) : (
          leaderAnnouncements.map((a) => (
            <div key={a.id} className="bg-white border border-black/5 rounded-[22px] p-4.5 shadow-sm space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-[#1D1D1F]">{a.title}</h4>
                <span className="text-[9px] text-zinc-400 font-mono">{a.createdAt}</span>
              </div>
              <p className="text-[11px] text-zinc-600 font-medium leading-relaxed">{a.content}</p>
            </div>
          ))
        )}
      </div>
    </LeaderLayout>
  );
};
