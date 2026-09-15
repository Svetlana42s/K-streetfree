/* ============================================
   ПОДКЛЮЧЕНИЕ К SUPABASE
   ============================================ */

const SUPABASE_URL = 'https://uebkfuyhnowjlzybcvji.supabase.co';
const SUPABASE_KEY = 'sb_publishable_p-4asuWrE72rgZuKvMBy9A_Iv7ZSR-w';

if (typeof supabase === 'undefined') {
  console.error('Библиотека Supabase не загружена. Проверь подключение CDN в HTML.');
}

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ============================================
   ЗАГРУЗКА ВСЕХ БЛЮД
   ============================================ */
async function loadDishes() {
  const { data, error } = await supabaseClient
    .from('dishes')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Ошибка загрузки меню:', error);
    return [];
  }
  return data || [];
}

/* ============================================
   ЗАГРУЗКА БЛЮД ПО КАТЕГОРИИ
   ============================================ */
async function loadDishesByCategory(category) {
  const { data, error } = await supabaseClient
    .from('dishes')
    .select('*')
    .eq('category', category)
    .order('id', { ascending: true });

  if (error) {
    console.error('Ошибка загрузки категории:', error);
    return [];
  }
  return data || [];
}

/* ============================================
   ЗАГРУЗКА ПОПУЛЯРНЫХ БЛЮД (is_popular = true)
   ============================================ */
async function loadPopularDishes() {
  const { data, error } = await supabaseClient
    .from('dishes')
    .select('*')
    .eq('is_popular', true)
    .order('id', { ascending: true });

  if (error) {
    console.error('Ошибка загрузки популярного:', error);
    return [];
  }
  return data || [];
}