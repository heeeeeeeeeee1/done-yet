'use client';

export default function VerificationFeed({ verifications }: { verifications: any[] }) {
  if (!verifications || verifications.length === 0) {
    return (
      <div className="py-20 text-center bg-gray-50 rounded-3xl">
        <p className="text-gray-400 text-sm">아직 인증샷이 없어요. 🥊</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 w-full">
      {verifications.map((v, index) => (
        <div key={v.id} className="flex flex-col gap-3 border-b pb-10 last:border-0 w-full">
          {/* 유저 정보 */}
          <div className="flex items-center justify-between text-sm px-1">
            <span className="font-bold text-gray-700">👤 {v.users?.nickname || '멤버'}</span>
            <span className="text-gray-400 text-[10px]">
              {new Date(v.created_at).toLocaleDateString()}
            </span>
          </div>

          {/* ✅ 에러 및 잘림 해결 핵심 구역 */}
          <div className="w-full rounded-2xl overflow-hidden shadow-sm bg-white border border-gray-100">
            <img
              // 1. 에러 해결: render/image를 object/public으로 바꾸고 뒤에 붙은 } 제거
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/${v.image_url}`}
              alt="인증샷"
              // 2. 잘림 해결: w-full과 h-auto를 써야 원본 비율대로 보입니다.
              className="w-full h-auto block"
              loading={index === 0 ? "eager" : "lazy"}
            />
          </div>

          {/* 인증 내용 */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <p className="text-[11px] font-bold text-blue-600 mb-1">
              {v.challenges?.title ? `#${v.challenges.title}` : '#오늘의인증'}
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {v.description || '오늘도 숙제 완료! 🔥'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}