import { Play, RotateCw, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";

export function Reminders() {
  const [timeLeft, setTimeLeft] = useState("01:24:21");
  const [isMeetingStarted, setIsMeetingStarted] = useState(false);

  useEffect(() => {
    if (isMeetingStarted) return;
    
    const interval = setInterval(() => {
      // Very simple timer logic just for UI feel
      setTimeLeft(prev => {
        const [h, m, s] = prev.split(":").map(Number);
        let totalSeconds = h * 3600 + m * 60 + s - 1;
        if (totalSeconds < 0) totalSeconds = 0;
        const newH = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
        const newM = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
        const newS = (totalSeconds % 60).toString().padStart(2, "0");
        return `${newH}:${newM}:${newS}`;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isMeetingStarted]);

  const handleStartMeeting = () => {
    setIsMeetingStarted(true);
    alert("Joining the interview meeting via video conference...");
  };

  const handleReschedule = () => {
    const newTime = prompt("Enter new meeting time (e.g., 3:00pm-5:00pm):", "3:00pm-5:00pm");
    if (newTime) {
      alert(`Meeting rescheduled to ${newTime}`);
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-50 shadow-sm transition-all duration-300">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Reminders</h3>
      
      <div className="mb-8">
        <h4 className="text-indigo-600 font-bold text-lg mb-1">Interview Meeting</h4>
        <p className="text-gray-400 text-sm">Time 2.00pm-4.00pm</p>
      </div>

      <div className="flex flex-col items-center mb-8">
        <span className="text-5xl font-bold text-indigo-600 mb-1 tracking-tighter">
          {isMeetingStarted ? "LIVE" : timeLeft}
        </span>
        <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">
          {isMeetingStarted ? "Meeting In Progress" : "Time Remaining"}
        </span>
      </div>

      <div className="space-y-4">
        <button 
          onClick={handleStartMeeting}
          disabled={isMeetingStarted}
          className="w-full bg-indigo-600 text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all active:scale-95 cursor-pointer disabled:bg-emerald-500 disabled:cursor-default"
        >
          {isMeetingStarted ? <CheckCircle2 className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white border-none" />}
          {isMeetingStarted ? "Meeting Session Active" : "Start Meeting"}
        </button>
        <button 
          onClick={handleReschedule}
          className="w-full bg-white border-2 border-indigo-600 text-indigo-600 rounded-2xl py-4 font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all active:scale-95 cursor-pointer"
        >
          <RotateCw className="w-4 h-4" />
          Reschedule Meeting
        </button>
      </div>
    </div>
  );
}
