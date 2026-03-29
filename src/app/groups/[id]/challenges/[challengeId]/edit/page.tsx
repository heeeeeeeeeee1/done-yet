// src/app/groups/[id]/challenges/[challengeId]/edit/page.tsx
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
  const [nickname, setNickname] = useState(''); // 알림에 표시할 닉네임
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      const [challengeRes, profileRes] = await Promise.all([
        supabase.from('challenges').select('*').eq('id', challengeId).single(),
        supabase.from('users').select('nickname').eq('id', user?.id).single()
      ]);

      if (challengeRes.error || !challengeRes.data) {
        toast.error('정보를 불러오지 못했습니다.');
        router.back();
        return;
      }

      setTitle(challengeRes.data.title);
      setWeeklyTarget(challengeRes.data.weekly_target);
      setPenaltyDesc(challengeRes.data.penalty_desc || '');
      setNickname(profileRes.data?.nickname || '익명');
      setIsLoading(false);
    };
    fetchData();
  }, [challengeId, supabase, router]);

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

    // ✅ 핵심 수정: 수정 성공 후 브로드캐스트 전송
    const channel = supabase.channel(`group-changes-${groupId}`);
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.send({
          type: 'broadcast',
          event: 'challenge_event',
          payload: { nickname, action: '수정', title: title.trim() },
        });
        supabase.removeChannel(channel);
      }
    });

    toast.success('수정 완료!');
    router.push(`/groups/${groupId}`);
    router.refresh();
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