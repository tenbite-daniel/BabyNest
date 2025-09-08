export type BabySize = { weekFrom: number; weekTo: number; title: string; emoji: string };

export const BABY_SIZES: BabySize[] = [
  { weekFrom: 4,  weekTo: 4,  title: "Poppy Seed",     emoji: "🟤" },
  { weekFrom: 5,  weekTo: 5,  title: "Sesame Seed",    emoji: "⚪" },
  { weekFrom: 6,  weekTo: 6,  title: "Lentil",         emoji: "🟤" },
  { weekFrom: 7,  weekTo: 7,  title: "Blueberry",      emoji: "🫐" },
  { weekFrom: 8,  weekTo: 8,  title: "Raspberry",      emoji: "🍓" },
  { weekFrom: 9,  weekTo: 9,  title: "Cherry",         emoji: "🍒" },
  { weekFrom: 10, weekTo: 10, title: "Strawberry",     emoji: "🍓" },
  { weekFrom: 11, weekTo: 11, title: "Lime",           emoji: "🍈" },
  { weekFrom: 12, weekTo: 12, title: "Plum",           emoji: "🟣" },
  { weekFrom: 13, weekTo: 13, title: "Peach",          emoji: "🍑" },
  { weekFrom: 14, weekTo: 14, title: "Lemon",          emoji: "🍋" },
  { weekFrom: 15, weekTo: 15, title: "Apple",          emoji: "🍎" },
  { weekFrom: 16, weekTo: 16, title: "Avocado",        emoji: "🥑" },
  { weekFrom: 17, weekTo: 17, title: "Pear",           emoji: "🍐" },
  { weekFrom: 18, weekTo: 18, title: "Bell Pepper",    emoji: "🫑" },
  { weekFrom: 19, weekTo: 19, title: "Tomato",         emoji: "🍅" },
  { weekFrom: 20, weekTo: 20, title: "Banana",         emoji: "🍌" },
  { weekFrom: 21, weekTo: 21, title: "Carrot",         emoji: "🥕" },
  { weekFrom: 22, weekTo: 22, title: "Papaya",         emoji: "🟠" },
  { weekFrom: 23, weekTo: 23, title: "Grapefruit",     emoji: "🍊" },
  { weekFrom: 24, weekTo: 24, title: "Corn",           emoji: "🌽" },
  { weekFrom: 25, weekTo: 25, title: "Turnip",         emoji: "⚪" },
  { weekFrom: 26, weekTo: 26, title: "Zucchini",       emoji: "🟢" },
  { weekFrom: 27, weekTo: 27, title: "Cauliflower",    emoji: "🥦" },
  { weekFrom: 28, weekTo: 28, title: "Eggplant",       emoji: "🍆" },
  { weekFrom: 29, weekTo: 29, title: "Butternut",      emoji: "🎃" },
  { weekFrom: 30, weekTo: 30, title: "Cabbage",        emoji: "🥬" },
  { weekFrom: 31, weekTo: 31, title: "Coconut",        emoji: "🥥" },
  { weekFrom: 32, weekTo: 32, title: "Jicama",         emoji: "🤍" },
  { weekFrom: 33, weekTo: 33, title: "Pineapple",      emoji: "🍍" },
  { weekFrom: 34, weekTo: 34, title: "Honeydew",       emoji: "🍈" },
  { weekFrom: 35, weekTo: 35, title: "Spaghetti Squash", emoji: "🎃" },
  { weekFrom: 36, weekTo: 36, title: "Romaine Lettuce",  emoji: "🥬" },
  { weekFrom: 37, weekTo: 37, title: "Swiss Chard",      emoji: "🥬" },
  { weekFrom: 38, weekTo: 38, title: "Leek",             emoji: "🧅" },
  { weekFrom: 39, weekTo: 39, title: "Watermelon",       emoji: "🍉" },
  { weekFrom: 40, weekTo: 42, title: "Pumpkin",          emoji: "🎃" },
];

export function getBabySize(week: number) {
  const found = BABY_SIZES.find(s => week >= s.weekFrom && week <= s.weekTo);
  return found ?? { weekFrom: week, weekTo: week, title: "Little One", emoji: "👶" };
}
