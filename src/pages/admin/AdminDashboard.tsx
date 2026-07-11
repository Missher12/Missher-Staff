import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useEventStore } from "../../app/stores/eventStore";
import { AdminLayout } from "../../app/layouts/AdminLayout";
import { BentoGrid, BentoCard, MetricCard, StatusBadge } from "../../shared/ui";
import { Users, ClipboardCheck, Calendar, Activity, ArrowRight, UserPlus, FileCheck2, UserCheck } from "lucide-react";

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { applications, attendanceRecords, interviewSlots } = useEventStore();

  // 1. 统计数据
  const totalAppsCount = applications.length;
  const pendingAuditCount = applications.filter(a => a.status === "SUBMITTED").length;
  const activeStaffCount = applications.filter(a => a.employmentStatus === "EMPLOYED").length;
  const todayCheckinCount = attendanceRecords.filter(r => r.date === "2026-07-11" && r.checkInTime).length;

  // 2. 最新申请 (前3个)
  const recentApps = applications.slice(0, 3);

  // 3. 实时签到日志 (前3个)
  const latestCheckins = attendanceRecords.slice(0, 3);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 顶部标题与快速引言 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-black/5 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">盛夏次元动漫嘉年华 · 考勤大盘</h2>
            <p className="text-xs text-[#86868B] mt-1.5 font-medium">
              欢迎回来，会场总监。当前正处于<b>筹备及第一阶段实名安防考核签到</b>阶段。
            </p>
          </div>
          <button 
            onClick={() => navigate("/admin/attendance/realtime")}
            className="px-4.5 py-2.5 bg-[#0A84FF] text-white text-xs font-bold rounded-full hover:bg-[#0A84FF]/90 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-[#0A84FF]/15"
          >
            开启考勤实时数字大屏 <ArrowRight size={14} />
          </button>
        </div>

        {/* 1. Metric Indicators Bento Row */}
        <BentoGrid>
          <MetricCard
            title="累计递交报名件"
            value={totalAppsCount}
            subValue={`待资格预审: ${pendingAuditCount} 件`}
            icon={<Users size={18} />}
            color="text-[#0A84FF] bg-blue-50"
            span={3}
          />
          <MetricCard
            title="简历资格初筛中"
            value={pendingAuditCount}
            subValue="急需完成背景及结算审核"
            icon={<ClipboardCheck size={18} />}
            color="text-[#FF9F0A] bg-amber-50"
            span={3}
          />
          <MetricCard
            title="已录取 STAFF 总量"
            value={activeStaffCount}
            subValue="已成功分配岗位和排班"
            icon={<UserCheck size={18} />}
            color="text-[#30D158] bg-green-50"
            span={3}
          />
          <MetricCard
            title="今日已签到上岗 (7/11)"
            value={todayCheckinCount}
            subValue={`今日应到岗: ${activeStaffCount}人`}
            icon={<Activity size={18} />}
            color="text-[#BF5AF2] bg-purple-50"
            span={3}
          />
        </BentoGrid>

        {/* 2. 大型 Bento 卡片拼接 */}
        <BentoGrid>
          {/* 左侧：待处理报名审核 (Span 7) */}
          <BentoCard span={7} className="space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
                  <FileCheck2 size={16} className="text-[#0A84FF]" /> 最新递交报名待审件
                </h3>
                <p className="text-[10px] text-[#86868B] font-medium mt-0.5">需要管理员核验其身份证号码及意向可参日期。</p>
              </div>
              <Link to="/admin/applications" className="text-xs font-bold text-[#0A84FF] hover:underline flex items-center gap-1">
                全部件 <ArrowRight size={12} />
              </Link>
            </div>

            <div className="divide-y divide-zinc-50">
              {recentApps.map((app) => (
                <div key={app.id} className="py-3 flex items-center justify-between text-xs transition-colors hover:bg-slate-50/50 px-2 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-zinc-500 border border-black/5">
                      {app.userName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-[#1D1D1F]">{app.userName}</p>
                      <p className="text-[10px] text-[#86868B] font-mono mt-0.5">{app.userPhone}</p>
                    </div>
                  </div>
                  
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className="font-semibold text-[10px] text-[#1D1D1F]">
                        {app.targetPositions.join(", ")}
                      </p>
                      <p className="text-[9px] text-[#86868B] mt-0.5">{app.submittedAt.substring(5, 16)}</p>
                    </div>
                    <StatusBadge status={app.status} />
                    <button 
                      onClick={() => navigate(`/admin/applications/${app.id}`)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-[#0A84FF] hover:text-white rounded-lg font-bold text-[10px] text-zinc-600 cursor-pointer transition-colors"
                    >
                      审核
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </BentoCard>

          {/* 右侧：实时打卡监控日志 (Span 5) */}
          <BentoCard span={5} className="space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
                  <Activity size={16} className="text-[#30D158]" /> 现场实时考勤签到流
                </h3>
                <p className="text-[10px] text-[#86868B] font-medium mt-0.5">当前正在打卡提交的现场实时回执日志。</p>
              </div>
            </div>

            <div className="space-y-3">
              {latestCheckins.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#86868B] font-medium">
                  今日尚未有 STAFF 成员打卡记录
                </div>
              ) : (
                latestCheckins.map((rec) => (
                  <div key={rec.id} className="p-3 bg-slate-50 border border-black/5 rounded-2xl flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2.5">
                      {rec.checkInPhoto ? (
                        <img src={rec.checkInPhoto} className="w-8 h-8 rounded-lg object-cover border border-black/5" alt="" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-zinc-200" />
                      )}
                      <div>
                        <p className="font-bold text-[#1D1D1F]">{rec.userName}</p>
                        <p className="text-[9px] text-[#86868B] font-semibold mt-0.5">{rec.groupName} · {rec.positionName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#0A84FF] font-mono">{rec.checkInTime}</p>
                      <span className="text-[8px] px-1.5 py-0.5 bg-green-100 text-green-700 font-semibold rounded mt-0.5 inline-block">
                        GPS误差 {rec.checkInDistance}m
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </BentoCard>
        </BentoGrid>

        {/* 3. 底部快捷活动运营卡片 */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-[24px] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md">
          <div className="space-y-1">
            <h4 className="text-sm font-bold flex items-center gap-1.5 text-[#30D158]">
              ● 漫展线下会场打卡围栏已布设
            </h4>
            <p className="text-xs text-zinc-300 leading-relaxed font-medium">
              定位中心坐标为 [30.2289, 120.2341] (博览中心大门)，合规打卡偏差限制为 <b>100 米</b> 圈内。
              超出此圈系统将强制挂起并报警，需要陈大伟组长使用保底签到扫码协助。
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/interviews")}
            className="px-5 py-2.5 bg-white text-zinc-900 text-xs font-bold rounded-full hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
          >
            进入面试排期设置
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};
