// src/components/common/GlobalNudgePopup.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

export default function GlobalNudgePopup() {
  const supabase = createClient();
  const [nudgeData, setNudgeData] = useState<{ sender: string } | null>(null);

  useEffect(() => {
    let activeChannels: any[] = [];

    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. 기존 코드의 로직: 내가 참여 중인 그룹들 가져오기
      const { data: groups } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);

      if (!groups || groups.length === 0) return;

      // 2. 기존 코드의 로직: 각 그룹 채널 구독
      groups.forEach(({ group_id }) => {
        const channel = supabase.channel(`group-changes-${group_id}`)
          .on('broadcast', { event: 'nudge_event' }, ({ payload }) => {
            if (payload.targetUserId === user.id) {

              // [진동] 그대로 유지
              if ('vibrate' in navigator) {
                navigator.vibrate([100, 50, 100, 50, 200]);
              }

              // [수정 포인트] toast 대신 상태값(state)을 업데이트해서 팝업을 켬
              setNudgeData({ sender: payload.senderNickname });

              // 4초 뒤 자동으로 팝업 닫기
              setTimeout(() => setNudgeData(null), 4000);
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

  return (
    <AnimatePresence>
      {nudgeData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setNudgeData(null)}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md p-6 cursor-pointer"
        >
          <motion.div
            initial={{ scale: 0.5, y: 100 }}
            animate={{
              scale: 1, y: 0,
              transition: { type: "spring", stiffness: 300, damping: 20 }
            }}
            exit={{ scale: 0.5, opacity: 0, y: 50 }}
            className="bg-white rounded-[40px] p-10 flex flex-col items-center gap-6 shadow-2xl border-4 border-yellow-400 max-w-xs w-full"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-8xl"
            >
              👀
            </motion.div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-black leading-tight">
                {nudgeData.sender}님이<br />지켜보고 있다!
              </h2>
              <p className="text-gray-500 font-bold text-sm">얼른 인증샷 안 올리냐! 🥊</p>
            </div>

            <p className="text-[10px] text-gray-400 font-medium">화면을 클릭하면 닫힙니다</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}