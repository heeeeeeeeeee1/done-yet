// src/app/profile/page.tsx
import { createClient } from '@/lib/supabase/server';
import MyCalendar from '@/components/calendar/MyCalendar';
import { LogoutButton } from '@/components/LogoutButton';
import Link from 'next/link';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div className="p-10 text-center">로그인이 필요합니다.</div>;

  // 속도 개선을 위한 병렬 호출 (Promise.all)
  // 개별적으로 await를 쓰지 않고 한 번에 호출하여 대기 시간을 1/3로 줄입니다.
  const [verificationsRes, groupsRes, challengesRes] = await Promise.all([
    // 내 모든 인증 내역 (달력용)
    supabase
      .from('verifications')
      .select('*')
      .eq('user_id', user.id),

    // 내가 참여 중인 그룹 목록
    supabase
      .from('group_members')
      .select('groups(*)')
      .eq('user_id', user.id),

    // 내가 생성한 도전 목록 (개별 목표 중심)
    supabase
      .from('challenges')
      .select('*, groups(name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
  ]);

  const verifications = verificationsRes.data || [];
  const myGroups = groupsRes.data || [];
  const myChallenges = challengesRes.data || [];

  return (
    <div className="flex flex-col min-h-screen p-6 pb-32 gap-8 bg-gray-50 max-w-md mx-auto">
      {/* 헤더 섹션 */}
      <header className="flex justify-between items-end pt-4">
        <div>
          <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mb-1">My Dashboard</p>
          <h1 className="text-2xl font-black text-gray-900">마이페이지</h1>
        </div>
        <LogoutButton />
      </header>

      {/* 1. 내 도전 달력 (성실도 확인) */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-black text-gray-800 text-sm">나의 도전 달력</h3>
          <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            누적 {verifications.length}회 성공
          </span>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
          <MyCalendar verifications={verifications} />
        </div>
      </section>

      {/* 2. 참여 중인 그룹 목록 */}
      <section className="space-y-4">
        <h3 className="font-black text-gray-800 text-sm px-1">참여 중인 그룹</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {myGroups.length ? (
            myGroups.map((item: any) => (
              <Link
                key={item.groups.id}
                href={`/groups/${item.groups.id}`}
                className="flex-shrink-0 w-32 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-95 transition-transform"
              >
                <div className="w-10 h-10 bg-blue-50 rounded-xl mb-3 flex items-center justify-center text-lg shadow-inner">🏠</div>
                <p className="text-xs font-bold text-gray-800 truncate">{item.groups.name}</p>
                <p className="text-[9px] text-gray-400 mt-1 font-medium">그룹 바로가기</p>
              </Link>
            ))
          ) : (
            <div className="w-full py-8 bg-white rounded-2xl border border-dashed border-gray-200 text-center">
              <p className="text-[11px] text-gray-400 font-medium font-black">참여 중인 그룹이 없습니다.</p>
            </div>
          )}
        </div>
      </section>

      {/* 3. 내 도전 목록 (개별 목표 중심) */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-black text-gray-800 text-sm">진행 중인 나의 도전</h3>
        </div>
        <div className="space-y-3">
          {myChallenges.length ? (
            myChallenges.map((challenge) => (
              <Link
                key={challenge.id}
                href={`/groups/${challenge.group_id}`}
                className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center active:scale-[0.98] transition-transform block"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] text-blue-500 font-black mb-1 px-1.5 py-0.5 bg-blue-50 rounded w-fit uppercase">
                    {challenge.groups?.name}
                  </p>
                  <h4 className="font-bold text-gray-800 truncate pr-4">{challenge.title}</h4>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[11px] font-black text-gray-900 bg-gray-100 px-2 py-1 rounded-lg">
                    주 {challenge.weekly_target}회
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <div className="py-12 bg-white rounded-2xl border border-dashed border-gray-200 text-center">
              <p className="text-xs text-gray-400 font-black">등록된 개인 도전이 없습니다.</p>
              <p className="text-[10px] text-gray-300 mt-1">그룹에 접속해 새로운 도전을 시작해보세요!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}