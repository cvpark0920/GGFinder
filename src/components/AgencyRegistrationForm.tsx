import React from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "./ui/sheet";
import {
  Building2,
  User,
  Phone,
  MapPin,
  FileText,
  Plus,
} from "lucide-react";
import { MemoTextarea } from "./MemoTextarea";
import { useLanguage } from "./LanguageContext";

interface AgencyRegistrationFormProps {
  newAgency: {
    name: string;
    role: "groom" | "bride";
    contact: string;
    phone: string;
    address: string;
    status: string;
    memo: string;
  };
  setNewAgency: (agency: any) => void;
  onClose: () => void;
  onAdd: () => Promise<void> | void;
}

export function AgencyRegistrationForm({
  newAgency,
  setNewAgency,
  onClose,
  onAdd,
}: AgencyRegistrationFormProps) {
  const { t } = useLanguage();
  
  return (
    <>
      <SheetHeader className="space-y-3 pb-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <SheetTitle className="text-xl">{t('dashboard.agency.registration.title')}</SheetTitle>
            <SheetDescription>
              {t('dashboard.agency.registration.description')}
            </SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <div className="mt-6 space-y-6 pb-6">
        {/* 기본 정보 섹션 */}
        <div className="bg-slate-50 rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm text-slate-700">{t('dashboard.agency.sections.basicInfo')}</h3>
          </div>
          <div>
            <Label
              htmlFor="agency-name"
              className="flex items-center gap-1"
            >
              {t('dashboard.agency.fields.name')} <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="agency-name"
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
              htmlFor="agency-role"
              className="flex items-center gap-1"
            >
              {t('dashboard.agency.fields.role')} <span className="text-rose-500">*</span>
            </Label>
            <Select
              value={newAgency.role}
              onValueChange={(value: "groom" | "bride") =>
                setNewAgency({
                  ...newAgency,
                  role: value,
                })
              }
            >
              <SelectTrigger
                id="agency-role"
                className="mt-1.5 bg-white"
              >
                <SelectValue placeholder={t('dashboard.agency.placeholders.role')} />
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
            <User className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm text-slate-700">{t('dashboard.agency.sections.contactInfo')}</h3>
          </div>
          <div>
            <Label
              htmlFor="agency-contact"
              className="flex items-center gap-1"
            >
              {t('dashboard.agency.fields.contact')} <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="agency-contact"
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
              htmlFor="agency-phone"
              className="flex items-center gap-1"
            >
              <Phone className="w-3.5 h-3.5" />
              {t('dashboard.agency.fields.phone')} <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="agency-phone"
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
              htmlFor="agency-address"
              className="flex items-center gap-1"
            >
              {t('dashboard.agency.fields.address')} <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="agency-address"
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
            <Label htmlFor="agency-status">{t('dashboard.agency.fields.status')}</Label>
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
                id="agency-status"
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
            <Label htmlFor="agency-memo">{t('dashboard.agency.fields.memo')}</Label>
            <MemoTextarea
              id="agency-memo"
              placeholder={t('dashboard.agency.placeholders.memo')}
              value={newAgency.memo}
              onChange={(e) =>
                setNewAgency({
                  ...newAgency,
                  memo: e.target.value,
                })
              }
              className="mt-1.5 bg-white"
            />
          </div>
        </div>
      </div>

      <SheetFooter className="mt-8 gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1"
        >
          {t('dashboard.agency.buttons.cancel')}
        </Button>
        <Button
          type="button"
          onClick={onAdd}
          disabled={
            !newAgency.name ||
            !newAgency.contact ||
            !newAgency.phone ||
            !newAgency.address
          }
          className="flex-1 bg-gradient-to-br from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 border-0 shadow-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('dashboard.agency.buttons.register')}
        </Button>
      </SheetFooter>
    </>
  );
}
