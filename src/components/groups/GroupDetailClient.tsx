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
// ✅ 새 컴포넌트 임포트
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

  // 마운트 시 최신 챌린지 목록 동기화
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

  // 실시간 브로드캐스트 리스너 (타 멤버 변경 감지)
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
    <div className="pb-20">
      {/* 1. 상단 네비게이션 및 설정 메뉴 */}
      <GroupHeader
        group={group}
        isOwner={isOwner}
        onLeave={groupActions.handleLeaveGroup}
        onDelete={groupActions.handleDeleteGroup}
      />

      {/* 2. 초대 코드 섹션 추가 (헤더 바로 아래 배치) */}
      <InviteCodeSection inviteCode={group.invite_code} />

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
        <TeamCalendar verifications={verifications} memberCount={memberCount} />
      </section>

      {/* 5. 진행 중인 개별 도전 목록 */}
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

      {/* 6. 멤버들의 최근 인증샷 피드 */}
      <section className="px-6">
        <h3 className="font-bold text-gray-800 mb-4 px-1">멤버 활동</h3>
        <VerificationFeed verifications={verifications} />
      </section>
    </div>
  );
}