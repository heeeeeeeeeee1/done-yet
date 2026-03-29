// src/app/groups/[id]/GroupDetailClient.tsx
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
import InviteCodeSection from './InviteCodeSection';

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
  }, [group.id, supabase]);

  const groupActions = useGroupActions(group, currentUserId);
  const { handleUpdateChallenge, handleDeleteChallenge } = useChallengeActions(currentUserNickname);

  useEffect(() => {
    const channel = supabase
      .channel(`group-changes-${group.id}`)
      .on('broadcast', { event: 'challenge_event' }, async ({ payload }) => {
        toast(`${payload.nickname} 님이 '${payload.title}' 목표를 ${payload.action}했습니다!`, {
          icon: payload.action === '수정' ? '🔄' : '🗑️',
        });

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
  }, [group.id, supabase]);

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* 1. 상단 헤더 (배지 포함) */}
      <GroupHeader
        group={group}
        isOwner={isOwner}
        onLeave={groupActions.handleLeaveGroup}
        onDelete={groupActions.handleDeleteGroup}
      />

      {/* 2. 초대 코드 및 인사말 */}
      <section className="px-6 mb-4">
        <div className="flex justify-end mb-2">
          <p className="text-[11px] font-bold text-gray-400">
            {currentUserNickname}님 반가워요!
          </p>
        </div>
        <InviteCodeSection inviteCode={group.invite_code} />
      </section>

      {/* 3. 이번 주 진행 현황 */}
      <section className="px-6 mb-8">
        <WeeklyProgressBanner
          verifications={verifications}
          currentUserId={currentUserId}
          weeklyTarget={challenges[0]?.weekly_target ?? 3}
        />
      </section>

      {/* 4. 팀 전체 챌린지 캘린더 */}
      <section className="px-6 mb-10">
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 px-1">팀 활동 현황</h3>
          <TeamCalendar verifications={verifications} memberCount={memberCount} />
        </div>
      </section>

      {/* 5. 진행 중인 개별 도전 목록 */}
      <section className="px-6 mb-10">
        <div className="flex justify-between items-center mb-4 px-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-800">진행 중인 도전</h3>
            <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-md font-bold">
              {challenges.length}
            </span>
          </div>
          <Link href={`/groups/${group.id}/challenges/new`} className="text-xs font-bold text-blue-600 hover:underline">
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
          <div className="text-center py-12 bg-white rounded-[32px] border border-dashed border-gray-200">
            <p className="text-sm text-gray-400 font-medium">아직 등록된 도전이 없습니다.<br />새로운 도전을 시작해보세요! 🚀</p>
          </div>
        )}
      </section>

      {/* 6. 멤버들의 최근 인증샷 피드 */}
      <section className="px-6">
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 px-1 text-sm">최근 멤버 활동</h3>
          <VerificationFeed verifications={verifications} />
        </div>
      </section>
    </div>
  );
}