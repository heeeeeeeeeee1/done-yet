// src/components/common/GlobalNudgePopup.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerStrongVibration } from '@/lib/native-bridge';

// ✅ 랜덤 애니메이션 타입
type AnimationType = 'eyes' | 'bounce' | 'shake' | 'zoom';

export default function GlobalNudgePopup() {
  const supabase = createClient();
  const [nudge, setNudge] = useState<{ sender: string; type: AnimationType } | null>(null);

  const getRandomType = (): AnimationType => {
    const types: AnimationType[] = ['eyes', 'bounce', 'shake', 'zoom'];
    return types[Math.floor(Math.random() * types.length)];
  };

  useEffect(() => {
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: groups } = await supabase.from('group_members').select('group_id').eq('user_id', user.id);
      if (!groups) return;

      groups.forEach(({ group_id }) => {
        supabase.channel(`group-changes-${group_id}`)
          .on('broadcast', { event: 'nudge_event' }, ({ payload }) => {
            if (payload.targetUserId === user.id) {
              // ✅ 1. 재촉 시 기존 팝업 제거 후 새 랜덤 애니메이션으로 교체
              setNudge(null);
              setTimeout(() => {
                setNudge({ sender: payload.senderNickname, type: getRandomType() });
                triggerStrongVibration(); // 앱 측에 진동 요청
              }, 50);
            }
          }).subscribe();
      });
    };

    setupSubscription();
  }, []);

  // ✅ 3. 랜덤 애니메이션 정의
  const variants = {
    eyes: { rotate: [0, -20, 20, -20, 0], transition: { repeat: Infinity, duration: 0.5 } },
    bounce: { y: [0, -40, 0], transition: { repeat: Infinity, duration: 0.4 } },
    shake: { x: [-5, 5, -5, 5, 0], transition: { repeat: Infinity, duration: 0.2 } },
    zoom: { scale: [1, 1.3, 1], transition: { repeat: Infinity, duration: 0.6 } }
  };

  return (
    <AnimatePresence mode="wait">
      {nudge && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
          onClick={() => setNudge(null)} // 클릭 시 즉시 닫기
        >
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-[40px] p-10 flex flex-col items-center gap-6 shadow-2xl border-4 border-yellow-400 max-w-xs w-full relative overflow-hidden"
          >
            <motion.div animate={variants[nudge.type]} className="text-8xl">
              {nudge.type === 'eyes' ? '👀' : nudge.type === 'bounce' ? '👁️' : nudge.type === 'shake' ? '👻' : '📢'}
            </motion.div>

            <div className="text-center">
              <h2 className="text-2xl font-black text-gray-900">{nudge.sender}님이</h2>
              <p className="text-gray-500 font-bold mt-1">빨리 하라고 재촉 중! 🥊</p>
            </div>

            {/* ✅ 1. 하단 3초 게이지 바 (시각적으로 사라짐 예고) */}
            <div className="absolute bottom-0 left-0 h-2 bg-gray-100 w-full">
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: 0 }}
                transition={{ duration: 3, ease: "linear" }}
                onAnimationComplete={() => setNudge(null)}
                className="h-full bg-yellow-400"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}