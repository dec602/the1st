export const PRODUCT_CATEGORIES = [
  '디지털기기', '생활가전', '가구·인테리어', '유아동',
  '생활·식품', '스포츠·레저', '여성패션', '남성패션', '게임·취미',
  '반려동물', '식물', '개념노트',
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];

export const ALL_CATEGORIES = ['전체', ...PRODUCT_CATEGORIES] as const;

export const PREMIUM_CATEGORIES: readonly string[] = ['개념노트'];
