import { supabase } from "../supabase/client";

export async function ensureShopExists({ userId, gymNextPaymentDate } = {}) {
  if (!userId) return;

  const { data, error } = await supabase
    .from("info_shops")
    .select("owner_id")
    .eq("owner_id", userId);

  if (error) throw error;
  if (data?.length) return;

  const nextPaymentDate = gymNextPaymentDate ? new Date(gymNextPaymentDate) : new Date();
  if (!gymNextPaymentDate) nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

  const newShop = {
    owner_id: userId,
    shop_name: "DEFAULT_SHOP_NAME",
    address: "DEFAULT_ADDRESS",
    owner_name: "DEFAULT_OWNER_NAME",
    owner_phone: "DEFAULT_OWNER_PHONE",
    public_phone: "DEFAULT_PUBLIC_PHONE",
    next_payment_date: nextPaymentDate,
    active: null,
    state: "DEFAULT_STATE",
    city: "DEFAULT_CITY",
    schedules: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    },
    theme: true,
    image_profile: null,
  };

  const { error: insertError } = await supabase.from("info_shops").insert(newShop);
  if (insertError) throw insertError;
}

