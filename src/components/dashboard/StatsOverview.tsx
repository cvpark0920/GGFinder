import React from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Plus } from "lucide-react";
import { Client, Match } from "../../types/dashboard";
import { useLanguage } from "../../components/LanguageContext";

interface StatsOverviewProps {
  grooms: Client[];
  brides: Client[];
  matches: Match[];
}

export function StatsOverview({ grooms, brides, matches }: StatsOverviewProps) {
  const { t } = useLanguage();
  
  return (
    <Card className="mb-4">
      <CardContent className="p-4 flex items-center justify-around divide-x divide-slate-100">
        <div className="flex flex-col items-center px-4 w-1/2">
          <span className="text-xs text-slate-500 font-medium mb-1">
            {t('dashboard.stats.totalMembers')}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900">
              {grooms.length + brides.length}
            </span>
            <span className="text-xs text-slate-400">{t('common.people')}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">
            {t('dashboard.stats.groom')} {grooms.length} / {t('dashboard.stats.bride')} {brides.length}
          </span>
        </div>
        <div className="flex flex-col items-center px-4 w-1/2">
          <span className="text-xs text-slate-500 font-medium mb-1">
            {t('dashboard.stats.activeMatches')}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-rose-600">
              {matches.length}
            </span>
            <span className="text-xs text-slate-400">{t('common.count')}</span>
          </div>
          <span className="text-[10px] text-green-600 flex items-center mt-1">
            <Plus className="w-3 h-3 mr-1" /> {t('dashboard.stats.recentUpdate')}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
