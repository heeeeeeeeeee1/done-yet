import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { targetUserId, senderNickname } = await req.json();

    if (!targetUserId || !senderNickname) {
      return NextResponse.json({ error: 'targetUserId, senderNickname 필요' }, { status: 400 });
    }

    const supabase = await createClient();

    // 인증 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: '인증 필요' }, { status: 401 });
    }

    // 대상 유저의 push_token 조회
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('push_token')
      .eq('id', targetUserId)
      .single();

    if (error || !profile?.push_token) {
      // push_token 없으면 조용히 성공 처리 (웹 유저거나 앱 미설치)
      return NextResponse.json({ ok: true, sent: false, reason: 'no_push_token' });
    }

    // Expo Push API 호출
    const expoRes = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        to: profile.push_token,
        title: '🥊 빨리 하라고!!',
        body: `${senderNickname}님이 당신의 인증을 기다리고 있어요!`,
        sound: 'default',
        priority: 'high',
        data: { type: 'nudge', senderNickname },
      }),
    });

    if (!expoRes.ok) {
      const errBody = await expoRes.text();
      console.error('[nudge] Expo Push 실패:', errBody);
      return NextResponse.json({ error: 'Expo Push 실패' }, { status: 502 });
    }

    return NextResponse.json({ ok: true, sent: true });
  } catch (err) {
    console.error('[nudge] 서버 오류:', err);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
