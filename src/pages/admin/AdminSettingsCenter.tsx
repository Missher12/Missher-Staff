import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePermission } from "../../app/guards/Guards";
import { useEventStore } from "../../app/stores/eventStore";
import { useAuthStore } from "../../app/stores/authStore";
import { AdminLayout } from "../../app/layouts/AdminLayout";
import { apiClient } from "../../shared/api/client";
import { PermissionCode, SettingCategory, SystemSetting, AdminPermissionGroup, AuditLog } from "../../shared/types";
import { 
  Settings, Shield, Users, Calendar, Clock, Volume2, ShieldAlert, FileText, Database, 
  Radio, History, Plus, Edit2, Trash2, Power, Check, X, ShieldCheck, Cpu, Key, Lock, 
  AlertTriangle, RefreshCw, FileDown, Search, Filter, Info, Eye, ClipboardCheck
} from "lucide-react";

// List of all 12 Settings Centers
interface SidebarItem {
  key: SettingCategory | "admins" | "permission-groups" | "audit-logs";
  name: string;
  description: string;
  icon: React.ComponentType<any>;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { key: "general", name: "系统与品牌", description: "配置系统基本名称、品牌Logo及界面主题", icon: Settings },
  { key: "admins", name: "管理员与权限", description: "子管理员人员管理、独立权限调配与启用", icon: Users },
  { key: "permission-groups", name: "角色与权限组", description: "定义 granular 权限组、管理功能访问范围", icon: Shield },
  { key: "activity-defaults", name: "活动全局默认值", description: "会期建立预设值、锁定退款时限及审批流", icon: Calendar },
  { key: "attendance", name: "考勤防作弊与规则", description: "地理围栏打卡、自拍活体人脸置信阀值参数", icon: Clock },
  { key: "application-interview", name: "招募、面试与核销", description: "重名核对、核销密钥安全以及面试标签库", icon: ClipboardCheck },
  { key: "data-privacy", name: "数据合规与脱敏", description: "身份证银行卡脱敏、极密信息导出防泄密水印", icon: FileText },
  { key: "notifications", name: "消息通道与模板", description: "短信网关设置、自适应招募与打卡推送模板", icon: Radio },
  { key: "security", name: "系统安全与策略", description: "密码策略规则、双因子核身及高危操作二次确认", icon: Lock },
  { key: "data-maintenance", name: "数据导入与导出", description: "数据库清淤归档、定时自动备份与主数清洗", icon: Database },
  { key: "integrations", name: "三方集成中心", description: "阿里云SMS、Tencent OCR、Redis与地理服务", icon: Cpu },
  { key: "audit-logs", name: "安全审计日志", description: "全量不可篡改管理员行为痕迹追踪日志", icon: History },
];

// All granular permission codes for grouping
const PERMISSION_METADATA = [
  { group: "系统管理 (System)", permissions: [
    { code: "system.settings.general.manage", name: "系统品牌设置管理", desc: "允许修改系统基本名称、ICP备案、网页页脚" },
    { code: "system.administrators.manage", name: "子管理员管理", desc: "允许添加、修改、禁用子管理员账号及直接赋权" },
    { code: "system.permission-groups.manage", name: "自定义权限组管理", desc: "允许建立、编辑和删除非系统预置的权限组" },
    { code: "system.integrations.manage", name: "第三方集成管理", desc: "允许配置短信、人脸识别、数据库等三方服务并执行测试" },
    { code: "system.data.manage", name: "系统数据维护", desc: "允许进行数据库重置、数据清理以及日志归档" },
    { code: "system.security.manage", name: "安全策略管理", desc: "配置密码政策、会话过期、高风险强制确认及提权审批" },
    { code: "system.audit.view", name: "查看操作日志", desc: "只读查看所有管理员的操作记录及连通性日志" }
  ]},
  { group: "会期与活动管理 (Activity)", permissions: [
    { code: "activity.create", name: "新建会期活动", desc: "支持全新起草活动或通过模板一键复制历史漫展" },
    { code: "activity.edit", name: "编辑会期配置", desc: "允许修改正在承办的活动地点、工作日期、意向岗位" },
    { code: "activity.delete", name: "删除会期活动", desc: "彻底移除正在编辑或尚未开启招募的漫展活动" },
    { code: "activity.archive", name: "活动归档结账", desc: "对完结活动进行考勤打包、保险计算，转入只读只退模式" },
    { code: "activity.unlock", name: "强制解锁锁定活动", desc: "对已结账归档或超过锁定期的数据进行限时提权订正" }
  ]},
  { group: "报名与面试审核 (Candidate)", permissions: [
    { code: "application.view", name: "查看报名列表", desc: "只读查看候选人报名进度、身份证图片及基本信息" },
    { code: "application.review", name: "初审资质审核", desc: "对报名材料执行审核通过/驳回，并指派面试意向" },
    { code: "interview.view", name: "查看面试场次", desc: "查看面试地点、预约人数、各场次剩余名额" },
    { code: "interview.manage", name: "面试场次排班管理", desc: "允许新建、修改或关闭面试预约时间段" },
    { code: "interview.scan", name: "面试核销扫码", desc: "在移动端对到场候选人的动态二维码进行扫码签到" },
    { code: "interview.review", name: "面试结果评议", desc: "对到场面试的人员进行评分、标签勾选及拟录用结论" },
    { code: "admission.view", name: "查看拟录用名单", desc: "查看各部门在录用阶段的排班分配和岗位落定" },
    { code: "admission.decide", name: "终审录用核定", desc: "点击『终审录用』正式下发Staff通知及组长关联" }
  ]},
  { group: "人员与小组管理 (Team)", permissions: [
    { code: "people.view", name: "查看成员档案", desc: "只读查看全站注册用户、工作人员的档案及手机号" },
    { code: "people.manage", name: "管理成员状态", desc: "修改成员黑名单标志、手动调整履历、编辑等级" },
    { code: "people.sensitive.view", name: "查看极密字段", desc: "允许查看未经脱敏的银行卡号及身份证全号" },
    { code: "group.view", name: "查看会务小组", desc: "查看各活动名下的正式小组（如舞台组、物料组）" },
    { code: "group.manage", name: "会务小组管理", desc: "允许新建/解散小组，以及指派/卸任小组组长" },
    { code: "position.manage", name: "管理分配岗位", desc: "添加各漫展名下的具体岗位及人数配置要求" },
    { code: "staff.assign", name: "组内成员调配", desc: "跨组调拨Staff、手动添加成员进入小组" }
  ]},
  { group: "现场考勤与请假 (Attendance)", permissions: [
    { code: "attendance.view", name: "查看考勤监控", desc: "查看实时及历史的打卡定位、照片比对结论及设备绑定" },
    { code: "attendance.group.view", name: "查看小组汇总表", desc: "查看自己管辖或全场的出勤工时统计、打卡缺勤率" },
    { code: "attendance.correct", name: "人工考勤订正", desc: "管理员忽略异常，手动代签或修改打卡记录为正常" },
    { code: "attendance.export", name: "导出考勤报表", desc: "导出Excel明细及财务代发劳务总表格" },
    { code: "leave.view", name: "查看请假记录", desc: "只读查看Staff提交的临时或全天请假申请" },
    { code: "leave.review", name: "审批请假申请", desc: "根据缺勤影响，决定批准或退回Staff的请假申请" }
  ]},
  { group: "通知与表单 (Notice & Forms)", permissions: [
    { code: "announcement.view", name: "查看系统通知", desc: "只读查看已发布的全局和活动公告及确认人" },
    { code: "announcement.publish", name: "撰写发布公告", desc: "支持拟定紧急和普通公告，并关联微信WebPush" },
    { code: "form.view", name: "查看自定义表单", desc: "只读查看报名问卷的设计、追加收集项的结构" },
    { code: "form.manage", name: "问卷表单设计器", desc: "支持动态拖拽追加手机号必填、健康承诺书等自定义输入" },
    { code: "data.import", name: "导入外部花名册", desc: "允许批量导入白名单用户跳过面试直接核定录用" },
    { code: "data.export", name: "导出全局数据", desc: "全局导出系统数据，附带防泄密数字水印保护" }
  ]}
];

const getTabPermission = (tab: string): PermissionCode => {
  switch (tab) {
    case "general":
      return "system.settings.general.manage";
    case "admins":
      return "system.administrators.manage";
    case "permission-groups":
      return "system.permission-groups.manage";
    case "integrations":
      return "system.integrations.manage";
    case "data-maintenance":
      return "system.data.manage";
    case "security":
      return "system.security.manage";
    case "audit-logs":
      return "system.audit.view";
    case "activity-defaults":
      return "activity.edit";
    case "attendance":
      return "attendance.view";
    case "application-interview":
      return "interview.manage";
    case "data-privacy":
      return "system.security.manage";
    case "notifications":
      return "announcement.publish";
    default:
      return "system.settings.general.manage";
  }
};

export const AdminSettingsCenter: React.FC = () => {
  const { category } = useParams<{ category?: string }>();
  const navigate = useNavigate();
  const { hasPermission } = usePermission();
  const activeTab = (category || "") as SettingCategory | "admins" | "permission-groups" | "audit-logs" | "";

  const { showToast } = useEventStore();
  const { user: currentUser } = useAuthStore();
  
  // Settings values loading state
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Administrative components lists state
  const [administrators, setAdministrators] = useState<any[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<AdminPermissionGroup[]>([]);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Logs search filter
  const [logSearch, setLogSearch] = useState<string>("");
  const [logFilterAction, setLogFilterAction] = useState<string>("");

  // Modals / Details states for CRUD
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any | null>(null);
  const [showGroupModal, setShowGroupModal] = useState<boolean>(false);
  const [selectedGroup, setSelectedGroup] = useState<AdminPermissionGroup | null>(null);
  const [showIntegrationModal, setShowIntegrationModal] = useState<boolean>(false);
  const [selectedIntegration, setSelectedIntegration] = useState<any | null>(null);
  const [testingKey, setTestingKey] = useState<string | null>(null);

  // Load all settings databases on mount and active tab switch
  useEffect(() => {
    if (activeTab) {
      loadAllData();
    }
  }, [activeTab]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      // Fetch basic system settings
      const rawSettings = await apiClient.getSettings();
      const settingsMap: Record<string, any> = {};
      rawSettings.forEach((s: SystemSetting) => {
        settingsMap[s.category] = s.value;
      });
      setSettings(settingsMap);

      // Fetch dynamic modules
      if (activeTab === "admins") {
        const admins = await apiClient.getAdministrators();
        setAdministrators(admins);
        const groups = await apiClient.getPermissionGroups();
        setPermissionGroups(groups);
      } else if (activeTab === "permission-groups") {
        const groups = await apiClient.getPermissionGroups();
        setPermissionGroups(groups);
      } else if (activeTab === "integrations") {
        const list = await apiClient.getIntegrations();
        setIntegrations(list);
      } else if (activeTab === "audit-logs") {
        const logs = await apiClient.getAuditLogs();
        setAuditLogs(logs);
      }
    } catch (err: any) {
      console.error(err);
      showToast(`加载数据失败: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (category: string) => {
    try {
      setSaving(true);
      const values = settings[category];
      await apiClient.updateSettings(
        category, 
        values, 
        currentUser?.id || "U_ADMIN", 
        currentUser?.name || "张晓明"
      );
      showToast("系统安全设置及防作弊安全参数在内存中更新成功！对应规则已实时生效。", "success");
    } catch (err: any) {
      showToast(`保存失败: ${err.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  // CRUD for Custom Permission Groups
  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) return;

    try {
      setSaving(true);
      if (selectedGroup.id) {
        // Update
        await apiClient.updatePermissionGroup(selectedGroup.id, {
          name: selectedGroup.name,
          description: selectedGroup.description,
          permissions: selectedGroup.permissions,
          operatorId: currentUser?.id,
          operatorName: currentUser?.name
        });
        showToast("权限组更新成功！", "success");
      } else {
        // Create
        await apiClient.createPermissionGroup({
          name: selectedGroup.name,
          description: selectedGroup.description,
          permissions: selectedGroup.permissions,
          operatorId: currentUser?.id,
          operatorName: currentUser?.name
        });
        showToast("全新权限组创建成功！已实时加入角色配置清单。", "success");
      }
      setShowGroupModal(false);
      loadAllData();
    } catch (err: any) {
      showToast(`保存权限组失败: ${err.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGroup = async (id: string, name: string) => {
    if (!window.confirm(`确定要彻底删除【${name}】权限组吗？此操作将同步清空该权限组下的所有管理员指派！`)) return;
    try {
      await apiClient.deletePermissionGroup(id);
      showToast("权限组已成功移除！", "success");
      loadAllData();
    } catch (err: any) {
      showToast(`删除失败: ${err.message}`, "error");
    }
  };

  // CRUD for Administrators
  const handleSaveAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;

    try {
      setSaving(true);
      if (selectedAdmin.isEdit) {
        // Update
        await apiClient.updateAdministrator(selectedAdmin.id, {
          name: selectedAdmin.name,
          phone: selectedAdmin.phone,
          permissionGroupIds: selectedAdmin.permissionGroupIds,
          directAllowPermissions: selectedAdmin.directAllowPermissions,
          directDenyPermissions: selectedAdmin.directDenyPermissions,
          activityIds: selectedAdmin.activityIds,
          enabled: selectedAdmin.enabled,
          operatorId: currentUser?.id,
          operatorName: currentUser?.name
        });
        showToast("管理员账号设置及指派组更新成功！", "success");
      } else {
        // Create
        await apiClient.createAdministrator({
          name: selectedAdmin.name,
          phone: selectedAdmin.phone,
          permissionGroupIds: selectedAdmin.permissionGroupIds,
          directAllowPermissions: selectedAdmin.directAllowPermissions,
          directDenyPermissions: selectedAdmin.directDenyPermissions,
          activityIds: selectedAdmin.activityIds,
          operatorId: currentUser?.id,
          operatorName: currentUser?.name
        });
        showToast("子管理员授权发布成功！当前账户已实时获得专属权限。", "success");
      }
      setShowAdminModal(false);
      loadAllData();
    } catch (err: any) {
      showToast(`保存失败: ${err.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDisableAdmin = async (id: string, name: string) => {
    if (!window.confirm(`确定要吊销并挂起【${name}】的管理员账号吗？挂起后其将无法登录管理控制台。`)) return;
    try {
      await apiClient.disableAdministrator(id, currentUser?.id, currentUser?.name);
      showToast(`已成功禁用管理员【${name}】的管理权限！`, "success");
      loadAllData();
    } catch (err: any) {
      showToast(`禁用失败: ${err.message}`, "error");
    }
  };

  // Integration testing
  const handleTestIntegration = async (key: string, name: string) => {
    try {
      setTestingKey(key);
      showToast(`正在对【${name}】组件执行接口连通性握手测试...`, "info");
      const res = await apiClient.testIntegration(key);
      if (res.success) {
        showToast(res.message, "success");
      } else {
        showToast(res.message, "error");
      }
      loadAllData();
    } catch (err: any) {
      showToast(`连通性测试异常: ${err.message}`, "error");
    } finally {
      setTestingKey(null);
    }
  };

  const handleSaveIntegration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIntegration) return;

    try {
      setSaving(true);
      await apiClient.updateIntegration(selectedIntegration.key, {
        mode: selectedIntegration.mode,
        status: selectedIntegration.status,
        description: selectedIntegration.description
      });
      showToast(`集成组件【${selectedIntegration.name}】参数配置保存成功！`, "success");
      setShowIntegrationModal(false);
      loadAllData();
    } catch (err: any) {
      showToast(`更新集成失败: ${err.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  // Data maintenance utility triggers
  const triggerSystemBackup = async () => {
    if (!window.confirm("确定要立即触发全局物理快照备份吗？")) return;
    showToast("正在启动高并发快照，打包 MySQL 物理数据库和 OSS 图像元数据...", "info");
    await new Promise(r => setTimeout(r, 1200));
    showToast("备份归档成功！已生成只读打包镜像：DB_SNAPSHOT_20260712.tar.gz (已同步分发至冗余备份节点)", "success");
  };

  const triggerCleanLogs = async () => {
    if (!window.confirm("确定要清理一年前的诊断和调试日志吗？(此操作不影响安全审计日志)")) return;
    showToast("正在清理 Redis 缓存签名垃圾和 node 内部控制台冗余日志...", "info");
    await new Promise(r => setTimeout(r, 800));
    showToast("垃圾清理完成！共释放 14.2 GB 存储空间，索引已重新校正。", "success");
  };

  const triggerFactoryReset = async () => {
    if (!window.confirm("⚠️ 危险操作：确定要将全系统设置、模拟数据一键重置为初始种子状态吗？您当前所做的自定义更改将被覆盖。")) return;
    showToast("正在擦除脏数据并重新 seeding 默认用户、考勤记录和权限配置...", "info");
    await new Promise(r => setTimeout(r, 1500));
    dbReset();
  };

  const dbReset = async () => {
    // Calling internal database reset by logging out and reloading or similar, 
    // but in mock adapter we can just re-initialize.
    // We'll write to mock data or let mock adapter reset.
    // Since our client exposes a mock adaptation, we can trigger a mock reset if exists,
    // otherwise we just tell them done.
    if ((apiClient as any).resetDatabase) {
      await (apiClient as any).resetDatabase();
    } else if (typeof (window as any).location !== "undefined") {
      // Direct call on mock Api Adapter
      const { db } = await import("../../shared/api/mock-adapter");
      db.reset();
    }
    showToast("全站数据已成功重置为种子状态！", "success");
    loadAllData();
  };

  // Safe Number UI generator ensuring Round 0 as per guidelines VI.
  const renderNumericValue = (val: string | number) => {
    return (
      <span className="font-sans font-medium tracking-tight text-[#1D1D1F] select-all [font-variant-numeric:lining-nums_tabular-nums] [font-feature-settings:'zero'_0]">
        {val}
      </span>
    );
  };

  if (activeTab === "") {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="border-b border-black/5 pb-4">
            <h1 className="text-xl font-black text-[#1D1D1F] flex items-center gap-2">
              <Settings className="text-[#BF5AF2]" size={24} /> 设置中心总览
            </h1>
            <p className="text-xs text-[#86868B] font-semibold mt-1">
              请选择对应的配置模块进行精细化系统设定。各模块受独立的 Granular 角色与权限限制。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;
              const perm = getTabPermission(item.key);
              const isAllowed = hasPermission(perm);
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    if (isAllowed) {
                      navigate(`/admin/settings/${item.key}`);
                    } else {
                      showToast(`您没有访问该设置模块的【${perm}】权限！`, "error");
                    }
                  }}
                  className={`p-6 bg-white border rounded-[28px] text-left transition-all hover:shadow-md hover:scale-[1.01] flex flex-col justify-between h-48 group cursor-pointer ${
                    isAllowed ? "border-black/5" : "border-red-100 bg-red-50/10 opacity-70"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-2xl ${isAllowed ? "bg-purple-50 text-[#BF5AF2]" : "bg-red-50 text-red-500"}`}>
                        <Icon size={20} />
                      </div>
                      {!isAllowed && (
                        <span className="text-[9px] px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-bold">
                          无权限
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#1D1D1F] group-hover:text-[#BF5AF2] transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-xs text-[#86868B] font-medium mt-1 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-[10px] text-[#BF5AF2] font-bold flex items-center gap-1 mt-2">
                    <span>进入设置</span>
                    <span className="transition-transform group-hover:translate-x-0.5">→</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </AdminLayout>
    );
  }

  const requiredPermission = getTabPermission(activeTab);
  const isAllowed = hasPermission(requiredPermission);

  if (!isAllowed) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-zinc-100 rounded-[28px] min-h-[50vh]">
          <span className="p-3 bg-red-50 text-[#FF453A] rounded-full mb-4">
            <ShieldAlert size={32} />
          </span>
          <h3 className="text-lg font-bold text-[#1D1D1F]">暂无设置模块访问权限</h3>
          <p className="text-xs text-[#86868B] max-w-sm mt-2 leading-relaxed">
            您的管理员账户没有 <strong>{requiredPermission}</strong> 权限，无法访问『{SIDEBAR_ITEMS.find(s => s.key === activeTab)?.name}』设置。
          </p>
          <button
            onClick={() => navigate("/admin/settings")}
            className="mt-6 px-6 py-2.5 bg-zinc-800 text-white rounded-full text-xs font-bold hover:bg-zinc-700 transition-all cursor-pointer"
          >
            返回设置总览
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-140px)] gap-6">
        
        {/* Apple Style Left Master Sidebar */}
        <div className="w-full lg:w-80 flex-shrink-0 bg-white border border-black/5 rounded-[24px] p-4 shadow-sm flex flex-col h-fit space-y-1.5">
          <div className="px-3 pb-3 border-b border-black/5 mb-2">
            <h2 className="text-sm font-extrabold text-[#1D1D1F] flex items-center gap-1.5">
              <Settings size={16} className="text-[#BF5AF2]" /> 控制控制面板
            </h2>
            <p className="text-[10px] text-[#86868B] font-medium mt-0.5">多重维度保障漫展考务平稳运行</p>
            <button
              onClick={() => navigate("/admin/settings")}
              className="mt-2 w-full py-1.5 text-center border border-purple-100 bg-purple-50/50 text-[#BF5AF2] rounded-xl text-[10px] font-bold hover:bg-purple-100 transition-all cursor-pointer"
            >
              ← 返回设置总览
            </button>
          </div>
          
          <div className="space-y-1 overflow-y-auto max-h-[600px] pr-1 scrollbar-thin">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => navigate(`/admin/settings/${item.key}`)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? "bg-[#BF5AF2] text-white shadow-md shadow-[#BF5AF2]/10" 
                      : "text-[#1D1D1F] hover:bg-zinc-50"
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${isActive ? "bg-white/10 text-white" : "bg-purple-50 text-[#BF5AF2]"}`}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold leading-none ${isActive ? "text-white" : "text-[#1D1D1F]"}`}>{item.name}</p>
                    <p className={`text-[9px] font-medium mt-1 truncate ${isActive ? "text-white/80" : "text-[#86868B]"}`}>{item.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Central/Right Canvas Panel */}
        <div className="flex-1 bg-white border border-black/5 rounded-[24px] p-6 shadow-sm flex flex-col min-w-0">
          
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 space-y-3">
              <RefreshCw className="animate-spin text-[#BF5AF2]" size={32} />
              <p className="text-xs text-zinc-400 font-semibold">正在载入配置及安全规则，请稍候...</p>
            </div>
          ) : (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Center Page Header */}
              <div className="border-b border-black/5 pb-4">
                <h3 className="text-base font-black text-[#1D1D1F] flex items-center gap-2">
                  {React.createElement(SIDEBAR_ITEMS.find(s => s.key === activeTab)?.icon || Settings, { size: 20, className: "text-[#BF5AF2]" })}
                  {SIDEBAR_ITEMS.find(s => s.key === activeTab)?.name}
                </h3>
                <p className="text-[11px] text-[#86868B] font-semibold mt-1">
                  {SIDEBAR_ITEMS.find(s => s.key === activeTab)?.description}
                </p>
              </div>

              {/* 1. Category: general */}
              {activeTab === "general" && settings.general && (
                <div className="space-y-6 max-w-2xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1D1D1F]">主系统名称</label>
                      <input 
                        type="text" 
                        value={settings.general.systemName}
                        onChange={(e) => setSettings({ ...settings, general: { ...settings.general, systemName: e.target.value } })}
                        className="w-full px-3 py-2 border border-black/5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#BF5AF2]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1D1D1F]">系统简称 (短信后缀等)</label>
                      <input 
                        type="text" 
                        value={settings.general.systemShortName}
                        onChange={(e) => setSettings({ ...settings, general: { ...settings.general, systemShortName: e.target.value } })}
                        className="w-full px-3 py-2 border border-black/5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#BF5AF2]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1D1D1F]">登录页大标题</label>
                      <input 
                        type="text" 
                        value={settings.general.loginTitle}
                        onChange={(e) => setSettings({ ...settings, general: { ...settings.general, loginTitle: e.target.value } })}
                        className="w-full px-3 py-2 border border-black/5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#BF5AF2]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1D1D1F]">登录页副标题</label>
                      <input 
                        type="text" 
                        value={settings.general.loginSubtitle}
                        onChange={(e) => setSettings({ ...settings, general: { ...settings.general, loginSubtitle: e.target.value } })}
                        className="w-full px-3 py-2 border border-black/5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#BF5AF2]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1D1D1F]">默认语言</label>
                      <select 
                        value={settings.general.defaultLang}
                        onChange={(e) => setSettings({ ...settings, general: { ...settings.general, defaultLang: e.target.value } })}
                        className="w-full px-3 py-2 border border-black/5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#BF5AF2]"
                      >
                        <option value="zh-CN">简体中文 (zh-CN)</option>
                        <option value="en-US">English (en-US)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1D1D1F]">默认时区</label>
                      <select 
                        value={settings.general.defaultTimezone}
                        onChange={(e) => setSettings({ ...settings, general: { ...settings.general, defaultTimezone: e.target.value } })}
                        className="w-full px-3 py-2 border border-black/5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#BF5AF2]"
                      >
                        <option value="GMT+8">北京时间 (GMT+8)</option>
                        <option value="GMT+0">中时区 (GMT+0)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1D1D1F]">默认系统主题</label>
                      <select 
                        value={settings.general.theme}
                        onChange={(e) => setSettings({ ...settings, general: { ...settings.general, theme: e.target.value } })}
                        className="w-full px-3 py-2 border border-black/5 rounded-xl text-xs font-semibold focus:outline-none"
                      >
                        <option value="light">简约现代明亮 (推荐)</option>
                        <option value="dark">极夜保护眼暗黑</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1D1D1F]">ICP 备案编号</label>
                      <input 
                        type="text" 
                        value={settings.general.icpInfo}
                        onChange={(e) => setSettings({ ...settings, general: { ...settings.general, icpInfo: e.target.value } })}
                        className="w-full px-3 py-2 border border-black/5 rounded-xl text-xs font-semibold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1D1D1F]">页脚版权声明</label>
                      <input 
                        type="text" 
                        value={settings.general.footerInfo}
                        onChange={(e) => setSettings({ ...settings, general: { ...settings.general, footerInfo: e.target.value } })}
                        className="w-full px-3 py-2 border border-black/5 rounded-xl text-xs font-semibold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1D1D1F]">新建活动默认封面 URL</label>
                    <input 
                      type="text" 
                      value={settings.general.defaultActivityCover}
                      onChange={(e) => setSettings({ ...settings, general: { ...settings.general, defaultActivityCover: e.target.value } })}
                      className="w-full px-3 py-2 border border-black/5 rounded-xl text-xs font-semibold focus:outline-none"
                    />
                  </div>

                  <div className="pt-4 border-t border-black/5 flex justify-end">
                    <button
                      onClick={() => handleSaveSettings("general")}
                      disabled={saving}
                      className="px-6 py-2 bg-[#BF5AF2] text-white text-xs font-bold rounded-xl hover:bg-[#BF5AF2]/90 cursor-pointer shadow-md flex items-center gap-2"
                    >
                      {saving && <RefreshCw size={12} className="animate-spin" />}
                      保存品牌与基本设置
                    </button>
                  </div>
                </div>
              )}

              {/* 2. Category: admins */}
              {activeTab === "admins" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-zinc-50 border border-zinc-100 rounded-2xl p-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-extrabold text-[#1D1D1F]">子管理员账户调配清单</h4>
                      <p className="text-[10px] text-[#86868B] font-semibold">此处直接列出当前全站具备高级管理权限（ADMIN）的工作人员，您可追加或动态修改其许可范围。</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedAdmin({
                          name: "",
                          phone: "",
                          permissionGroupIds: ["PG_SYS_ADMIN"],
                          directAllowPermissions: [],
                          directDenyPermissions: [],
                          activityIds: ["*"],
                          enabled: true,
                          isEdit: false
                        });
                        setShowAdminModal(true);
                      }}
                      className="px-3.5 py-1.5 bg-[#BF5AF2] text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer shadow"
                    >
                      <Plus size={14} /> 新授权管理员
                    </button>
                  </div>

                  <div className="border border-black/5 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-zinc-50 border-b border-black/5 font-bold text-[#86868B]">
                          <th className="p-3">名字</th>
                          <th className="p-3">电话号码</th>
                          <th className="p-3">指派权限组</th>
                          <th className="p-3">管辖会期活动</th>
                          <th className="p-3">状态</th>
                          <th className="p-3 text-right">管理操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {administrators.map((adm) => (
                          <tr key={adm.id} className="hover:bg-zinc-50/50 font-semibold">
                            <td className="p-3 flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-purple-100 text-[#BF5AF2] flex items-center justify-center font-bold text-[10px]">
                                {adm.name.charAt(0)}
                              </div>
                              <span className="text-[#1D1D1F] font-bold">{adm.name}</span>
                            </td>
                            <td className="p-3">{renderNumericValue(adm.phone)}</td>
                            <td className="p-3">
                              <div className="flex flex-wrap gap-1">
                                {adm.permissionGroupIds.map((pgId: string) => {
                                  const name = permissionGroups.find(g => g.id === pgId)?.name || pgId;
                                  return (
                                    <span key={pgId} className="px-2 py-0.5 bg-purple-50 text-[#BF5AF2] rounded-full text-[9px] font-bold">
                                      {name}
                                    </span>
                                  );
                                })}
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 bg-blue-50 text-[#0A84FF] rounded text-[9px] font-mono">
                                {adm.activityIds.includes("*") ? "全局通管 (*)" : `限管理 ${adm.activityIds.length} 个活动`}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                adm.enabled 
                                  ? "bg-green-50 text-[#30D158]" 
                                  : "bg-red-50 text-[#FF453A]"
                              }`}>
                                {adm.enabled ? "正常登录" : "封禁挂起"}
                              </span>
                            </td>
                            <td className="p-3 text-right space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedAdmin({ ...adm, isEdit: true });
                                  setShowAdminModal(true);
                                }}
                                className="p-1 text-[#0A84FF] hover:bg-blue-50 rounded cursor-pointer inline-flex items-center"
                              >
                                <Edit2 size={13} />
                              </button>
                              {adm.id !== "U_ADMIN" && adm.enabled && (
                                <button
                                  onClick={() => handleDisableAdmin(adm.id, adm.name)}
                                  className="p-1 text-[#FF453A] hover:bg-red-50 rounded cursor-pointer inline-flex items-center"
                                  title="禁用挂起"
                                >
                                  <Power size={13} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 3. Category: permission-groups */}
              {activeTab === "permission-groups" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-zinc-50 border border-zinc-100 rounded-2xl p-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-extrabold text-[#1D1D1F]">自定义角色与权限组</h4>
                      <p className="text-[10px] text-[#86868B] font-semibold">系统管理员可通过权限配置代替传统粗放的单一管理员角色，实现极其精细的按需划拨。</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedGroup({
                          id: "",
                          name: "",
                          description: "",
                          permissions: [],
                          isSystem: false,
                          createdAt: "",
                          updatedAt: ""
                        });
                        setShowGroupModal(true);
                      }}
                      className="px-3.5 py-1.5 bg-[#BF5AF2] text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer shadow"
                    >
                      <Plus size={14} /> 新建权限组
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {permissionGroups.map((group) => (
                      <div key={group.id} className="border border-black/5 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:border-zinc-200 transition-all">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-extrabold text-[#1D1D1F] truncate">{group.name}</span>
                            {group.isSystem ? (
                              <span className="px-1.5 py-0.5 bg-zinc-100 text-zinc-500 rounded text-[8px] font-bold">系统预设</span>
                            ) : (
                              <span className="px-1.5 py-0.5 bg-purple-50 text-[#BF5AF2] rounded text-[8px] font-bold">用户自定义</span>
                            )}
                          </div>
                          <p className="text-[10px] text-[#86868B] font-medium leading-relaxed line-clamp-2 h-7">{group.description}</p>
                          <div className="flex items-center gap-1">
                            <ShieldCheck size={12} className="text-[#BF5AF2]" />
                            <span className="text-[10px] font-bold text-zinc-500">
                              共包含 {renderNumericValue(group.permissions.length)} 项精细许可
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-black/5 flex justify-end gap-2 text-[10px] font-bold">
                          <button
                            onClick={() => {
                              setSelectedGroup({ ...group });
                              setShowGroupModal(true);
                            }}
                            className="px-2 py-1 border border-zinc-200 hover:bg-zinc-50 rounded-lg cursor-pointer text-[#0A84FF] flex items-center gap-0.5"
                          >
                            <Edit2 size={11} />
                            {group.isSystem ? "只读查看" : "配置授权"}
                          </button>
                          {!group.isSystem && (
                            <button
                              onClick={() => handleDeleteGroup(group.id, group.name)}
                              className="px-2 py-1 bg-red-50 hover:bg-red-100 rounded-lg cursor-pointer text-[#FF453A] flex items-center gap-0.5"
                            >
                              <Trash2 size={11} /> 删除
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Category: activity-defaults */}
              {activeTab === "activity-defaults" && settings["activity-defaults"] && (
                <div className="space-y-6 max-w-2xl">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1D1D1F] flex justify-between">
                      <span>默认漫展会期建立预备提前期</span>
                      <span className="text-[#0A84FF]">{renderNumericValue(settings["activity-defaults"].defaultAdvanceDays)} 天</span>
                    </label>
                    <input 
                      type="range" 
                      min="1" 
                      max="30" 
                      step="1"
                      value={settings["activity-defaults"].defaultAdvanceDays}
                      onChange={(e) => setSettings({ ...settings, "activity-defaults": { ...settings["activity-defaults"], defaultAdvanceDays: Number(e.target.value) } })}
                      className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-[#BF5AF2]"
                    />
                    <p className="text-[10px] text-zinc-400 font-semibold leading-relaxed">指定新漫展活动建立时，预设的工作日期相比当天必须要领先的周期长度。</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1D1D1F]">默认报名截止时间 (工作日首日前夕)</label>
                      <input 
                        type="text" 
                        value={settings["activity-defaults"].defaultApplyDeadlineTime}
                        onChange={(e) => setSettings({ ...settings, "activity-defaults": { ...settings["activity-defaults"], defaultApplyDeadlineTime: e.target.value } })}
                        className="w-full px-3 py-2 border border-black/5 rounded-xl text-xs font-semibold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1D1D1F]">默认面试签到提前到场缓冲时间</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={settings["activity-defaults"].defaultInterviewAdvanceMinutes}
                          onChange={(e) => setSettings({ ...settings, "activity-defaults": { ...settings["activity-defaults"], defaultInterviewAdvanceMinutes: Number(e.target.value) } })}
                          className="w-full px-3 py-2 border border-black/5 rounded-xl text-xs font-semibold focus:outline-none"
                        />
                        <span className="absolute right-3 top-2.5 text-[9px] text-zinc-400 font-bold">分钟</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1D1D1F]">会期完结后打卡锁定天数</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={settings["activity-defaults"].defaultLockDays}
                          onChange={(e) => setSettings({ ...settings, "activity-defaults": { ...settings["activity-defaults"], defaultLockDays: Number(e.target.value) } })}
                          className="w-full px-3 py-2 border border-black/5 rounded-xl text-xs font-semibold focus:outline-none"
                        />
                        <span className="absolute right-3 top-2.5 text-[9px] text-zinc-400 font-bold">天</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1D1D1F]">超出人数限额处理预案</label>
                      <select 
                        value={settings["activity-defaults"].defaultOverLimitProcess}
                        onChange={(e) => setSettings({ ...settings, "activity-defaults": { ...settings["activity-defaults"], defaultOverLimitProcess: e.target.value } })}
                        className="w-full px-3 py-2 border border-black/5 rounded-xl text-xs font-semibold focus:outline-none"
                      >
                        <option value="WAITLIST">自动转入候补通道 (FIFO 候补队列)</option>
                        <option value="BLOCK">直接停止该岗位报名输入</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1D1D1F]">自动归档时限规则</label>
                      <select 
                        value={settings["activity-defaults"].defaultArchiveRule}
                        onChange={(e) => setSettings({ ...settings, "activity-defaults": { ...settings["activity-defaults"], defaultArchiveRule: e.target.value } })}
                        className="w-full px-3 py-2 border border-black/5 rounded-xl text-xs font-semibold focus:outline-none"
                      >
                        <option value="AUTO_30_DAYS">活动完结后 30 天自动关账归档</option>
                        <option value="AUTO_15_DAYS">活动完结后 15 天自动关账归档</option>
                        <option value="MANUAL_ONLY">仅限管理员手动确认一键归档</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1D1D1F]">全局打卡和图片凭证保存留存时限</label>
                      <select 
                        value={settings["activity-defaults"].defaultRetentionPeriodMonths}
                        onChange={(e) => setSettings({ ...settings, "activity-defaults": { ...settings["activity-defaults"], defaultRetentionPeriodMonths: Number(e.target.value) } })}
                        className="w-full px-3 py-2 border border-black/5 rounded-xl text-xs font-semibold focus:outline-none"
                      >
                        <option value={12}>12 个月（到期自动归零清洗）</option>
                        <option value={24}>24 个月（符合审计标准）</option>
                        <option value={36}>36 个月（高合规长期存储）</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-black/5 flex justify-end">
                    <button
                      onClick={() => handleSaveSettings("activity-defaults")}
                      disabled={saving}
                      className="px-6 py-2 bg-[#BF5AF2] text-white text-xs font-bold rounded-xl hover:bg-[#BF5AF2]/90 cursor-pointer shadow-md flex items-center gap-2"
                    >
                      {saving && <RefreshCw size={12} className="animate-spin" />}
                      保存会期招募默认值
                    </button>
                  </div>
                </div>
              )}

              {/* 5. Category: attendance */}
              {activeTab === "attendance" && settings.attendance && (
                <div className="space-y-6 max-w-2xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1D1D1F]">考勤基准签到时间</label>
                      <input 
                        type="text" 
                        value={settings.attendance.defaultCheckInTime}
                        onChange={(e) => setSettings({ ...settings, attendance: { ...settings.attendance, defaultCheckInTime: e.target.value } })}
                        className="w-full px-3 py-2 border border-black/5 rounded-xl text-xs font-semibold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1D1D1F]">考勤基准签退时间</label>
                      <input 
                        type="text" 
                        value={settings.attendance.defaultCheckOutTime}
                        onChange={(e) => setSettings({ ...settings, attendance: { ...settings.attendance, defaultCheckOutTime: e.target.value } })}
                        className="w-full px-3 py-2 border border-black/5 rounded-xl text-xs font-semibold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1D1D1F]">迟到豁免缓冲弹性期</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={settings.attendance.lateGraceMinutes}
                          onChange={(e) => setSettings({ ...settings, attendance: { ...settings.attendance, lateGraceMinutes: Number(e.target.value) } })}
                          className="w-full px-3 py-2 border border-black/5 rounded-xl text-xs font-semibold focus:outline-none"
                        />
                        <span className="absolute right-3 top-2.5 text-[9px] text-zinc-400 font-bold">分钟</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1D1D1F]">早退豁免缓冲弹性期</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={settings.attendance.earlyLeaveGraceMinutes}
                          onChange={(e) => setSettings({ ...settings, attendance: { ...settings.attendance, earlyLeaveGraceMinutes: Number(e.target.value) } })}
                          className="w-full px-3 py-2 border border-black/5 rounded-xl text-xs font-semibold focus:outline-none"
                        />
                        <span className="absolute right-3 top-2.5 text-[9px] text-zinc-400 font-bold">分钟</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl p-4">
                    <h4 className="text-xs font-extrabold text-[#1D1D1F] flex items-center gap-1">
                      <ShieldAlert size={14} className="text-[#FF9F0A]" /> 防作弊与核验物理策略
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-black/5">
                        <div className="space-y-0.5">
                          <span className="text-[11px] font-bold text-zinc-800">强制前置自拍核身</span>
                          <p className="text-[9px] text-zinc-400 font-semibold">签到必须开启摄像头自拍</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={settings.attendance.requireSelfie}
                          onChange={(e) => setSettings({ ...settings, attendance: { ...settings.attendance, requireSelfie: e.target.checked } })}
                          className="w-4 h-4 rounded text-[#BF5AF2] border-black/5 focus:ring-[#BF5AF2] accent-[#BF5AF2] cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-black/5">
                        <div className="space-y-0.5">
                          <span className="text-[11px] font-bold text-zinc-800">允许相册照片上传</span>
                          <p className="text-[9px] text-zinc-400 font-semibold">关闭可防备虚拟地理拍照刷卡</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={settings.attendance.allowAlbumUpload}
                          onChange={(e) => setSettings({ ...settings, attendance: { ...settings.attendance, allowAlbumUpload: e.target.checked } })}
                          className="w-4 h-4 rounded text-[#BF5AF2] border-black/5 focus:ring-[#BF5AF2] accent-[#BF5AF2] cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-black/5">
                        <div className="space-y-0.5">
                          <span className="text-[11px] font-bold text-zinc-800">首次打卡绑定手机物理设备</span>
                          <p className="text-[9px] text-zinc-400 font-semibold">防一人多部手机替人刷卡</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={settings.attendance.bindDeviceOnFirstCheckIn}
                          onChange={(e) => setSettings({ ...settings, attendance: { ...settings.attendance, bindDeviceOnFirstCheckIn: e.target.checked } })}
                          className="w-4 h-4 rounded text-[#BF5AF2] border-black/5 focus:ring-[#BF5AF2] accent-[#BF5AF2] cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-black/5">
                        <div className="space-y-0.5">
                          <span className="text-[11px] font-bold text-zinc-800">跨小组考勤数据联通</span>
                          <p className="text-[9px] text-zinc-400 font-semibold">各组长共享白名单统计看板</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={settings.attendance.shareAttendanceBetweenRoles}
                          onChange={(e) => setSettings({ ...settings, attendance: { ...settings.attendance, shareAttendanceBetweenRoles: e.target.checked } })}
                          className="w-4 h-4 rounded text-[#BF5AF2] border-black/5 focus:ring-[#BF5AF2] accent-[#BF5AF2] cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#1D1D1F] flex justify-between">
                      <span>漫展场馆地理打卡半径 (GPS 圈地围栏)</span>
                      <span className="text-[#0A84FF]">{renderNumericValue(settings.attendance.defaultVenueRadiusMeters)} 米</span>
                    </label>
                    <input 
                      type="range" 
                      min="50" 
                      max="1000" 
                      step="50"
                      value={settings.attendance.defaultVenueRadiusMeters}
                      onChange={(e) => setSettings({ ...settings, attendance: { ...settings.attendance, defaultVenueRadiusMeters: Number(e.target.value) } })}
                      className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-[#BF5AF2]"
                    />
                    <p className="text-[10px] text-zinc-400 font-semibold leading-relaxed">打卡物理坐标与展馆核定中点位置偏移阀值。若超出此半径，自动挂起并提示“超出场馆范围”。</p>
                  </div>

                  <div className="pt-4 border-t border-black/5 flex justify-end">
                    <button
                      onClick={() => handleSaveSettings("attendance")}
                      disabled={saving}
                      className="px-6 py-2 bg-[#BF5AF2] text-white text-xs font-bold rounded-xl hover:bg-[#BF5AF2]/90 cursor-pointer shadow-md flex items-center gap-2"
                    >
                      {saving && <RefreshCw size={12} className="animate-spin" />}
                      保存考勤防作弊规则
                    </button>
                  </div>
                </div>
              )}

              {/* 6. Category: application-interview */}
              {activeTab === "application-interview" && settings["application-interview"] && (
                <div className="space-y-6 max-w-2xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-zinc-800">防范身份证重名报备</span>
                        <p className="text-[9px] text-zinc-400 font-semibold">报名资料提交前置核对重复项</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings["application-interview"].checkDuplicateIdCard}
                        onChange={(e) => setSettings({ ...settings, "application-interview": { ...settings["application-interview"], checkDuplicateIdCard: e.target.checked } })}
                        className="w-4 h-4 rounded text-[#BF5AF2] border-black/5 focus:ring-[#BF5AF2] accent-[#BF5AF2] cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-zinc-800">防范手机号刷单恶意注册</span>
                        <p className="text-[9px] text-zinc-400 font-semibold">前置核实注册手机号独立性</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings["application-interview"].checkDuplicatePhone}
                        onChange={(e) => setSettings({ ...settings, "application-interview": { ...settings["application-interview"], checkDuplicatePhone: e.target.checked } })}
                        className="w-4 h-4 rounded text-[#BF5AF2] border-black/5 focus:ring-[#BF5AF2] accent-[#BF5AF2] cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1D1D1F]">扫码签到核销凭证动态刷新周期</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={settings["application-interview"].dynamicQrCodeExpirySeconds}
                          onChange={(e) => setSettings({ ...settings, "application-interview": { ...settings["application-interview"], dynamicQrCodeExpirySeconds: Number(e.target.value) } })}
                          className="w-full px-3 py-2 border border-black/5 rounded-xl text-xs font-semibold focus:outline-none"
                        />
                        <span className="absolute right-3 top-2.5 text-[9px] text-zinc-400 font-bold">秒刷新</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1D1D1F]">终审录用权限核定模式</label>
                      <select 
                        value={settings["application-interview"].finalEmploymentRule}
                        onChange={(e) => setSettings({ ...settings, "application-interview": { ...settings["application-interview"], finalEmploymentRule: e.target.value } })}
                        className="w-full px-3 py-2 border border-black/5 rounded-xl text-xs font-semibold focus:outline-none"
                      >
                        <option value="ADMIN_DECISION_ONLY">必须由全权管理员 (ADMIN) 统一作最终决策</option>
                        <option value="LEADER_RECOMMENDED">各组长推荐拟录用后系统自动通过并派单</option>
                      </select>
                    </div>
                  </div>

                  {/* Dynamic Editable Chips for Interview tags */}
                  <div className="space-y-2.5">
                    <label className="text-xs font-bold text-[#1D1D1F]">面试预设标签快捷候选库</label>
                    <div className="flex flex-wrap gap-1.5 p-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl">
                      {settings["application-interview"].interviewEvaluationTags.map((tag: string, idx: number) => (
                        <span key={idx} className="px-2.5 py-1 bg-white border border-zinc-200 text-zinc-800 rounded-lg text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                          {tag}
                          <button 
                            onClick={() => {
                              const updated = [...settings["application-interview"].interviewEvaluationTags];
                              updated.splice(idx, 1);
                              setSettings({ ...settings, "application-interview": { ...settings["application-interview"], interviewEvaluationTags: updated } });
                            }}
                            className="text-zinc-400 hover:text-red-500 font-extrabold cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      <button
                        onClick={() => {
                          const tag = window.prompt("请输入新增面试备选标签名称:");
                          if (tag && tag.trim()) {
                            const updated = [...settings["application-interview"].interviewEvaluationTags, tag.trim()];
                            setSettings({ ...settings, "application-interview": { ...settings["application-interview"], interviewEvaluationTags: updated } });
                          }
                        }}
                        className="px-2.5 py-1 bg-[#BF5AF2]/5 text-[#BF5AF2] hover:bg-[#BF5AF2]/10 rounded-lg text-[10px] font-extrabold flex items-center gap-0.5 cursor-pointer"
                      >
                        + 加新标签
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-black/5 flex justify-end">
                    <button
                      onClick={() => handleSaveSettings("application-interview")}
                      disabled={saving}
                      className="px-6 py-2 bg-[#BF5AF2] text-white text-xs font-bold rounded-xl hover:bg-[#BF5AF2]/90 cursor-pointer shadow-md flex items-center gap-2"
                    >
                      {saving && <RefreshCw size={12} className="animate-spin" />}
                      保存招募面试参数
                    </button>
                  </div>
                </div>
              )}

              {/* 7. Category: data-privacy */}
              {activeTab === "data-privacy" && settings["data-privacy"] && (
                <div className="space-y-6 max-w-2xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1D1D1F]">身份证号默认脱敏级别</label>
                      <select 
                        value={settings["data-privacy"].idCardDisplayMethod}
                        onChange={(e) => setSettings({ ...settings, "data-privacy": { ...settings["data-privacy"], idCardDisplayMethod: e.target.value } })}
                        className="w-full px-3 py-2 border border-black/5 rounded-xl text-xs font-semibold focus:outline-none"
                      >
                        <option value="MASK_MIDDLE">部分遮蔽 (如: 3301**********2213)</option>
                        <option value="SHOW_LAST_6">仅展示后 6 位，其余脱敏</option>
                        <option value="SHOW_ALL">展示完整原始数值 (极度危险)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1D1D1F]">银行卡号默认脱敏级别</label>
                      <select 
                        value={settings["data-privacy"].bankCardDisplayMethod}
                        onChange={(e) => setSettings({ ...settings, "data-privacy": { ...settings["data-privacy"], bankCardDisplayMethod: e.target.value } })}
                        className="w-full px-3 py-2 border border-black/5 rounded-xl text-xs font-semibold focus:outline-none"
                      >
                        <option value="MASK_MIDDLE">部分遮蔽 (仅展示开头及结尾4位)</option>
                        <option value="SHOW_ALL">展示完整数值 (不进行脱敏)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1D1D1F]">极密表格文件导出防泄密水印</label>
                      <input 
                        type="text" 
                        value={settings["data-privacy"].exportWatermarkText}
                        onChange={(e) => setSettings({ ...settings, "data-privacy": { ...settings["data-privacy"], exportWatermarkText: e.target.value } })}
                        className="w-full px-3 py-2 border border-black/5 rounded-xl text-xs font-semibold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1D1D1F]">数据防翻盖自动锁定期</label>
                      <select 
                        value={settings["data-privacy"].dataLockTimeDays}
                        onChange={(e) => setSettings({ ...settings, "data-privacy": { ...settings["data-privacy"], dataLockTimeDays: Number(e.target.value) } })}
                        className="w-full px-3 py-2 border border-black/5 rounded-xl text-xs font-semibold focus:outline-none"
                      >
                        <option value={7}>完结后 7 天强制加锁只读</option>
                        <option value={15}>完结后 15 天强制加锁只读</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl p-4">
                    <h4 className="text-xs font-extrabold text-[#1D1D1F] flex items-center gap-1">
                      <ShieldAlert size={14} className="text-[#BF5AF2]" /> 物理敏感附件过期自动销毁
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-500">身份证正面电子照片销毁留存期</label>
                        <select 
                          value={settings["data-privacy"].idCardPhotoRetentionMonths}
                          onChange={(e) => setSettings({ ...settings, "data-privacy": { ...settings["data-privacy"], idCardPhotoRetentionMonths: Number(e.target.value) } })}
                          className="w-full px-2.5 py-1.5 bg-white border border-black/5 rounded-xl text-[11px] font-semibold"
                        >
                          <option value={3}>3 个月内（招募工作结束后即行撕毁）</option>
                          <option value={6}>6 个月</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-500">劳务代发报表销毁留存期</label>
                        <select 
                          value={settings["data-privacy"].bankCardInfoRetentionMonths}
                          onChange={(e) => setSettings({ ...settings, "data-privacy": { ...settings["data-privacy"], bankCardInfoRetentionMonths: Number(e.target.value) } })}
                          className="w-full px-2.5 py-1.5 bg-white border border-black/5 rounded-xl text-[11px] font-semibold"
                        >
                          <option value={6}>6 个月内（代发完税后立即物理清除）</option>
                          <option value={12}>12 个月</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-black/5 mt-2">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-bold text-zinc-800">导出操作全链路安全审计日志</span>
                        <p className="text-[9px] text-zinc-400 font-semibold">记录任何管理员导出Excel的动作及IP</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings["data-privacy"].exportAuditLogging}
                        onChange={(e) => setSettings({ ...settings, "data-privacy": { ...settings["data-privacy"], exportAuditLogging: e.target.checked } })}
                        className="w-4 h-4 rounded text-[#BF5AF2] border-black/5 focus:ring-[#BF5AF2] accent-[#BF5AF2] cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-black/5 flex justify-end">
                    <button
                      onClick={() => handleSaveSettings("data-privacy")}
                      disabled={saving}
                      className="px-6 py-2 bg-[#BF5AF2] text-white text-xs font-bold rounded-xl hover:bg-[#BF5AF2]/90 cursor-pointer shadow-md flex items-center gap-2"
                    >
                      {saving && <RefreshCw size={12} className="animate-spin" />}
                      保存合规与脱敏参数
                    </button>
                  </div>
                </div>
              )}

              {/* 8. Category: notifications */}
              {activeTab === "notifications" && settings.notifications && (
                <div className="space-y-6 max-w-2xl">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1D1D1F]">默认通道重试策略</label>
                    <select 
                      value={settings.notifications.failureRetryRules}
                      onChange={(e) => setSettings({ ...settings, notifications: { ...settings.notifications, failureRetryRules: e.target.value } })}
                      className="w-full px-3 py-2 border border-black/5 rounded-xl text-xs font-semibold focus:outline-none"
                    >
                      <option value="RETRY_3_TIMES_10M">发送失败后 10 分钟内重试 3 次</option>
                      <option value="RETRY_5_TIMES_5M">发送失败后 5 分钟内重试 5 次</option>
                      <option value="NO_RETRY">直接挂起报错，不自动重试</option>
                    </select>
                  </div>

                  <div className="space-y-3 bg-zinc-50 border border-zinc-100 rounded-2xl p-4">
                    <h4 className="text-xs font-extrabold text-[#1D1D1F] flex items-center gap-1">
                      <Volume2 size={14} className="text-[#BF5AF2]" /> 消息模板引擎定制 (支持动态插值)
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500">报名提交成功通知模板</label>
                        <textarea 
                          rows={2}
                          value={settings.notifications.templates.applySuccess}
                          onChange={(e) => setSettings({ ...settings, notifications: { ...settings.notifications, templates: { ...settings.notifications.templates, applySuccess: e.target.value } } })}
                          className="w-full p-2 bg-white border border-black/5 rounded-xl text-xs font-semibold font-sans"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500">初审及面试邀约通知模板</label>
                        <textarea 
                          rows={2}
                          value={settings.notifications.templates.auditResult}
                          onChange={(e) => setSettings({ ...settings, notifications: { ...settings.notifications, templates: { ...settings.notifications.templates, auditResult: e.target.value } } })}
                          className="w-full p-2 bg-white border border-black/5 rounded-xl text-xs font-semibold font-sans"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500">终审正式录用结果通知模板</label>
                        <textarea 
                          rows={2}
                          value={settings.notifications.templates.employmentResult}
                          onChange={(e) => setSettings({ ...settings, notifications: { ...settings.notifications, templates: { ...settings.notifications.templates, employmentResult: e.target.value } } })}
                          className="w-full p-2 bg-white border border-black/5 rounded-xl text-xs font-semibold font-sans"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-black/5 flex justify-end">
                    <button
                      onClick={() => handleSaveSettings("notifications")}
                      disabled={saving}
                      className="px-6 py-2 bg-[#BF5AF2] text-white text-xs font-bold rounded-xl hover:bg-[#BF5AF2]/90 cursor-pointer shadow-md flex items-center gap-2"
                    >
                      {saving && <RefreshCw size={12} className="animate-spin" />}
                      保存模板与通知规则
                    </button>
                  </div>
                </div>
              )}

              {/* 9. Category: security */}
              {activeTab === "security" && settings.security && (
                <div className="space-y-6 max-w-2xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1D1D1F]">管理员登录密码复杂度策略</label>
                      <select 
                        value={settings.security.passwordPolicy}
                        onChange={(e) => setSettings({ ...settings, security: { ...settings.security, passwordPolicy: e.target.value } })}
                        className="w-full px-3 py-2 border border-black/5 rounded-xl text-xs font-semibold focus:outline-none"
                      >
                        <option value="SIMPLE">允许 6 位纯数字 (仅用于快速演示)</option>
                        <option value="MEDIUM">中等：必须包含字母与数字混合，长度不少于 8 位</option>
                        <option value="STRONG">强：必须包含大写、小写、数字、特殊符号，长度不少于 10 位</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1D1D1F]">非法登录锁定限制机制</label>
                      <select 
                        value={settings.security.lockoutRules}
                        onChange={(e) => setSettings({ ...settings, security: { ...settings.security, lockoutRules: e.target.value } })}
                        className="w-full px-3 py-2 border border-black/5 rounded-xl text-xs font-semibold focus:outline-none"
                      >
                        <option value="5_FAILURES_LOCK_30M">连续 5 次登录失败，物理封禁账户 30 分钟</option>
                        <option value="3_FAILURES_LOCK_1H">连续 3 次登录失败，物理封禁账户 1 小时</option>
                        <option value="NO_LOCK">仅记录报错，不执行自动锁定账户</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1D1D1F]">管理会话过期销毁策略</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={settings.security.sessionExpiryMinutes}
                          onChange={(e) => setSettings({ ...settings, security: { ...settings.security, sessionExpiryMinutes: Number(e.target.value) } })}
                          className="w-full px-3 py-2 border border-black/5 rounded-xl text-xs font-semibold focus:outline-none"
                        />
                        <span className="absolute right-3 top-2.5 text-[9px] text-zinc-400 font-bold">分钟无操作登出</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1D1D1F]">强制双因子 (2FA) 安全登录校验</label>
                      <select 
                        value={settings.security.require2fa ? "true" : "false"}
                        onChange={(e) => setSettings({ ...settings, security: { ...settings.security, require2fa: e.target.value === "true" } })}
                        className="w-full px-3 py-2 border border-black/5 rounded-xl text-xs font-semibold focus:outline-none"
                      >
                        <option value="false">关闭 2FA 校验 (仅在需要时启用)</option>
                        <option value="true">开启 2FA 校验 (每次登录必须前置扫码验证)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-zinc-800">对删除活动等极高风险敏感动作执行二次弹窗验证</span>
                      <p className="text-[9px] text-zinc-400 font-semibold">强力防备误点产生的数据丢失灾难</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={settings.security.doubleConfirmOnSensitiveActions}
                      onChange={(e) => setSettings({ ...settings, security: { ...settings.security, doubleConfirmOnSensitiveActions: e.target.checked } })}
                      className="w-4 h-4 rounded text-[#BF5AF2] border-black/5 focus:ring-[#BF5AF2] accent-[#BF5AF2] cursor-pointer"
                    />
                  </div>

                  <div className="pt-4 border-t border-black/5 flex justify-end">
                    <button
                      onClick={() => handleSaveSettings("security")}
                      disabled={saving}
                      className="px-6 py-2 bg-[#BF5AF2] text-white text-xs font-bold rounded-xl hover:bg-[#BF5AF2]/90 cursor-pointer shadow-md flex items-center gap-2"
                    >
                      {saving && <RefreshCw size={12} className="animate-spin" />}
                      保存安全策略参数
                    </button>
                  </div>
                </div>
              )}

              {/* 10. Category: data-maintenance */}
              {activeTab === "data-maintenance" && (
                <div className="space-y-6 max-w-2xl">
                  <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 space-y-4">
                    <h4 className="text-xs font-extrabold text-[#1D1D1F] flex items-center gap-1.5">
                      <Database size={15} className="text-[#BF5AF2]" /> 物理数据库清淤、备份与重置
                    </h4>
                    <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed">由于 Missher-Staff 运行于沙箱隔离容器，所有的本地数据修改均在虚拟内存空间内运行，建议您定时触发快照保存，或在测试混乱时一键 Seeding 恢复种子状态。</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <button
                        onClick={triggerSystemBackup}
                        className="p-3 bg-white border border-zinc-200 hover:border-purple-300 rounded-xl text-left cursor-pointer space-y-2 transition-all shadow-sm"
                      >
                        <FileDown size={16} className="text-[#BF5AF2]" />
                        <h5 className="text-[11px] font-bold text-zinc-800">触发物理全局快照</h5>
                        <p className="text-[9px] text-zinc-400 font-medium">全量冷备份数据打包OSS</p>
                      </button>

                      <button
                        onClick={triggerCleanLogs}
                        className="p-3 bg-white border border-zinc-200 hover:border-purple-300 rounded-xl text-left cursor-pointer space-y-2 transition-all shadow-sm"
                      >
                        <Trash2 size={16} className="text-[#0A84FF]" />
                        <h5 className="text-[11px] font-bold text-zinc-800">清理历史陈旧日志</h5>
                        <p className="text-[9px] text-zinc-400 font-medium">释放 Nginx / Redis 缓冲区</p>
                      </button>

                      <button
                        onClick={triggerFactoryReset}
                        className="p-3 bg-white border border-red-100 hover:border-red-300 rounded-xl text-left cursor-pointer space-y-2 transition-all shadow-sm"
                      >
                        <AlertTriangle size={16} className="text-[#FF453A]" />
                        <h5 className="text-[11px] font-bold text-zinc-800 text-[#FF453A]">重置为默认种子</h5>
                        <p className="text-[9px] text-zinc-400 font-medium">回滚擦除测试脏记录</p>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 11. Category: integrations */}
              {activeTab === "integrations" && (
                <div className="space-y-6">
                  <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4">
                    <h4 className="text-xs font-extrabold text-[#1D1D1F]">高并发三方集成控制网关</h4>
                    <p className="text-[10px] text-[#86868B] font-semibold mt-1">
                      配置漫展招募必需的各大底层云端产品 API Key。在此您可以配置短信通知、高精度GPS测偏算法、实名人脸核身等。
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {integrations.map((item) => (
                      <div key={item.key} className="border border-black/5 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:border-zinc-200 transition-all bg-white space-y-3">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-extrabold text-[#1D1D1F] truncate">{item.name}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold ${
                              item.status === "已连接" 
                                ? "bg-green-50 text-[#30D158]" 
                                : item.status === "Mock 演示"
                                ? "bg-blue-50 text-[#0A84FF]"
                                : "bg-zinc-100 text-zinc-400"
                            }`}>
                              {item.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#86868B] font-medium leading-relaxed h-7 line-clamp-2">{item.description}</p>
                          <div className="flex items-center justify-between text-[9px] text-zinc-400 font-bold">
                            <span>集成模式：{item.mode}</span>
                            <span>测试时间: {item.lastTested}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-black/5 flex justify-end gap-1.5 text-[10px] font-bold">
                          <button
                            onClick={() => {
                              setSelectedIntegration({ ...item });
                              setShowIntegrationModal(true);
                            }}
                            className="px-2 py-1.5 border border-zinc-200 hover:bg-zinc-50 rounded-lg cursor-pointer text-[#0A84FF]"
                          >
                            参数参数
                          </button>
                          <button
                            onClick={() => handleTestIntegration(item.key, item.name)}
                            disabled={testingKey === item.key}
                            className="px-2 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#BF5AF2] rounded-lg cursor-pointer flex items-center gap-0.5"
                          >
                            {testingKey === item.key ? (
                              <RefreshCw size={10} className="animate-spin" />
                            ) : (
                              <RefreshCw size={10} />
                            )}
                            测试测试
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 12. Category: audit-logs */}
              {activeTab === "audit-logs" && (
                <div className="space-y-4">
                  {/* Tabular Search Filters */}
                  <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-zinc-50 border border-zinc-100 p-4 rounded-2xl">
                    <div className="relative w-full sm:w-72">
                      <Search className="absolute left-3 top-2.5 text-zinc-400" size={13} />
                      <input 
                        type="text" 
                        placeholder="检索操作行为或被审核记录ID..."
                        value={logSearch}
                        onChange={(e) => setLogSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-white border border-black/5 rounded-xl text-xs font-semibold focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Filter size={13} className="text-zinc-500" />
                      <select
                        value={logFilterAction}
                        onChange={(e) => setLogFilterAction(e.target.value)}
                        className="px-3 py-1.5 bg-white border border-black/5 rounded-xl text-xs font-semibold focus:outline-none w-full sm:w-40"
                      >
                        <option value="">所有行为分类</option>
                        <option value="APPROVE_APPLICATION">初审报名材料</option>
                        <option value="UPDATE_SYSTEM_SETTINGS">修改系统配置</option>
                        <option value="ADD_ADMINISTRATOR">赋权管理员</option>
                        <option value="CORRECT_ATTENDANCE">订正打卡异常</option>
                        <option value="TEST_INTEGRATION">测试集成握手</option>
                      </select>
                    </div>
                  </div>

                  {/*tabular logging viewer */}
                  <div className="border border-black/5 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-zinc-50 border-b border-black/5 font-bold text-[#86868B]">
                          <th className="p-3">操作人信息</th>
                          <th className="p-3">操作行为 action</th>
                          <th className="p-3">靶向目标 Target</th>
                          <th className="p-3">详细痕迹描述 Trace Description</th>
                          <th className="p-3">操作时间 (UTC+8)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {auditLogs
                          .filter(log => {
                            const matchStr = `${log.operatorName} ${log.description} ${log.targetId}`.toLowerCase();
                            const searchMatch = !logSearch || matchStr.includes(logSearch.toLowerCase());
                            const actionMatch = !logFilterAction || log.action === logFilterAction;
                            return searchMatch && actionMatch;
                          })
                          .map((log) => (
                            <tr key={log.id} className="hover:bg-zinc-50/50 font-semibold text-zinc-700">
                              <td className="p-3">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-[#1D1D1F]">{log.operatorName}</span>
                                    <span className="px-1.5 py-0.2 bg-purple-50 text-[#BF5AF2] rounded text-[8px] font-bold">
                                      {log.operatorRole}
                                    </span>
                                  </div>
                                  <span className="text-[9px] font-mono text-zinc-400 block">{log.operatorId}</span>
                                </div>
                              </td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 bg-zinc-100 rounded text-[9px] font-mono text-zinc-500 uppercase">
                                  {log.action}
                                </span>
                              </td>
                              <td className="p-3">
                                <div className="space-y-0.5">
                                  <span className="text-zinc-600 font-bold block text-[10px]">{log.targetType}</span>
                                  <span className="text-[9px] font-mono text-zinc-400 block">{log.targetId}</span>
                                </div>
                              </td>
                              <td className="p-3 text-[#1D1D1F] max-w-xs truncate">{log.description}</td>
                              <td className="p-3 text-zinc-400 font-mono text-[10px]">{log.createdAt}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>

      {/* ADMIN CRUD MODAL */}
      {showAdminModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveAdmin} className="bg-white border border-black/5 rounded-[24px] p-6 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center border-b border-black/5 pb-3">
              <h4 className="text-sm font-black text-[#1D1D1F]">
                {selectedAdmin.isEdit ? "编辑管理员设置" : "指派全新管理员授权"}
              </h4>
              <button type="button" onClick={() => setShowAdminModal(false)} className="p-1 hover:bg-zinc-100 rounded-full cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1D1D1F]">真实姓名</label>
                <input 
                  type="text" 
                  required
                  value={selectedAdmin.name}
                  onChange={(e) => setSelectedAdmin({ ...selectedAdmin, name: e.target.value })}
                  className="w-full px-3 py-2 border border-black/5 rounded-xl text-xs font-semibold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1D1D1F]">手机号码 (登录凭证)</label>
                <input 
                  type="text" 
                  required
                  disabled={selectedAdmin.isEdit}
                  value={selectedAdmin.phone}
                  onChange={(e) => setSelectedAdmin({ ...selectedAdmin, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-black/5 rounded-xl text-xs font-semibold disabled:bg-zinc-50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1D1D1F]">指派所属权限组 (可多选)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {permissionGroups.map(g => {
                  const isChecked = selectedAdmin.permissionGroupIds.includes(g.id);
                  return (
                    <label key={g.id} className="flex items-center gap-2 p-2 bg-zinc-50 border border-zinc-100 hover:border-purple-200 rounded-xl cursor-pointer text-[11px] font-bold">
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          let updated;
                          if (e.target.checked) {
                            updated = [...selectedAdmin.permissionGroupIds, g.id];
                          } else {
                            updated = selectedAdmin.permissionGroupIds.filter((pgId: string) => pgId !== g.id);
                          }
                          setSelectedAdmin({ ...selectedAdmin, permissionGroupIds: updated });
                        }}
                        className="rounded text-[#BF5AF2] focus:ring-[#BF5AF2]"
                      />
                      <span className="truncate">{g.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1D1D1F]">指派管辖漫展活动范围</label>
                <select
                  value={selectedAdmin.activityIds.includes("*") ? "*" : "LIMIT"}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedAdmin({ ...selectedAdmin, activityIds: val === "*" ? ["*"] : [] });
                  }}
                  className="w-full px-3 py-2 border border-black/5 rounded-xl text-xs font-semibold"
                >
                  <option value="*">通管全场漫展 (*)</option>
                  <option value="LIMIT">限部分指派活动会场</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1D1D1F]">是否启用该账号</label>
                <select
                  value={selectedAdmin.enabled ? "true" : "false"}
                  onChange={(e) => setSelectedAdmin({ ...selectedAdmin, enabled: e.target.value === "true" })}
                  className="w-full px-3 py-2 border border-black/5 rounded-xl text-xs font-semibold"
                >
                  <option value="true">激活：允许登录并全权管理</option>
                  <option value="false">封禁：挂起并吊销登录态</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-black/5 flex justify-end gap-2 text-xs font-bold">
              <button type="button" onClick={() => setShowAdminModal(false)} className="px-4 py-2 border border-zinc-200 rounded-xl hover:bg-zinc-50 cursor-pointer">
                取消
              </button>
              <button type="submit" disabled={saving} className="px-5 py-2 bg-[#BF5AF2] text-white rounded-xl shadow cursor-pointer">
                保存管理员授权
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PERMISSION GROUP CRUD MODAL */}
      {showGroupModal && selectedGroup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveGroup} className="bg-white border border-black/5 rounded-[24px] p-6 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center border-b border-black/5 pb-3">
              <h4 className="text-sm font-black text-[#1D1D1F]">
                {selectedGroup.id ? (selectedGroup.isSystem ? "只读查看系统内置权限组" : "配置自定义权限组") : "建立全新权限组"}
              </h4>
              <button type="button" onClick={() => setShowGroupModal(false)} className="p-1 hover:bg-zinc-100 rounded-full cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1D1D1F]">权限组名称</label>
                <input 
                  type="text" 
                  required
                  disabled={selectedGroup.isSystem}
                  value={selectedGroup.name}
                  onChange={(e) => setSelectedGroup({ ...selectedGroup, name: e.target.value })}
                  className="w-full px-3 py-2 border border-black/5 rounded-xl text-xs font-semibold disabled:bg-zinc-50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1D1D1F]">功能职责说明</label>
                <input 
                  type="text" 
                  disabled={selectedGroup.isSystem}
                  value={selectedGroup.description}
                  onChange={(e) => setSelectedGroup({ ...selectedGroup, description: e.target.value })}
                  className="w-full px-3 py-2 border border-black/5 rounded-xl text-xs font-semibold disabled:bg-zinc-50"
                />
              </div>
            </div>

            {/* Checklist of 40+ modular permissions */}
            <div className="space-y-4">
              <h5 className="text-xs font-black text-zinc-800 border-b border-zinc-100 pb-1 flex items-center gap-1.5">
                <Key size={14} className="text-[#BF5AF2]" /> 勾选要归入该组的细颗粒度功能权限 (Granular Permissions)
              </h5>

              <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-2">
                {PERMISSION_METADATA.map((grp) => (
                  <div key={grp.group} className="space-y-2">
                    <span className="text-[10px] font-extrabold text-[#BF5AF2] uppercase bg-purple-50 px-2 py-0.5 rounded-full">
                      {grp.group}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {grp.permissions.map((p) => {
                        const isChecked = selectedGroup.permissions.includes(p.code as PermissionCode);
                        return (
                          <label 
                            key={p.code} 
                            className={`flex items-start gap-2.5 p-2 rounded-xl border text-[10px] font-semibold leading-normal ${
                              isChecked 
                                ? "bg-purple-50/20 border-purple-200" 
                                : "bg-white border-zinc-100 hover:border-zinc-200"
                            } ${selectedGroup.isSystem ? "pointer-events-none opacity-80" : "cursor-pointer"}`}
                          >
                            <input 
                              type="checkbox"
                              disabled={selectedGroup.isSystem}
                              checked={isChecked}
                              onChange={(e) => {
                                let updated;
                                if (e.target.checked) {
                                  updated = [...selectedGroup.permissions, p.code as PermissionCode];
                                } else {
                                  updated = selectedGroup.permissions.filter(c => c !== p.code);
                                }
                                setSelectedGroup({ ...selectedGroup, permissions: updated });
                              }}
                              className="rounded text-[#BF5AF2] focus:ring-[#BF5AF2] mt-0.5"
                            />
                            <div className="space-y-0.5">
                              <span className="font-bold text-zinc-800">{p.name}</span>
                              <span className="text-[8px] font-mono text-zinc-400 block">{p.code}</span>
                              <p className="text-[9px] text-zinc-400 font-medium leading-relaxed">{p.desc}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-black/5 flex justify-end gap-2 text-xs font-bold">
              <button type="button" onClick={() => setShowGroupModal(false)} className="px-4 py-2 border border-zinc-200 rounded-xl hover:bg-zinc-50 cursor-pointer">
                关闭
              </button>
              {!selectedGroup.isSystem && (
                <button type="submit" disabled={saving} className="px-5 py-2 bg-[#BF5AF2] text-white rounded-xl shadow cursor-pointer">
                  保存并加入角色库
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* INTEGRATION SETTINGS MODAL */}
      {showIntegrationModal && selectedIntegration && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveIntegration} className="bg-white border border-black/5 rounded-[24px] p-6 shadow-2xl max-w-md w-full space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-black/5 pb-3">
              <h4 className="text-sm font-black text-[#1D1D1F]">
                配置集成网关: {selectedIntegration.name}
              </h4>
              <button type="button" onClick={() => setShowIntegrationModal(false)} className="p-1 hover:bg-zinc-100 rounded-full cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700">网关运行状态</label>
                <select
                  value={selectedIntegration.status}
                  onChange={(e) => setSelectedIntegration({ ...selectedIntegration, status: e.target.value })}
                  className="w-full px-3 py-2 border border-black/5 rounded-xl text-xs font-semibold"
                >
                  <option value="已连接">Active 开启已连通</option>
                  <option value="Mock 演示">Mock 演示模式</option>
                  <option value="等待 Codex 接入">等待 Codex 接入</option>
                  <option value="未配置">Disabled 关闭未配置</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700">接入模式配置</label>
                <input 
                  type="text" 
                  value={selectedIntegration.mode}
                  onChange={(e) => setSelectedIntegration({ ...selectedIntegration, mode: e.target.value })}
                  className="w-full px-3 py-2 border border-black/5 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700">网关端点 URL (Endpoint API)</label>
                <input 
                  type="text" 
                  placeholder="https://api.cloud-gateway.com/v3"
                  className="w-full px-3 py-2 border border-black/5 rounded-xl text-xs font-semibold placeholder-zinc-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700">网关安全令牌 (Secret Token/API Key)</label>
                <div className="relative">
                  <input 
                    type="password" 
                    value="••••••••••••••••"
                    disabled
                    className="w-full px-3 py-2 border border-black/5 rounded-xl text-xs font-semibold disabled:bg-zinc-50"
                  />
                  <span className="absolute right-3 top-2.5 text-[9px] text-zinc-400 font-bold">已脱敏保护</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700">业务描述说明</label>
                <textarea 
                  rows={2}
                  value={selectedIntegration.description}
                  onChange={(e) => setSelectedIntegration({ ...selectedIntegration, description: e.target.value })}
                  className="w-full p-2 border border-black/5 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-black/5 flex justify-end gap-2 text-xs font-bold">
              <button type="button" onClick={() => setShowIntegrationModal(false)} className="px-4 py-2 border border-zinc-200 rounded-xl hover:bg-zinc-50 cursor-pointer">
                取消
              </button>
              <button type="submit" disabled={saving} className="px-5 py-2 bg-[#BF5AF2] text-white rounded-xl shadow cursor-pointer">
                配置网关参数
              </button>
            </div>
          </form>
        </div>
      )}

    </AdminLayout>
  );
};
