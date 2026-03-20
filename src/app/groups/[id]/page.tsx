// src/app/groups/[id]/page.tsx
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import GroupDetailClient from '@/components/groups/GroupDetailClient';

export default async function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. 그룹 정보와 해당 그룹의 챌린지 목록을 동시에 가져옵니다.
  const [groupRes, challengesRes] = await Promise.all([
    supabase.from('groups').select('*').eq('id', id).single(),
    supabase.from('challenges').select('*').eq('group_id', id).order('created_at', { ascending: false })
  ]);

  if (groupRes.error || !groupRes.data) return notFound();

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white pb-20">
      {/* 2. 불러온 챌린지 데이터를 클라이언트 컴포넌트에 넘겨줍니다. */}
      <GroupDetailClient group={groupRes.data} challenges={challengesRes.data || []} />
    </div>
  );
}