// src/app/groups/[id]/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import GroupDetailClient from '@/components/groups/GroupDetailClient';

export default async function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. 현재 유저 및 프로필 정보
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('users')
    .select('nickname')
    .eq('id', user?.id)
    .single();

  // 2. 데이터 병렬 로드
  const [groupRes, challengesRes, verificationsRes, memberCountRes] = await Promise.all([
    supabase.from('groups').select('*').eq('id', id).single(),
    // ✅ 수정: users 테이블과 조인하여 nickname을 함께 가져옵니다.
    supabase
      .from('challenges')
      .select(`
        *,
        users (
          nickname
        )
      `)
      .eq('group_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('verifications')
      .select(`*, users (nickname), challenges (id, title)`)
      .order('created_at', { ascending: false }),
    supabase.from('group_members').select('*', { count: 'exact', head: true }).eq('group_id', id)
  ]);

  if (groupRes.error || !groupRes.data) return notFound();

  // 이 그룹에 속한 인증샷만 필터링
  const groupVerifications = (verificationsRes.data || []).filter((v: any) =>
    challengesRes.data?.some(c => c.id === v.challenge_id)
  );

  const isOwner = groupRes.data.owner_id === user?.id;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white pb-20">
      <GroupDetailClient
        group={groupRes.data}
        challenges={challengesRes.data || []}
        verifications={groupVerifications}
        memberCount={memberCountRes.count || 0}
        isOwner={isOwner}
        currentUserId={user?.id}
        currentUserNickname={profile?.nickname || '익명의 멤버'}
      />
    </div>
  );
}