// src/components/groups/GroupDetailClient.tsx
'use client';

import BackButton from '@/components/common/BackButton';

export default function GroupDetailClient({ group }: { group: any }) {
  
  // 초대 코드 복사 함수
  const handleCopyCode = () => {
    if (group.invite_code) {
      navigator.clipboard.writeText(group.invite_code);
      alert('초대 코드가 복사되었습니다! 친구들에게 공유하세요. 🥊');
    }
  };

  return (
    <div className="p-6 flex flex-col gap-8">
      {/* 헤더 부분 */}
      <header className="flex items-center gap-2">
        <BackButton />
        <h1 className="text-xl font-bold">그룹 상세</h1>
      </header>

      {/* 그룹 이름 카드 */}
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
        <h2 className="text-2xl font-black text-gray-900 mb-1">{group.name}</h2>
        <p className="text-sm text-gray-400">그룹이 생성되었습니다.</p>
      </div>

      {/* 초대 코드 섹션 */}
      <section className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
        <p className="text-sm text-blue-600 mb-3 font-bold text-center">우리 그룹 초대 코드</p>
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-blue-200">
          <code className="text-xl font-mono font-black tracking-widest text-blue-700">
            {group.invite_code || 'CODE123'}
          </code>
          <button 
            onClick={handleCopyCode}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold active:scale-95 transition-transform"
          >
            복사
          </button>
        </div>
      </section>

      {/* 챌린지 시작 버튼 (다음 단계) */}
      <div className="mt-auto pt-10 flex flex-col gap-4">
        <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-colors">
          새로운 챌린지 만들기
        </button>
        <p className="text-center text-xs text-gray-400">
          아직 진행 중인 챌린지가 없습니다. 🥊
        </p>
      </div>
    </div>
  );
}