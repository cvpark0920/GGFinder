
import React, { useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Users, Settings } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';

export default function VideoCall() {
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);

  return (
    <div className="h-[calc(100vh-120px)] bg-slate-900 rounded-xl overflow-hidden flex flex-col relative shadow-2xl">
       {/* Main Video Area */}
       <div className="flex-1 relative">
          {/* Remote Video (Placeholder) */}
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
             <div className="text-center">
                <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-slate-700">
                   <AvatarImage src="https://i.pravatar.cc/300?u=1" />
                   <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <h2 className="text-white text-xl font-semibold">Nguyen Thi A</h2>
                <p className="text-slate-400 animate-pulse">연결 중...</p>
             </div>
          </div>
          
          {/* Local Video (PIP) */}
          <div className="absolute top-4 right-4 w-48 h-36 bg-black rounded-lg border border-slate-700 shadow-xl overflow-hidden">
             <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                {cameraOn ? (
                   <span className="text-xs text-slate-500">나</span>
                ) : (
                   <VideoOff className="text-slate-500" />
                )}
             </div>
             <div className="absolute bottom-2 left-2">
                <Badge variant="secondary" className="bg-black/50 text-white border-0 text-[10px]">나</Badge>
             </div>
          </div>
       </div>

       {/* Controls Bar */}
       <div className="h-20 bg-slate-900/90 backdrop-blur border-t border-slate-800 flex items-center justify-center gap-6 px-8 z-10">
          <Button 
            variant={micOn ? "secondary" : "destructive"} 
            size="icon" 
            className="rounded-full w-12 h-12"
            onClick={() => setMicOn(!micOn)}
          >
             {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </Button>
          
          <Button 
            variant={cameraOn ? "secondary" : "destructive"} 
            size="icon" 
            className="rounded-full w-12 h-12"
            onClick={() => setCameraOn(!cameraOn)}
          >
             {cameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>

          <Button variant="destructive" size="icon" className="rounded-full w-16 h-16 mx-4 shadow-lg hover:bg-red-600">
             <PhoneOff className="w-8 h-8" />
          </Button>

          <Button variant="outline" size="icon" className="rounded-full w-12 h-12 bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
             <MessageSquare className="w-5 h-5" />
          </Button>
          
          <Button variant="outline" size="icon" className="rounded-full w-12 h-12 bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
             <Settings className="w-5 h-5" />
          </Button>
       </div>
    </div>
  );
}
