// src/components/groups/GroupDetailClient.tsx
'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import BackButton from '@/components/common/BackButton';
import TeamCalendar from '@/components/calendar/TeamCalendar';

interface GroupDetailProps {
  group: any;
  challenges: any[];
  verifications: any[];
  memberCount: number;
  isOwner: boolean;
  currentUserId?: string;
}

export default function GroupDetailClient({ 
  group, 
  challenges, 
  verifications, 
  memberCount,
  isOwner,
  currentUserId
}: GroupDetailProps) {
  const router = useRouter();
  const supabase = createClient();

  // 1. 그룹 정보 수정 (이름)
  const handleUpdateGroup = async () => {
    const newName = prompt("새로운 그룹 이름을 입력하세요", group.name);
    if (!newName || newName === group.name) return;

    const { error } = await supabase
      .from('groups')
      .update({ name: newName })
      .eq('id', group.id);

    if (error) {
      alert("그룹 수정에 실패했습니다.");
    } else {
      alert("그룹 이름이 변경되었습니다.");
      router.refresh();
    }
  };

  // 2. 그룹 삭제
  const handleDeleteGroup = async () => {
    if (!confirm("정말로 그룹을 삭제하시겠습니까? 모든 챌린지와 인증 데이터가 영구 삭제됩니다.")) return;
    
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', group.id);

    if (error) {
      alert("그룹 삭제에 실패했습니다.");
    } else {
      alert("그룹이 삭제되었습니다.");
      router.push('/profile'); // 삭제 후 리디렉션할 페이지 (예: 그룹 목록 또는 프로필)
    }
  };

  // 3. 그룹 탈퇴
  const handleLeaveGroup = async () => {
    if (!confirm("그룹에서 탈퇴하시겠습니까?")) return;
    
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', group.id)
      .eq('user_id', currentUserId);

    if (error) {
      alert("탈퇴 처리 중 오류가 발생했습니다.");
    } else {
      alert("그룹에서 탈퇴되었습니다.");
      router.push('/groups');
    }
  };

  // 4. 목표(챌린지) 삭제
  const handleDeleteChallenge = async (challengeId: string) => {
    if (!confirm("이 목표를 삭제하시겠습니까? 관련 인증샷 데이터도 함께 사라집니다.")) return;
    
    const { error } = await supabase
      .from('challenges')
      .delete()
      .eq('id', challengeId);

    if (error) {
      alert(`삭제실패: ${error.message}`);
    } else {
      router.refresh();
    }
  };

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
            <div className="flex gap-2">
              {/* 권한에 따른 관리 버튼 노출 */}
              {isOwner ? (
                <>
                  <button onClick={handleUpdateGroup} className="text-[10px] font-bold text-gray-400 border border-gray-100 px-2 py-1 rounded-md">수정</button>
                  <button onClick={handleDeleteGroup} className="text-[10px] font-bold text-red-400 border border-red-50 px-2 py-1 rounded-md bg-red-50/30">삭제</button>
                </>
              ) : (
                <button onClick={handleLeaveGroup} className="text-[10px] font-bold text-gray-400 border border-gray-100 px-2 py-1 rounded-md">탈퇴</button>
              )}
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium leading-relaxed">
            {group.description || "함께 도전하고 성취하는 즐거움을 느껴보세요!"}
          </p>
        </div>
      </div>

      {/* 팀 현황 달력 섹션 */}
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
                <div className="flex-1 min-w-0 mr-4">
                  <h4 className="font-bold text-gray-800 truncate">{challenge.title}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-[10px] text-gray-400 font-bold">
                      목표: 주 {challenge.weekly_target}회
                    </p>
                   {/* 수정된 권한 로직: 방장이거나, 본인이 만든 챌린지일 때만 삭제 버튼 노출 */}
                    {(isOwner || challenge.user_id === currentUserId) && (
                      <button 
                        onClick={() => handleDeleteChallenge(challenge.id)}
                        className="text-[10px] text-red-400 font-bold hover:underline"
                      >
                        삭제
                      </button>
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

      {/* 실시간 인증 피드 섹션 */}
      <section className="px-6 pb-24">
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="font-bold text-gray-800">최근 인증 피드</h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {verifications.length > 0 ? (
            verifications.map((v) => (
              <div key={v.id} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex-shrink-0 overflow-hidden border border-blue-50">
                  <img 
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/${v.image_url}`}
                    className="w-full h-full object-cover"
                    alt="인증"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=📸'; 
                    }}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-blue-600 font-black mb-0.5 truncate uppercase">
                    #{v.challenges?.title || '도전 완료'}
                  </p>
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {v.users?.nickname || '익명의 멤버'}
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