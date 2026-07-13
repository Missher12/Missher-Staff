import React, { useState } from "react";
import { SuperAdminLayout } from "../../app/layouts/SuperAdminLayout";
import { useEventStore } from "../../app/stores/eventStore";
import { 
  Calendar, ShieldAlert, Cpu, Database, UserCheck, 
  Settings, History, PlusCircle, Copy, Archive, Power 
} from "lucide-react";

// ==========================================
// 1. SuperAdminDashboard (超管运营大盘)
// ==========================================
export const SuperAdminDashboard: React.FC = () => {
  const { activities, applications } = useEventStore();
  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div className="border-b border-black/5 pb-4">
          <h2 className="text-xl font-bold text-[#1D1D1F]">超级会务控制台运营大盘</h2>
          <p className="text-xs text-[#86868B] font-medium mt-1">全局管理多个地区的会期、活动承接数、考务人员数量及容器集群负荷状态。</p>
        </div>

        {/* Apple Style Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-black/5 rounded-[22px] p-5 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-[#86868B] uppercase">当前承办会场数</span>
            <span className="text-2xl font-black text-[#BF5AF2] font-mono">{activities.length} 个地区</span>
          </div>
          <div className="bg-white border border-black/5 rounded-[22px] p-5 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-[#86868B] uppercase">系统登记志愿者数</span>
            <span className="text-2xl font-black text-[#0A84FF] font-mono">1,024 人</span>
          </div>
          <div className="bg-white border border-black/5 rounded-[22px] p-5 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-[#86868B] uppercase">物理考务打卡量</span>
            <span className="text-2xl font-black text-[#30D158] font-mono">4,512 次</span>
          </div>
          <div className="bg-white border border-black/5 rounded-[22px] p-5 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-[#86868B] uppercase">防篡改GPS校验率</span>
            <span className="text-2xl font-black text-[#FF9F0A] font-mono">100.00%</span>
          </div>
        </div>

        {/* Live Cluster Health */}
        <div className="bg-white border border-black/5 rounded-[24px] p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#1D1D1F] flex items-center gap-1.5">
            <Cpu size={16} className="text-[#BF5AF2]" /> 容器集群实时运行负荷
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
            <div className="p-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl space-y-2">
              <div className="flex justify-between">
                <span>Docker-Pod-01 (CPU)</span>
                <span className="text-zinc-400 font-mono">8.2%</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#BF5AF2]" style={{ width: "8.2%" }} />
              </div>
            </div>

            <div className="p-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl space-y-2">
              <div className="flex justify-between">
                <span>Docker-Pod-02 (内存)</span>
                <span className="text-zinc-400 font-mono">42.5%</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#BF5AF2]" style={{ width: "42.5%" }} />
              </div>
            </div>

            <div className="p-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl space-y-2">
              <div className="flex justify-between">
                <span>Redis-Cache 集群 (命中)</span>
                <span className="text-[#30D158] font-mono">99.98%</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#30D158]" style={{ width: "99.9%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

// ==========================================
// 2. SuperAdminActivities (活动全生命周期、创建与复制)
// ==========================================
export const SuperAdminActivities: React.FC = () => {
  const { activities, showToast } = useEventStore();
  const [list, setList] = useState(activities);

  const handleCopyActivity = (id: string) => {
    const original = list.find(a => a.id === id);
    if (!original) return;

    const copy = {
      ...original,
      id: `ACT_COPY_${Date.now().toString().substring(8)}`,
      name: `${original.name} (复制备份)`,
      dates: [...original.dates]
    };

    setList(p => [...p, copy]);
    showToast(`活动复制成功！已自动克隆报名表表单设计、岗位分配及考点基准GPS范围：${copy.name}`, "success");
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-black/5 pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#1D1D1F]">活动全生命周期承办控制</h2>
            <p className="text-xs text-[#86868B] font-medium mt-1">创建、归档或快捷克隆历史漫展的考务设置，避免重复起草报名表单。</p>
          </div>

          <button 
            onClick={() => showToast("功能展示：超级管理员可在这里点击『创建新活动』创建全新的大型漫展活动", "info")}
            className="px-4 py-2 bg-[#BF5AF2] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <PlusCircle size={14} /> 新建空会期活动
          </button>
        </div>

        <div className="space-y-3">
          {list.map((act) => (
            <div key={act.id} className="bg-white border border-black/5 rounded-[22px] p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-zinc-100 rounded-full text-[9px] font-bold font-mono text-zinc-500 uppercase">
                    {act.id}
                  </span>
                  <span className="text-xs font-bold text-[#30D158]">● 承办中</span>
                </div>
                <h3 className="text-sm font-bold text-[#1D1D1F]">{act.name}</h3>
                <p className="text-[11px] text-zinc-400 font-semibold">出勤时间：{act.dates.join("、")}</p>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => handleCopyActivity(act.id)}
                  className="px-3.5 py-2 border border-black/5 rounded-xl text-xs font-bold bg-white hover:bg-zinc-50 cursor-pointer flex items-center gap-1"
                >
                  <Copy size={13} /> 快捷复制
                </button>
                <button 
                  onClick={() => showToast("该会期活动已安全归档结账，所有打卡定位日志已备份到云端。", "success")}
                  className="px-3.5 py-2 bg-zinc-100 rounded-xl text-xs font-bold text-[#FF453A] cursor-pointer flex items-center gap-1"
                >
                  <Archive size={13} /> 归档结账
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SuperAdminLayout>
  );
};

// ==========================================
// 3. SuperAdminAdministrators (考务管理员授权)
// ==========================================
export const SuperAdminAdministrators: React.FC = () => {
  const [admins, setAdmins] = useState([
    { id: "A_01", name: "张晓明", email: "zhang@convention.pro", role: "会场考务总监", status: "ACTIVE" },
    { id: "A_02", name: "李静", email: "li@convention.pro", role: "财务劳务结算员", status: "ACTIVE" }
  ]);

  const handleToggleAdminStatus = (id: string) => {
    setAdmins(p => p.map(a => {
      if (a.id === id) {
        return { ...a, status: a.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" };
      }
      return a;
    }));
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div className="border-b border-black/5 pb-4">
          <h2 className="text-xl font-bold text-[#1D1D1F]">考务管理员授权</h2>
          <p className="text-xs text-[#86868B] font-medium mt-1">集中指派具有特定区域审核、录取及请假核准权力的子管理员账户。</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl">
          {admins.map((admin) => (
            <div key={admin.id} className="bg-white border border-black/5 rounded-[22px] p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-50 text-[#BF5AF2] flex items-center justify-center font-bold text-sm">
                    {admin.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1D1D1F]">{admin.name} ({admin.role})</h4>
                    <p className="text-[10px] text-zinc-400 font-mono">{admin.email}</p>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  admin.status === "ACTIVE" 
                    ? "bg-green-50 text-[#30D158]" 
                    : "bg-red-50 text-[#FF453A]"
                }`}>
                  {admin.status === "ACTIVE" ? "生效中" : "已挂起"}
                </span>
              </div>

              <div className="h-px bg-zinc-100" />

              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => handleToggleAdminStatus(admin.id)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                    admin.status === "ACTIVE" 
                      ? "bg-red-50 text-[#FF453A]" 
                      : "bg-green-50 text-[#30D158]"
                  }`}
                >
                  <Power size={11} /> {admin.status === "ACTIVE" ? "挂起吊销" : "激活账户"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SuperAdminLayout>
  );
};

// ==========================================
// 4. SuperAdminGlobalSettings (全局防作弊参数与安全)
// ==========================================
export const SuperAdminGlobalSettings: React.FC = () => {
  const { showToast } = useEventStore();
  const [radius, setRadius] = useState(300);
  const [photoMatch, setPhotoMatch] = useState(85);

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div className="border-b border-black/5 pb-4">
          <h2 className="text-xl font-bold text-[#1D1D1F]">全局考务防作弊及网络参数中心</h2>
          <p className="text-xs text-[#86868B] font-medium mt-1">设置GPS定位围栏阀值、自拍底片活体OCR比对率等硬件校验机制。</p>
        </div>

        <div className="bg-white border border-black/5 rounded-[24px] p-6 shadow-sm max-w-2xl space-y-5">
          <h3 className="text-sm font-bold text-[#1D1D1F] flex items-center gap-1.5">
            <Settings size={16} className="text-[#BF5AF2]" /> 活体核验与定位基准点
          </h3>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1D1D1F] flex justify-between">
                <span>物理会场GPS考勤围栏半径</span>
                <span className="font-mono text-[#0A84FF]">{radius} 米</span>
              </label>
              <input 
                type="range" 
                min="50" 
                max="1000" 
                step="50"
                value={radius}
                onChange={e => setRadius(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-[#BF5AF2]"
              />
              <p className="text-[10px] text-zinc-400 font-semibold leading-relaxed">
                打卡地理坐标与展馆核定中点位置偏移阀值。若超出此半径，自动挂起并提示“超出场馆范围”。
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1D1D1F] flex justify-between">
                <span>自拍底片OCR活体人脸置信阀值</span>
                <span className="font-mono text-[#30D158]">{photoMatch}%</span>
              </label>
              <input 
                type="range" 
                min="60" 
                max="100" 
                step="5"
                value={photoMatch}
                onChange={e => setPhotoMatch(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-[#BF5AF2]"
              />
              <p className="text-[10px] text-zinc-400 font-semibold leading-relaxed">
                自拍照与身份证实名登记底片进行对比时，判定是否为同一个人的百分比相似度要求。
              </p>
            </div>
          </div>

          <button 
            onClick={() => showToast("全局防作弊安全参数在内存中更新成功！对应规则已实时应用至移动端定位 and 活体拍照API。", "success")}
            className="px-6 py-2.5 bg-[#BF5AF2] text-white text-xs font-bold rounded-xl hover:bg-[#BF5AF2]/95 cursor-pointer shadow-md"
          >
            保存安全防作弊规则
          </button>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

// ==========================================
// 5. SuperAdminAuditLogs (不可篡改管理审计日志)
// ==========================================
export const SuperAdminAuditLogs: React.FC = () => {
  const logs = [
    { id: "1", op: "ACTIVITY_ADMIN张晓明", action: "终审录用林可儿为STAFF并排班", time: "2026-07-11 12:30", ip: "192.168.1.104" },
    { id: "2", op: "ACTIVITY_ADMIN张晓明", action: "批准林可儿初审资质", time: "2026-07-10 14:15", ip: "192.168.1.104" },
    { id: "3", op: "SUPER_ADMIN根用户", action: "修改GPS定位半径为300米", time: "2026-07-09 10:00", ip: "10.0.8.12" }
  ];

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div className="border-b border-black/5 pb-4">
          <h2 className="text-xl font-bold text-[#1D1D1F]">超级安全管理审计日志</h2>
          <p className="text-xs text-[#86868B] font-medium mt-1">记录所有会务管理员的提权、录用、财务代发审核以及保险批单核减的完整不可逆追踪日志。</p>
        </div>

        <div className="bg-white border border-black/5 rounded-[22px] overflow-hidden shadow-sm">
          <div className="divide-y divide-zinc-100">
            {logs.map((log) => (
              <div key={log.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs font-semibold text-[#1D1D1F] gap-2">
                <div className="space-y-0.5">
                  <p className="font-bold text-[#1D1D1F]">操作人：{log.op}</p>
                  <p className="text-[11px] text-zinc-500">{log.action}</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-zinc-400 block">{log.time}</span>
                  <span className="text-[10px] font-mono text-[#BF5AF2] block">IP: {log.ip}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

// ==========================================
// 6. SuperAdminSystemHealth (集群与容器健康)
// ==========================================
export const SuperAdminSystemHealth: React.FC = () => {
  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div className="border-b border-black/5 pb-4">
          <h2 className="text-xl font-bold text-[#1D1D1F]">容器集群及底层微服务健康度</h2>
          <p className="text-xs text-[#86868B] font-medium mt-1">监控 Node-Vite 静态层、OCR活体比对微服务以及 Redis 高并发打卡签名池健康度。</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl">
          <div className="bg-white border border-black/5 rounded-[22px] p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-[#1D1D1F] flex items-center gap-1.5">
              <Database size={15} className="text-[#30D158]" /> Drizzle SQL 物理主库
            </h3>
            <div className="space-y-2 text-xs font-semibold text-zinc-500">
              <div className="flex justify-between">
                <span>连接池状态</span>
                <span className="text-[#30D158]">● 正常活动</span>
              </div>
              <div className="flex justify-between">
                <span>当前连接数</span>
                <span className="text-[#1D1D1F] font-mono">14 / 100</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-black/5 rounded-[22px] p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-[#1D1D1F] flex items-center gap-1.5">
              <ShieldAlert size={15} className="text-[#0A84FF]" /> Tencent OCR-活体人脸核验
            </h3>
            <div className="space-y-2 text-xs font-semibold text-zinc-500">
              <div className="flex justify-between">
                <span>API 状态</span>
                <span className="text-[#30D158]">● 在线 (延迟12ms)</span>
              </div>
              <div className="flex justify-between">
                <span>今日请求量</span>
                <span className="text-[#1D1D1F] font-mono">1,412 次</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-black/5 rounded-[22px] p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-[#1D1D1F] flex items-center gap-1.5">
              <Cpu size={15} className="text-[#FF9F0A]" /> Node Ingress Nginx Proxy
            </h3>
            <div className="space-y-2 text-xs font-semibold text-zinc-500">
              <div className="flex justify-between">
                <span>外部路由映射</span>
                <span className="text-[#30D158]">● 开启 (Port 3000)</span>
              </div>
              <div className="flex justify-between">
                <span>SSL 证书有效期</span>
                <span className="text-[#1D1D1F]">剩余 342 天</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
};
