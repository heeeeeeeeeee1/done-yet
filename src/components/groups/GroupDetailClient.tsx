'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import GroupHeader from './GroupHeader';
import ChallengeList from './ChallengeList';
import { useChallengeActions } from '@/hooks/useChallengeActions';
import WeeklyProgressBanner from './WeeklyProgressBanner';
import TeamCalendar from '@/components/calendar/TeamCalendar';
import VerificationFeed from './VerificationFeed';
import Link from 'next/link';
import { useGroupActions } from '@/hooks/useGroupActions';

interface GroupDetailProps {
  group: any;
  challenges: any[];
  verifications: any[];
  memberCount: number;
  isOwner: boolean;
  currentUserId?: string;
  currentUserNickname: string;
}

export default function GroupDetailClient({
  group,
  challenges: initialChallenges,
  verifications,
  memberCount,
  isOwner,
  currentUserId,
  currentUserNickname
}: GroupDetailProps) {
  const supabase = createClient();
  const [challenges, setChallenges] = useState(initialChallenges);
  const [nudgeData, setNudgeData] = useState<{ sender: string } | null>(null);

  // 그룹 및 챌린지 액션 훅 연결
  const { handleUpdateGroup, handleDeleteGroup, handleLeaveGroup } = useGroupActions(group, currentUserId);
  const { handleUpdateChallenge, handleDeleteChallenge, handleNudge } = useChallengeActions(currentUserNickname);

  // 1. 실시간 데이터 동기화 및 리스너 설정
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
          .select('*')
          .eq('group_id', group.id)
          .order('created_at', { ascending: false });
        if (data) setChallenges(data);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [group.id, currentUserId, supabase]);

  // 2. 각 챌린지별 이번 주 달성 횟수 계산
  const challengesWithProgress = challenges.map((challenge: any) => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    const currentCount = verifications.filter((v: any) => {
      const proofDate = new Date(v.created_at || v.proof_date);
      return v.challenge_id === challenge.id && proofDate >= monday;
    }).length;

    return {
      ...challenge,
      current_count: currentCount,
    };
  });

  return (
    <div className="pb-20 bg-gray-50 min-h-screen relative overflow-hidden">
      {/* 👀 재촉 애니메이션 오버레이 */}
      <AnimatePresence>
        {nudgeData && (
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: -45 }}
            animate={{
              opacity: 1,
              scale: [1, 1.3, 1],
              rotate: 0,
              y: [0, -20, 0]
            }}
            exit={{ opacity: 0, scale: 2, filter: "blur(10px)" }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          >
            <div className="bg-white/80 backdrop-blur-md p-10 rounded-[50px] shadow-2xl border-4 border-amber-400 flex flex-col items-center">
              <motion.span
                animate={{ rotate: [0, -15, 15, -15, 0] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
                className="text-9xl mb-4"
              >
                👀
              </motion.span>
              <p className="text-xl font-black text-gray-900 tracking-tighter text-center">
                {nudgeData.sender}님이<br />지켜보고 있다!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 초대 기능이 통합된 헤더 */}
      <GroupHeader
        group={group}
        isOwner={isOwner}
        onUpdate={handleUpdateGroup}
        onDelete={handleDeleteGroup}
        onLeave={handleLeaveGroup}
      />

      <section className="px-6 mb-4">
        <div className="flex justify-end mb-2">
          <p className="text-[11px] font-bold text-gray-400">{currentUserNickname}님 반가워요!</p>
        </div>

        {/* 개인화된 주간 진행 배너 */}
        <WeeklyProgressBanner
          verifications={verifications}
          currentUserId={currentUserId}
          challenges={challenges}
        />
      </section>

      {/* 진행 중인 도전 목록 */}
      <section className="px-6 mb-10">
        <div className="flex justify-between items-center mb-4 px-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-800 text-sm">진행 중인 도전</h3>
            <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-md font-bold">
              {challenges.length}
            </span>
          </div>
          <Link href={`/groups/${group.id}/challenges/new`} className="text-blue-600 font-bold text-xs hover:underline">
            + 새 도전 만들기
          </Link>
        </div>

        <ChallengeList
          challenges={challengesWithProgress}
          isOwner={isOwner}
          currentUserId={currentUserId}
          onUpdate={handleUpdateChallenge}
          onDelete={handleDeleteChallenge}
          onNudge={handleNudge}
          groupId={group.id}
        />
      </section>

      {/* 활동 현황 및 피드 */}
      <section className="px-6 mb-10 space-y-10">
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 px-1 text-sm">팀 활동 현황</h3>
          <TeamCalendar verifications={verifications} memberCount={memberCount} />
        </div>

        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 px-1 text-sm">최근 멤버 활동</h3>
          <VerificationFeed verifications={verifications} />
        </div>
      </section>
    </div>
  );
}