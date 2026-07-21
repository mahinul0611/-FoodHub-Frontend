import { api, asArray } from "./api";
import type { Category, Meal } from "./types";

/**
 * Loads categories from the API. The category list endpoint lives under
 * `/admin/category`; if it is not accessible for the current user, fall back
 * to the category objects embedded in the public meals list so browsing and
 * filtering still work.
 */
export async function loadCategories(): Promise<Category[]> {
 for (const endpoint of ["/category", "/admin/category"]) {
    try {
      const payload = await api.get(endpoint);
      const categories = asArray<Category>(payload).filter(
        (c) => c && typeof c.id === "string" && typeof c.name === "string",
      );
      if (categories.length > 0) return categories;
    }catch {
    // Fall through to the meals-based fallback below.
  }

  try {
    const meals = asArray<Meal>(await api.get("/meals/"));
    const map = new Map<string, Category>();
    for (const meal of meals) {
      const category = meal.category;
      if (
        category &&
        typeof category.id === "string" &&
        typeof category.name === "string" &&
        !map.has(category.id)
      ) {
        map.set(category.id, category);
      }
    }
    return Array.from(map.values());
  } catch {
    return [];
  }
}
}
