import { Agency } from "../../types/dashboard";
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
import { MemoTextarea } from "../MemoTextarea";
import { Pencil, Building2, User as UserIcon, Phone, MapPin, FileText } from "lucide-react";
import { useLanguage } from "../LanguageContext";

interface EditAgencySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newAgency: {
    name: string;
    role: "groom" | "bride";
    contact: string;
    phone: string;
    address: string;
    status: string;
    memo: string;
  };
  setNewAgency: (agency: {
    name: string;
    role: "groom" | "bride";
    contact: string;
    phone: string;
    address: string;
    status: string;
    memo: string;
  }) => void;
  onSave: () => void;
}

export function EditAgencySheet({
  open,
  onOpenChange,
  newAgency,
  setNewAgency,
  onSave,
}: EditAgencySheetProps) {
  const { t } = useLanguage();
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[80vh] max-h-[80vh] rounded-t-2xl flex flex-col overflow-hidden p-0"
        style={{ height: '80vh', maxHeight: '80vh' }}
      >
        <SheetHeader className="space-y-3 pb-6 border-b flex-shrink-0 px-6 pt-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
              <Pencil className="w-6 h-6 text-white" />
            </div>
            <div>
              <SheetTitle className="text-xl">{t('dashboard.agency.edit.title')}</SheetTitle>
              <SheetDescription>{t('dashboard.agency.edit.description')}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 mt-6 space-y-6 pb-6">
          {/* 기본 정보 섹션 */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm text-slate-700">{t('dashboard.agency.sections.basicInfo')}</h3>
            </div>
            <div>
              <Label
                htmlFor="edit-agency-name"
                className="flex items-center gap-1"
              >
                {t('dashboard.agency.fields.name')} <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="edit-agency-name"
                placeholder={t('dashboard.agency.placeholders.name')}
                value={newAgency.name}
                onChange={(e) =>
                  setNewAgency({
                    ...newAgency,
                    name: e.target.value,
                  })
                }
                className="mt-1.5 bg-white"
              />
            </div>
            <div>
              <Label
                htmlFor="edit-agency-role"
                className="flex items-center gap-1"
              >
                {t('dashboard.agency.fields.role')} <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={newAgency.role}
                onValueChange={(value: "groom" | "bride") =>
                  setNewAgency({ ...newAgency, role: value })
                }
              >
                <SelectTrigger
                  id="edit-agency-role"
                  className="mt-1.5 bg-white"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="groom">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      {t('dashboard.agency.roles.groom')}
                    </div>
                  </SelectItem>
                  <SelectItem value="bride">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                      {t('dashboard.agency.roles.bride')}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 담당자 정보 섹션 */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <UserIcon className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm text-slate-700">{t('dashboard.agency.sections.contactInfo')}</h3>
            </div>
            <div>
              <Label
                htmlFor="edit-agency-contact"
                className="flex items-center gap-1"
              >
                {t('dashboard.agency.fields.contact')} <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="edit-agency-contact"
                placeholder={t('dashboard.agency.placeholders.contact')}
                value={newAgency.contact}
                onChange={(e) =>
                  setNewAgency({
                    ...newAgency,
                    contact: e.target.value,
                  })
                }
                className="mt-1.5 bg-white"
              />
            </div>
            <div>
              <Label
                htmlFor="edit-agency-phone"
                className="flex items-center gap-1"
              >
                <Phone className="w-3.5 h-3.5" />
                {t('dashboard.agency.fields.phone')} <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="edit-agency-phone"
                placeholder={t('dashboard.agency.placeholders.phone')}
                value={newAgency.phone}
                onChange={(e) =>
                  setNewAgency({
                    ...newAgency,
                    phone: e.target.value,
                  })
                }
                className="mt-1.5 bg-white"
              />
            </div>
          </div>

          {/* 위치 정보 섹션 */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm text-slate-700">{t('dashboard.agency.sections.locationInfo')}</h3>
            </div>
            <div>
              <Label
                htmlFor="edit-agency-address"
                className="flex items-center gap-1"
              >
                {t('dashboard.agency.fields.address')} <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="edit-agency-address"
                placeholder={t('dashboard.agency.placeholders.address')}
                value={newAgency.address}
                onChange={(e) =>
                  setNewAgency({
                    ...newAgency,
                    address: e.target.value,
                  })
                }
                className="mt-1.5 bg-white"
              />
            </div>
          </div>

          {/* 추가 정보 섹션 */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm text-slate-700">{t('dashboard.agency.sections.additionalInfo')}</h3>
            </div>
            <div>
              <Label htmlFor="edit-agency-status">{t('dashboard.agency.fields.status')}</Label>
              <Select
                value={newAgency.status}
                onValueChange={(value) =>
                  setNewAgency({
                    ...newAgency,
                    status: value,
                  })
                }
              >
                <SelectTrigger
                  id="edit-agency-status"
                  className="mt-1.5 bg-white"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="활성">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      {t('dashboard.agency.status.active')}
                    </div>
                  </SelectItem>
                  <SelectItem value="중지">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                      {t('dashboard.agency.status.suspended')}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-agency-memo">{t('dashboard.agency.fields.memo')}</Label>
              <MemoTextarea
                id="edit-agency-memo"
                placeholder={t('dashboard.agency.placeholders.memo')}
                value={newAgency.memo}
                onChange={(value) =>
                  setNewAgency({
                    ...newAgency,
                    memo: value,
                  })
                }
              />
            </div>
          </div>
        </div>

        <SheetFooter className="mt-8 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            {t('dashboard.agency.buttons.cancel')}
          </Button>
          <Button
            type="button"
            onClick={onSave}
            disabled={
              !newAgency.name ||
              !newAgency.contact ||
              !newAgency.phone ||
              !newAgency.address
            }
            className="flex-1 bg-gradient-to-br from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 border-0 shadow-md"
          >
            <Pencil className="w-4 h-4 mr-2" />
            {t('dashboard.agency.buttons.save')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

