import { supabase } from '../supabase/client';

/**
 * Identifica el tipo de cuenta del usuario (gimnasio o tienda)
 * @param {string} userId - ID del usuario
 * @returns {Promise<{type: string, data: object}>} - Tipo de cuenta ('gym', 'shop' o 'none') y datos
 */
export const identifyAccountType = async (userId) => {
  if (!userId) return { type: 'none', data: null };

  try {
    // Verificar si es un gimnasio
    const { data: gymData } = await supabase
      .from('info_general_gym')
      .select('*')
      .eq('owner_id', userId)
      .single();

    if (gymData) {
      localStorage.setItem('accountType', "gym");
      return { type: 'gym', data: gymData };
    }

    // Verificar si es una tienda
    const { data: shopData } = await supabase
      .from('info_shops')
      .select('*')
      .eq('owner_id', userId)
      .single();

    if (shopData) {
      localStorage.setItem('accountType', "shop");
      return { type: 'shop', data: shopData };
    }

    return { type: 'none', data: null };
  } catch (error) {
    console.error('Error al identificar tipo de cuenta:', error);
    return { type: 'none', data: null };
  }
};