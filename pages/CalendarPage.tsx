import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface Event {
  time: string;
  title: string;
  type: string;
  color: string;
  dateDay: number;
}

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(11);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [events, setEvents] = useState<Event[]>([
    { time: "09:00 AM", title: "Daily Sync Meeting", type: "Internal", color: "bg-blue-500", dateDay: 11 },
    { time: "11:30 AM", title: "Interview with Alex", type: "Candidate", color: "bg-indigo-600", dateDay: 11 },
    { time: "02:00 PM", title: "Budget Review", type: "Management", color: "bg-purple-500", dateDay: 15 },
    { time: "04:30 PM", title: "HR Policy Update", type: "Policy", color: "bg-emerald-500", dateDay: 20 },
  ]);

  // Form states
  const [eventTitle, setEventTitle] = useState("");
  const [eventTime, setEventTime] = useState("10:00 AM");
  const [eventType, setEventType] = useState("Candidate");
  const [eventColor, setEventColor] = useState("bg-indigo-600");

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !selectedDay) return;

    const newEvent: Event = {
      time: eventTime,
      title: eventTitle,
      type: eventType,
      color: eventColor,
      dateDay: selectedDay,
    };

    setEvents([...events, newEvent]);
    setEventTitle("");
    setIsModalOpen(false);
  };

  const handleNextMonth = () => {
    const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(next);
  };

  const handlePrevMonth = () => {
    const prev = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(prev);
  };

  // Filter events by selectedDay
  const filteredEvents = selectedDay !== null 
    ? events.filter(e => e.dateDay === selectedDay)
    : events;

  return (
    <main className="ml-64 p-8 min-h-screen bg-[#FAFBFF]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-500 mt-1">Schedule and manage your recruitment events</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Schedule Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">
              {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h3>
            <div className="flex gap-2">
              <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-xl transition-all cursor-pointer">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-xl transition-all cursor-pointer">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-7 gap-4 mb-4">
              {days.map((day) => (
                <div key={day} className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-4">
              {Array.from({ length: 31 }).map((_, i) => {
                const dayNum = i + 1;
                const hasEvents = events.some((e) => e.dateDay === dayNum);
                const isSelected = selectedDay === dayNum;

                return (
                  <div
                    key={i}
                    onClick={() => setSelectedDay(dayNum)}
                    className={cn(
                      "aspect-square rounded-2xl flex flex-col items-center justify-center text-sm font-bold relative transition-all cursor-pointer select-none",
                      isSelected 
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-105" 
                        : "hover:bg-gray-50 text-gray-700"
                    )}
                  >
                    <span>{dayNum}</span>
                    {hasEvents && (
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full mt-1",
                        isSelected ? "bg-white" : "bg-indigo-600"
                      )} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <Clock className="w-6 h-6 text-indigo-600" />
                {selectedDay ? `Day ${selectedDay} Events` : "All Schedule Events"}
              </h3>
              {selectedDay !== null && (
                <button 
                  onClick={() => setSelectedDay(null)}
                  className="text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  Show All
                </button>
              )}
            </div>
            
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {filteredEvents.length === 0 ? (
                <div className="py-8 text-center text-gray-400 italic text-sm">
                  No events scheduled for this day. Click "Schedule Event" to add one!
                </div>
              ) : (
                filteredEvents.map((event, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-gray-50/50 border border-transparent hover:border-gray-100 transition-all">
                    <div className={cn("w-1 h-12 rounded-full", event.color)} />
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{event.time} | Day {event.dateDay}</p>
                      <p className="text-sm font-black text-gray-900 mt-0.5">{event.title}</p>
                      <span className="inline-block mt-1 text-[10px] bg-white border border-gray-100 px-2 py-0.5 rounded-md font-bold text-gray-500 uppercase">
                        {event.type}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="text-xl font-bold mb-2">HireMate Calendar</h3>
               <p className="text-indigo-100 text-sm opacity-80 leading-relaxed mb-6">
                 Synced with your Google Calendar and Outlook for seamless scheduling across platforms.
               </p>
               <button 
                onClick={() => alert("Google/Outlook Calendar accounts synchronization setting is coming soon!")}
                className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all cursor-pointer"
               >
                  Sync Settings
               </button>
             </div>
             <CalendarIcon className="absolute -bottom-8 -right-8 w-40 h-40 text-white/10" />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Schedule Event</h3>
                  <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Event Title</label>
                    <input 
                      type="text" 
                      required 
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      placeholder="e.g. Code Review, Candidate Interview" 
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Time</label>
                      <input 
                        type="text" 
                        required 
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                        placeholder="e.g. 10:00 AM" 
                        className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Scheduled Day (1-31)</label>
                      <input 
                        type="number" 
                        required 
                        min="1"
                        max="31"
                        value={selectedDay || 1}
                        onChange={(e) => setSelectedDay(parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-sans font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Event Category</label>
                      <select 
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-gray-600"
                      >
                        <option value="Candidate">Candidate</option>
                        <option value="Internal">Internal</option>
                        <option value="Management">Management</option>
                        <option value="Policy">Policy</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Label Color</label>
                      <select 
                        value={eventColor}
                        onChange={(e) => setEventColor(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-gray-600"
                      >
                        <option value="bg-indigo-600">Indigo</option>
                        <option value="bg-blue-500">Blue</option>
                        <option value="bg-purple-500">Purple</option>
                        <option value="bg-emerald-500">Emerald</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-6">
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)} 
                      className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 cursor-pointer"
                    >
                      Add Event
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
