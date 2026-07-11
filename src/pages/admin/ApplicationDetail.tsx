import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEventStore } from "../../app/stores/eventStore";
import { AdminLayout } from "../../app/layouts/AdminLayout";
import { BentoGrid, BentoCard, StatusBadge, SensitiveText } from "../../shared/ui";
import { 
  ArrowLeft, CheckCircle, XCircle, AlertCircle, Clock, 
  Briefcase, Landmark, BookOpen, ShieldCheck, ClipboardCheck
} from "lucide-react";
import { ApplicationStatus, InterviewStatus } from "../../shared/types";

export const ApplicationDetail: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const { applications, auditApplication, evaluateInterview, employStaff } = useEventStore();

  const app = applications.find((a) => a.id === applicationId);

  // 终审分配参数
  const [selectedGroup, setSelectedGroup] = useState("舞台控场组");
  const [selectedPosition, setSelectedPosition] = useState("舞台控场岗");
  const [commentInput, setCommentInput] = useState("");

  if (!app) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-sm text-[#86868B] font-semibold">找不到指定的岗位申请件信息</p>
          <button onClick={() => navigate("/admin/applications")} className="mt-4 px-4 py-2 bg-zinc-100 rounded-full font-bold text-xs">
            返回列表
          </button>
        </div>
      </AdminLayout>
    );
  }

  // 1. 初审资格审核通过
  const handleApproveApp = () => {
    auditApplication(
      app.id, 
      "APPROVED", 
      "会场总监张晓明", 
      commentInput || "简历资质初审合格。欢迎进入面试预约环节，已自动触发邀请短信通知。"
    );
    setCommentInput("");
    alert("初审批准通过！系统已释放该用户的面试预约资格。");
  };

  // 2. 驳回/驳退
  const handleRejectApp = () => {
    auditApplication(
      app.id, 
      "REJECTED", 
      "会场总监张晓明", 
      commentInput || "十分抱歉，您填报的岗位出勤日期或相关经历与会场要求冲突，暂不予批准录用。"
    );
    setCommentInput("");
    alert("该岗位申请件已标记驳回归档。");
  };

  // 3. 终审录取
  const handleHireStaff = (isEmployed: boolean) => {
    employStaff(app.id, isEmployed, selectedGroup, selectedPosition);
    alert(isEmployed ? `终审合格！已录取该志愿并划分岗位：${selectedGroup} - ${selectedPosition}` : "终审操作成功");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Back Link Header */}
        <div className="flex justify-between items-center border-b border-black/5 pb-4">
          <button 
            onClick={() => navigate("/admin/applications")} 
            className="flex items-center gap-1.5 text-xs font-bold text-[#0A84FF] hover:underline cursor-pointer"
          >
            <ArrowLeft size={14} /> 返回岗位申请列表
          </button>
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500 font-semibold font-mono">APP ID: {app.id}</span>
            <StatusBadge status={app.status} />
          </div>
        </div>

        {/* Apple style Bento Grid Layout */}
        <BentoGrid>
          {/* Card 1: Basic Profile Info (Span 4) */}
          <BentoCard span={4} className="space-y-4">
            <h3 className="text-xs font-extrabold text-[#1D1D1F] border-b border-zinc-100 pb-2 flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-[#0A84FF]" /> 1. 志愿者候选人档案
            </h3>
            <div className="space-y-3.5 text-xs text-zinc-500 font-semibold">
              <div className="flex justify-between">
                <span>真实姓名</span>
                <span className="text-[#1D1D1F] font-bold">{app.userName}</span>
              </div>
              <div className="flex justify-between">
                <span>性别</span>
                <span className="text-[#1D1D1F]">{app.userId.includes("APPLICANT") || app.userName.includes("可儿") ? "女 (Female)" : "男 (Male)"}</span>
              </div>
              <div className="flex justify-between">
                <span>实名手机号</span>
                <SensitiveText text={app.userPhone} type="PHONE" />
              </div>
              <div className="flex justify-between">
                <span>脱敏身份证号</span>
                <SensitiveText text="330104200108151214" type="IDCARD" />
              </div>
            </div>
          </BentoCard>

          {/* Card 2: Wage Bank Cards Settlement (Span 4) */}
          <BentoCard span={4} className="space-y-4">
            <h3 className="text-xs font-extrabold text-[#1D1D1F] border-b border-zinc-100 pb-2 flex items-center gap-1.5">
              <Landmark size={15} className="text-[#BF5AF2]" /> 2. 财务发放结算卡详情
            </h3>
            <div className="space-y-3.5 text-xs text-zinc-500 font-semibold">
              <div className="flex justify-between">
                <span>银行卡开户姓名</span>
                <span className="text-[#1D1D1F] font-bold">{app.userName} (借记)</span>
              </div>
              <div className="flex justify-between">
                <span>所属发卡行</span>
                <span className="text-[#1D1D1F]">中国工商银行 / 招商银行</span>
              </div>
              <div className="flex justify-between">
                <span>结算卡卡号</span>
                <SensitiveText text="62220212000045128899" type="BANKCARD" />
              </div>
              <div className="flex justify-between">
                <span>具体开户支行</span>
                <span className="text-[#1D1D1F] truncate max-w-[120px]">杭州市城西西湖支行</span>
              </div>
            </div>
          </BentoCard>

          {/* Card 3: Experience & Preferences (Span 4) */}
          <BentoCard span={4} className="space-y-4">
            <h3 className="text-xs font-extrabold text-[#1D1D1F] border-b border-zinc-100 pb-2 flex items-center gap-1.5">
              <BookOpen size={15} className="text-[#FF9F0A]" /> 3. 岗位意向与出勤时间
            </h3>
            <div className="space-y-3.5 text-xs text-zinc-500 font-semibold">
              <div className="flex justify-between">
                <span>心仪工作岗位</span>
                <span className="text-[#1D1D1F] font-bold">{app.targetPositions.join("、")}</span>
              </div>
              <div className="flex justify-between">
                <span>可安排出勤日期</span>
                <span className="text-[#30D158] font-bold">{app.availableDates.join("、")}</span>
              </div>
              <div className="flex justify-between">
                <span>简历递交时间</span>
                <span className="text-[#1D1D1F] font-mono">{app.submittedAt}</span>
              </div>
              <div className="flex justify-between">
                <span>资质自拍底片</span>
                <span className="text-[#0A84FF] font-semibold underline cursor-pointer">查看证件底片OCR.jpg</span>
              </div>
            </div>
          </BentoCard>

          {/* Card 4: Written answers & Interview logs (Span 8) */}
          <BentoCard span={8} className="space-y-4">
            <div>
              <h3 className="text-xs font-extrabold text-[#1D1D1F] flex items-center gap-1.5 mb-1.5">
                <Briefcase size={15} className="text-[#30D158]" /> 4. 履历自述与过往经验
              </h3>
              <p className="text-[10px] text-zinc-400 font-semibold">由候选人在报名表单中自主陈述的现场出勤志愿能力证明。</p>
            </div>
            
            <div className="p-4 bg-slate-50 border border-black/5 rounded-2xl text-xs text-zinc-800 leading-relaxed whitespace-pre-wrap font-medium">
              {app.experience}
            </div>

            {/* Audit Comments history */}
            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-bold text-[#86868B] block uppercase">历史审批核准评语</span>
              <div className="space-y-2.5">
                {app.auditHistory.map((item, index) => (
                  <div key={index} className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl text-xs flex justify-between items-start">
                    <div className="space-y-0.5">
                      <p className="font-bold text-[#1D1D1F]">
                        操作人: {item.operatorName} (标记为: <span className="text-[#0A84FF]">{item.status}</span>)
                      </p>
                      <p className="text-[10px] text-zinc-500 leading-relaxed">{item.comment}</p>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-400 shrink-0">{item.time.substring(5, 16)}</span>
                  </div>
                ))}
              </div>
            </div>
          </BentoCard>

          {/* Card 5: Core Action Desk (Span 4) */}
          <BentoCard span={4} className="bg-slate-50 space-y-4 border-2 border-black/8 shadow-md">
            <div>
              <h3 className="text-xs font-extrabold text-[#1D1D1F] flex items-center gap-1.5 mb-1">
                <ClipboardCheck size={16} className="text-[#0A84FF]" /> 5. 考务总监审批控制台
              </h3>
              <p className="text-[10px] text-[#86868B] font-medium">管理员根据目前进度进行相应的审批状态流转及核发。</p>
            </div>

            {/* 阶段 1: 简历资格初筛 */}
            {app.status === "SUBMITTED" && (
              <div className="space-y-4 pt-1">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500">审批评语 (用于发送反馈通知短信)</label>
                  <textarea
                    placeholder="请输入评语，可空..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    rows={2}
                    className="w-full p-2.5 border border-black/5 rounded-xl text-xs bg-white focus:border-[#0A84FF] outline-none font-medium resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleApproveApp}
                    className="flex-1 py-3 bg-[#0A84FF] hover:bg-[#0A84FF]/90 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    批准初审通过
                  </button>
                  <button
                    onClick={handleRejectApp}
                    className="flex-1 py-3 bg-red-50 hover:bg-red-100 text-[#FF453A] border border-red-200 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    直接驳回
                  </button>
                </div>
              </div>
            )}

            {/* 阶段 2: 面试完成后的录取分配 (APPROVED 阶段) */}
            {app.status === "APPROVED" && (
              <div className="space-y-4 pt-1">
                {app.employmentStatus === "PENDING" ? (
                  <>
                    <div className="p-3 bg-white/60 border border-black/5 rounded-2xl text-[11px] text-[#86868B] font-medium space-y-1">
                      <p className="font-bold text-[#1D1D1F]">当前面试进度：</p>
                      <p>● 场次：2026-07-09 下午 14:00 (博览中心B馆)</p>
                      <p>
                        ● 面试状态：
                        <span className="text-[#30D158] font-bold">
                          {app.interviewStatus === "ATTENDED" ? "● 已到场候考" : "● 面试测评完成(推荐录用)"}
                        </span>
                      </p>
                    </div>

                    <div className="h-px bg-zinc-200" />

                    <div className="space-y-3 text-xs">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500">分配工作小组</label>
                        <select
                          value={selectedGroup}
                          onChange={(e) => setSelectedGroup(e.target.value)}
                          className="w-full px-3 py-2 border border-black/5 rounded-xl bg-white outline-none text-xs font-semibold"
                        >
                          <option value="舞台控场组">舞台控场组</option>
                          <option value="门禁检票A组">门禁检票A组</option>
                          <option value="后勤机动组">后勤机动组</option>
                          <option value="秩序引导组">秩序引导组</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500">分派岗位职责</label>
                        <select
                          value={selectedPosition}
                          onChange={(e) => setSelectedPosition(e.target.value)}
                          className="w-full px-3 py-2 border border-black/5 rounded-xl bg-white outline-none text-xs font-semibold"
                        >
                          <option value="舞台控场岗">舞台控场岗</option>
                          <option value="门禁检票岗">门禁检票岗</option>
                          <option value="后勤机动岗">后勤机动岗</option>
                          <option value="秩序疏导岗">秩序疏导岗</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleHireStaff(true)}
                        className="flex-1 py-3 bg-[#30D158] hover:bg-[#30D158]/95 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                      >
                        确认终审录用并排班
                      </button>
                      <button
                        onClick={() => handleHireStaff(false)}
                        className="py-3 px-3 bg-red-50 border border-red-200 text-[#FF453A] text-xs font-bold rounded-xl cursor-pointer hover:bg-red-100 transition-colors"
                      >
                        不予录用
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 bg-white border border-black/5 rounded-2xl space-y-2">
                    <div className="w-10 h-10 bg-green-50 text-[#30D158] border border-green-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle size={20} />
                    </div>
                    <p className="text-xs font-bold text-[#1D1D1F]">已正式录用为 STAFF</p>
                    <p className="text-[10px] text-[#86868B] leading-relaxed">
                      该用户已解锁现场考勤和自拍照打卡特权。其分派岗位：{selectedGroup} - {selectedPosition}。
                    </p>
                  </div>
                )}
              </div>
            )}
          </BentoCard>
        </BentoGrid>
      </div>
    </AdminLayout>
  );
};
