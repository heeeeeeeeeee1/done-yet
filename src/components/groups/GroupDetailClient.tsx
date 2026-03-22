// src/components/groups/GroupDetailClient.tsx
'use client';

import { useEffect } from 'react';
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
  challenges, 
  verifications, 
  memberCount,
  isOwner,
  currentUserId,
  currentUserNickname
}: GroupDetailProps) {
  const router = useRouter();
  const supabase = createClient();
  
  // 1. 훅 호출 시 닉네임 전달
  const groupActions = useGroupActions(group, currentUserId);
  const { handleUpdateChallenge, handleDeleteChallenge } = useChallengeActions(currentUserNickname);

  // 2. 실시간 브로드캐스트 수신 설정
  useEffect(() => {
    const channel = supabase
      .channel(`group-changes-${group.id}`, {
        config: { broadcast: { self: false } }
      })
      .on('broadcast', { event: 'challenge_event' }, ({ payload }) => {
        toast(`${payload.nickname} 님이 '${payload.title}' 목표를 ${payload.action}했습니다!`, {
          icon: payload.action === '수정' ? '🔄' : '🗑️',
        });
        router.refresh();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [group.id, supabase, router]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <GroupHeader 
        group={group} 
        isOwner={isOwner} 
        onUpdate={groupActions.handleUpdateGroup} 
        onDelete={groupActions.handleDeleteGroup} 
        onLeave={groupActions.handleLeaveGroup} 
      />

      <section className='px-2 mb-3'>
        <WeeklyProgressBanner 
          verifications={verifications} 
          currentUserId={currentUserId} 
          weeklyTarget={challenges[0]?.weekly_target ?? 3} // 기본값 3(데이터가 진짜 null이거나 undefined일 때만 3을 쓰겠다)
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
        
        <div className="space-y-3">
          {challenges.length > 0 ? (
            challenges.map((c) => (
              <div key={c.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center">
                <div className="flex-1 min-w-0 mr-4">
                  <h4 className="font-bold text-gray-800 truncate">{c.title}</h4>
                  <div className="flex items-center gap-3 mt-1 text-[10px] font-bold">
                    <span className="text-gray-400">목표: 주 {c.weekly_target}회</span>
                    
                    {(isOwner || c.user_id === currentUserId) && (
                      <div className="flex gap-2">
                        {/* handleUpdateChallenge에 (도전객체, 그룹ID) 전달 */}
                        <button 
                          onClick={() => handleUpdateChallenge(c, group.id)} 
                          className="text-blue-500 underline"
                        >
                          수정
                        </button>
                        {/* handleDeleteChallenge에 (도전ID, 그룹ID, 제목) 전달 */}
                        <button 
                          onClick={() => handleDeleteChallenge(c.id, group.id, c.title)} 
                          className="text-red-400 underline"
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm text-lg flex-shrink-0">
                  🔥
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-sm text-gray-400 font-medium">아직 등록된 도전이 없습니다.</p>
            </div>
          )}
        </div>
      </section>

      <section className="px-6 pb-24">
        <h3 className="font-bold text-gray-800 mb-4 px-1">최근 인증 피드</h3>
        <VerificationFeed verifications={verifications} />
      </section>
    </div>
  );
}