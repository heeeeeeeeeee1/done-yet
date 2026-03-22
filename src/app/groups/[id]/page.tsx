// src/app/groups/[id]/page.tsx
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import GroupDetailClient from '@/components/groups/GroupDetailClient';

export default async function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // 현재 유저 정보 가져오기
  const { data: { user } } = await supabase.auth.getUser();

  // 1. 챌린지 ID 목록 먼저 가져오기 (인증샷 필터링용)
  const { data: challengeIds } = await supabase.from('challenges').select('id').eq('group_id', id);
  const ids = challengeIds?.map(c => c.id) || [];

  // 2. 여러 데이터를 병렬로 호출
  const [groupRes, challengesRes, verificationsRes, memberCountRes] = await Promise.all([
    supabase.from('groups').select('*').eq('id', id).single(),
    supabase.from('challenges').select('*').eq('group_id', id).order('created_at', { ascending: false }),
    supabase
      .from('verifications')
      .select(`*, users (nickname), challenges (title)`)
      .in('challenge_id', ids)
      .order('created_at', { ascending: false }),
    // 멤버 수 추가
    supabase.from('group_members').select('*', { count: 'exact', head: true }).eq('group_id', id)
  ]);

  if (groupRes.error || !groupRes.data) return notFound();

  // 방장 여부 확인 (스키마의 owner_id와 현재 유저 id 비교)
  const isOwner = groupRes.data.owner_id === user?.id;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white pb-20">
      <GroupDetailClient 
        group={groupRes.data} 
        challenges={challengesRes.data || []} 
        verifications={verificationsRes.data || []}
        memberCount={memberCountRes.count || 0} // 멤버 수 전달
        isOwner={isOwner} // 추가
        currentUserId={user?.id} // 추가
      />
    </div>
  );
}