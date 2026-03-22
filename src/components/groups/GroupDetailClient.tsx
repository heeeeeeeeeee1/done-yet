// src/components/groups/GroupDetailClient.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import toast from 'react-hot-toast';
import TeamCalendar from '@/components/calendar/TeamCalendar';
import GroupHeader from './GroupHeader';
import VerificationFeed from './VerificationFeed';
import { useGroupActions } from '@/hooks/useGroupActions';
import { useChallengeActions } from '@/hooks/useChallengeActions';
import WeeklyProgressBanner from './WeeklyProgressBanner';
import ChallengeList from './ChallengeList';

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
  const router = useRouter();
  const supabase = createClient();

  const [challenges, setChallenges] = useState(initialChallenges);

  // ✅ 핵심 수정 1:
  // 브로드캐스트에 의존하지 않고, 컴포넌트가 마운트될 때마다
  // DB에서 직접 최신 챌린지 목록을 가져와 state를 갱신한다.
  // window.location.href로 돌아오면 페이지가 완전히 새로 마운트되므로
  // 이 useEffect가 반드시 실행되어 수정된 데이터가 반영된다.
  useEffect(() => {
    const fetchLatestChallenges = async () => {
      const { data } = await supabase
        .from('challenges')
        .select('*')
        .eq('group_id', group.id)
        .order('created_at', { ascending: false });

      if (data) setChallenges(data);
    };

    fetchLatestChallenges();
  }, [group.id]); // ✅ group.id가 바뀔 때만 재실행 (마운트 시 1회)

  const groupActions = useGroupActions(group, currentUserId);
  const { handleUpdateChallenge, handleDeleteChallenge } = useChallengeActions(currentUserNickname);

  // ✅ 핵심 수정 2:
  // 브로드캐스트는 다른 멤버들의 실시간 반영용으로만 유지한다.
  // 본인 이벤트(self: true)는 제거 — 어차피 마운트 시 fetch로 처리하기 때문.
  useEffect(() => {
    const channel = supabase
      .channel(`group-changes-${group.id}`)
      // ❌ 제거: config: { broadcast: { self: true } }
      // 본인이 수정/삭제 후 돌아올 때는 위의 마운트 fetch가 처리하므로 불필요
      .on('broadcast', { event: 'challenge_event' }, async ({ payload }) => {
        toast(`${payload.nickname} 님이 '${payload.title}' 목표를 ${payload.action}했습니다!`, {
          icon: payload.action === '수정' ? '🔄' : '🗑️',
        });

        // 다른 멤버 이벤트 수신 시 DB 재조회
        const { data: updatedChallenges } = await supabase
          .from('challenges')
          .select('*')
          .eq('group_id', group.id)
          .order('created_at', { ascending: false });

        if (updatedChallenges) setChallenges(updatedChallenges);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [group.id, supabase, router]);

  return (
    <div className="pb-20">
      <GroupHeader
        group={group}
        isOwner={isOwner}
        onLeave={groupActions.handleLeaveGroup}
        onDelete={groupActions.handleDeleteGroup}
      />

      <section className="px-6 mb-8">
        <WeeklyProgressBanner
          verifications={verifications}
          currentUserId={currentUserId}
          weeklyTarget={challenges[0]?.weekly_target ?? 3}
        />
      </section>

      <section className="px-6 mb-10">
        <TeamCalendar verifications={verifications} memberCount={memberCount} />
      </section>

      <section className="px-6 mb-10">
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="font-bold text-gray-800">진행 중인 도전</h3>
          <Link href={`/groups/${group.id}/challenges/new`} className="text-xs font-bold text-blue-600">
            + 새 도전 만들기
          </Link>
        </div>

        {challenges.length > 0 ? (
          <ChallengeList
            challenges={challenges}
            isOwner={isOwner}
            currentUserId={currentUserId}
            onUpdate={handleUpdateChallenge}
            onDelete={handleDeleteChallenge}
            groupId={group.id}
          />
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-sm text-gray-400 font-medium">아직 등록된 도전이 없습니다.</p>
          </div>
        )}
      </section>

      <section className="px-6">
        <h3 className="font-bold text-gray-800 mb-4 px-1">멤버 활동</h3>
        <VerificationFeed verifications={verifications} />
      </section>
    </div>
  );
}