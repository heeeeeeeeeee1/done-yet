'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';

export default function EditChallengePage({ params }: { params: Promise<{ id: string; challengeId: string }> }) {
  const { id: groupId, challengeId } = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState('');
  const [weeklyTarget, setWeeklyTarget] = useState(3);
  const [penaltyDesc, setPenaltyDesc] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChallenge = async () => {
      const { data, error } = await supabase
        .from('challenges').select('*').eq('id', challengeId).single();

      if (error || !data) {
        toast.error('정보를 불러오지 못했습니다.');
        router.back();
        return;
      }
      setTitle(data.title);
      setWeeklyTarget(data.weekly_target);
      setPenaltyDesc(data.penalty_desc || '');
      setIsLoading(false);
    };
    fetchChallenge();
  }, [challengeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error('제목을 입력해주세요.');

    const { error } = await supabase
      .from('challenges')
      .update({
        title: title.trim(),
        weekly_target: Number(weeklyTarget),
        penalty_desc: penaltyDesc.trim(),
      })
      .eq('id', challengeId);

    if (error) return toast.error('수정에 실패했습니다.');

    // ✅ 핵심 수정:
    // 브로드캐스트를 받을 채널이 그룹 페이지에 아직 없는 타이밍 문제가 있었음.
    // 브로드캐스트 대신, 다른 멤버들을 위한 Supabase Realtime DB 변경 감지로 대체하거나
    // 여기서는 단순히 DB 업데이트 후 바로 이동한다.
    // GroupDetailClient가 마운트될 때 직접 DB를 조회하므로 항상 최신 데이터가 표시된다.
    toast.success('수정 완료!');
    window.location.href = `/groups/${groupId}`; // 완전 새로고침으로 마운트 fetch 유도
  };

  if (isLoading) return <div className="p-10 text-center text-gray-400">로딩 중...</div>;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white p-6 pb-20">
      <header className="flex items-center mb-8">
        <button onClick={() => router.back()} className="mr-4 text-gray-400 p-2">◀</button>
        <h1 className="text-xl font-black text-gray-900">도전 수정하기</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">도전 제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">주간 목표 (현재 {weeklyTarget}회)</label>
          <div className="flex justify-between gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setWeeklyTarget(num)}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${weeklyTarget === num ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-50 text-gray-400 border border-gray-100'
                  }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">미달성 시 벌칙 💀</label>
          <textarea
            value={penaltyDesc}
            onChange={(e) => setPenaltyDesc(e.target.value)}
            className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-red-400 font-medium min-h-[120px] text-gray-900"
            placeholder="벌칙을 입력해주세요."
          />
        </div>

        <button type="submit" className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-transform">
          저장하기
        </button>
      </form>
    </div>
  );
}