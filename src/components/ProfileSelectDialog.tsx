import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { fetchClients } from '../utils/api';
import { Client } from '../types/dashboard';
import { Loader2 } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';

interface ProfileSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (clientId: number) => void;
  profileType: 'groom' | 'bride'; // 찜할 프로필의 타입 (신부를 찜할 때는 'bride', 신랑을 찜할 때는 'groom')
}

export function ProfileSelectDialog({
  open,
  onOpenChange,
  onSelect,
  profileType,
}: ProfileSelectDialogProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [profiles, setProfiles] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);

  // 프로필 타입 결정: 찜할 프로필이 신부면 신랑 프로필을 보여주고, 찜할 프로필이 신랑이면 신부 프로필을 보여줌
  const selectableProfileType = profileType === 'bride' ? 'groom' : 'bride';

  useEffect(() => {
    if (open && user?.agencyId) {
      loadProfiles();
    } else {
      setProfiles([]);
      setSelectedProfileId(null);
    }
  }, [open, user?.agencyId]);

  const loadProfiles = async () => {
    if (!user?.agencyId) {
      return;
    }

    setLoading(true);
    try {
      // 자신의 소속사 프로필만 조회
      const clients = await fetchClients(selectableProfileType, true);
      // 자신의 소속사 프로필만 필터링
      const agencyProfiles = clients.filter(
        (client) => client.agencyId === user.agencyId
      );
      setProfiles(agencyProfiles);
    } catch (error) {
      console.error('Failed to load profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = () => {
    if (selectedProfileId !== null) {
      onSelect(selectedProfileId);
      onOpenChange(false);
      setSelectedProfileId(null);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedProfileId(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {t('profile.selectProfile')}
          </DialogTitle>
          <DialogDescription>
            {t('profile.selectProfileDesc', { type: selectableProfileType === 'groom' ? t('dashboard.tabs.grooms') : t('dashboard.tabs.brides') })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">
                {t('profile.noProfilesToSelect', { type: selectableProfileType === 'groom' ? t('dashboard.tabs.grooms') : t('dashboard.tabs.brides') })}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profiles.map((profile) => {
                const isSelected = selectedProfileId === profile.id;
                return (
                  <Card
                    key={profile.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected
                        ? 'ring-2 ring-primary border-primary'
                        : 'border-slate-200'
                    }`}
                    onClick={() => setSelectedProfileId(profile.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12 flex-shrink-0">
                          <AvatarImage
                            src={profile.avatarUrl || profile.images?.[0]}
                            alt={profile.name}
                          />
                          <AvatarFallback
                            className={
                              selectableProfileType === 'groom'
                                ? 'bg-slate-100 text-slate-500'
                                : 'bg-rose-50 text-rose-500'
                            }
                          >
                            {profile.name.slice(0, 1)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">
                            {selectableProfileType === 'groom' ? 'GR' : 'BR'}-
                            {String(profile.id).padStart(3, '0')}
                          </div>
                          <div className="text-xs text-slate-600 truncate">
                            {profile.name}
                          </div>
                          {profile.age && (
                            <div className="text-xs text-slate-500">
                              {profile.age}세
                            </div>
                          )}
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M5 13l4 4L19 7" />
                            </svg>
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

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSelect}
            disabled={selectedProfileId === null || loading}
          >
            {t('profile.select')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

