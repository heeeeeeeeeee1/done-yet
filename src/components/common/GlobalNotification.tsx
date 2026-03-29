// src/components/common/GlobalNotification.tsx
// GlobalNudgePopup과 같은 역할이라 삭제해도 될듯
'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function GlobalNotification() {
  const supabase = createClient();

  useEffect(() => {
    let activeChannels: any[] = [];

    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. 내가 참여 중인 모든 그룹 가져오기
      const { data: groups } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);

      if (!groups || groups.length === 0) return;

      // 2. 각 그룹의 채널 구독
      groups.forEach(({ group_id }) => {
        const channel = supabase.channel(`group-changes-${group_id}`)
          .on('broadcast', { event: 'nudge_event' }, ({ payload }) => {
            // 알림 대상이 '나'인 경우에만
            if (payload.targetUserId === user.id) {

              // 진동 (모바일)
              if ('vibrate' in navigator) {
                navigator.vibrate([100, 50, 100]);
              }

              // 전역 토스트 알림
              toast(`🔔 ${payload.senderNickname}님이 재촉했어요!`, {
                icon: '👀',
                duration: 3000,
                style: {
                  borderRadius: '24px',
                  background: '#1a1a1a',
                  color: '#fff',
                  fontWeight: '900',
                  fontSize: '14px',
                  padding: '16px 24px',
                },
              });
            }
          })
          .subscribe();

        activeChannels.push(channel);
      });
    };

    setupSubscription();

    return () => {
      activeChannels.forEach(ch => supabase.removeChannel(ch));
    };
  }, [supabase]);

  return null;
}