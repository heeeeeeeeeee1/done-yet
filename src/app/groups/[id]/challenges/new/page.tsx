// src/app/groups/[id]/challenges/new/page.tsx
'use client';

import { useState, use } from 'react'; // 1. use 추가
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import BackButton from '@/components/common/BackButton';

export default function NewChallengePage({ params }: { params: Promise<{ id: string }> }) {
  // 2. use()를 사용하여 params에서 id를 꺼냅니다.
  const { id } = use(params); 
  
  const [title, setTitle] = useState('');
  const [weeklyTarget, setWeeklyTarget] = useState(3);
  const supabase = createClient();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 3. 이제 params.id 대신 변수 id를 직접 사용합니다.
    const { error } = await supabase.from('challenges').insert({
      group_id: id, 
      title,
      weekly_target: weeklyTarget,
      start_date: new Date().toISOString().split('T')[0],
    });

    if (error) {
      alert('챌린지 생성 실패');
    } else {
      // 4. 이동할 때도 id 변수를 사용합니다.
      router.push(`/groups/${id}`);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <header className="flex items-center gap-2 mb-8">
        <BackButton />
        <h1 className="text-xl font-bold">새 챌린지 생성</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-2">
          <label className="font-bold text-gray-700">챌린지 이름</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 매일 스쿼트 100개"
            className="w-full p-4 border rounded-xl"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="font-bold text-gray-700">주간 목표 횟수 ({weeklyTarget}회)</label>
          <input
            type="range"
            min="1"
            max="7"
            value={weeklyTarget}
            onChange={(e) => setWeeklyTarget(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>1회</span><span>7회</span>
          </div>
        </div>

        <button className="w-full py-4 bg-black text-white rounded-xl font-bold">
          챌린지 시작하기 🚀
        </button>
      </form>
    </div>
  );
}