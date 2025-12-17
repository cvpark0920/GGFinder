import React from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Heart, TrendingUp, Clock, Building2, ArrowRight, CheckCircle2, XCircle, Hourglass } from "lucide-react";
import { useLanguage } from "../../components/LanguageContext";

interface FavoriteStatistics {
  total: {
    all: number;
    groom_to_bride: number;
    bride_to_groom: number;
  };
  byStatus: {
    pending: number;
    accepted: number;
    rejected: number;
  };
  recent: {
    last7Days: number;
    last30Days: number;
  };
  byAgency?: Record<number, {
    name: string;
    count: number;
  }>;
}

interface FavoriteStatsOverviewProps {
  statistics: FavoriteStatistics | null;
  loading?: boolean;
}

export function FavoriteStatsOverview({ statistics, loading }: FavoriteStatsOverviewProps) {
  const { t } = useLanguage();
  
  if (loading) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="text-center text-slate-500">{t('common.loading')}</div>
        </CardContent>
      </Card>
    );
  }

  if (!statistics) {
    return null;
  }

  return (
    <Card className="mb-4 overflow-hidden">
      <CardContent className="p-0">
        {/* 통합 통계 카드 */}
        <div className="bg-gradient-to-br from-slate-50 via-white to-rose-50/30">
          {/* 상단: 전체 찜 + 방향별 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-200">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">{t('favorite.stats.total')}</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-slate-800">{statistics.total.all}</span>
                  <span className="text-xs text-slate-400">{t('common.count')}</span>
                </div>
              </div>
            </div>
            
            {/* 방향별 통계 */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1 px-2 py-1.5 bg-blue-50 rounded-full border border-blue-100">
                <span className="text-blue-600 hidden sm:inline">{t('dashboard.stats.groom')}</span>
                <span className="text-blue-600 sm:hidden">♂</span>
                <ArrowRight className="w-3 h-3 text-blue-400" />
                <span className="text-pink-600 hidden sm:inline">{t('dashboard.stats.bride')}</span>
                <span className="text-pink-600 sm:hidden">♀</span>
                <span className="font-bold text-slate-700 ml-0.5">{statistics.total.groom_to_bride}</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1.5 bg-pink-50 rounded-full border border-pink-100">
                <span className="text-pink-600 hidden sm:inline">{t('dashboard.stats.bride')}</span>
                <span className="text-pink-600 sm:hidden">♀</span>
                <ArrowRight className="w-3 h-3 text-pink-400" />
                <span className="text-blue-600 hidden sm:inline">{t('dashboard.stats.groom')}</span>
                <span className="text-blue-600 sm:hidden">♂</span>
                <span className="font-bold text-slate-700 ml-0.5">{statistics.total.bride_to_groom}</span>
              </div>
            </div>
          </div>
          
          {/* 하단: 상태별 + 최근 활동 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 sm:divide-x divide-slate-100">
            {/* 상태별 */}
            <div className="p-4 border-b sm:border-b-0 border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{t('favorite.stats.byStatus')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2 py-1.5 bg-amber-50 rounded-lg border border-amber-100 flex-1">
                  <Hourglass className="w-3 h-3 text-amber-500" />
                  <span className="text-[11px] text-slate-600">{t('favorite.stats.pending')}</span>
                  <span className="text-sm font-bold text-amber-600 ml-auto">{statistics.byStatus.pending}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100 flex-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span className="text-[11px] text-slate-600">{t('favorite.stats.accepted')}</span>
                  <span className="text-sm font-bold text-emerald-600 ml-auto">{statistics.byStatus.accepted}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1.5 bg-red-50 rounded-lg border border-red-100 flex-1">
                  <XCircle className="w-3 h-3 text-red-500" />
                  <span className="text-[11px] text-slate-600">{t('favorite.stats.rejected')}</span>
                  <span className="text-sm font-bold text-red-600 ml-auto">{statistics.byStatus.rejected}</span>
                </div>
              </div>
            </div>
            
            {/* 최근 활동 */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{t('favorite.stats.recentActivity')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 text-center px-3 py-2 bg-purple-50 rounded-lg border border-purple-100">
                  <div className="text-[10px] text-slate-500 mb-0.5">{t('favorite.stats.last7Days')}</div>
                  <div className="text-lg font-bold text-purple-600">{statistics.recent.last7Days}</div>
                </div>
                <div className="flex-1 text-center px-3 py-2 bg-indigo-50 rounded-lg border border-indigo-100">
                  <div className="text-[10px] text-slate-500 mb-0.5">{t('favorite.stats.last30Days')}</div>
                  <div className="text-lg font-bold text-indigo-600">{statistics.recent.last30Days}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 소속사별 통계 (관리자만) */}
        {statistics.byAgency && Object.keys(statistics.byAgency).length > 0 && (
          <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{t('favorite.stats.byAgency')}</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {Object.entries(statistics.byAgency)
                .sort(([, a], [, b]) => b.count - a.count) // 내림차순 정렬
                .map(([agencyId, agency]) => (
                  <div
                    key={agencyId}
                    className="flex items-center justify-between gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 hover:border-rose-200 hover:bg-rose-50/30 transition-all duration-200"
                  >
                    <span className="text-xs text-slate-700 truncate font-medium">{agency.name}</span>
                    <span className="text-sm font-bold text-rose-600 flex-shrink-0">{agency.count}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

