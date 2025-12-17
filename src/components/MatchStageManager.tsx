import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CheckCircle2, Circle, Clock, Calendar, MessageSquare, FileText, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from './LanguageContext';

interface Match {
  id: number;
  groom: string;
  bride: string;
  groomId: number;
  brideId: number;
  status: string;
  stage: string;
  progress: number;
  nextStep: string;
  date: string;
}

interface MatchStage {
  id: string;
  name: string;
  status: 'completed' | 'in-progress' | 'pending';
  completedDate?: string;
  memo?: string;
  duration?: string;
}

interface MatchStageManagerProps {
  match: Match | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateMatch: (matchId: number, updates: Partial<Match>) => void;
}

export default function MatchStageManager({ match, open, onOpenChange, onUpdateMatch }: MatchStageManagerProps) {
  const { t } = useLanguage();
  
  const getDefaultStages = (): MatchStage[] => [
    { id: '1', name: t('match.stages.documentReview'), status: 'completed' as const },
    { id: '2', name: t('match.stages.initialConsultation'), status: 'completed' as const },
    { id: '3', name: t('match.stages.profileExchange'), status: 'in-progress' as const },
    { id: '4', name: t('match.stages.videoIntroduction'), status: 'pending' as const },
    { id: '5', name: t('match.stages.faceToFaceMeeting'), status: 'pending' as const },
    { id: '6', name: t('match.stages.marriageDocuments'), status: 'pending' as const },
    { id: '7', name: t('match.stages.marriagePreparation'), status: 'pending' as const },
  ];
  
  const [stages, setStages] = useState<MatchStage[]>(getDefaultStages());
  const [editingStage, setEditingStage] = useState<string | null>(null);
  const [stageMemo, setStageMemo] = useState<Record<string, string>>({});
  const [overallStatus, setOverallStatus] = useState(match?.status || t('match.status.inProgress'));

  if (!match) return null;

  const handleToggleStageStatus = (stageId: string) => {
    setStages(stages.map(stage => {
      if (stage.id === stageId) {
        const newStatus = stage.status === 'completed' 
          ? 'in-progress' 
          : stage.status === 'in-progress' 
          ? 'pending' 
          : 'completed';
        
        return {
          ...stage,
          status: newStatus,
          completedDate: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : undefined
        };
      }
      return stage;
    }));
    
    // Update progress based on completed stages
    const completedCount = stages.filter(s => s.status === 'completed' || (s.id === stageId && stages.find(st => st.id === stageId)?.status !== 'completed')).length;
    const newProgress = Math.round((completedCount / stages.length) * 100);
    
    toast.success(t('success.updated'));
  };

  const handleSaveMemo = (stageId: string) => {
    const memo = stageMemo[stageId] || '';
    setStages(stages.map(stage => 
      stage.id === stageId ? { ...stage, memo } : stage
    ));
    setEditingStage(null);
    toast.success(t('success.saved'));
  };

  const handleUpdateOverallStatus = (newStatus: string) => {
    setOverallStatus(newStatus);
    onUpdateMatch(match.id, { status: newStatus });
    toast.success(t('success.updated'));
  };

  const handleSaveAndClose = () => {
    const completedStages = stages.filter(s => s.status === 'completed').length;
    const currentStage = stages.find(s => s.status === 'in-progress')?.name || stages[stages.length - 1].name;
    const nextStage = stages.find(s => s.status === 'pending')?.name || t('match.status.completed');
    const newProgress = Math.round((completedStages / stages.length) * 100);

    onUpdateMatch(match.id, {
      stage: currentStage,
      nextStep: nextStage,
      progress: newProgress,
      status: overallStatus
    });

    toast.success(t('success.saved'));
    onOpenChange(false);
  };

  const getStatusIcon = (status: MatchStage['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <Circle className="w-5 h-5 text-orange-500 fill-orange-500" />;
      case 'pending':
        return <Circle className="w-5 h-5 text-slate-300" />;
    }
  };

  const getStatusBadge = (status: MatchStage['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-0 text-xs">{t('match.status.completed')}</Badge>;
      case 'in-progress':
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-0 text-xs">{t('match.status.inProgress')}</Badge>;
      case 'pending':
        return <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-0 text-xs">{t('match.status.pending')}</Badge>;
    }
  };

  const completedCount = stages.filter(s => s.status === 'completed').length;
  const totalProgress = Math.round((completedCount / stages.length) * 100);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] overflow-y-auto p-0 rounded-t-2xl">
        <SheetHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-rose-50 to-pink-50 rounded-t-2xl">
          <SheetTitle className="flex items-center gap-2">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold">남</div>
              <div className="w-8 h-8 rounded-full bg-rose-100 border-2 border-white flex items-center justify-center text-xs font-bold text-rose-600">여</div>
            </div>
            <span>{match.groom} & {match.bride} {t('match.title')}</span>
          </SheetTitle>
          <SheetDescription className="text-slate-600">
            {t('match.stages.title')}
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 px-6 space-y-6">
          {/* Overall Status */}
          <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 rounded-xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 mb-1">{t('match.progress.overall')}</p>
                <p className="text-3xl font-bold text-rose-600">{totalProgress}%</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-600 mb-2">{t('common.status')}</p>
                <Select value={overallStatus} onValueChange={handleUpdateOverallStatus}>
                  <SelectTrigger className="w-32 h-9 bg-white border-rose-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="진행 중">{t('match.status.inProgress')}</SelectItem>
                    <SelectItem value="대기 중">{t('match.status.pending')}</SelectItem>
                    <SelectItem value="완료">{t('match.status.completed')}</SelectItem>
                    <SelectItem value="보류">{t('dashboard.status.waiting')}</SelectItem>
                    <SelectItem value="취소됨">{t('common.cancel')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="w-full bg-white/60 h-3 rounded-full overflow-hidden shadow-inner">
              <div 
                className="bg-gradient-to-r from-rose-500 to-pink-500 h-full transition-all duration-500 shadow-sm" 
                style={{ width: `${totalProgress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span className="font-medium">{completedCount} / {stages.length} {t('match.progress.completed')}</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {match.date}
              </span>
            </div>
          </div>

          {/* Stage Timeline */}
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-800 mb-4 px-1">{t('match.stages.title')}</h3>
            <div className="relative">
              {/* Vertical Line */}
              <div className="absolute left-[18px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-rose-200 via-pink-200 to-rose-200"></div>
              
              {stages.map((stage, index) => (
                <div key={stage.id} className="relative pb-5 last:pb-0">
                  {/* Stage Header */}
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <button 
                      onClick={() => handleToggleStageStatus(stage.id)}
                      className="relative z-[1] flex-shrink-0 w-9 h-9 rounded-full bg-white border-2 border-slate-200 hover:border-rose-300 hover:bg-rose-50 hover:scale-110 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center group"
                    >
                      {getStatusIcon(stage.status)}
                    </button>

                    {/* Content */}
                    <div className="flex-1 bg-white border border-slate-200 rounded-xl p-4 hover:border-rose-300 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <h4 className="font-semibold">{stage.name}</h4>
                            {getStatusBadge(stage.status)}
                          </div>
                          {stage.completedDate && (
                            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {t('common.date')}: {stage.completedDate}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-rose-50"
                          onClick={() => setEditingStage(editingStage === stage.id ? null : stage.id)}
                        >
                          <MessageSquare className="w-4 h-4 text-slate-400" />
                        </Button>
                      </div>

                      {/* Memo Section */}
                      {editingStage === stage.id && (
                        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5">
                          <Label className="text-xs text-slate-600">{t('profile.memo')}</Label>
                          <textarea
                            value={stageMemo[stage.id] || stage.memo || ''}
                            onChange={(e) => setStageMemo({ ...stageMemo, [stage.id]: e.target.value })}
                            placeholder={t('form.placeholders.memo')}
                            className="w-full min-h-[70px] text-sm rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
                          />
                          <div className="flex gap-2 justify-end">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 text-xs px-4"
                              onClick={() => setEditingStage(null)}
                            >
                              {t('common.cancel')}
                            </Button>
                            <Button 
                              size="sm" 
                              className="h-8 text-xs px-4 bg-rose-600 hover:bg-rose-700"
                              onClick={() => handleSaveMemo(stage.id)}
                            >
                              {t('common.save')}
                            </Button>
                          </div>
                        </div>
                      )}

                      {!editingStage && stage.memo && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <p className="text-xs text-slate-600 flex items-start gap-2 bg-slate-50 rounded-lg p-2.5">
                            <FileText className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-slate-400" />
                            <span className="leading-relaxed">{stage.memo}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 shadow-sm">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {t('match.quickActions.nextStage')}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="justify-start h-10 border-blue-200 bg-white hover:bg-blue-100 hover:border-blue-300 transition-colors"
                onClick={() => {
                  const firstPending = stages.find(s => s.status === 'pending');
                  if (firstPending) handleToggleStageStatus(firstPending.id);
                }}
              >
                <Clock className="w-4 h-4 mr-2" />
                {t('match.quickActions.nextStage')}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="justify-start h-10 border-blue-200 bg-white hover:bg-blue-100 hover:border-blue-300 transition-colors"
                onClick={() => {
                  const inProgress = stages.find(s => s.status === 'in-progress');
                  if (inProgress) handleToggleStageStatus(inProgress.id);
                }}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {t('match.quickActions.updateProgress')}
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200 sticky bottom-0 bg-white pb-4 z-10">
            <Button 
              variant="outline" 
              className="flex-1 h-11"
              onClick={() => onOpenChange(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              className="flex-1 h-11 bg-rose-600 hover:bg-rose-700 shadow-sm"
              onClick={handleSaveAndClose}
            >
              {t('common.save')}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}