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

export function importData(json) {
  let data;
  try {
    data = JSON.parse(json);
  } catch {
    throw new Error("This file is not valid JSON.");
  }

  // Accept the app's backup format, as well as a plain array of habits.
  const importedHabits = Array.isArray(data) ? data : data?.habits;
  if (!Array.isArray(importedHabits)) {
    throw new Error("The JSON file must contain a habits array.");
  }

  const ids = new Set();
  const habits = importedHabits.map((habit) => {
    if (!habit || typeof habit !== "object" || Array.isArray(habit)) {
      throw new Error("The file contains an invalid habit.");
    }
    if (habit.completedDates !== undefined &&
        (!Array.isArray(habit.completedDates) ||
         !habit.completedDates.every((date) => typeof date === "string"))) {
      throw new Error("A habit has invalid completion dates.");
    }
    if (habit.title !== undefined && typeof habit.title !== "string") {
      throw new Error("A habit has an invalid title.");
    }
    if (habit.name !== undefined && typeof habit.name !== "string") {
      throw new Error("A habit has an invalid name.");
    }

    const migrated = migrateHabit(habit);
    const category = CATEGORIES.includes(migrated.category) ? migrated.category : "Personal";
    let id = typeof migrated.id === "string" && migrated.id ? migrated.id : generateId();
    if (ids.has(id)) id = generateId();
    ids.add(id);

    return {
      id,
      title: typeof migrated.title === "string" && migrated.title.trim()
        ? migrated.title.trim()
        : "Untitled",
      category,
      color: typeof migrated.color === "string" && /^#[\da-f]{6}$/i.test(migrated.color)
        ? migrated.color
        : CATEGORY_COLORS[category],
      targetFrequency: typeof migrated.targetFrequency === "string"
        ? migrated.targetFrequency
        : "daily",
      createdDate: typeof migrated.createdDate === "string" ? migrated.createdDate : getDateKey(),
      completedDates: migrated.completedDates || [],
      archived: Boolean(migrated.archived),
      streakCount: 0,
    };
  });

  const theme = Array.isArray(data) ? "dark" : (data.theme ?? "dark");
  if (theme !== "dark" && theme !== "light") {
    throw new Error("The file contains an invalid theme setting.");
  }

  const importedPreferences = Array.isArray(data) ? {} : (data.preferences ?? {});
  if (!importedPreferences || typeof importedPreferences !== "object" || Array.isArray(importedPreferences)) {
    throw new Error("The file contains invalid preferences.");
  }
  const preferences = { ...DEFAULT_PREFERENCES, ...importedPreferences };
  if (typeof preferences.reminderTime !== "string" ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(preferences.reminderTime) ||
      typeof preferences.notificationsEnabled !== "boolean" ||
      typeof preferences.soundEnabled !== "boolean" ||
      !(preferences.lastReminderDate === null || typeof preferences.lastReminderDate === "string")) {
    throw new Error("The file contains invalid preferences.");
  }

  // Only persist after the whole file has passed validation.
  saveHabits(habits);
  saveTheme(theme);
  savePreferences(preferences);
  return { habits, theme, preferences };
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
