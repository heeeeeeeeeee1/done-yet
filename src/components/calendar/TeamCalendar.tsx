// src/components/calendar/TeamCalendar.tsx
'use client';

import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';

interface TeamCalendarProps {
  verifications: any[];
  memberCount: number;
}

export default function TeamCalendar({ verifications, memberCount }: TeamCalendarProps) {
  const today = new Date();
  const weekDays = eachDayOfInterval({
    start: startOfWeek(today),
    end: endOfWeek(today),
  });

  return (
    <div className="bg-gray-900 text-white p-6 rounded-3xl shadow-xl">
      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-400">이번 주 팀 도전 현황</h3>
        <p className="text-[10px] text-blue-400 mt-1">총 {memberCount}명의 멤버가 함께하고 있어요!</p>
      </div>

      <div className="flex justify-between items-center">
        {weekDays.map((day, idx) => {
          const dailyCount = verifications.filter(v => isSameDay(new Date(v.proof_date), day)).length;
          const isToday = isSameDay(day, today);

          return (
            <div key={idx} className="flex flex-col items-center gap-2">
              <span className={`text-[10px] ${isToday ? 'text-blue-400' : 'text-gray-600'}`}>
                {format(day, 'E')}
              </span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black
                ${dailyCount === memberCount && memberCount > 0 ? 'bg-blue-600' : dailyCount > 0 ? 'bg-gray-800 border border-gray-700' : 'bg-transparent text-gray-700'}
              `}>
                {dailyCount > 0 ? dailyCount : '-'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}