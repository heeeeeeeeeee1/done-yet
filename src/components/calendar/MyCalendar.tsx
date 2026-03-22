// src/components/calendar/MyCalendar.tsx
'use client';

import { useState } from 'react';
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths 
} from 'date-fns';
import { ko } from 'date-fns/locale';

export default function MyCalendar({ verifications }: { verifications: any[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth)),
  });

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-black text-lg">{format(currentMonth, 'yyyy년 M월', { locale: ko })}</h3>
        <div className="flex gap-4 text-gray-400">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>◀</button>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>▶</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-4 text-center">
        {['일', '월', '화', '수', '목', '금', '토'].map(d => (
          <div key={d} className="text-[10px] font-bold text-gray-300">{d}</div>
        ))}
        {days.map((day, idx) => {
          const isVerified = verifications.some(v => isSameDay(new Date(v.proof_date), day));
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <div key={idx} className="relative py-2 flex flex-col items-center">
              <span className={`text-xs ${!isCurrentMonth ? 'text-gray-200' : 'text-gray-600'}`}>
                {format(day, 'd')}
              </span>
              {isVerified && (
                <div className="mt-1 w-1.5 h-1.5 bg-blue-600 rounded-full" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}