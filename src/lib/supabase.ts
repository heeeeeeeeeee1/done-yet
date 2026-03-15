import { createClient } from '@supabase/supabase-js';

// .env.local에 저장한 정보를 가져옵니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 이제 이 'supabase'라는 변수가 우리 앱의 리모컨이 됩니다.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);