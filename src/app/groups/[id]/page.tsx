// src/app/groups/[id]/page.tsx
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import GroupDetailClient from '@/components/groups/GroupDetailClient';

export default async function GroupDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  // URL의 [id]값(UUID)을 이용해 DB에서 그룹 정보를 가져옵니다.
  const { data: group, error } = await supabase
    .from('groups')
    .select('*')
    .eq('id', params.id)
    .single();

  // 그룹이 없거나 에러가 나면 404 페이지로 보냅니다.
  if (error || !group) {
    return notFound();
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white">
      {/* 실제 UI는 클라이언트 컴포넌트에서 처리합니다. */}
      <GroupDetailClient group={group} />
    </div>
  );
}