import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import BackButton from '@/components/common/BackButton';

export default async function ProfilePage() {
  const supabase = await createClient();

  // 1. 유저 정보 가져오기
  const { data: { user } } = await supabase.auth.getUser();

  // 로그인이 안 되어 있으면 홈으로 보냅니다.
  if (!user) {
    redirect('/');
  }

  // 2. 내가 참여 중인 그룹 목록 가져오기 (group_members -> groups 조인)
  const { data: myGroups, error } = await supabase
    .from('group_members')
    .select(`
      group_id,
      groups (
        id,
        name,
        invite_code
      )
    `)
    .eq('user_id', user.id);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white p-6 pb-32">
      <header className="flex items-center gap-2 mb-8">
        <BackButton />
        <h1 className="text-xl font-bold">마이 페이지</h1>
      </header>

      {/* 유저 프로필 간략 정보 */}
      <section className="flex items-center gap-4 mb-10 p-4 bg-gray-50 rounded-2xl">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
          👤
        </div>
        <div>
          <p className="font-bold text-lg">{user.user_metadata?.full_name || '사용자'}님</p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </section>

      {/* 내 그룹 목록 */}
      <section className="space-y-4">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          내 그룹 목록 <span className="text-blue-500 text-sm">{myGroups?.length || 0}</span>
        </h3>
        
        <div className="grid gap-3">
          {myGroups && myGroups.length > 0 ? (
            myGroups.map((item: any) => (
              <Link 
                key={item.groups.id} 
                href={`/groups/${item.groups.id}`}
                className="block p-5 border rounded-2xl hover:border-blue-300 transition-all bg-white shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{item.groups.name}</p>
                    <p className="text-xs text-gray-400 mt-1">코드: {item.groups.invite_code}</p>
                  </div>
                  <span className="text-gray-300">→</span>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-2xl text-gray-400">
              <p className="text-sm">참여 중인 그룹이 없습니다. 🥊</p>
              <Link href="/groups/new" className="text-blue-500 font-bold text-xs mt-2 inline-block">
                새 그룹 만들기
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}