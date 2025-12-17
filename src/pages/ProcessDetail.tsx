
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Circle, Clock, FileText, Heart, MessageSquare, Plane, Ring, Video } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';

const STEPS = [
  { id: 1, title: '등록', desc: '프로필 생성 및 검증', status: 'completed', icon: FileText },
  { id: 2, title: '매칭', desc: 'AI 매칭 및 선택', status: 'completed', icon: Heart },
  { id: 3, title: '소개', desc: '화상 통화 및 관심 확인', status: 'current', icon: Video },
  { id: 4, title: '만남', desc: '현지 만남 (베트남)', status: 'pending', icon: Plane },
  { id: 5, title: '결혼', desc: '결혼식', status: 'pending', icon: 'Ring' }, // Using string literal for custom icon logic or just placeholder
  { id: 6, title: '비자 수속', desc: 'F-6 비자 신청', status: 'pending', icon: FileText },
];

export default function ProcessDetail() {
  const { id } = useParams();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="mb-8 bg-white shadow-sm border-slate-200">
         <CardHeader className="flex flex-row items-center justify-between space-y-0 px-6 py-4">
            <div className="space-y-1">
               <CardTitle className="text-xl font-bold text-slate-900">매칭 프로세스 #2023-{id}</CardTitle>
               <CardDescription className="flex items-center text-sm font-medium">
                  박지성 (KR) 
                  <Heart className="w-3.5 h-3.5 mx-1.5 text-rose-500 fill-rose-500" /> 
                  Nguyen Thi A (VN)
               </CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 h-8" asChild>
               <Link to="/dashboard" className="flex items-center gap-1 text-sm">
                  <span className="text-base pb-0.5">←</span> 돌아가기
               </Link>
            </Button>
         </CardHeader>
      </Card>

      {/* Progress Stepper */}
      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200" />
        <div className="space-y-8">
           {STEPS.map((step, idx) => {
             const Icon = step.icon === 'Ring' ? Heart : step.icon; // Fallback for now
             const isCompleted = step.status === 'completed';
             const isCurrent = step.status === 'current';
             
             return (
               <div key={step.id} className="relative flex gap-6">
                 <div className={`relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 ${
                    isCompleted ? 'border-green-100 bg-green-500 text-white' : 
                    isCurrent ? 'border-rose-100 bg-rose-600 text-white' : 
                    'border-slate-100 bg-white text-slate-300'
                 }`}>
                    {isCompleted ? <CheckCircle2 className="w-8 h-8" /> : <Icon className="w-8 h-8" />}
                 </div>
                 <div className={`flex-1 pt-1 ${isCurrent ? 'opacity-100' : 'opacity-70'}`}>
                    <div className="flex items-center justify-between">
                       <h3 className={`text-lg font-bold ${isCurrent ? 'text-rose-600' : 'text-slate-900'}`}>{step.title}</h3>
                       {isCurrent && <Badge className="bg-rose-100 text-rose-600 hover:bg-rose-200 border-0">진행 중</Badge>}
                       {isCompleted && <span className="text-sm text-green-600 font-medium">완료됨</span>}
                    </div>
                    <p className="text-slate-500 mb-3">{step.desc}</p>
                    
                    {isCurrent && (
                       <Card className="mt-2 border-rose-100 bg-rose-50/30">
                          <CardContent className="p-4">
                             <h4 className="font-semibold text-sm mb-2">현재 과제</h4>
                             <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2">
                                   <CheckCircle2 className="w-4 h-4 text-green-500" />
                                   <span>화상 통화 일정 잡기 (완료 10/24)</span>
                                </li>
                                <li className="flex items-center gap-2">
                                   <Circle className="w-4 h-4 text-rose-500" />
                                   <span>대화 번역 지원</span>
                                </li>
                                <li className="flex items-center gap-2">
                                   <Circle className="w-4 h-4 text-rose-500" />
                                   <span>상호 관심 확인</span>
                                </li>
                             </ul>
                             <div className="flex gap-2 mt-4">
                                <Button size="sm" className="bg-rose-600 hover:bg-rose-700" asChild>
                                    <Link to="/video-call">화상 통화 시작</Link>
                                </Button>
                                <Button size="sm" variant="outline" asChild>
                                    <Link to="/messages">채팅 열기</Link>
                                </Button>
                             </div>
                          </CardContent>
                       </Card>
                    )}
                 </div>
               </div>
             );
           })}
        </div>
      </div>
    </div>
  );
}
