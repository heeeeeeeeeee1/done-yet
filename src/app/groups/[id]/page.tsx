// src/app/groups/[id]/page.tsx
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import GroupDetailClient from '@/components/groups/GroupDetailClient';

export default async function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [groupRes, challengesRes, verificationsRes] = await Promise.all([
    supabase.from('groups').select('*').eq('id', id).single(),
    supabase.from('challenges').select('*').eq('group_id', id).order('created_at', { ascending: false }),
    // 해당 그룹에 속한 모든 챌린지의 인증샷을 가져옵니다.
    supabase
      .from('verifications')
      .select(`
        *,
        profiles (full_name),
        challenges (title)
      `)
      .in('challenge_id', (await supabase.from('challenges').select('id').eq('group_id', id)).data?.map(c => c.id) || [])
      .order('created_at', { ascending: false })
  ]);

  if (groupRes.error || !groupRes.data) return notFound();

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white pb-20">
      <GroupDetailClient 
        group={groupRes.data} 
        challenges={challengesRes.data || []} 
        verifications={verificationsRes.data || []} // 인증 데이터 전달
      />
    </div>
  );
}