'use client';

import Link from 'next/link';
import BackButton from '@/components/common/BackButton';
import VerificationFeed from './VerificationFeed';

interface GroupDetailProps {
  group: any;
  challenges: any[];
  verifications: any[];
}

export default function GroupDetailClient({ group, challenges, verifications }: GroupDetailProps) {
  
  const handleCopyCode = () => {
    if (group.invite_code) {
      navigator.clipboard.writeText(group.invite_code);
      alert('초대 코드가 복사되었습니다! 🥊');
    }
  };

  return (
    <div className="flex flex-col gap-8 p-6">
      {/* 1. 상단 네비게이션 */}
      <header className="flex items-center gap-2">
        <BackButton />
        <h1 className="text-xl font-bold">그룹 상세</h1>
      </header>

      {/* 2. 그룹 정보 카드 */}
      <div className="bg-gray-900 text-white p-6 rounded-3xl shadow-xl">
        <h2 className="text-2xl font-black mb-1">{group.name}</h2>
        <p className="text-gray-400 text-xs">함께라면 끝까지 할 수 있어요! 🔥</p>
      </div>

      {/* 3. 초대 코드 섹션 */}
      <section className="bg-blue-50 p-5 rounded-3xl border border-blue-100">
        <p className="text-[10px] text-blue-500 font-black mb-2 uppercase tracking-wider text-center">Invite Friends</p>
        <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-blue-200">
          <code className="text-lg font-mono font-black text-blue-700 tracking-widest pl-2">
            {group.invite_code}
          </code>
          <button 
            onClick={handleCopyCode}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
          >
            복사하기
          </button>
        </div>
      </section>

      {/* 4. 진행 중인 챌린지 (숙제) 목록 */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">진행 중인 챌린지</h3>
          <Link href={`/groups/${group.id}/challenges/new`} className="text-xs font-bold text-blue-600">
            + 새 숙제 추가
          </Link>
        </div>

        <div className="grid gap-3">
          {challenges && challenges.length > 0 ? (
            challenges.map((challenge) => (
              <div key={challenge.id} className="p-4 border border-gray-100 rounded-2xl bg-white shadow-sm flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-800 text-sm">{challenge.title}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">주 {challenge.weekly_target}회 인증 목표</p>
                </div>
                <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px] font-black">
                  ON AIR
                </div>
              </div>
            ))
          ) : (
            <Link 
              href={`/groups/${group.id}/challenges/new`}
              className="py-8 text-center border-2 border-dashed border-gray-100 rounded-3xl text-gray-400 text-sm hover:bg-gray-50 transition-colors"
            >
              등록된 숙제가 없어요. 첫 숙제를 만들어보세요!
            </Link>
          )}
        </div>
      </section>

      {/* 5. 실시간 인증 피드 (분리된 컴포넌트 호출) */}
      <section className="flex flex-col gap-5 pt-4">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          우리 팀 인증 현황 📸
        </h3>
        <VerificationFeed verifications={verifications} />
      </section>
    </div>
  );
}