// src/components/groups/GroupDetailClient.tsx
'use client';

import Link from 'next/link';
import BackButton from '@/components/common/BackButton';
import TeamCalendar from '@/components/calendar/TeamCalendar';

interface GroupDetailProps {
  group: any;
  challenges: any[];
  verifications: any[];
  memberCount: number;
}

export default function GroupDetailClient({ 
  group, 
  challenges, 
  verifications, 
  memberCount 
}: GroupDetailProps) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 상단 헤더 및 그룹 정보 */}
      <div className="p-6 pb-0">
        <header className="flex items-center gap-2 mb-6">
          <BackButton />
          <h1 className="text-xl font-black italic uppercase tracking-tighter">Group Details</h1>
        </header>

        <div className="mb-8">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-3xl font-black text-gray-900 leading-tight">
              {group.name}
            </h2>
            <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase">
              Active
            </span>
          </div>
          <p className="text-gray-500 text-sm font-medium leading-relaxed">
            {group.description || "함께 도전하고 성취하는 즐거움을 느껴보세요!"}
          </p>
        </div>
      </div>

      {/* 3번 기능: 팀 현황 달력 섹션 */}
      <section className="px-6 mb-10">
        <div className="flex justify-between items-end mb-4 px-1">
          <h3 className="font-bold text-gray-800">이번 주 팀 도전 현황</h3>
        </div>
        <TeamCalendar 
          verifications={verifications} 
          memberCount={memberCount} 
        />
      </section>

      {/* 진행 중인 도전 목록 섹션 */}
      <section className="px-6 mb-10">
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="font-bold text-gray-800">진행 중인 도전</h3>
          <Link 
            href={`/groups/${group.id}/challenges/new`}
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            + 새 도전 만들기
          </Link>
        </div>
        
        <div className="space-y-3">
          {challenges.length > 0 ? (
            challenges.map((challenge) => (
              <div key={challenge.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-gray-800">{challenge.title}</h4>
                  <p className="text-[10px] text-gray-400 font-bold mt-1">
                    목표: 주 {challenge.weekly_target}회
                  </p>
                </div>
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm text-lg">
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

      {/* 실시간 인증 피드 섹션 */}
      <section className="px-6 pb-24">
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="font-bold text-gray-800">최근 인증 피드</h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {verifications.length > 0 ? (
            verifications.map((v) => (
              <div key={v.id} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                {/* 이미지가 있다면 여기에 배치 (현재는 아이콘 대체) */}
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex-shrink-0 flex items-center justify-center text-xl">
                  📸
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-blue-600 font-black mb-0.5 truncate">
                    {v.challenges?.title || '도전 인증'}
                  </p>
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {v.profiles?.full_name || '익명의 멤버'}
                  </p>
                </div>
                <span className="text-[10px] font-bold text-gray-300">
                  {v.proof_date}
                </span>
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-gray-400 py-10 font-medium">
              첫 번째 인증샷의 주인공이 되어보세요!
            </p>
          )}
        </div>
      </section>
    </div>
  );
}