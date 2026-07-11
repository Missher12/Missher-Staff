import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEventStore } from "../../app/stores/eventStore";
import { AdminLayout } from "../../app/layouts/AdminLayout";
import { StatusBadge } from "../../shared/ui";
import { Search, Filter, Check, X, Bookmark, Eye, ArrowRight } from "lucide-react";
import { ApplicationStatus } from "../../shared/types";

export const ApplicationReview: React.FC = () => {
  const navigate = useNavigate();
  const { applications, auditApplication } = useEventStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Checkboxes
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 1. 过滤算法
  const filteredApps = applications.filter((app) => {
    const matchesSearch = 
      app.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.userPhone.includes(searchTerm);
    const matchesStatus = statusFilter === "ALL" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredApps.map((a) => a.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => 
      checked ? [...prev, id] : prev.filter((item) => item !== id)
    );
  };

  // 批量操作
  const handleBatchAudit = (status: ApplicationStatus, comment: string) => {
    if (selectedIds.length === 0) {
      alert("请先选择要进行批量操作的申请件！");
      return;
    }
    
    selectedIds.forEach((id) => {
      auditApplication(id, status, "系统管理员(张晓明)", comment);
    });

    alert(`成功批量审核通过 ${selectedIds.length} 个岗位申请件！`);
    setSelectedIds([]);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-black/5 pb-4">
          <h2 className="text-xl font-extrabold text-[#1D1D1F] tracking-tight">STAFF 岗位招募筛选审核</h2>
          <p className="text-xs text-[#86868B] mt-1">
            管理员可在资格初筛后，批量或单笔邀请通过初审的志愿者预约面试并自动发送短信。
          </p>
        </div>

        {/* Filter Toolbar (Apple style) */}
        <div className="bg-white/80 border border-black/5 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
            {/* Search */}
            <div className="relative flex items-center w-full sm:w-60">
              <Search size={14} className="absolute left-3.5 text-[#86868B]" />
              <input
                type="text"
                placeholder="搜索候选人姓名或联系手机"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-black/5 rounded-xl text-xs font-semibold focus:bg-white outline-none"
              />
            </div>

            {/* Status Selector */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1D1D1F]">
              <span className="text-[#86868B] flex items-center gap-1"><Filter size={12} /> 状态筛选:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-black/5 rounded-xl text-xs outline-none focus:bg-white"
              >
                <option value="ALL">全部状态</option>
                <option value="SUBMITTED">已递交待审</option>
                <option value="APPROVED">初审通过(待面)</option>
                <option value="WAITLIST">候补状态</option>
                <option value="REJECTED">已驳回</option>
              </select>
            </div>
          </div>

          {/* Batch operations */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <span className="text-[10px] font-bold text-[#86868B] mr-2">已勾选 {selectedIds.length} 项:</span>
              <button
                onClick={() => handleBatchAudit("APPROVED", "简历初审合格，批准通过，系统已触发邀请面试排期。")}
                className="px-3.5 py-1.5 bg-[#30D158] hover:bg-[#30D158]/90 text-white font-bold text-[10px] rounded-lg cursor-pointer flex items-center gap-1"
              >
                <Check size={12} /> 批量批准通过
              </button>
              <button
                onClick={() => handleBatchAudit("WAITLIST", "暂存为会场第二候补志愿库")}
                className="px-3.5 py-1.5 bg-[#FF9F0A] hover:bg-[#FF9F0A]/90 text-white font-bold text-[10px] rounded-lg cursor-pointer flex items-center gap-1"
              >
                <Bookmark size={12} /> 批量加入候补
              </button>
              <button
                onClick={() => handleBatchAudit("REJECTED", "十分感谢您的热心递交，由于本次招募岗位名额冲突暂未录用，已加入备用骨干名单")}
                className="px-3.5 py-1.5 bg-[#FF453A] hover:bg-[#FF453A]/90 text-white font-bold text-[10px] rounded-lg cursor-pointer flex items-center gap-1"
              >
                <X size={12} /> 批量驳回
              </button>
            </div>
          )}
        </div>

        {/* Data List Spreadsheet Card */}
        <div className="bg-white/94 backdrop-blur-md border border-black/6 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-100 bg-slate-50/50 text-[#86868B] font-bold uppercase tracking-wider">
                  <th className="p-4 w-12 text-center">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={filteredApps.length > 0 && selectedIds.length === filteredApps.length}
                    />
                  </th>
                  <th className="p-4">姓名</th>
                  <th className="p-4">联系电话</th>
                  <th className="p-4">意向工作岗位</th>
                  <th className="p-4">可参加出勤排班日期</th>
                  <th className="p-4 text-center">报名进度</th>
                  <th className="p-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150 font-medium">
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[#86868B]">
                      找不到符合筛选规则的候选人报名件。
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app) => {
                    const isSelected = selectedIds.includes(app.id);
                    return (
                      <tr 
                        key={app.id} 
                        className={`transition-colors hover:bg-slate-50/40 ${isSelected ? "bg-blue-50/20" : ""}`}
                      >
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleSelectOne(app.id, e.target.checked)}
                          />
                        </td>
                        <td className="p-4 font-bold text-[#1D1D1F]">{app.userName}</td>
                        <td className="p-4 font-mono text-zinc-500">{app.userPhone}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-zinc-100 text-zinc-600 rounded text-[10px]">
                            {app.targetPositions.join(", ")}
                          </span>
                        </td>
                        <td className="p-4 text-[10px] text-zinc-600">
                          {app.availableDates.join("、")}
                        </td>
                        <td className="p-4 text-center">
                          <StatusBadge status={app.status} />
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => navigate(`/admin/applications/${app.id}`)}
                            className="px-3 py-1.5 border border-black/5 bg-slate-50 hover:bg-[#0A84FF] hover:text-white rounded-lg transition-all font-bold text-[10px] text-zinc-600 cursor-pointer flex items-center gap-1 ml-auto"
                          >
                            <Eye size={12} /> 查看详情
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
