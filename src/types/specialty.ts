export type SpecialtyCategory = {
  name: string;
  icon: string;
};

export const SPECIALTY_CATEGORIES: readonly SpecialtyCategory[] = [
  { name: "Anxiety", icon: "🧘" },
  { name: "Depression", icon: "🌧️" },
  { name: "ADHD", icon: "⚡" },
  { name: "Eating disorders", icon: "🍽️" },
  { name: "Chronic pain", icon: "💊" },
  { name: "Women's issues", icon: "👶" },
  { name: "Pediatrics", icon: "👶" },
  { name: "Substance", icon: "🚭" },
  { name: "Sleep", icon: "😴" },
  { name: "Coaching", icon: "🎯" },
] as const;

export type SpecialtyName = (typeof SPECIALTY_CATEGORIES)[number]["name"];
