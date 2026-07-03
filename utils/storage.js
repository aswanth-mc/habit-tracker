import { getDateKey } from "./dates.js";
import { recalculateAllStreaks } from "./streaks.js";

export const CATEGORIES = ["Study", "Fitness", "Health", "Work", "Personal"];

export const CATEGORY_COLORS = {
  Study: "#8b5cf6",
  Fitness: "#22c55e",
  Health: "#06b6d4",
  Work: "#3b82f6",
  Personal: "#f59e0b",
};

const DEFAULT_PREFERENCES = {
  reminderTime: "09:00",
  notificationsEnabled: true,
  soundEnabled: true,
  lastReminderDate: null,
};

function generateId() {
  return crypto.randomUUID();
}

function migrateHabit(old) {
  if (old.title && old.id) return old;

  const today = getDateKey();
  const completedDates = [...(old.completedDates || [])];
  if (old.completed && !completedDates.includes(today)) {
    completedDates.push(today);
  }

  return {
    id: old.id || generateId(),
    title: old.title || old.name || "Untitled",
    category: old.category || "Personal",
    color: old.color || CATEGORY_COLORS[old.category] || CATEGORY_COLORS.Personal,
    targetFrequency: "daily",
    createdDate: old.createdDate || today,
    completedDates,
    archived: old.archived || false,
    streakCount: 0,
  };
}

export function loadHabits() {
  try {
    const raw = localStorage.getItem("habits");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const migrated = parsed.map(migrateHabit);
    return recalculateAllStreaks(migrated);
  } catch {
    return [];
  }
}

export function saveHabits(habits) {
  recalculateAllStreaks(habits);
  localStorage.setItem("habits", JSON.stringify(habits));
}

export function loadTheme() {
  return localStorage.getItem("theme") || "dark";
}

export function saveTheme(theme) {
  localStorage.setItem("theme", theme);
}

export function loadPreferences() {
  try {
    const raw = localStorage.getItem("preferences");
    if (!raw) return { ...DEFAULT_PREFERENCES };
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export function savePreferences(prefs) {
  localStorage.setItem("preferences", JSON.stringify(prefs));
}

export function exportData() {
  return JSON.stringify(
    {
      habits: loadHabits(),
      theme: loadTheme(),
      preferences: loadPreferences(),
      exportedAt: new Date().toISOString(),
    },
    null,
    2
  );
}

export function resetAll() {
  localStorage.removeItem("habits");
  localStorage.removeItem("theme");
  localStorage.removeItem("preferences");
}

export function createHabit({ title, category, color }) {
  return {
    id: generateId(),
    title,
    category,
    color: color || CATEGORY_COLORS[category] || CATEGORY_COLORS.Personal,
    targetFrequency: "daily",
    createdDate: getDateKey(),
    completedDates: [],
    archived: false,
    streakCount: 0,
  };
}
