import { buildApiUrl } from '../apiConfig';

const MINIO_IMAGE_BASE_URL = 'http://192.168.18.40:9000/laundry-photos';

/**
 * Parse Go sql.NullInt64
 */
const parseNullInt64 = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'object' && value.Valid === true) return value.Int64 ?? null;
  return null;
};

/**
 * Parse Go sql.NullString
 */
const parseNullString = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value.Valid === true) return value.String || null;
  return null;
};

/**
 * Parse Go sql.NullFloat64
 */
const parseNullFloat64 = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'object' && value.Valid === true) return value.Float64 ?? null;
  return null;
};

/**
 * Parse Go sql.NullTime
 */
const parseNullTime = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value.Valid === true) return value.Time || null;
  return null;
};

/**
 * Parse string (NOT NULL)
 */
const parseString = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value.Valid === true) return value.String || '';
  return String(value);
};

/**
 * Parse int64 (NOT NULL)
 */
const parseInt64 = (value) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'object' && value.Valid === true) return value.Int64 ?? 0;
  return 0;
};

/**
 * Normalize sortir akhir data dari Go format ke plain object
 */
const normalizeSortirAkhir = (rawData) => {
  return rawData.map(item => ({
    id_matched: parseNullInt64(item.id_matched),
    sortir_awal_photo_id: parseNullInt64(item.sortir_awal_photo_id),
    sortir_akhir_photo_id: parseInt64(item.sortir_akhir_photo_id),
    photo_awal: parseNullString(item.photo_awal),
    photo_akhir: parseString(item.photo_akhir),
    match_source: parseNullString(item.match_source),
    matched_at: parseNullTime(item.matched_at),
    similarity_score: parseNullFloat64(item.similarity_score),
    review_status: parseNullString(item.review_status),
    status: parseString(item.status)
  }));
};

// ========================================
// FETCH SORTIR AWAL
// ========================================
export const fetchSortirAwal = async (idProduksi) => {
  try {
    const sortirResponse = await fetch(buildApiUrl(`/ai-sortir/sortir-awal/${idProduksi}`));
    if (!sortirResponse.ok) throw new Error('Gagal mengambil data sortir awal');
    const sortirData = await sortirResponse.json();
    const photos = Array.isArray(sortirData) ? sortirData : [];

    const detailResponse = await fetch(buildApiUrl(`/ai-sortir/produksi/${idProduksi}`));
    if (!detailResponse.ok) throw new Error('Gagal mengambil detail produksi');
    const detailData = await detailResponse.json();

    return { success: true, data: { id_produksi: parseInt(idProduksi), pelanggan: detailData || {}, sortir_awal: photos } };
  } catch (error) {
    console.error('[fetchSortirAwal] Error:', error);
    return { success: false, message: error.message, data: { id_produksi: parseInt(idProduksi), pelanggan: {}, sortir_awal: [] } };
  }
};

// ========================================
// ✅ FETCH SORTIR AKHIR (UPDATED - WRAPPER OBJECT)
// ========================================
export const fetchSortirAkhir = async (idProduksi) => {
  try {
    const url = buildApiUrl(`/ai-sortir/sortir-akhir/${idProduksi}`);
    console.log(`🔍 [fetchSortirAkhir] URL: ${url}`);
    
    const response = await fetch(url);
    console.log(`📡 [fetchSortirAkhir] Status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Gagal mengambil data sortir akhir`);
    }
    
    const responseData = await response.json();
    console.log(`📦 [fetchSortirAkhir] Response keys:`, Object.keys(responseData));
    
    // ✅ CEK: Apakah response wrapper object atau array langsung?
    let summary = null;
    let matches = [];
    
    if (responseData.summary && responseData.matches) {
      // ✅ FORMAT BARU: Wrapper object { summary: {...}, matches: [...] }
      console.log('✅ [fetchSortirAkhir] New wrapper format detected');
      summary = responseData.summary;
      matches = normalizeSortirAkhir(responseData.matches);
    } else if (Array.isArray(responseData)) {
      // 🔄 FORMAT LAMA: Array langsung (backward compatible)
      console.log('⚠️ [fetchSortirAkhir] Old array format detected');
      matches = normalizeSortirAkhir(responseData);
      summary = {
        id_produksi: parseInt(idProduksi),
        total_sortir_awal: 0,
        total_sortir_akhir: matches.length,
        total_matched: matches.filter(m => m.status === 'MATCHED').length,
        total_unmatched: matches.filter(m => m.status !== 'MATCHED').length,
        total_need_confirmation: 0,
        total_no_match: 0,
        progress_percent: 0,
        is_fully_completed: false
      };
    }
    
    console.log(`📊 [fetchSortirAkhir] Summary:`, summary);
    console.log(`📊 [fetchSortirAkhir] Matches: ${matches.length} items`);
    
    return { 
      success: true, 
      data: { 
        summary: summary,
        sortir_akhir: matches 
      } 
    };
    
  } catch (error) {
    console.error('❌ [fetchSortirAkhir] Error:', error);
    return { 
      success: true,
      data: { 
        summary: null,
        sortir_akhir: [] 
      } 
    };
  }
};

// ========================================
// FORMAT URL GAMBAR
// ========================================
export const getImageUrl = (photoPath) => {
  if (!photoPath) return null;
  if (photoPath.startsWith('http')) return photoPath;
  const cleanPath = photoPath.startsWith('/') ? photoPath.slice(1) : photoPath;
  return `${MINIO_IMAGE_BASE_URL}/${cleanPath}`;
};