import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "../../app/layouts/AdminLayout";
import { useAuthStore } from "../../app/stores/authStore";
import { useEventStore } from "../../app/stores/eventStore";
import { Application, AttendanceRecord } from "../../shared/types";
import {
  useAttendanceRecords,
  useAttendanceById,
  useAttendanceCorrections,
  useCorrectAttendance,
  useCorrectionSuggestions,
  useApproveCorrectionSuggestion,
  usePeople,
  useUpdateUserRole,
  useGroups,
  useAnnouncements,
  useCreateAnnouncement,
  useLeaveRequests,
  useAuditLeaveRequest
} from "../../shared/hooks/useQueries";
import { 
  Users, UserCheck, ShieldCheck, Megaphone, FileText, 
  UploadCloud, FileSpreadsheet, PlusCircle, Trash2, CheckCircle, XCircle,
  ArrowLeft, History, Clock, AlertTriangle, FileClock
} from "lucide-react";

// ==========================================
// 1. AdminGroups (小组与岗位管理)
// ==========================================
export const AdminGroups: React.FC = () => {
  const { groups } = useEventStore();
  const [groupList, setGroupList] = useState(groups);
  const [newGroupName, setNewGroupName] = useState("");

  const handleAddGroup = () => {
    if (!newGroupName) return;
    setGroupList(p => [
      ...p,
      {
        id: `GRP_${Date.now()}`,
        activityId: "ACT_2026_01",
        name: newGroupName,
        leaderId: "U_NEW_L",
        leaderName: "待指派组长",
        leaderPhone: "---",
        memberIds: []
      }
    ]);
    setNewGroupName("");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-black/5 pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#1D1D1F]">小组与会务岗位管理</h2>
            <p className="text-xs text-[#86868B] font-medium mt-1">创建、划分工作小组并指派出勤队长（组长）。</p>
          </div>
          
          <div className="flex gap-2">
            <input 
              placeholder="新增小组名称..."
              value={newGroupName}
              onChange={e => setNewGroupName(e.target.value)}
              className="px-3.5 py-2 border border-black/5 rounded-xl text-xs bg-white focus:border-[#0A84FF] outline-none font-semibold"
            />
            <button 
              onClick={handleAddGroup}
              className="px-4 py-2 bg-[#0A84FF] text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle size={14} /> 新建小组
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {groupList.map((g) => (
            <div key={g.id} className="bg-white border border-black/5 rounded-[22px] p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-[#1D1D1F]">{g.name}</h3>
                  <span className="text-[9px] font-mono text-zinc-400">GRP ID: {g.id}</span>
                </div>
                <span className="px-2.5 py-0.5 bg-blue-50 text-[#0A84FF] rounded-full text-[10px] font-bold">
                  {g.memberIds.length} 人在岗
                </span>
              </div>

              <div className="h-px bg-zinc-100" />

              <div className="space-y-2 text-xs text-zinc-500 font-semibold">
                <div className="flex justify-between">
                  <span>指定现场负责人</span>
                  <span className="text-[#1D1D1F] font-bold">{g.leaderName}</span>
                </div>
                <div className="flex justify-between">
                  <span>组长直连电话</span>
                  <span className="text-[#1D1D1F] font-mono">{g.leaderPhone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

// ==========================================
// 2. AdminLeave (请假最终审批控制台)
// ==========================================
export const AdminLeave: React.FC = () => {
  const { user } = useAuthStore();
  const { showToast } = useEventStore();
  const { data: leaves = [], isLoading } = useLeaveRequests({});
  const auditMutation = useAuditLeaveRequest();

  const handleFinalAudit = (id: string, isApprove: boolean) => {
    if (!user) return;
    const finalStatus = isApprove ? "APPROVED" : "REJECTED";

    auditMutation.mutate({
      id,
      status: finalStatus,
      comment: isApprove ? "总部终审批准，自动扣减今日应到人数，并录入劳务及保险结算结算剔除名单。" : "终审驳回，请继续到岗出勤。",
      auditorId: user.id,
      role: "ADMIN"
    }, {
      onSuccess: () => {
        showToast(
          isApprove 
            ? "请假单终审核准！已核减出勤考核，并自动写入保费/劳务扣减名单。" 
            : "请假单终审已驳回，相关拒绝结果已通知组员及组长。", 
          "success"
        );
      },
      onError: (err: any) => {
        showToast(`审核提交失败: ${err.message}`, "error");
      }
    });
  };

  // Divide into pending admin (which leader approved) and already processed
  const pendingLeaves = (leaves || []).filter(l => l.status === "PENDING_ADMIN");
  const processedLeaves = (leaves || []).filter(l => l.status === "APPROVED" || l.status === "REJECTED");

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-black/5 pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#1D1D1F]">STAFF 请假终审控制台</h2>
            <p className="text-xs text-[#86868B] font-medium mt-1">处理经由组长初步审核上报的请假单，进行最终裁决及保险/劳务清扣核算。</p>
          </div>
          <span className="px-2.5 py-1 bg-[#0A84FF]/10 text-[#0A84FF] rounded-full text-[10px] font-bold border border-[#0A84FF]/20">
            Audit Trail Enabled
          </span>
        </div>

        <div className="space-y-6 max-w-3xl">
          {/* Pending Final Approvals */}
          <div className="space-y-3">
            <span className="text-[10px] font-extrabold text-[#86868B] tracking-wide uppercase block">
              待总部终审 ({pendingLeaves.length})
            </span>

            {isLoading ? (
              <div className="text-center py-6 text-xs text-zinc-400 font-semibold">加载请假申请库...</div>
            ) : pendingLeaves.length === 0 ? (
              <div className="text-center py-8 bg-zinc-50 border border-black/5 rounded-2xl text-xs text-[#86868B] font-semibold">
                当前没有待您终审的请假单。所有组员假单均已处理或待组长初审。
              </div>
            ) : (
              pendingLeaves.map((l) => (
                <div key={l.id} className="bg-white border border-black/5 rounded-[22px] p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-50 text-[#FF9F0A] flex items-center justify-center font-bold text-sm">
                        {l.userName?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-[#1D1D1F]">{l.userName} (手机: {l.userPhone || "保密"})</h3>
                        <p className="text-[10px] text-zinc-400 font-mono">申请休假会期日期：{l.date}</p>
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-[#FF9F0A]">
                      ● 组长已初审通过
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 border border-black/5 rounded-2xl text-xs text-zinc-700 leading-relaxed font-semibold">
                    请假原因：{l.reason}
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button 
                      disabled={auditMutation.isPending}
                      onClick={() => handleFinalAudit(l.id, true)}
                      className="px-5 py-2 bg-[#30D158] hover:bg-[#30D158]/90 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <CheckCircle size={14} /> 准予休假
                    </button>
                    <button 
                      disabled={auditMutation.isPending}
                      onClick={() => handleFinalAudit(l.id, false)}
                      className="px-5 py-2 bg-red-50 border border-red-200 text-[#FF453A] font-bold text-xs rounded-xl hover:bg-red-100 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <XCircle size={14} /> 予以驳回
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Already Audited List */}
          <div className="space-y-3">
            <span className="text-[10px] font-extrabold text-[#86868B] tracking-wide uppercase block">
              请假审批历史记录 ({processedLeaves.length})
            </span>

            {processedLeaves.length > 0 && (
              <div className="bg-white border border-black/5 rounded-[22px] p-4.5 shadow-sm space-y-3">
                {processedLeaves.map((l) => (
                  <div key={l.id} className="flex justify-between items-center text-xs border-b border-zinc-50 pb-3 last:border-b-0 last:pb-0">
                    <div>
                      <h4 className="font-bold text-[#1D1D1F]">{l.userName}</h4>
                      <p className="text-[10px] text-zinc-400 mt-0.5">请假日期：{l.date} | 事由: {l.reason}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      l.status === "APPROVED" ? "bg-green-50 text-[#30D158]" : "bg-red-50 text-[#FF453A]"
                    }`}>
                      {l.status === "APPROVED" ? "准予休假" : "予以驳回"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

// ==========================================
// 3. AdminAnnouncements (公告管理发布)
// ==========================================
export const AdminAnnouncements: React.FC = () => {
  const { showToast } = useEventStore();
  const [titleInput, setTitleInput] = useState("");
  const [contentInput, setContentInput] = useState("");
  const [isRequired, setIsRequired] = useState(false);

  const { data: annList = [], isLoading } = useAnnouncements();
  const createAnnMutation = useCreateAnnouncement();

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim() || !contentInput.trim()) {
      showToast("请填写完整的公告标题与内容！", "error");
      return;
    }

    createAnnMutation.mutate({
      title: titleInput,
      content: contentInput,
      isRequiredConfirm: isRequired
    }, {
      onSuccess: () => {
        showToast("公告起草成功！已对目标受众推送考务消息提醒。", "success");
        setTitleInput("");
        setContentInput("");
        setIsRequired(false);
      },
      onError: (err: any) => {
        showToast(`发布公告失败: ${err.message}`, "error");
      }
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="border-b border-black/5 pb-4">
          <h2 className="text-xl font-bold text-[#1D1D1F]">考务公告消息管理中心</h2>
          <p className="text-xs text-[#86868B] font-medium mt-1">起草紧急公告并开启全屏强制物理确认，阻断未阅用户的考勤定位接口。</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create announcement Form */}
          <form onSubmit={handlePublish} className="bg-white border border-black/5 rounded-[22px] p-5 shadow-sm space-y-4 h-fit">
            <h3 className="text-sm font-bold text-[#1D1D1F] flex items-center gap-1.5">
              <Megaphone size={16} className="text-[#0A84FF]" /> 发布紧急/常规通知
            </h3>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500">通知标题</label>
              <input
                placeholder="例如：关于全馆考勤打卡定位半径升级..."
                value={titleInput}
                onChange={e => setTitleInput(e.target.value)}
                className="w-full p-2.5 border border-black/5 rounded-xl text-xs bg-zinc-50 focus:bg-white focus:border-[#0A84FF] outline-none font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500">详细公告内容</label>
              <textarea
                placeholder="请输入详细文本..."
                value={contentInput}
                onChange={e => setContentInput(e.target.value)}
                rows={4}
                className="w-full p-2.5 border border-black/5 rounded-xl text-xs bg-zinc-50 focus:bg-white focus:border-[#0A84FF] outline-none font-medium resize-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="isReq" 
                checked={isRequired}
                onChange={e => setIsRequired(e.target.checked)}
                className="w-4 h-4 text-[#0A84FF] border-black/5 rounded"
              />
              <label htmlFor="isReq" className="text-[11px] font-bold text-[#FF453A] cursor-pointer">
                🚨 开启强制公告确认（全屏阻断）
              </label>
            </div>

            <button
              type="submit"
              disabled={createAnnMutation.isPending}
              className="w-full py-3 bg-[#0A84FF] text-white font-bold text-xs rounded-xl hover:bg-[#0A84FF]/95 transition-all cursor-pointer disabled:opacity-50"
            >
              {createAnnMutation.isPending ? "正在发布及广播中..." : "起草并广播该公告通知"}
            </button>
          </form>

          {/* Announcement history list */}
          <div className="lg:col-span-2 space-y-3">
            <span className="text-[10px] font-extrabold text-[#86868B] tracking-wide uppercase block">已发历史公告一览</span>
            
            {isLoading ? (
              <div className="text-center py-10 text-xs text-zinc-400 font-semibold">
                正在加载最新考务通知...
              </div>
            ) : annList.length === 0 ? (
              <div className="text-center py-10 bg-white border border-black/5 rounded-[22px] text-xs text-[#86868B] font-semibold">
                当前暂无已发布的考务通知。
              </div>
            ) : (
              annList.map((ann: any) => (
                <div key={ann.id} className="bg-white border border-black/5 rounded-2xl p-4.5 shadow-sm space-y-2 relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold ${
                        ann.isRequiredConfirm ? "bg-red-50 text-[#FF453A]" : "bg-blue-50 text-[#0A84FF]"
                      }`}>
                        {ann.isRequiredConfirm ? "物理强阻断公告" : "普通通知"}
                      </span>
                      <h4 className="text-xs font-bold text-[#1D1D1F] mt-1.5">{ann.title}</h4>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-400 shrink-0">发布：{ann.publishDate}</span>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed font-semibold">
                    {ann.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

// ==========================================
// 4. AdminImports (数据批量导入、导出)
// ==========================================
export const AdminImports: React.FC = () => {
  const { showToast } = useEventStore();
  const [importing, setImporting] = useState(false);
  const [success, setSuccess] = useState(false);

  const triggerImport = () => {
    setImporting(true);
    setSuccess(false);
    setTimeout(() => {
      setImporting(false);
      setSuccess(true);
    }, 2000);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="border-b border-black/5 pb-4">
          <h2 className="text-xl font-bold text-[#1D1D1F]">人员排班及劳务数据导入导出</h2>
          <p className="text-xs text-[#86868B] font-medium mt-1">支持 Excel 格式解析。批量录入大出勤志愿者名单或将财务发放结算表一键下载归档。</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {/* Import Card */}
          <div className="bg-white border border-black/5 rounded-[22px] p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-[#1D1D1F] flex items-center gap-1.5">
              <UploadCloud size={16} className="text-[#0A84FF]" /> 批量导入 Excel 排班表
            </h3>

            <div className="border-2 border-dashed border-zinc-200 rounded-2xl p-8 text-center space-y-3 bg-zinc-50">
              <FileSpreadsheet size={36} className="text-[#0A84FF] mx-auto animate-pulse" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#1D1D1F]">拖入 .xlsx 或者是 .csv 排班文件</p>
                <p className="text-[10px] text-zinc-400 font-semibold">大小不超过 10MB，自动匹配 OCR 实名格式</p>
              </div>
            </div>

            {success && (
              <div className="p-3 bg-green-50 text-[#30D158] border border-green-100 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <CheckCircle size={14} /> 导入完毕！成功更新 15 名 STAFF 人员档案，自动建立财务卡及商业险投保契约。
              </div>
            )}

            <button 
              onClick={triggerImport}
              disabled={importing}
              className="w-full py-3.5 bg-[#0A84FF] text-white font-bold text-xs rounded-xl hover:bg-[#0A84FF]/95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {importing ? "正在匹配OCR与表头并建立档案..." : "立即运行模拟 Excel 导入"}
            </button>
          </div>

          {/* Export Card */}
          <div className="bg-white border border-black/5 rounded-[22px] p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-[#1D1D1F] flex items-center gap-1.5">
              <FileSpreadsheet size={16} className="text-[#30D158]" /> 导出劳务财务核算及保险清册
            </h3>
            
            <p className="text-xs text-[#86868B] leading-relaxed font-semibold">
              考勤打卡状态及定位日志自动核实无篡改后，一键生成符合银行发放格式的代发清册文件。包括银行结算卡、姓名及个人出勤天数。
            </p>

            <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-xs space-y-2.5 font-semibold text-zinc-500">
              <div className="flex justify-between">
                <span>出勤总天数</span>
                <span className="text-[#1D1D1F] font-mono">12 天 (累计)</span>
              </div>
              <div className="flex justify-between">
                <span>总劳务清算支出</span>
                <span className="text-[#1D1D1F] font-mono">¥2,160.00</span>
              </div>
              <div className="flex justify-between">
                <span>承保总批单号</span>
                <span className="text-[#1D1D1F] font-mono">PAC_MOCK_2026_0114</span>
              </div>
            </div>

            <button 
              onClick={() => showToast("代发清册一键下载成功！文件名：STAFF_LAOWU_SETTLEMENT_2026.xlsx", "success")}
              className="w-full py-3.5 bg-[#30D158] text-white font-bold text-xs rounded-xl hover:bg-[#30D158]/95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              一键导出劳务打卡结算 Excel
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

// ==========================================
// 5. ActivityList (活动列表及生命周期规划)
// ==========================================
export const ActivityList: React.FC = () => {
  const { activities } = useEventStore();
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="border-b border-black/5 pb-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-[#1D1D1F]">漫展会期与招募生命周期</h2>
            <p className="text-xs text-[#86868B] font-medium mt-1">全局规划不同地区的临时出勤岗位招募、线下面试进度以及考勤清算阶段。</p>
          </div>
        </div>

        <div className="space-y-4">
          {activities.map((act) => (
            <div key={act.id} className="bg-white border border-black/5 rounded-[22px] p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 bg-zinc-100 rounded-full text-[9px] font-extrabold text-zinc-500 font-mono">
                      {act.id}
                    </span>
                    <span className="px-2.5 py-0.5 bg-green-50 text-[#30D158] border border-green-100 rounded-full text-[10px] font-bold">
                      ● 招募与面试进行中
                    </span>
                  </div>
                  <h3 className="text-base font-black text-[#1D1D1F] mt-2">{act.name}</h3>
                  <p className="text-xs text-[#86868B] font-medium mt-1">考勤基准地：{act.venue} • 预计招募 {act.recruitCount} 人</p>
                </div>

                <div className="text-xs text-right text-zinc-500 font-semibold shrink-0">
                  <p>出勤日期: {act.dates.join("、")}</p>
                  <p className="text-[10px] text-zinc-400 mt-1">报名截止: {act.applyDeadline}</p>
                </div>
              </div>

              {/* Lifecycle Stage Flow */}
              <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl">
                <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400">
                  <span className="text-[#0A84FF]">1. 报名筹备</span>
                  <span className="text-[#0A84FF]">2. 公开招募</span>
                  <span className="text-[#0A84FF]">3. 线下面试</span>
                  <span>4. 录取分配</span>
                  <span>5. 现场执勤</span>
                  <span>6. 结算归档</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-200 rounded-full mt-2.5 overflow-hidden flex">
                  <div className="h-full bg-[#0A84FF] rounded-full" style={{ width: "50%" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

// ==========================================
// 6. FormBuilder (动态报名表表单设计器)
// ==========================================
export const FormBuilder: React.FC = () => {
  const { showToast } = useEventStore();
  const [fields, setFields] = useState<any[]>([
    { id: "1", label: "姓名", type: "text", required: true, isSensitive: false },
    { id: "2", label: "手机号码", type: "phone", required: true, isSensitive: true },
    { id: "3", label: "身份证号 (后六位)", type: "idcard", required: true, isSensitive: true },
    { id: "4", label: "常驻城市", type: "text", required: true, isSensitive: false },
    { id: "5", label: "漫展工作经验说明", type: "textarea", required: false, isSensitive: false },
    { id: "6", label: "意向工作岗位", type: "checkbox", required: true, isSensitive: false, options: ["舞台控场", "门禁检票", "后勤协调", "秩序维持"] }
  ]);

  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState("text");
  const [isRequired, setIsRequired] = useState(false);

  const handleAddField = () => {
    if (!newLabel) return;
    setFields(p => [
      ...p,
      {
        id: `FIELD_${Date.now()}`,
        label: newLabel,
        type: newType,
        required: isRequired,
        isSensitive: false
      }
    ]);
    setNewLabel("");
    setIsRequired(false);
  };

  const handleRemoveField = (id: string) => {
    setFields(p => p.filter(f => f.id !== id));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="border-b border-black/5 pb-4">
          <h2 className="text-xl font-bold text-[#1D1D1F]">报名表单动态设计器</h2>
          <p className="text-xs text-[#86868B] font-medium mt-1">拖拽定义字段、设定类型与脱敏规则，实时更新前台报名移动端渲染视图。</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor sidebar controller */}
          <div className="bg-white border border-black/5 rounded-[22px] p-5 shadow-sm space-y-4 h-fit">
            <h3 className="text-xs font-black text-[#1D1D1F] uppercase tracking-wider">新增表单字段</h3>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500">字段展示标签</label>
              <input
                placeholder="例如：可执勤日期、银行结算卡号..."
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                className="w-full p-2.5 bg-zinc-50 border border-black/5 rounded-xl text-xs outline-none font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500">字段数据类型</label>
              <select 
                value={newType} 
                onChange={e => setNewType(e.target.value)}
                className="w-full p-2.5 bg-zinc-50 border border-black/5 rounded-xl text-xs outline-none font-bold"
              >
                <option value="text">单行文本 (Text)</option>
                <option value="textarea">多行文本 (Textarea)</option>
                <option value="phone">手机号 (Phone)</option>
                <option value="idcard">身份证号 (ID Card)</option>
                <option value="bankcard">银行卡号 (Bank Card)</option>
                <option value="checkbox">多选框组 (Checkbox)</option>
                <option value="radio">单选框组 (Radio)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="isReqF" 
                checked={isRequired}
                onChange={e => setIsRequired(e.target.checked)}
                className="w-4 h-4 text-[#0A84FF] border-black/5 rounded"
              />
              <label htmlFor="isReqF" className="text-[11px] font-bold text-[#1D1D1F] cursor-pointer">
                强制此字段必填
              </label>
            </div>

            <button
              onClick={handleAddField}
              className="w-full py-3 bg-[#0A84FF] text-white font-bold text-xs rounded-xl hover:bg-[#0A84FF]/95 transition-all cursor-pointer"
            >
              插入新字段
            </button>
          </div>

          {/* Form preview canvas */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-extrabold text-[#86868B] tracking-wide uppercase">画布预览（可拖动规划）</span>
              <button 
                onClick={() => showToast("表单设计已发布！手机报名端已实时替换为新设计的表单模型。", "success")}
                className="px-4 py-2 bg-[#30D158] hover:bg-[#30D158]/95 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                保存并发布报名表
              </button>
            </div>

            <div className="bg-[#F5F5F7] border border-black/5 rounded-[24px] p-6 space-y-3.5">
              {fields.map((f, idx) => (
                <div key={f.id} className="bg-white border border-black/5 rounded-2xl p-4 flex justify-between items-center shadow-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 bg-zinc-100 rounded-full text-[8px] font-extrabold text-zinc-400 font-mono">
                        FIELD_0{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-[#1D1D1F]">{f.label}</span>
                      {f.required && <span className="text-[#FF453A] font-bold text-[10px]">* 必填</span>}
                      {f.isSensitive && <span className="px-1.5 py-0.5 bg-amber-50 text-[#FF9F0A] rounded text-[8px] font-bold">已脱敏</span>}
                    </div>
                    <p className="text-[10px] text-zinc-400 font-medium">数据类型：{f.type}</p>
                  </div>

                  <button 
                    onClick={() => handleRemoveField(f.id)}
                    className="p-2 text-zinc-400 hover:text-[#FF453A] hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

// ==========================================
// 5. AdminInterviews (面试评分)
// ==========================================
export const AdminInterviews: React.FC = () => {
  const { applications, employStaff, showToast } = useEventStore();

  const reviews = applications.filter(a => 
    a.employmentStatus === "PENDING" && 
    (a.interviewStatus === "RECOMMENDED" || a.interviewStatus === "COMPLETED")
  );

  const handleAction = (id: string, action: "APPROVED" | "REJECTED") => {
    employStaff(id, action === "APPROVED", "舞台控场组", "舞台控场岗");
    showToast(
      action === "APPROVED" 
        ? "已同意录取该 STAFF，身份已自动升级，已分配至 [舞台控场组]，系统已同步实名保险并发出短信引导。" 
        : "已暂缓录取，对应记录已归档。",
      action === "APPROVED" ? "success" : "info"
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="border-b border-black/5 pb-4">
          <h2 className="text-xl font-bold text-[#1D1D1F]">面试评分与录用中心</h2>
          <p className="text-xs text-[#86868B] font-medium mt-1">查看各小组长提交的现场面试打分和评语，进行 STAFF 最终录取核定。</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-white border border-black/5 rounded-[22px] text-zinc-400 text-xs font-semibold">
              暂无等待终审录取核定的面试档案
            </div>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="bg-white border border-black/5 rounded-[22px] p-5 shadow-sm space-y-4 animate-scale-up">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-[#1D1D1F]">{r.userName}</h3>
                    <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">申请岗位：{r.targetPositions.join("、")}</p>
                  </div>
                  <span className="px-2.5 py-0.5 bg-amber-50 text-[#FF9F0A] rounded-full text-[10px] font-bold">
                    组长评定: 推荐录用
                  </span>
                </div>

                {r.comment && (
                  <div className="p-3 bg-zinc-50 border border-black/5 rounded-xl text-xs text-zinc-600 leading-relaxed font-semibold">
                    <strong>组长面评：</strong>{r.comment}
                  </div>
                )}

                <div className="flex gap-2 justify-end">
                  <button 
                    onClick={() => handleAction(r.id, "APPROVED")}
                    className="px-4 py-2 bg-[#30D158] hover:bg-[#30D158]/95 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    批准录用 (发放 STAFF 权限)
                  </button>
                  <button 
                    onClick={() => handleAction(r.id, "REJECTED")}
                    className="px-4 py-2 bg-red-50 border border-red-200 text-[#FF453A] text-xs font-bold rounded-xl hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    暂不录取
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

// ==========================================
// 6. AdminAttendanceRealtime (实时核销监控)
// ==========================================
export const AdminAttendanceRealtime: React.FC = () => {
  const { attendanceRecords, updateAttendanceStatus, showToast } = useEventStore();

  const handleRefresh = () => {
    showToast("现场考勤GPS底片和双特征水印已实时拉取并完成秒级校对。", "success");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-black/5 pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#1D1D1F]">现场考勤实时监控与核销</h2>
            <p className="text-xs text-[#86868B] font-medium mt-1">秒级监控漫展现场所有 STAFF 岗位打卡自拍，核验地理芯片偏差度。</p>
          </div>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-[#0A84FF] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            实时核对底片
          </button>
        </div>

        {/* Real-time statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-black/5 rounded-2xl p-4">
            <span className="text-[10px] font-bold text-zinc-400 block mb-1">今日出勤率</span>
            <span className="text-2xl font-black text-[#30D158] font-mono">94.8%</span>
          </div>
          <div className="bg-white border border-black/5 rounded-2xl p-4">
            <span className="text-[10px] font-bold text-zinc-400 block mb-1">正常在岗</span>
            <span className="text-2xl font-black text-zinc-800 font-mono">32 人</span>
          </div>
          <div className="bg-white border border-black/5 rounded-2xl p-4">
            <span className="text-[10px] font-bold text-zinc-400 block mb-1">定位异常警告</span>
            <span className="text-2xl font-black text-[#FF9F0A] font-mono">2 人</span>
          </div>
          <div className="bg-white border border-black/5 rounded-2xl p-4">
            <span className="text-[10px] font-bold text-zinc-400 block mb-1">异常照片</span>
            <span className="text-2xl font-black text-[#FF453A] font-mono">0 张</span>
          </div>
        </div>

        <div className="space-y-3">
          <span className="text-[10px] font-extrabold text-[#86868B] uppercase tracking-wider block">最新实时打卡流水 feeds</span>
          
          <div className="grid grid-cols-1 gap-3.5">
            {attendanceRecords.map((r) => (
              <div key={r.id} className="bg-white border border-black/5 rounded-[22px] p-4.5 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4 animate-scale-up">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-sm border border-black/5 text-[#0A84FF] overflow-hidden">
                    {r.checkInPhoto ? (
                      <img src={r.checkInPhoto} className="w-full h-full object-cover" alt="" />
                    ) : (
                      r.userName.charAt(0)
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-[#1D1D1F]">{r.userName}</h4>
                      <span className="px-1.5 py-0.5 bg-slate-100 text-zinc-600 rounded text-[8px] font-bold">{r.groupName}</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">签到打卡时间：{r.checkInTime || "未打卡"}</p>
                    {r.checkOutTime && (
                      <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">签退打卡时间：{r.checkOutTime}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col md:items-end text-xs gap-1.5">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-zinc-400 font-semibold">定位精度:</span>
                    <span className={`font-mono font-bold ${
                      (r.checkInDistance || 0) < 50 ? "text-[#30D158]" : "text-[#FF9F0A]"
                    }`}>
                      {r.checkInDistance !== undefined ? `${r.checkInDistance}米 (合规)` : "未采集"}
                    </span>
                  </div>
                  <p className="text-[9px] text-zinc-400 font-semibold">芯片基站：{r.checkInLocation || "未采集"}</p>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <Link
                      to={`/admin/attendance/${r.id}`}
                      className="px-2.5 py-1 bg-[#0A84FF]/10 hover:bg-[#0A84FF]/20 text-[#0A84FF] text-[10px] font-bold rounded-lg transition-all inline-block"
                    >
                      🔍 核销详情与人工修正
                    </Link>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                      r.status === "NORMAL" 
                        ? "bg-green-50 text-[#30D158]" 
                        : r.status === "LATE"
                          ? "bg-amber-50 text-[#FF9F0A]"
                          : "bg-red-50 text-[#FF453A]"
                    }`}>
                      {r.status === "NORMAL" ? "正常" : r.status === "LATE" ? "迟到" : "缺勤"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

// ==========================================
// 7. AdminAdmissions (最终录用与分配中心)
// ==========================================
export const AdminAdmissions: React.FC = () => {
  const { applications, employStaff, showToast } = useEventStore();
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  
  // Modal configurations
  const [groupName, setGroupName] = useState("舞台控场组");
  const [positionName, setPositionName] = useState("舞台控场岗");
  const [assignedDates, setAssignedDates] = useState<string[]>([]);
  const [isLeader, setIsLeader] = useState(false);

  // Default dropdown selections
  const availableGroups = ["舞台控场组", "门禁检票组", "后勤机动组", "摄影宣传组"];
  const availablePositions = ["舞台控场岗", "门禁检票岗", "后勤机动岗", "摄影/自媒体岗", "秩序疏导岗"];

  // Filter candidates who have applied and are NOT yet employed/rejected (PENDING employmentStatus)
  const pendingCandidates = applications.filter(a => a.employmentStatus === "PENDING");

  const handleOpenPlacement = (app: Application) => {
    setSelectedApp(app);
    setGroupName(app.targetPositions[0]?.includes("舞台") ? "舞台控场组" : "门禁检票组");
    setPositionName(app.targetPositions[0] || "舞台控场岗");
    setAssignedDates(app.availableDates);
    setIsLeader(false);
  };

  const handleConfirmHiring = async () => {
    if (!selectedApp) return;
    if (assignedDates.length === 0) {
      showToast("请至少选择一个工作排班日期！", "error");
      return;
    }

    // Call the store's action to employ the staff
    employStaff(selectedApp.id, true, groupName, positionName);

    // If marked as leader, elevate role to LEADER
    if (isLeader) {
      const { mockUsers } = await import("../../shared/mocks/data");
      const u = mockUsers.find(user => user.id === selectedApp.userId);
      if (u) u.role = "LEADER";

      const { db } = await import("../../shared/api/mock-adapter");
      const du = db.users.find(user => user.id === selectedApp.userId);
      if (du) du.role = "LEADER";
    }

    // Automatically register empty AttendanceRecords for the chosen dates
    const { useEventStore: eventStore } = await import("../../app/stores/eventStore");
    const newRecords = assignedDates.map((date, idx) => ({
      id: `ATT_GEN_${Date.now()}_${idx}`,
      userId: selectedApp.userId,
      userName: selectedApp.userName,
      userPhone: selectedApp.userPhone,
      groupName,
      positionName,
      activityId: selectedApp.activityId,
      date,
      status: "ABSENT" as const,
      riskLevel: "LOW" as const
    }));

    eventStore.setState(state => ({
      attendanceRecords: [...newRecords, ...state.attendanceRecords]
    }));

    showToast(`成功录用 ${selectedApp.userName} 为 ${isLeader ? "组长" : "STAFF"}，并为其在 ${assignedDates.join(", ")} 自动注册了出勤底片！`, "success");
    setSelectedApp(null);
  };

  const isInterviewPassed = (app: Application) => {
    return app.interviewStatus === "COMPLETED" || app.interviewStatus === "RECOMMENDED" || app.interviewStatus === "ATTENDED";
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="border-b border-black/5 pb-4">
          <h2 className="text-xl font-bold text-[#1D1D1F]">最终录用与岗前分配大盘</h2>
          <p className="text-xs text-[#86868B] font-medium mt-1">处理通过报名筛选、实名面试及组长面评推荐的候选人，指派执行小组、会务岗位、具体工作排班。已完成面试验证的候选人方可办理录取。</p>
        </div>

        {/* Candidate List */}
        <div className="space-y-4">
          <span className="text-[10px] font-extrabold text-[#86868B] uppercase tracking-wider block">
            待录用终审候选人档案库 ({pendingCandidates.length})
          </span>

          {pendingCandidates.length === 0 ? (
            <div className="text-center py-12 bg-white border border-black/5 rounded-[22px] text-zinc-400 text-xs font-semibold">
              目前没有等待录用终审的候选人
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingCandidates.map((app) => {
                const passed = isInterviewPassed(app);
                return (
                  <div key={app.id} className="bg-white border border-black/5 rounded-[22px] p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[#1D1D1F]">{app.userName}</h4>
                        <span className="text-[10px] text-zinc-400 font-mono">（手机：{app.userPhone}）</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                          passed ? "bg-green-50 text-[#30D158]" : "bg-red-50 text-[#FF453A]"
                        }`}>
                          {passed ? "✓ 面试通过" : "✗ 尚未面试/签到"}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 font-medium">
                        意向岗位：{app.targetPositions.join(", ")} | 可服务日期：{app.availableDates.join(", ")}
                      </p>
                      {app.comment && (
                        <p className="text-[10px] text-amber-600 bg-amber-50/50 px-2.5 py-1 rounded-lg inline-block font-bold">
                          💡 组长评价：{app.comment}
                        </p>
                      )}
                    </div>

                    <div>
                      {passed ? (
                        <button
                          onClick={() => handleOpenPlacement(app)}
                          className="px-4 py-2 bg-[#0A84FF] hover:bg-[#0A84FF]/90 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                        >
                          ✨ 分配岗位并录取
                        </button>
                      ) : (
                        <button
                          disabled
                          className="px-4 py-2 bg-zinc-100 text-zinc-400 text-xs font-bold rounded-xl cursor-not-allowed border border-black/5"
                        >
                          🔒 待面试验证不可录
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Placements & Hiring Configuration Dialog */}
        {selectedApp && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-[28px] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-scale-up">
              <div className="flex justify-between items-center border-b border-black/5 pb-3">
                <div>
                  <h3 className="text-base font-black text-zinc-950">指派岗位与排班配置</h3>
                  <p className="text-[10px] text-[#86868B] font-semibold mt-0.5">候选人：{selectedApp.userName}，意向岗位：{selectedApp.targetPositions.join(", ")}</p>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="text-zinc-400 hover:text-zinc-600 text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs font-semibold">
                {/* Group Selector */}
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">分派执行小组</label>
                  <select
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full p-3 bg-zinc-50 border border-black/5 rounded-xl text-zinc-800 font-bold outline-none"
                  >
                    {availableGroups.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                {/* Position Selector */}
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">指派会务岗位</label>
                  <select
                    value={positionName}
                    onChange={(e) => setPositionName(e.target.value)}
                    className="w-full p-3 bg-zinc-50 border border-black/5 rounded-xl text-zinc-800 font-bold outline-none"
                  >
                    {availablePositions.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Date Selection Checkboxes */}
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1.5">排班出勤日期（打卡底片激活）</label>
                  <div className="flex flex-wrap gap-2">
                    {["2026-07-11", "2026-07-12"].map((date) => {
                      const isChecked = assignedDates.includes(date);
                      return (
                        <button
                          type="button"
                          key={date}
                          onClick={() => {
                            if (isChecked) {
                              setAssignedDates(prev => prev.filter(d => d !== date));
                            } else {
                              setAssignedDates(prev => [...prev, date]);
                            }
                          }}
                          className={`flex-1 py-2 rounded-xl border text-center font-bold transition-all ${
                            isChecked
                              ? "border-[#0A84FF] bg-[#0A84FF]/10 text-[#0A84FF]"
                              : "border-zinc-200 text-zinc-500 bg-white"
                          }`}
                        >
                          📅 {date}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Is Leader Switch */}
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-black/5 rounded-xl">
                  <div>
                    <span className="text-[11px] font-bold text-zinc-800 block">任命为该组组长 (LEADER)</span>
                    <span className="text-[9px] text-zinc-400">若勾选，其角色将直接晋升，并拥有审核该组组员考勤的特权。</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isLeader}
                    onChange={(e) => setIsLeader(e.target.checked)}
                    className="w-4 h-4 text-[#0A84FF] border-zinc-300 rounded cursor-pointer"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2.5 pt-3 border-t border-black/5">
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleConfirmHiring}
                    className="flex-1 py-3 bg-[#30D158] hover:bg-[#30D158]/90 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    ✓ 确认录用入职
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

// ==========================================
// 8. AdminPeople (全量人员底片)
// ==========================================
export const AdminPeople: React.FC = () => {
  const [search, setSearch] = useState("");
  const { showToast } = useEventStore();
  const { data: users = [], isLoading } = usePeople();
  const updateRoleMutation = useUpdateUserRole();

  const handleRoleChange = (userId: string, currentRole: string) => {
    // Cycle roles: APPLICANT -> STAFF -> LEADER -> APPLICANT
    let nextRole = "APPLICANT";
    if (currentRole === "APPLICANT") nextRole = "STAFF";
    else if (currentRole === "STAFF") nextRole = "LEADER";

    updateRoleMutation.mutate({ userId, role: nextRole }, {
      onSuccess: () => {
        showToast(`成功将人员角色变更为 ${nextRole}！派岗与考勤权限已实时刷。`, "success");
      },
      onError: (err: any) => {
        showToast(`变更角色失败: ${err.message}`, "error");
      }
    });
  };

  const filtered = (users || []).filter((u: any) => 
    u.name.includes(search) || u.phone.includes(search)
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-black/5 pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#1D1D1F]">全量人员底片控制面板</h2>
            <p className="text-xs text-[#86868B] font-medium mt-1">查看、变更当前动漫展会所有报名人员、STAFF 以及各组长的角色与底片。</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-amber-50 text-[#FF9F0A] border border-amber-200 rounded-full text-[10px] font-bold">
              Mock Status: Active
            </span>
            <input 
              placeholder="搜索姓名或电话..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="px-3.5 py-2 border border-black/5 rounded-xl text-xs bg-white outline-none font-semibold"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-10 text-xs text-zinc-400 font-semibold">
            正在读取人员数据库底片...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 bg-white border border-black/5 rounded-[22px] text-xs text-[#86868B] font-semibold">
            没有找到匹配的人员记录。
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map((u: any) => (
              <div key={u.id} className="bg-white border border-black/5 rounded-[22px] p-5 shadow-sm flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold text-[#1D1D1F] text-sm">{u.name}</h4>
                  <p className="text-[10px] text-zinc-400 font-mono mt-1">账号/电话：{u.phone} | 系统ID: {u.id}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                    u.role === "LEADER" 
                      ? "bg-purple-50 text-[#BF5AF2]" 
                      : u.role === "STAFF" 
                        ? "bg-green-50 text-[#30D158]" 
                        : "bg-blue-50 text-[#0A84FF]"
                  }`}>
                    {u.role}
                  </span>

                  <button 
                    disabled={updateRoleMutation.isPending}
                    onClick={() => handleRoleChange(u.id, u.role)}
                    className="px-2.5 py-1.5 border border-black/5 rounded-xl text-[10px] font-bold hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    切换/升级角色
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

// ==========================================
// 9. AdminAssignments (岗位指派)
// ==========================================
export const AdminAssignments: React.FC = () => {
  const { showToast } = useEventStore();
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="border-b border-black/5 pb-4">
          <h2 className="text-xl font-bold text-[#1D1D1F]">岗位分派与派岗管理</h2>
          <p className="text-xs text-[#86868B] font-medium mt-1">将录取通过的 STAFF 划归分派至各执行小组，并在现场考勤系统实时下发。</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-black/5 rounded-[22px] p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-[#1D1D1F] uppercase tracking-wide">待分配岗位的 STAFF (1)</h3>
            <div className="p-3 bg-zinc-50 border border-black/5 rounded-xl flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-[#1D1D1F]">苏苏</p>
                <p className="text-[9px] text-zinc-400 mt-0.5">意向: 秩序维持、检票口</p>
              </div>
              <button 
                onClick={() => showToast("成功指派 苏苏 划归至 [舞台控场组] (组长：陈大伟)！派岗指令和实名保险已实时更新。", "success")}
                className="px-3 py-1.5 bg-[#0A84FF] text-white font-bold text-[10px] rounded-lg cursor-pointer"
              >
                指派至舞台控场组
              </button>
            </div>
          </div>

          <div className="bg-white border border-black/5 rounded-[22px] p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-[#1D1D1F] uppercase tracking-wide">各执行组在岗架构 overview</h3>
            <div className="space-y-3 text-xs font-semibold text-zinc-600">
              <div className="p-3 bg-blue-50/50 rounded-xl flex justify-between">
                <span>舞台控场组 (组长 陈大伟)</span>
                <span className="text-[#0A84FF]">12 人在岗</span>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl flex justify-between">
                <span>后勤协调组 (组长 暂缺)</span>
                <span className="text-zinc-500">4 人在岗</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

// ==========================================
// 10. AdminAttendance (历史考勤归档底片)
// ==========================================
export const AdminAttendance: React.FC = () => {
  const { showToast } = useEventStore();
  const [search, setSearch] = useState("");
  const { data: records, isLoading } = useAttendanceRecords({
    search: search || undefined,
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start border-b border-black/5 pb-4 flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#1D1D1F]">历史考勤归档底片库</h2>
            <p className="text-xs text-[#86868B] font-medium mt-1">查看、导出漫展多期活动的所有人员出勤、补签、请假及劳务结算结算明细。</p>
          </div>
          <div className="flex gap-2">
            <Link 
              to="/admin/attendance/corrections"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-zinc-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <History size={14} /> 📑 查看人工修正审计台账
            </Link>
            <button 
              onClick={() => showToast("考勤总台出勤底片及劳务对账单已成功生成！对账 Excel 报表已开始打包并下载至您的设备。", "success")}
              className="px-4 py-2 bg-[#30D158] hover:bg-[#30D158]/95 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet size={14} /> 导出考勤对账明细 Excel
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="bg-white border border-black/5 rounded-[22px] p-4 shadow-sm flex items-center gap-3">
          <input
            type="text"
            placeholder="🔍 搜索姓名、岗位名称或小组..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-xs font-semibold p-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#0A84FF] transition-colors"
          />
        </div>

        <div className="bg-white border border-black/5 rounded-[22px] p-5 shadow-sm space-y-4">
          <span className="text-xs font-extrabold text-[#1D1D1F]">考勤记录历史总账表</span>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="border-b border-zinc-100 text-zinc-400">
                  <th className="py-2.5">姓名</th>
                  <th className="py-2.5">日期</th>
                  <th className="py-2.5">岗位</th>
                  <th className="py-2.5">签到打卡</th>
                  <th className="py-2.5">签退打卡</th>
                  <th className="py-2.5">出勤状态</th>
                  <th className="py-2.5 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-zinc-400">正在加载考勤历史归档...</td>
                  </tr>
                ) : !records || records.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-zinc-400">暂无任何考勤底片记录</td>
                  </tr>
                ) : (
                  records.map((r) => (
                    <tr key={r.id} className="text-[#1D1D1F] hover:bg-slate-50/50 transition-colors">
                      <td className="py-2.5 font-bold">{r.userName}</td>
                      <td className="py-2.5 font-mono">{r.date}</td>
                      <td className="py-2.5">{r.positionName}</td>
                      <td className="py-2.5 font-mono text-zinc-500">{r.checkInTime || "（无）"}</td>
                      <td className="py-2.5 font-mono text-zinc-500">{r.checkOutTime || "（无）"}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                          r.status === "NORMAL" 
                            ? "bg-green-50 text-[#30D158]" 
                            : r.status === "LATE"
                              ? "bg-amber-50 text-[#FF9F0A]"
                              : r.status === "EXCEPTIONAL"
                                ? "bg-purple-50 text-[#BF5AF2]"
                                : "bg-red-50 text-[#FF453A]"
                        }`}>
                          {r.status === "NORMAL" ? "正常" : r.status === "LATE" ? "迟到" : r.status === "EXCEPTIONAL" ? "异常" : "缺勤"}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <Link 
                          to={`/admin/attendance/${r.id}`}
                          className="px-2.5 py-1 bg-[#0A84FF]/10 hover:bg-[#0A84FF]/20 text-[#0A84FF] text-[10px] font-black rounded-lg transition-colors inline-block"
                        >
                          核销与审计详情 →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

// ==========================================
// 11. AdminAttendanceDetail (考勤核销与人工修正详情)
// ==========================================
export const AdminAttendanceDetail: React.FC = () => {
  const { attendanceId } = useParams<{ attendanceId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showToast } = useEventStore();

  const { data: record, isLoading: isRecordLoading } = useAttendanceById(attendanceId || "");
  const { data: corrections, isLoading: isCorrectionsLoading } = useAttendanceCorrections(attendanceId);
  const { data: pendingSuggestions } = useCorrectionSuggestions({ status: "PENDING" });

  const correctMutation = useCorrectAttendance();
  const approveMutation = useApproveCorrectionSuggestion();

  // Manual input form state
  const [newStatus, setNewStatus] = useState<any>("NORMAL");
  const [newCheckInTime, setNewCheckInTime] = useState("");
  const [newCheckOutTime, setNewCheckOutTime] = useState("");
  const [correctionReason, setCorrectionReason] = useState("");

  const pendingSug = pendingSuggestions?.find(s => s.attendanceId === attendanceId);

  React.useEffect(() => {
    if (record) {
      setNewStatus(record.status);
      setNewCheckInTime(record.checkInTime || "");
      setNewCheckOutTime(record.checkOutTime || "");
    }
  }, [record]);

  const handleManualCorrect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctionReason.trim()) {
      showToast("请填写人工修正的原因！此项内容将写入系统审计日志。", "error");
      return;
    }
    if (!record) return;

    correctMutation.mutate({
      attendanceId: record.id,
      update: {
        status: newStatus,
        checkInTime: newCheckInTime || undefined,
        checkOutTime: newCheckOutTime || undefined,
        reason: correctionReason
      },
      operatorId: user?.id || "ADMIN_M",
      operatorName: user?.name || "系统管理员"
    }, {
      onSuccess: () => {
        showToast(`已成功人工修正 ${record.userName} 的考勤结果，并记入系统审计台账。`, "success");
        setCorrectionReason("");
      },
      onError: (err: any) => {
        showToast(`修改失败: ${err.message}`, "error");
      }
    });
  };

  const handleApproveSuggestion = (status: "APPROVED" | "REJECTED") => {
    if (!pendingSug) return;
    approveMutation.mutate({
      suggestionId: pendingSug.id,
      status,
      adminId: user?.id || "ADMIN_M"
    }, {
      onSuccess: () => {
        showToast(status === "APPROVED" ? "已批准该考勤补签申请，数据已完成更新。" : "已驳回该补签申请。", "success");
      },
      onError: (err: any) => {
        showToast(`操作失败: ${err.message}`, "error");
      }
    });
  };

  if (isRecordLoading || !record) {
    return (
      <AdminLayout>
        <div className="p-10 text-center text-zinc-400 font-semibold text-xs">
          正在读取打卡原始底片及审计底账...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header navigation */}
        <div className="flex items-center gap-3 border-b border-black/5 pb-4">
          <button 
            onClick={() => navigate("/admin/attendance")}
            className="p-1.5 hover:bg-slate-100 rounded-full text-zinc-600 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-lg font-extrabold text-[#1D1D1F]">考勤底片核销与修正审计</h2>
            <p className="text-[10px] text-zinc-400 font-medium">考勤记录ID: {record.id}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User & Group Info */}
          <div className="bg-white border border-black/5 rounded-[22px] p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              {record.photoUrl ? (
                <img 
                  src={record.photoUrl} 
                  alt="打卡自拍" 
                  className="w-12 h-12 rounded-full object-cover border border-zinc-100"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-12 h-12 bg-blue-50 text-[#0A84FF] rounded-full flex items-center justify-center font-black text-sm">
                  {record.userName.substring(0, 1)}
                </div>
              )}
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
                <span className="text-zinc-400">当前判定状态</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                  record.status === "NORMAL" 
                    ? "bg-green-50 text-[#30D158]" 
                    : record.status === "LATE"
                      ? "bg-amber-50 text-[#FF9F0A]"
                      : record.status === "EXCEPTIONAL"
                        ? "bg-purple-50 text-[#BF5AF2]"
                        : "bg-red-50 text-[#FF453A]"
                }`}>
                  {record.status === "NORMAL" ? "正常出勤" : record.status === "LATE" ? "迟到" : record.status === "EXCEPTIONAL" ? "GPS异常" : "缺勤"}
                </span>
              </div>
            </div>

            {/* GPS Detail */}
            <div className="p-3.5 bg-slate-50 border border-zinc-100 rounded-xl text-xs space-y-2 font-semibold">
              <span className="text-[9px] text-zinc-400 block uppercase tracking-wide">考勤自拍及GPS原始底片</span>
              <div className="flex justify-between">
                <span className="text-zinc-400">打卡精度:</span>
                <span className="text-zinc-800 font-mono">15m (高精度)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">签到位置偏差:</span>
                <span className="text-zinc-800 font-mono">{record.checkInDistance !== undefined ? `${record.checkInDistance} 米` : "（无记录）"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">签退位置偏差:</span>
                <span className="text-zinc-800 font-mono">{record.checkOutDistance !== undefined ? `${record.checkOutDistance} 米` : "（无记录）"}</span>
              </div>
            </div>
          </div>

          {/* Form & Actions */}
          <div className="bg-white border border-black/5 rounded-[22px] p-5 shadow-sm space-y-5 md:col-span-2">
            {/* Pending Leader Suggestion alert */}
            {pendingSug && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3 font-semibold text-xs animate-scale-up">
                <div className="flex justify-between items-center">
                  <span className="text-amber-800 font-extrabold flex items-center gap-1">
                    <Clock size={14} className="animate-spin" /> 收到来自组长【{pendingSug.leaderName || "组长"}】提交的补签修正建议
                  </span>
                  <span className="text-[8px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                    待管理员审核
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-zinc-600 font-normal">
                  <p>更正目标: <span className="font-semibold text-zinc-800">{pendingSug.suggestedType === "CHECK_IN" ? "签到打卡" : "签退打卡"}</span></p>
                  <p>更正状态: <span className="font-semibold text-zinc-800">{pendingSug.suggestedStatus === "NORMAL" ? "正常" : "迟到"}</span></p>
                  <p>建议时间: <span className="font-semibold font-mono text-zinc-800">{pendingSug.suggestedTime || "未指定"}</span></p>
                  <p className="col-span-2">申请原因: <span className="font-semibold text-zinc-800 italic">“{pendingSug.reason}”</span></p>
                </div>
                <div className="flex gap-2 pt-1">
                  <button 
                    onClick={() => handleApproveSuggestion("APPROVED")}
                    disabled={approveMutation.isPending}
                    className="flex-1 py-1.5 bg-[#30D158] hover:bg-[#30D158]/95 text-white font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <CheckCircle size={12} /> 同意并自动修正
                  </button>
                  <button 
                    onClick={() => handleApproveSuggestion("REJECTED")}
                    disabled={approveMutation.isPending}
                    className="py-1.5 px-4 bg-red-50 hover:bg-red-100 text-[#FF453A] font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <XCircle size={12} /> 驳回
                  </button>
                </div>
              </div>
            )}

            {/* Manual correction form */}
            <form onSubmit={handleManualCorrect} className="space-y-4 text-xs font-semibold">
              <span className="text-xs font-extrabold text-zinc-800 block">管理员高级人工修正</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-wide block mb-1">更正出勤判定</label>
                  <select 
                    value={newStatus} 
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none"
                  >
                    <option value="NORMAL">正常 (NORMAL)</option>
                    <option value="LATE">迟到 (LATE)</option>
                    <option value="ABSENT">缺勤 (ABSENT)</option>
                    <option value="EXCEPTIONAL">GPS异常 (EXCEPTIONAL)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-wide block mb-1">签到打卡时间</label>
                  <input 
                    type="text" 
                    value={newCheckInTime} 
                    onChange={(e) => setNewCheckInTime(e.target.value)}
                    placeholder="HH:MM:SS"
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-mono text-zinc-800"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-wide block mb-1">签退打卡时间</label>
                  <input 
                    type="text" 
                    value={newCheckOutTime} 
                    onChange={(e) => setNewCheckOutTime(e.target.value)}
                    placeholder="HH:MM:SS"
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-mono text-zinc-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase tracking-wide block mb-1">
                  修正审核意见与原因 <span className="text-red-500">*必填（作为审计凭证）</span>
                </label>
                <textarea 
                  rows={2}
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  placeholder="请输入修正此次考勤的具体业务理由，例如：经后台照片人工复核，定位漂移确属展馆5G信号拥堵所致..."
                  className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-medium leading-relaxed outline-none focus:border-[#0A84FF] transition-colors"
                />
              </div>

              <button 
                type="submit"
                disabled={correctMutation.isPending}
                className="w-full py-3 bg-[#0A84FF] hover:bg-[#0A84FF]/95 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {correctMutation.isPending ? "正在提交人工修正..." : "⚡ 确认人工修正并写入系统审计库"}
              </button>
            </form>
          </div>
        </div>

        {/* Audit timeline section */}
        <div className="bg-white border border-black/5 rounded-[22px] p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <FileClock size={16} className="text-[#0A84FF]" />
            <span className="text-xs font-extrabold text-[#1D1D1F]">该考勤记录的人工修正审计时间线 (Audit Log)</span>
          </div>

          <div className="space-y-4">
            {isCorrectionsLoading ? (
              <div className="text-zinc-400 text-xs py-2 text-center">正在读取修正审计流...</div>
            ) : !corrections || corrections.length === 0 ? (
              <div className="text-zinc-400 text-xs py-4 text-center bg-slate-50 border border-black/5 rounded-xl font-medium">
                无任何人工修正操作记录，该考勤记录为打卡底片原始数据。
              </div>
            ) : (
              <div className="relative border-l-2 border-slate-100 pl-4 ml-2 space-y-4 text-xs font-semibold">
                {corrections.map((corr) => (
                  <div key={corr.id} className="relative animate-scale-up">
                    {/* Circle icon */}
                    <span className="absolute -left-[21px] top-0.5 bg-[#30D158] w-2.5 h-2.5 rounded-full border border-white shadow-sm" />
                    
                    <div className="bg-slate-50 border border-black/5 p-3 rounded-xl space-y-1">
                      <div className="flex justify-between items-center flex-wrap gap-1">
                        <span className="text-zinc-800">
                          由管理员 <span className="font-black text-[#0A84FF]">{corr.operatorName}</span> 修正
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">{corr.createdAt}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 py-1.5 text-zinc-600 font-normal">
                        <div>
                          <p className="text-[9px] text-zinc-400">更正前出勤</p>
                          <span className="font-semibold">{corr.before.status === "NORMAL" ? "正常" : "迟到/异常"}</span>
                        </div>
                        <div>
                          <p className="text-[9px] text-[#30D158]">更正后出勤</p>
                          <span className="font-bold text-[#30D158]">{corr.after.status === "NORMAL" ? "正常" : "迟到/异常"}</span>
                        </div>
                      </div>

                      <p className="text-zinc-500 font-medium pt-1.5 border-t border-black/5">
                        修正凭证原因: <span className="text-zinc-800 italic">“{corr.reason}”</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

// ==========================================
// 12. AdminAttendanceCorrections (系统人工考勤修正总台账)
// ==========================================
export const AdminAttendanceCorrections: React.FC = () => {
  const navigate = useNavigate();
  const { data: corrections, isLoading } = useAttendanceCorrections();

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header navigation */}
        <div className="flex items-center gap-3 border-b border-black/5 pb-4">
          <button 
            onClick={() => navigate("/admin/attendance")}
            className="p-1.5 hover:bg-slate-100 rounded-full text-zinc-600 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-lg font-extrabold text-[#1D1D1F]">人工考勤修正审计大账表</h2>
            <p className="text-xs text-[#86868B] font-medium mt-0.5">记录全站所有 STAFF 出勤底片修改的操作流，严控虚假打卡防作弊。</p>
          </div>
        </div>

        <div className="bg-white border border-black/5 rounded-[22px] p-5 shadow-sm space-y-4">
          <span className="text-xs font-extrabold text-zinc-800 block">全站人工修正审计明细清单</span>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="border-b border-zinc-100 text-zinc-400">
                  <th className="py-2.5">记录 ID</th>
                  <th className="py-2.5">时间</th>
                  <th className="py-2.5">操作管理员</th>
                  <th className="py-2.5">变更前状态</th>
                  <th className="py-2.5">变更后状态</th>
                  <th className="py-2.5">修正原因凭证</th>
                  <th className="py-2.5 text-right">查看</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-zinc-400">正在调取系统高级审计档案记录...</td>
                  </tr>
                ) : !corrections || corrections.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-zinc-400">暂无任何人工考勤修正审计记录</td>
                  </tr>
                ) : (
                  corrections.map((corr) => (
                    <tr key={corr.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-2.5 font-mono text-zinc-500">{corr.id.substring(0, 8)}...</td>
                      <td className="py-2.5 font-mono text-zinc-500">{corr.createdAt}</td>
                      <td className="py-2.5 font-bold text-zinc-800">{corr.operatorName}</td>
                      <td className="py-2.5 font-mono text-zinc-400">{corr.before.status}</td>
                      <td className="py-2.5 font-mono text-zinc-800 font-extrabold text-[#30D158]">{corr.after.status}</td>
                      <td className="py-2.5 max-w-xs truncate text-zinc-600 font-medium">{corr.reason}</td>
                      <td className="py-2.5 text-right">
                        <Link 
                          to={`/admin/attendance/${corr.attendanceId}`}
                          className="text-[#0A84FF] hover:underline text-[10px]"
                        >
                          追溯底片 →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

