import React, { useState } from "react";
import { AdminLayout } from "../../app/layouts/AdminLayout";
import { useEventStore } from "../../app/stores/eventStore";
import { 
  Users, UserCheck, ShieldCheck, Megaphone, FileText, 
  UploadCloud, FileSpreadsheet, PlusCircle, Trash2, CheckCircle, XCircle 
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
  const [leaves, setLeaves] = useState([
    { id: "L_01", userName: "苏苏", date: "2026-07-12", group: "舞台控场组", reason: "学校有紧急论文答辩需要请假半天", status: "LEADER_APPROVED" }
  ]);

  const handleFinalAudit = (id: string, isApprove: boolean) => {
    setLeaves(prev => prev.map(l => {
      if (l.id === id) {
        return { ...l, status: isApprove ? "APPROVED" : "REJECTED" };
      }
      return l;
    }));
    alert(isApprove ? "请假单终审核准！已强制核减今日出勤应到人数，并录入保险退扣名单。" : "终审驳回，通知已流转");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="border-b border-black/5 pb-4">
          <h2 className="text-xl font-bold text-[#1D1D1F]">STAFF 请假终审控制台</h2>
          <p className="text-xs text-[#86868B] font-medium mt-1">处理经由组长初步审核上报的请假单，进行最终裁决及保险/劳务清扣核算。</p>
        </div>

        <div className="space-y-4 max-w-3xl">
          {leaves.map((l) => (
            <div key={l.id} className="bg-white border border-black/5 rounded-[22px] p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-50 text-[#FF453A] flex items-center justify-center font-bold text-sm">
                    {l.userName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#1D1D1F]">{l.userName} (所属：{l.group})</h3>
                    <p className="text-[10px] text-zinc-400 font-mono">请假日期：{l.date}</p>
                  </div>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  l.status === "LEADER_APPROVED" 
                    ? "bg-amber-50 text-[#FF9F0A]" 
                    : l.status === "APPROVED" 
                      ? "bg-green-50 text-[#30D158]" 
                      : "bg-red-50 text-[#FF453A]"
                }`}>
                  {l.status === "LEADER_APPROVED" ? "● 组长已同意 (待总部终审)" : l.status === "APPROVED" ? "已终审批准" : "终审拒绝"}
                </span>
              </div>

              <div className="p-4 bg-slate-50 border border-black/5 rounded-2xl text-xs text-zinc-700 leading-relaxed font-semibold">
                事由：{l.reason}
              </div>

              {l.status === "LEADER_APPROVED" && (
                <div className="flex gap-2 justify-end">
                  <button 
                    onClick={() => handleFinalAudit(l.id, true)}
                    className="px-5 py-2 bg-[#30D158] hover:bg-[#30D158]/90 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle size={14} /> 准予休假
                  </button>
                  <button 
                    onClick={() => handleFinalAudit(l.id, false)}
                    className="px-5 py-2 bg-red-50 border border-red-200 text-[#FF453A] font-bold text-xs rounded-xl hover:bg-red-100 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <XCircle size={14} /> 予以驳回
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

// ==========================================
// 3. AdminAnnouncements (公告管理发布)
// ==========================================
export const AdminAnnouncements: React.FC = () => {
  const { announcements, confirmAnnouncement } = useEventStore();
  const [titleInput, setTitleInput] = useState("");
  const [contentInput, setContentInput] = useState("");
  const [isRequired, setIsRequired] = useState(false);
  const [annList, setAnnList] = useState(announcements);

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput || !contentInput) return;

    const newAnn = {
      id: `ANN_${Date.now()}`,
      title: titleInput,
      content: contentInput,
      publishDate: new Date().toISOString().substring(0, 10),
      isRequiredConfirm: isRequired,
      confirmedUserIds: []
    };

    setAnnList(p => [newAnn, ...p]);
    setTitleInput("");
    setContentInput("");
    setIsRequired(false);
    alert("公告发布成功！已对目标受众推送全屏强阻断阅读或消息提示。");
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
              className="w-full py-3 bg-[#0A84FF] text-white font-bold text-xs rounded-xl hover:bg-[#0A84FF]/95 transition-all cursor-pointer"
            >
              起草并广播该公告通知
            </button>
          </form>

          {/* Announcement history list */}
          <div className="lg:col-span-2 space-y-3">
            <span className="text-[10px] font-extrabold text-[#86868B] tracking-wide uppercase block">已发历史公告一览</span>
            
            {annList.map((ann) => (
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
            ))}
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
              onClick={() => alert("代发清册一键下载成功！文件名：STAFF_LAOWU_SETTLEMENT_2026.xlsx")}
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
                onClick={() => alert("表单设计已发布！手机报名端已实时替换为新设计的表单模型。")}
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
