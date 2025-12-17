import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '../components/ui/sheet';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Upload, Video, X } from 'lucide-react';

interface Client {
  id: number;
  name: string;
  age: number;
  loc: string;
  status: string;
  date: string;
  type: 'groom' | 'bride';
  education?: string;
  height?: string;
  weight?: string;
  family?: string;
  marriage?: string;
  job?: string;
  tattoo?: string;
  income?: string;
  smoking?: string;
  drinking?: string;
  idealType?: string;
}

interface EditSheetProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onUpdate: (client: Client) => void;
  photoPreviewUrls: string[];
  videoPreviewUrl: string;
  selectedPhotos: File[];
  selectedVideo: File | null;
  handlePhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleVideoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemovePhoto: (index: number) => void;
  handleRemoveVideo: () => void;
}

export function EditGroomSheet({
  isOpen,
  onClose,
  client,
  onUpdate,
  photoPreviewUrls,
  videoPreviewUrl,
  selectedPhotos,
  selectedVideo,
  handlePhotoChange,
  handleVideoChange,
  handleRemovePhoto,
  handleRemoveVideo,
}: EditSheetProps) {
  if (!client) return null;

  const [editingClient, setEditingClient] = React.useState<Client>(client);

  React.useEffect(() => {
    if (client) setEditingClient(client);
  }, [client]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>신랑 정보 수정</SheetTitle>
          <SheetDescription>신랑 회원의 정보를 수정하세요.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4 px-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-g-name">이름</Label>
              <Input 
                id="edit-g-name" 
                value={editingClient.name} 
                onChange={e => setEditingClient({...editingClient, name: e.target.value})} 
                placeholder="홍길동" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-g-marriage">결혼유무</Label>
              <Select value={editingClient.marriage} onValueChange={val => setEditingClient({...editingClient, marriage: val})}>
                <SelectTrigger id="edit-g-marriage">
                  <SelectValue placeholder="선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="초혼">초혼</SelectItem>
                  <SelectItem value="재혼">재혼</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-g-age">나이</Label>
              <Input 
                id="edit-g-age" 
                type="number" 
                value={editingClient.age} 
                onChange={e => setEditingClient({...editingClient, age: parseInt(e.target.value) || 0})} 
                placeholder="35" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-g-loc">거주지 주소</Label>
              <Input 
                id="edit-g-loc" 
                value={editingClient.loc} 
                onChange={e => setEditingClient({...editingClient, loc: e.target.value})} 
                placeholder="서울시 강남구" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-g-edu">학력</Label>
              <Input 
                id="edit-g-edu" 
                value={editingClient.education || ''} 
                onChange={e => setEditingClient({...editingClient, education: e.target.value})} 
                placeholder="대졸" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-g-job">직업(직장)</Label>
              <Input 
                id="edit-g-job" 
                value={editingClient.job || ''} 
                onChange={e => setEditingClient({...editingClient, job: e.target.value})} 
                placeholder="회사원" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-g-height">신장</Label>
              <Input 
                id="edit-g-height" 
                value={editingClient.height || ''} 
                onChange={e => setEditingClient({...editingClient, height: e.target.value})} 
                placeholder="175cm" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-g-weight">몸무게</Label>
              <Input 
                id="edit-g-weight" 
                value={editingClient.weight || ''} 
                onChange={e => setEditingClient({...editingClient, weight: e.target.value})} 
                placeholder="70kg" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-g-income">연소득</Label>
              <Input 
                id="edit-g-income" 
                value={editingClient.income || ''} 
                onChange={e => setEditingClient({...editingClient, income: e.target.value})} 
                placeholder="5,000만원" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-g-smoking">흡연유무</Label>
              <Select value={editingClient.smoking || '비흡연'} onValueChange={val => setEditingClient({...editingClient, smoking: val})}>
                <SelectTrigger id="edit-g-smoking">
                  <SelectValue placeholder="선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="비흡연">비흡연</SelectItem>
                  <SelectItem value="흡연">흡연</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-g-drinking">음주주량</Label>
            <Input 
              id="edit-g-drinking" 
              value={editingClient.drinking || ''} 
              onChange={e => setEditingClient({...editingClient, drinking: e.target.value})} 
              placeholder="소주 1병" 
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-g-ideal">이상형여성 조건</Label>
            <textarea 
              id="edit-g-ideal" 
              value={editingClient.idealType || ''} 
              onChange={e => setEditingClient({...editingClient, idealType: e.target.value})} 
              placeholder="성격이 밝고 명랑한 분" 
              className="flex min-h-[80px] w-full rounded-md border border-input bg-slate-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-g-photos">사진 업로드</Label>
            <div className="flex items-center gap-2">
              <Input 
                id="edit-g-photos" 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handlePhotoChange} 
                className="hidden" 
              />
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1 px-3 h-9"
                asChild
              >
                <label htmlFor="edit-g-photos" className="flex items-center gap-1 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" /> 사진 선택
                </label>
              </Button>
              {selectedPhotos.length > 0 && (
                <span className="text-xs text-slate-500">{selectedPhotos.length}장 선택됨</span>
              )}
            </div>
            {photoPreviewUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {photoPreviewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={url} 
                      alt={`Uploaded photo ${index + 1}`} 
                      className="w-full h-20 object-cover rounded-md border border-slate-200"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-1 right-1 h-6 w-6 bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemovePhoto(index)}
                    >
                      <X className="w-3 h-3 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-g-video">동영상 업로드</Label>
            <div className="flex items-center gap-2">
              <Input 
                id="edit-g-video" 
                type="file" 
                accept="video/*" 
                onChange={handleVideoChange} 
                className="hidden" 
              />
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1 px-3 h-9"
                asChild
              >
                <label htmlFor="edit-g-video" className="flex items-center gap-1 cursor-pointer">
                  <Video className="w-3.5 h-3.5" /> 동영상 선택
                </label>
              </Button>
              {selectedVideo && (
                <span className="text-xs text-slate-500">{selectedVideo.name}</span>
              )}
            </div>
            {videoPreviewUrl && (
              <div className="relative mt-2 group">
                <video 
                  src={videoPreviewUrl} 
                  controls 
                  className="w-full h-40 object-cover rounded-md border border-slate-200"
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 h-6 w-6 bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleRemoveVideo}
                >
                  <X className="w-3 h-3 text-red-500" />
                </Button>
              </div>
            )}
          </div>
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={() => onUpdate(editingClient)} className="bg-indigo-600 hover:bg-indigo-700">수정 완료</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
