'use client';

import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';

interface TeamCalendarProps {
  verifications: any[];
  memberCount: number;
}

export default function TeamCalendar({ verifications, memberCount }: TeamCalendarProps) {
  const today = new Date();
  
  // weekStartsOn: 1 을 추가하여 월요일부터 시작하게 설정
  const weekDays = eachDayOfInterval({
    start: startOfWeek(today, { weekStartsOn: 1 }),
    end: endOfWeek(today, { weekStartsOn: 1 }),
  });

  return (
    <div className="bg-gray-900 text-white p-6 rounded-3xl shadow-xl">
      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-400">이번 주 팀 도전 현황</h3>
        <p className="text-[10px] text-blue-400 mt-1">총 {memberCount}명의 멤버가 함께하고 있어요!</p>
      </div>

      <div className="flex justify-between items-center">
        {weekDays.map((day, idx) => {
          // 중복 제거 로직: 같은 날, 같은 유저의 인증은 하나로 합침
          const dailyVerifications = verifications.filter(v => isSameDay(new Date(v.proof_date), day));
          const uniqueUserCount = new Set(dailyVerifications.map(v => v.user_id)).size;
          
          const isToday = isSameDay(day, today);

          return (
            <div key={idx} className="flex flex-col items-center gap-2">
              <span className={`text-[10px] ${isToday ? 'text-blue-400 font-bold' : 'text-gray-600'}`}>
                {format(day, 'E')}
              </span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black transition-all
                ${uniqueUserCount === memberCount && memberCount > 0 
                  ? 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]' 
                  : uniqueUserCount > 0 
                    ? 'bg-gray-800 border border-gray-700 text-blue-400' 
                    : 'bg-transparent text-gray-800 border border-gray-800/30'}
              `}>
                {uniqueUserCount > 0 ? uniqueUserCount : '-'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}