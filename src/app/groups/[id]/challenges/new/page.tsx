'use client';

import { useState, use, useEffect } from 'react'; // useEffect 추가
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import BackButton from '@/components/common/BackButton';

export default function NewChallengePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); 
  
  const [title, setTitle] = useState('');
  const [weeklyTarget, setWeeklyTarget] = useState(3);
  const [userId, setUserId] = useState<string | null>(null); // 유저 ID 상태 추가
  
  const supabase = createClient();
  const router = useRouter();

  // 현재 로그인한 유저 정보 가져오기
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    fetchUser();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      alert('로그인이 필요한 서비스입니다.');
      return;
    }
    
    const { error } = await supabase.from('challenges').insert({
      group_id: id, 
      title,
      weekly_target: weeklyTarget,
      user_id: userId, // 👈 이제 현재 유저의 ID가 정확히 들어갑니다!
      start_date: new Date().toISOString().split('T')[0],
    });

    if (error) {
      console.error('에러 상세:', error); // 콘솔에서 에러 원인 확인 가능
      alert(`챌린지 생성 실패: ${error.message}`);
    } else {
      router.push(`/groups/${id}`);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto pb-24"> {/* 하단 여백 추가 */}
      <header className="flex items-center gap-2 mb-8">
        <BackButton />
        <h1 className="text-xl font-bold">새 도전 생성</h1> {/* 챌린지 -> 도전으로 변경 */}
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-2">
          <label className="font-bold text-gray-700">도전 이름</label>
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

        <button className="w-full py-4 bg-black text-white rounded-xl font-bold active:scale-95 transition-all">
          도전 시작하기 🚀
        </button>
      </form>
    </div>
  );
}