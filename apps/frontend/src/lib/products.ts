import { supabase } from "./supabase";

export async function getProducts(categoryId?: string) {
  let query = supabase
    .from("products")
    .select(
      "id, name, base_price, product_img, vendor:vendors(name, shop_name), category:categories(cat_name)"
    );
  if (categoryId) query = query.eq("category_id", categoryId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function getProduct(id: string) {
  const { data, error } = await supabase
    .from("products")
    .select(
      "*, vendor:vendors(name, shop_name), category:categories(cat_name), variants:product_variants(*)"
    )
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}
