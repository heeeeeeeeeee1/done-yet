// src/components/profile/ProfileContent.tsx
import { createClient } from '@/lib/supabase/server';
import MyCalendar from '@/components/calendar/MyCalendar';
import Link from 'next/link';

export default async function ProfileContent({ userId }: { userId: string }) {
  const supabase = await createClient();

  // 1단계: 데이터 다이어트 - 최근 2개월치 데이터만 조회
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
  const dateLimit = twoMonthsAgo.toISOString();

  // ✅ 2단계: select('*') 대신 필요한 컬럼만 명시 (성능 개선의 핵심)
  const [verificationsRes, groupsRes, challengesRes] = await Promise.all([
    // 캘린더 점 표시에 필요한 최소 데이터만 조회
    supabase
      .from('verifications')
      .select('id, proof_date')
      .eq('user_id', userId)
      .gte('created_at', dateLimit),

    // 참여 중인 그룹의 ID와 이름만 조회
    supabase
      .from('group_members')
      .select('groups(id, name)')
      .eq('user_id', userId),

    // 진행 중인 도전 정보 (최근 10개로 제한)
    supabase
      .from('challenges')
      .select('id, title, weekly_target, group_id, groups(name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)
  ]);

  const verifications = verificationsRes.data || [];
  const myGroups = groupsRes.data || [];
  const myChallenges = challengesRes.data || [];

  return (
    <div className="flex flex-col gap-8 p-6 pt-0">
      {/* 1. 나의 도전 달력 섹션 */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-black text-gray-800 text-sm">나의 도전 달력</h3>
          <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            최근 2개월 {verifications.length}회 성공
          </span>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
          <MyCalendar verifications={verifications} />
        </div>
      </section>

      {/* 2. 참여 중인 그룹 목록 섹션 */}
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
              <p className="text-[11px] text-gray-400 font-black">참여 중인 그룹이 없습니다.</p>
            </div>
          )}
        </div>
      </section>

      {/* 3. 진행 중인 나의 도전 섹션 */}
      <section className="space-y-4">
        <h3 className="font-black text-gray-800 text-sm px-1">진행 중인 나의 도전</h3>
        <div className="space-y-3">
          {myChallenges.length ? (
            myChallenges.map((challenge: any) => (
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
            </div>
          )}
        </div>
      </section>
    </div>
  );
}