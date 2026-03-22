// src/app/profile/page.tsx
import { createClient } from '@/lib/supabase/server';
import MyCalendar from '@/components/calendar/MyCalendar';
import { LogoutButton } from '@/components/LogoutButton';
import Link from 'next/link';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div className="p-10 text-center">로그인이 필요합니다.</div>;

  // 1. 내 모든 인증 내역 (달력용)
  const { data: verifications } = await supabase
    .from('verifications')
    .select('*')
    .eq('user_id', user.id);

  // 2. 내가 참여 중인 그룹 목록
  const { data: myGroups } = await supabase
    .from('group_members')
    .select('groups(*)')
    .eq('user_id', user.id);

  // 3. 내가 생성한 도전 목록
  const { data: myChallenges } = await supabase
    .from('challenges')
    .select('*, groups(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="flex flex-col min-h-screen p-6 pb-32 gap-8 bg-gray-50">
      {/* 헤더 섹션 */}
      <header className="flex justify-between items-end">
        <div>
          <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mb-1">My Dashboard</p>
          <h1 className="text-2xl font-black text-gray-900">마이페이지</h1>
        </div>
        <LogoutButton />
      </header>

      {/* 상단: 내 도전 달력 (나의 성실도 확인) */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-black text-gray-800">나의 도전 달력</h3>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            누적 {verifications?.length || 0}회 성공
          </span>
        </div>
        <MyCalendar verifications={verifications || []} />
      </section>

      {/* 중간: 참여 중인 그룹 목록 */}
      <section className="space-y-4">
        <h3 className="font-black text-gray-800 px-1">참여 중인 그룹</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {myGroups?.length ? (
            myGroups.map((item: any) => (
              <Link 
                key={item.groups.id} 
                href={`/groups/${item.groups.id}`}
                className="flex-shrink-0 w-32 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-xl mb-3 flex items-center justify-center text-lg">🏠</div>
                <p className="text-sm font-bold text-gray-800 truncate">{item.groups.name}</p>
              </Link>
            ))
          ) : (
            <p className="text-xs text-gray-400 p-4">참여 중인 그룹이 없습니다.</p>
          )}
        </div>
      </section>

      {/* 하단: 내 도전 목록 */}
      <section className="space-y-4">
        <h3 className="font-black text-gray-800 px-1">진행 중인 나의 도전</h3>
        <div className="space-y-3">
          {myChallenges?.length ? (
            myChallenges.map((challenge) => (
              <div key={challenge.id} className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold mb-1">{challenge.groups?.name}</p>
                  <h4 className="font-bold text-gray-800">{challenge.title}</h4>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-blue-600">주 {challenge.weekly_target}회 목표</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-400 p-4">등록된 도전이 없습니다.</p>
          )}
        </div>
      </section>
    </div>
  );
}