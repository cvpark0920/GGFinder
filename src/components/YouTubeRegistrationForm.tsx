import React, { useEffect } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
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
import { Youtube, Link as LinkIcon, AlertCircle } from "lucide-react";
import { YouTubeVideo } from "../types/dashboard";
import { useLanguage } from "./LanguageContext";

interface YouTubeRegistrationFormProps {
  initialData?: Partial<YouTubeVideo>;
  onSubmit: (data: Omit<YouTubeVideo, "id" | "createdAt" | "videoId"> & { videoId: string }) => void;
  onCancel: () => void;
}

export function YouTubeRegistrationForm({
  initialData,
  onSubmit,
  onCancel,
}: YouTubeRegistrationFormProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = React.useState({
    title: "",
    url: "",
    description: "",
    status: "active" as "active" | "inactive",
  });
  const [previewId, setPreviewId] = React.useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        url: initialData.url || "",
        description: initialData.description || "",
        status: initialData.status || "active",
      });
      if (initialData.videoId) {
        setPreviewId(initialData.videoId);
      }
    }
  }, [initialData]);

  const extractVideoId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData({ ...formData, url });
    
    if (!url) {
      setPreviewId("");
      return;
    }

    const videoId = extractVideoId(url);
    if (videoId) {
      setPreviewId(videoId);
    } else {
      setPreviewId("");
    }
  };

  const handleSubmit = () => {
    if (!formData.url) return;
    
    // Attempt to extract videoId, but fallback to the URL itself if extraction fails
    const extractedId = extractVideoId(formData.url);
    const videoId = extractedId || formData.url;

    onSubmit({
      ...formData,
      videoId,
    });
  };

  return (
    <>
      <SheetHeader className="px-5 pt-6 pb-6 border-b space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
            <Youtube className="w-6 h-6 text-red-600" />
          </div>
          <div className="space-y-1">
            <SheetTitle className="text-xl">
              {initialData?.id ? t('dashboard.youtube.titles.edit') : t('dashboard.youtube.titles.register')}
            </SheetTitle>
            <SheetDescription className="text-slate-500">
              {t('dashboard.youtube.descriptions.register')}
            </SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <div className="px-5 py-6 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="video-url" className="text-sm font-medium text-slate-700">
              {t('dashboard.youtube.fields.url')} <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="video-url"
                value={formData.url}
                onChange={handleUrlChange}
                placeholder={t('dashboard.youtube.placeholders.url')}
                className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
              />
            </div>
            {/* Validation Alert removed */}
          </div>

          {previewId && (
            <div className="rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
              <div className="aspect-video w-full">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${previewId}`}
                  title="YouTube video preview"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                <span>{t('dashboard.youtube.preview.title')}</span>
                <span className="font-mono">{previewId}</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="video-title" className="text-sm font-medium text-slate-700">
              {t('dashboard.youtube.fields.title')}
            </Label>
            <Input
              id="video-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t('dashboard.youtube.placeholders.title')}
              className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2 col-span-2">
              <Label htmlFor="video-status" className="text-sm font-medium text-slate-700">
                {t('dashboard.youtube.fields.status')}
              </Label>
              <Select
                value={formData.status}
                onValueChange={(val: "active" | "inactive") => setFormData({ ...formData, status: val })}
              >
                <SelectTrigger className="bg-slate-50 border-slate-200 focus:bg-white transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      {t('dashboard.youtube.status.active')}
                    </div>
                  </SelectItem>
                  <SelectItem value="inactive">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-400" />
                      {t('dashboard.youtube.status.inactive')}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="video-desc" className="text-sm font-medium text-slate-700">
              {t('dashboard.youtube.fields.description')}
            </Label>
            <Textarea
              id="video-desc"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('dashboard.youtube.placeholders.description')}
              className="min-h-[100px] resize-none bg-slate-50 border-slate-200 focus:bg-white transition-colors"
            />
          </div>
        </div>
      </div>

      <SheetFooter className="px-5 pb-8 sm:pb-6 gap-2 sm:gap-4">
        <Button 
          variant="outline" 
          onClick={onCancel} 
          className="flex-1 h-11 text-base font-medium border-slate-300 hover:bg-slate-50"
        >
          {t('dashboard.youtube.buttons.cancel')}
        </Button>
        <Button 
          onClick={handleSubmit} 
          className="flex-1 h-11 text-base font-medium bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all"
          disabled={!formData.url}
        >
          {initialData?.id ? t('dashboard.youtube.buttons.save') : t('dashboard.youtube.buttons.register')}
        </Button>
      </SheetFooter>
    </>
  );
}
