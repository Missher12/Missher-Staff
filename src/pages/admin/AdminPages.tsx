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

// ==========================================
// 5. AdminInterviews (面试评分)
// ==========================================
export const AdminInterviews: React.FC = () => {
  const { applications } = useEventStore();
  const [reviews, setReviews] = useState(applications.filter(a => a.status === "INTERVIEWED" || a.status === "SUBMITTED"));

  const handleAction = (id: string, action: "APPROVED" | "REJECTED") => {
    setReviews(prev => prev.filter(r => r.id !== id));
    alert(action === "APPROVED" ? "已同意录取该 STAFF，身份已自动升级，系统已发出岗位邀约短信。" : "已拒绝，候选人信息已加入备用档案池。");
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
  const { attendanceRecords } = useEventStore();
  const [records, setRecords] = useState(attendanceRecords);

  const handleRefresh = () => {
    setRecords([...attendanceRecords]);
    alert("现场考勤GPS底片和双特征水印已实时拉取并完成秒级校对。");
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
            {records.map((r) => (
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
                  </div>
                </div>

                <div className="flex flex-col md:items-end text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-zinc-400 font-semibold">定位精度:</span>
                    <span className={`font-mono font-bold ${
                      (r.checkInDistance || 0) < 50 ? "text-[#30D158]" : "text-[#FF9F0A]"
                    }`}>
                      {r.checkInDistance !== undefined ? `${r.checkInDistance}米 (合规)` : "未采集"}
                    </span>
                  </div>
                  <p className="text-[9px] text-zinc-400 font-semibold mt-1">芯片基站：{r.checkInLocation || "未采集"}</p>
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
// 7. AdminAdmissions (特批直入)
// ==========================================
export const AdminAdmissions: React.FC = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="border-b border-black/5 pb-4">
          <h2 className="text-xl font-bold text-[#1D1D1F]">特批免审录取中心</h2>
          <p className="text-xs text-[#86868B] font-medium mt-1">对受邀漫展明星随行、VIP骨干或历史优秀STAFF进行一键特批免审录取。</p>
        </div>

        <div className="bg-white border border-black/5 rounded-[22px] p-6 text-center space-y-4 max-w-xl mx-auto shadow-sm">
          <span className="p-3.5 bg-blue-50 text-[#0A84FF] rounded-full inline-block">
            <UserCheck size={28} />
          </span>
          <h3 className="text-sm font-bold text-[#1D1D1F]">特批录入面板</h3>
          <div className="space-y-3 text-left">
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">候选人手机号</label>
              <input placeholder="请输入 11 位大陆有效手机号..." className="w-full p-3 bg-zinc-50 border border-black/5 rounded-2xl text-xs font-bold outline-none mt-1" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">特批录用事由</label>
              <input placeholder="例如：特邀舞台COSER随行保障，或历史金牌骨干STAFF免审..." className="w-full p-3 bg-zinc-50 border border-black/5 rounded-2xl text-xs font-bold outline-none mt-1" />
            </div>
            <button 
              onClick={() => alert("免审特招成功！对应成员已直接升级为 STAFF 级别并发出短信指引。")}
              className="w-full py-3.5 bg-[#0A84FF] text-white text-xs font-bold rounded-2xl hover:bg-[#0A84FF]/95 transition-all cursor-pointer"
            >
              一键免审特招
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

// ==========================================
// 8. AdminPeople (全量人员底片)
// ==========================================
export const AdminPeople: React.FC = () => {
  const [search, setSearch] = useState("");
  const users = [
    { id: "1", name: "林可儿", role: "STAFF", phone: "13800000001", status: "ACTIVE" },
    { id: "2", name: "陈大伟", role: "LEADER", phone: "13900000002", status: "ACTIVE" },
    { id: "3", name: "苏苏", role: "APPLICANT", phone: "13111110000", status: "PENDING" }
  ];

  const filtered = users.filter(u => u.name.includes(search) || u.phone.includes(search));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-black/5 pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#1D1D1F]">全量人员底片控制面板</h2>
            <p className="text-xs text-[#86868B] font-medium mt-1">查看、变更当前动漫展会所有报名人员、STAFF 以及各组长的角色与底片。</p>
          </div>
          <input 
            placeholder="搜索姓名或电话..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3.5 py-2 border border-black/5 rounded-xl text-xs bg-white outline-none font-semibold"
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filtered.map((u) => (
            <div key={u.id} className="bg-white border border-black/5 rounded-[22px] p-5 shadow-sm flex justify-between items-center text-xs">
              <div>
                <h4 className="font-bold text-[#1D1D1F] text-sm">{u.name}</h4>
                <p className="text-[10px] text-zinc-400 font-mono mt-1">账号：{u.phone} | 系统标识: {u.id}</p>
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
                  onClick={() => alert(`安全限制：出于防止现场欺诈考勤需要，变更人员角色已触发安全审查邮件。`)}
                  className="px-2.5 py-1.5 border border-black/5 rounded-xl text-[10px] font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  提升/降级权限
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

// ==========================================
// 9. AdminAssignments (岗位指派)
// ==========================================
export const AdminAssignments: React.FC = () => {
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
                onClick={() => alert("成功指派 苏苏 划归至 [舞台控场组] (组长：陈大伟)！派岗指令和实名保险已实时更新。")}
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
  const { attendanceRecords } = useEventStore();
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="border-b border-black/5 pb-4">
          <h2 className="text-xl font-bold text-[#1D1D1F]">历史考勤归档底片库</h2>
          <p className="text-xs text-[#86868B] font-medium mt-1">查看、导出漫展多期活动的所有人员出勤、补签、请假及劳务结算结算明细。</p>
        </div>

        <div className="bg-white border border-black/5 rounded-[22px] p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <span className="text-xs font-extrabold text-[#1D1D1F]">考勤记录历史总账表</span>
            <button 
              onClick={() => alert("考勤总台出勤底片及劳务对账单已成功生成！对账 Excel 报表已开始打包并下载至您的设备。")}
              className="px-4 py-2 bg-[#30D158] hover:bg-[#30D158]/95 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet size={14} /> 导出考勤对账明细 Excel
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="border-b border-zinc-100 text-zinc-400">
                  <th className="py-2.5">姓名</th>
                  <th className="py-2.5">日期</th>
                  <th className="py-2.5">岗位</th>
                  <th className="py-2.5">出勤状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {attendanceRecords.map((r) => (
                  <tr key={r.id} className="text-[#1D1D1F]">
                    <td className="py-2.5">{r.userName}</td>
                    <td className="py-2.5 font-mono">{r.date}</td>
                    <td className="py-2.5">{r.positionName}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                        r.status === "NORMAL" ? "bg-green-50 text-[#30D158]" : "bg-amber-50 text-[#FF9F0A]"
                      }`}>
                        {r.status === "NORMAL" ? "正常" : "迟到"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
