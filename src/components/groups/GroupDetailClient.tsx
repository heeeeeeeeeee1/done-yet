'use client';

import Link from 'next/link';
import BackButton from '@/components/common/BackButton';

// 1. props 타입을 { group: any; challenges: any[] }로 확장합니다.
export default function GroupDetailClient({ 
  group, 
  challenges 
}: { 
  group: any; 
  challenges: any[]; 
}) {
  
  const handleCopyCode = () => {
    if (group.invite_code) {
      navigator.clipboard.writeText(group.invite_code);
      alert('초대 코드가 복사되었습니다! 친구들에게 공유하세요. 🥊');
    }
  };

  return (
    <div className="p-6 flex flex-col gap-8">
      {/* 헤더 및 그룹 정보 섹션 (기존과 동일) */}
      <header className="flex items-center gap-2">
        <BackButton />
        <h1 className="text-xl font-bold">그룹 상세</h1>
      </header>

      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
        <h2 className="text-2xl font-black text-gray-900 mb-1">{group.name}</h2>
        <p className="text-sm text-gray-400">그룹이 생성되었습니다.</p>
      </div>

      {/* 초대 코드 섹션 (기존과 동일) */}
      <section className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
        <p className="text-sm text-blue-600 mb-3 font-bold text-center">우리 그룹 초대 코드</p>
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-blue-200">
          <code className="text-xl font-mono font-black tracking-widest text-blue-700">
            {group.invite_code || 'CODE123'}
          </code>
          <button 
            onClick={handleCopyCode}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold"
          >
            복사
          </button>
        </div>
      </section>

      {/* 2. 챌린지 목록 섹션: 하드코딩 대신 실제 데이터를 그립니다. */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">진행 중인 챌린지</h3>
          <Link href={`/groups/${group.id}/challenges/new`} className="text-xs font-bold text-blue-600">
            + 추가하기
          </Link>
        </div>

        {challenges && challenges.length > 0 ? (
          <div className="grid gap-3">
            {challenges.map((challenge) => (
              <div key={challenge.id} className="p-4 border rounded-xl bg-white shadow-sm flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-800">{challenge.title}</p>
                  <p className="text-xs text-gray-400">주 {challenge.weekly_target}회 목표</p>
                </div>
                <div className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-bold">
                  진행중
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center border-2 border-dashed border-gray-100 rounded-2xl">
            <p className="text-gray-400 text-sm mb-4">아직 등록된 숙제가 없어요.</p>
            <Link 
              href={`/groups/${group.id}/challenges/new`}
              className="inline-block bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-sm"
            >
              첫 번째 챌린지 만들기
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}