'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function NativeBridge() {
  const supabase = createClient();

  useEffect(() => {
    // 1. 앱에서 푸시 토큰을 전달하기 위한 전역 함수 등록
    window.setPushToken = async (token: string) => {
      console.log('Received push token from native app:', token);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // 프로필 테이블(profiles)에 푸시 토큰 저장
        // (profiles 테이블에 push_token 컬럼이 있다고 가정)
        const { error } = await supabase
          .from('profiles')
          .update({ push_token: token })
          .eq('id', user.id);

        if (error) {
          console.error('Error saving push token:', error);
        } else {
          console.log('Push token saved successfully.');
        }
      }
    };

    // 2. 앱 측에 웹뷰 로드 완료를 알림 (필요 시 토큰 요청)
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'WEBVIEW_READY' }));
    }

    return () => {
      delete window.setPushToken;
    };
  }, [supabase]);

  return null; // UI는 없는 유틸리티 컴포넌트
}
