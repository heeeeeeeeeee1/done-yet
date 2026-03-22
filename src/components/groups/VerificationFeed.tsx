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
    <div className="grid gap-6">
      {verifications.map((v) => (
        <div key={v.id} className="flex flex-col gap-3 border-b pb-6 last:border-0">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold">👤 {v.users?.nickname || '멤버'}</span>
            <span className="text-gray-400 text-[10px]">
              {new Date(v.created_at).toLocaleDateString()}
            </span>
          </div>
          
          <div className="aspect-square rounded-2xl bg-gray-100 overflow-hidden shadow-inner">
            <img 
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/${v.image_url}`}
              className="w-full h-full object-cover"
              alt="인증샷"
            />
          </div>
          
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
            <p className="text-xs font-bold text-blue-600 mb-1">#{v.challenges?.title}</p>
            <p className="text-sm text-gray-700">{v.description || '오늘도 숙제 완료! 🔥'}</p>
          </div>
        </div>
      ))}
    </div>
  );
}