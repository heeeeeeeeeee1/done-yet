'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import GroupHeader from './GroupHeader';
import ChallengeList from './ChallengeList';
import { useChallengeActions } from '@/hooks/useChallengeActions';
import WeeklyProgressBanner from './WeeklyProgressBanner';
import Link from 'next/link';
import { useGroupActions } from '@/hooks/useGroupActions';

const TeamCalendar = dynamic(() => import('@/components/calendar/TeamCalendar'), {
  ssr: false,
  loading: () => <div className="h-32 w-full animate-pulse bg-gray-100 rounded-2xl" />
});

const VerificationFeed = dynamic(() => import('./VerificationFeed'), {
  ssr: false,
  // 로딩 스켈레톤의 높이를 이미지 높이와 비슷하게 맞춰서 안정감을 줌
  loading: () => <div className="min-h-[200px] w-full animate-pulse bg-gray-50 rounded-3xl" />
});

export default function GroupDetailClient({
  group,
  challenges: initialChallenges,
  verifications,
  memberCount,
  isOwner,
  currentUserId,
  currentUserNickname
}: any) {
  const supabase = createClient();
  const [challenges, setChallenges] = useState(initialChallenges);
  const [nudgeData, setNudgeData] = useState<{ sender: string } | null>(null);

  const { handleUpdateGroup, handleDeleteGroup, handleLeaveGroup } = useGroupActions(group, currentUserId);
  const { handleUpdateChallenge, handleDeleteChallenge, handleNudge } = useChallengeActions(currentUserNickname);

  useEffect(() => {
    const channel = supabase
      .channel(`group-changes-${group.id}`)
      .on('broadcast', { event: 'nudge_event' }, ({ payload }) => {
        if (payload.targetUserId === currentUserId) {
          setNudgeData({ sender: payload.senderNickname });
          setTimeout(() => setNudgeData(null), 3000);
        }
      })
      .on('broadcast', { event: 'challenge_event' }, async ({ payload }) => {
        toast(`${payload.nickname}님이 목표를 ${payload.action}했습니다!`);
        const { data } = await supabase
          .from('challenges')
          .select('*, users ( nickname )')
          .eq('group_id', group.id)
          .order('created_at', { ascending: false });
        if (data) setChallenges(data);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [group.id, currentUserId, supabase]);

  const challengesWithProgress = challenges.map((challenge: any) => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - (day === 0 ? 6 : day - 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    const currentCount = verifications.filter((v: any) => {
      const proofDate = new Date(v.proof_date);
      return v.challenge_id === challenge.id && proofDate >= monday;
    }).length;

    return { ...challenge, current_count: currentCount };
  });

  return (
    <div className="pb-20 bg-gray-50 min-h-screen relative">
      <AnimatePresence>
        {nudgeData && (
          <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
            <div className="bg-white/80 backdrop-blur-md p-10 rounded-[50px] shadow-2xl border-4 border-amber-400 flex flex-col items-center">
              <span className="text-9xl mb-4">👀</span>
              <p className="text-xl font-black text-gray-900 text-center">{nudgeData.sender}님이<br />지켜보고 있다!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <GroupHeader group={group} isOwner={isOwner} onUpdate={handleUpdateGroup} onDelete={handleDeleteGroup} onLeave={handleLeaveGroup} />

      <section className="px-6 mb-4">
        <WeeklyProgressBanner verifications={verifications} currentUserId={currentUserId} challenges={challenges} />
      </section>

      <section className="px-6 mb-4">
        <div className="bg-white p-4 mb-4 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-2 text-sm">팀 활동 현황</h3>
          <TeamCalendar verifications={verifications} memberCount={memberCount} />
        </div>
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="font-bold text-gray-800 text-sm">진행 중인 도전 <span className="ml-1 text-blue-500">{challenges.length}</span></h3>
          <Link href={`/groups/${group.id}/challenges/new`} className="text-blue-600 font-bold text-xs">+ 새 도전 만들기</Link>
        </div>
        <ChallengeList challenges={challengesWithProgress} isOwner={isOwner} currentUserId={currentUserId} onUpdate={handleUpdateChallenge} onDelete={handleDeleteChallenge} onNudge={handleNudge} groupId={group.id} />
      </section>

      <section className="px-6 space-y-10">
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 text-sm">최근 멤버 활동</h3>
          <VerificationFeed verifications={verifications} />
        </div>
      </section>
    </div>
  );
}