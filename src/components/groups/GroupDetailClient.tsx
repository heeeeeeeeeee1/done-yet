'use client';

import Link from 'next/link';
import TeamCalendar from '@/components/calendar/TeamCalendar';
import GroupHeader from './GroupHeader';
import VerificationFeed from './VerificationFeed';
import { useGroupActions } from '@/hooks/useGroupActions';

export default function GroupDetailClient({ group, challenges, verifications, memberCount, isOwner, currentUserId }: any) {
  const { handleUpdateGroup, handleDeleteGroup, handleLeaveGroup, handleDeleteChallenge } = useGroupActions(group, currentUserId);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <GroupHeader group={group} isOwner={isOwner} onUpdate={handleUpdateGroup} onDelete={handleDeleteGroup} onLeave={handleLeaveGroup} />

      {/* 달력 섹션 */}
      <section className="px-6 mb-10">
        <TeamCalendar verifications={verifications} memberCount={memberCount} />
      </section>

      {/* 도전 목록 섹션 */}
      <section className="px-6 mb-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800">진행 중인 도전</h3>
          <Link href={`/groups/${group.id}/challenges/new`} className="text-xs font-bold text-blue-600">+ 새 도전</Link>
        </div>
        <div className="space-y-3">
          {challenges.map((c: any) => (
            <div key={c.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center">
              <div className="flex-1">
                <h4 className="font-bold text-gray-800">{c.title}</h4>
                <div className="flex gap-3 mt-1 text-[10px] font-bold">
                  <span className="text-gray-400">목표: 주 {c.weekly_target}회</span>
                  {(isOwner || c.user_id === currentUserId) && (
                    <button onClick={() => handleDeleteChallenge(c.id)} className="text-red-400 underline">삭제</button>
                  )}
                </div>
              </div>
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">🔥</div>
            </div>
          ))}
        </div>
      </section>

      {/* 피드 섹션 */}
      <section className="px-6 pb-24">
        <h3 className="font-bold text-gray-800 mb-4">최근 인증 피드</h3>
        <VerificationFeed verifications={verifications} />
      </section>
    </div>
  );
}