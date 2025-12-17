import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Heart, Clock, ArrowRight, Plus } from "lucide-react";
import { Match } from "../../types/dashboard";

interface MatchTabContentProps {
  matches: Match[];
  onOpenStageManager: (match: Match) => void;
}

export function MatchTabContent({
  matches,
  onOpenStageManager,
}: MatchTabContentProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {matches.map((match) => (
        <Card
          key={match.id}
          className="group hover:shadow-md transition-shadow cursor-pointer border-slate-200"
          onClick={() => onOpenStageManager(match)}
        >
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="text-slate-900">{match.groom}</span>
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
                  <span className="text-slate-900">{match.bride}</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  {match.date} 시작
                </CardDescription>
              </div>
              <Badge
                variant="secondary"
                className="bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-100"
              >
                {match.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">현재 단계</span>
                <span className="font-medium text-slate-900">
                  {match.stage}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">진행률</span>
                  <span className="font-semibold text-rose-600">
                    {match.progress}%
                  </span>
                </div>
                <div className="w-full bg-slate-200/60 h-2.5 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-rose-500 to-pink-500 h-full transition-all duration-500 shadow-sm relative overflow-hidden"
                    style={{
                      width: `${match.progress}%`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
              <div className="text-xs text-slate-600 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium">다음:</span> {match.nextStep}
              </div>
              <div className="text-xs text-rose-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                단계 관리 <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
