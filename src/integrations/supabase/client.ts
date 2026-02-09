import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

// Mengambil variabel dari environment vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validasi sederhana untuk memudahkan debugging
// Jika variabel ini tidak ada (undefined), aplikasi biasanya akan crash tanpa pesan yang jelas
if (!supabaseUrl || !supabaseKey) {
  console.error(
    "⚠️ KONFIGURASI SUPABASE HILANG: Pastikan Anda memiliki file .env dengan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY."
  );
}

// Gunakan fallback ke string kosong atau placeholder agar aplikasi tidak langsung crash saat load awal,
// sehingga Anda masih bisa melihat UI dan pesan error di console.
export const supabase = createClient<Database>(
  supabaseUrl || 'https://project-placeholder.supabase.co',
  supabaseKey || 'anon-key-placeholder'
);
