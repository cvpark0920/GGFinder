import { Client } from "../../types/dashboard";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Card, CardContent } from "../ui/card";
import { Heart, Search, Users, CheckCircle2, MapPin, GraduationCap, Briefcase } from "lucide-react";
import { useLanguage } from "../LanguageContext";

interface CreateMatchSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchingClient: Client | null;
  selectedPartner: Client | null;
  setSelectedPartner: (partner: Client | null) => void;
  partnerSearchTerm: string;
  setPartnerSearchTerm: (term: string) => void;
  matchInfo: {
    startDate: string;
    stage: string;
    nextStep: string;
    memo: string;
  };
  setMatchInfo: (info: {
    startDate: string;
    stage: string;
    nextStep: string;
    memo: string;
  }) => void;
  availablePartners: Client[];
  onCreateMatch: () => void;
}

export function CreateMatchSheet({
  open,
  onOpenChange,
  matchingClient,
  selectedPartner,
  setSelectedPartner,
  partnerSearchTerm,
  setPartnerSearchTerm,
  matchInfo,
  setMatchInfo,
  availablePartners,
  onCreateMatch,
}: CreateMatchSheetProps) {
  const { t } = useLanguage();
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] max-h-[80vh] rounded-t-2xl flex flex-col overflow-hidden p-0" style={{ height: '80vh', maxHeight: '80vh' }}>
        <SheetHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-rose-50 to-pink-50 flex-shrink-0">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <Heart className="w-6 h-6 text-rose-600" />
            {matchingClient?.name} {t('match.selectPartner')}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Partner Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder={matchingClient?.type === "groom" 
                ? t('match.create.searchPlaceholder.groom')
                : t('match.create.searchPlaceholder.bride')}
              className="pl-9 h-11 border-slate-300 focus:border-rose-400 focus:ring-rose-400"
              value={partnerSearchTerm}
              onChange={(e) => setPartnerSearchTerm(e.target.value)}
            />
          </div>

          {/* Available Partners List */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {availablePartners.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12">
                  <div className="text-center text-slate-500">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-base font-medium">
                      {matchingClient?.type === "groom" 
                        ? t('match.create.noPartners.groom')
                        : t('match.create.noPartners.bride')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availablePartners.map((partner) => {
                  const isSelected = selectedPartner?.id === partner.id;
                  return (
                    <Card
                      key={partner.id}
                      className={`cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "ring-2 ring-rose-500 border-rose-500 bg-gradient-to-br from-rose-50 to-pink-50 shadow-lg"
                          : "border-slate-200 hover:border-rose-300 hover:shadow-md bg-white"
                      }`}
                      onClick={() => setSelectedPartner(partner)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <Avatar className={`w-16 h-16 flex-shrink-0 border-2 ${
                            isSelected ? "border-rose-500 shadow-md" : "border-slate-200"
                          }`}>
                            <AvatarImage
                              src={partner.avatarUrl || partner.images?.[0]}
                              alt={partner.name}
                            />
                            <AvatarFallback
                              className={
                                partner.type === "groom"
                                  ? "bg-gradient-to-br from-slate-400 to-slate-600 text-white font-bold text-lg"
                                  : "bg-gradient-to-br from-rose-400 to-pink-500 text-white font-bold text-lg"
                              }
                            >
                              {partner.name.slice(0, 1)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-bold text-slate-900 text-base truncate">
                                {partner.name}
                              </h4>
                              <Badge
                                variant="secondary"
                                className={`text-xs font-semibold ${
                                  partner.type === "groom"
                                    ? "bg-slate-100 text-slate-700"
                                    : "bg-rose-100 text-rose-700"
                                }`}
                              >
                                {t('match.create.fields.age', { age: partner.age })}
                              </Badge>
                            </div>
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                <span className="truncate">{partner.loc}</span>
                              </div>
                              {partner.education && (
                                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{t('match.create.fields.education', { education: partner.education })}</span>
                                </div>
                              )}
                              {partner.job && (
                                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                                  <span className="truncate">{partner.job}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          {isSelected && (
                            <div className="flex-shrink-0">
                              <div className="w-6 h-6 rounded-full bg-rose-600 flex items-center justify-center shadow-md">
                                <CheckCircle2 className="w-4 h-4 text-white fill-white" />
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Match Information */}
          {selectedPartner && (
            <Card className="border-rose-200 bg-gradient-to-br from-rose-50/50 to-pink-50/50">
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-rose-200">
                  <Heart className="w-5 h-5 text-rose-600" />
                  <h3 className="font-bold text-lg text-slate-900">{t('match.matchInfo')}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="match-date" className="text-sm font-semibold text-slate-700">
                      {t('common.date')}
                    </Label>
                    <Input
                      id="match-date"
                      type="date"
                      value={matchInfo.startDate}
                      onChange={(e) =>
                        setMatchInfo({
                          ...matchInfo,
                          startDate: e.target.value,
                        })
                      }
                      className="border-slate-300 focus:border-rose-400 focus:ring-rose-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="match-stage" className="text-sm font-semibold text-slate-700">
                      {t('match.stages.title')}
                    </Label>
                    <Select
                      value={matchInfo.stage}
                      onValueChange={(val) =>
                        setMatchInfo({
                          ...matchInfo,
                          stage: val,
                        })
                      }
                    >
                      <SelectTrigger id="match-stage" className="border-slate-300 focus:border-rose-400 focus:ring-rose-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="서류 확인">{t('match.stages.documentReview')}</SelectItem>
                        <SelectItem value="화상 미팅">{t('match.stages.videoIntroduction')}</SelectItem>
                        <SelectItem value="대면 만남">{t('match.stages.faceToFaceMeeting')}</SelectItem>
                        <SelectItem value="가족 소개">{t('match.stages.initialConsultation')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="match-next" className="text-sm font-semibold text-slate-700">
                      {t('match.quickActions.nextStage')}
                    </Label>
                    <Input
                      id="match-next"
                      value={matchInfo.nextStep}
                      onChange={(e) =>
                        setMatchInfo({
                          ...matchInfo,
                          nextStep: e.target.value,
                        })
                      }
                      placeholder={t('match.create.placeholders.nextStep')}
                      className="border-slate-300 focus:border-rose-400 focus:ring-rose-400"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="match-memo" className="text-sm font-semibold text-slate-700">
                      {t('profile.memo')} ({t('common.select')})
                    </Label>
                    <textarea
                      id="match-memo"
                      value={matchInfo.memo}
                      onChange={(e) =>
                        setMatchInfo({
                          ...matchInfo,
                          memo: e.target.value,
                        })
                      }
                      placeholder={t('form.placeholders.memo')}
                      className="flex min-h-[100px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:border-rose-400 resize-none"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <SheetFooter className="px-6 py-4 border-t bg-white sticky bottom-0 gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 border-slate-300 hover:bg-slate-50"
          >
            {t('match.create.buttons.cancel')}
          </Button>
          <Button
            onClick={onCreateMatch}
            disabled={!selectedPartner}
            className="flex-1 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Heart className="w-4 h-4 mr-2" />
            {t('match.createMatch')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

