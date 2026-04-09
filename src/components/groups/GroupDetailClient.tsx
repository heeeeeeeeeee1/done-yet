'use client';

import { useEffect, useRef, useState } from 'react';
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
import type { RealtimeChannel } from '@supabase/supabase-js';

const TeamCalendar = dynamic(() => import('@/components/calendar/TeamCalendar'), {
  ssr: false,
  loading: () => <div className="h-32 w-full animate-pulse bg-gray-100 rounded-2xl" />,
});

const VerificationFeed = dynamic(() => import('./VerificationFeed'), {
  ssr: false,
  loading: () => <div className="min-h-[200px] w-full animate-pulse bg-gray-50 rounded-3xl" />,
});

export default function GroupDetailClient({
  group,
  challenges: initialChallenges,
  verifications,
  memberCount,
  isOwner,
  currentUserId,
  currentUserNickname,
}: any) {
  const supabase = createClient();
  const [challenges, setChallenges] = useState(initialChallenges);
  const [nudgeData, setNudgeData] = useState<{ sender: string } | null>(null);

  // ✅ 채널을 ref로 관리 → hook과 공유해서 새 채널 생성 없이 브로드캐스트
  const channelRef = useRef<RealtimeChannel | null>(null);

  // ✅ "새 도전 만들기" 중복 클릭 방어
  const isNavigatingRef = useRef(false);

  const { handleUpdateGroup, handleDeleteGroup, handleLeaveGroup } = useGroupActions(group, currentUserId);
  const { handleDeleteChallenge, handleNudge } = useChallengeActions(
    currentUserNickname,
    channelRef,
    (deletedId) => setChallenges((prev: any[]) => prev.filter((c: any) => c.id !== deletedId))
  );

  // ✅ 앱 재진입 시 미읽 nudge 알림 불러와 팝업 표시
  useEffect(() => {
    const loadPendingNudges = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', currentUserId)
        .eq('type', 'nudge')
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error || !data || data.length === 0) return;

      const latest = data[0];
      const match = latest.message?.match(/^(.+?)님이/);
      const sender = match ? match[1] : '누군가';

      setNudgeData({ sender });
      setTimeout(() => setNudgeData(null), 3000);

      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', currentUserId)
        .eq('type', 'nudge')
        .eq('is_read', false);
    };

    loadPendingNudges();
  }, [currentUserId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ✅ 실시간 채널 구독 — SUBSCRIBED 후 ref에 저장
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
        // ✅ 수정/삭제 이벤트 모두 수신 (action: '수정' | '삭제')
        toast(`${payload.nickname}님이 도전을 ${payload.action}했습니다!`);
        const { data } = await supabase
          .from('challenges')
          .select('*, users ( nickname )')
          .eq('group_id', group.id)
          .order('created_at', { ascending: false });
        if (data) setChallenges(data);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          channelRef.current = channel;
        }
      });

    return () => {
      channelRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [group.id, currentUserId]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // ✅ "새 도전 만들기" 중복 클릭 방어 핸들러
  const handleNewChallenge = (e: React.MouseEvent) => {
    if (isNavigatingRef.current) {
      e.preventDefault();
      return;
    }
    isNavigatingRef.current = true;
    // 페이지 이동 후 상태 리셋 (뒤로오기 대비 3초 후 해제)
    setTimeout(() => { isNavigatingRef.current = false; }, 3000);
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen relative">
      <AnimatePresence>
        {nudgeData && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          >
            <div className="bg-white/80 backdrop-blur-md p-10 rounded-[50px] shadow-2xl border-4 border-amber-400 flex flex-col items-center">
              <span className="text-9xl mb-4">👀</span>
              <p className="text-xl font-black text-gray-900 text-center">
                {nudgeData.sender}님이<br />지켜보고 있다!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <GroupHeader
        group={group}
        isOwner={isOwner}
        onUpdate={handleUpdateGroup}
        onDelete={handleDeleteGroup}
        onLeave={handleLeaveGroup}
      />

      <section className="px-6 mb-4">
        <WeeklyProgressBanner
          verifications={verifications}
          currentUserId={currentUserId}
          challenges={challenges}
        />
      </section>

      <section className="px-6 mb-4">
        <div className="bg-white p-4 mb-4 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-2 text-sm">팀 활동 현황</h3>
          <TeamCalendar verifications={verifications} memberCount={memberCount} />
        </div>

        <div className="flex justify-between items-center mb-4 px-1">
          {/* ✅ 그룹 이름 반응형: truncate + min-w-0으로 overflow 방지 */}
          <h3 className="font-bold text-gray-800 text-sm min-w-0 truncate mr-2">
            진행 중인 도전{' '}
            <span className="ml-1 text-blue-500">{challenges.length}</span>
          </h3>
          {/* ✅ 중복 클릭 방어 */}
          <Link
            href={`/groups/${group.id}/challenges/new`}
            onClick={handleNewChallenge}
            className="text-blue-600 font-bold text-xs shrink-0"
          >
            + 새 도전 만들기
          </Link>
        </div>

        <ChallengeList
          challenges={challengesWithProgress}
          isOwner={isOwner}
          currentUserId={currentUserId}
          onDelete={handleDeleteChallenge}
          onNudge={handleNudge}
          groupId={group.id}
        />
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