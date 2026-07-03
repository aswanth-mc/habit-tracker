import { getDateKey, parseDateKey, addDays } from "./dates.js";

export function getCurrentStreak(completedDates) {
  if (!completedDates || completedDates.length === 0) return 0;

  const sorted = [...completedDates].sort();
  const today = getDateKey();
  const yesterday = getDateKey(addDays(new Date(), -1));
  const lastDate = sorted[sorted.length - 1];

  if (lastDate !== today && lastDate !== yesterday) return 0;

  let streak = 0;
  let checkDate = lastDate === today ? today : yesterday;

  const dateSet = new Set(sorted);
  while (dateSet.has(checkDate)) {
    streak++;
    const d = parseDateKey(checkDate);
    checkDate = getDateKey(addDays(d, -1));
  }
  return streak;
}

export function getLongestStreak(completedDates) {
  if (!completedDates || completedDates.length === 0) return 0;

  const sorted = [...completedDates].sort();
  let longest = 1;
  let current = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = parseDateKey(sorted[i - 1]);
    const curr = parseDateKey(sorted[i]);
    const diff = (curr - prev) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else if (diff > 1) {
      current = 1;
    }
  }
  return longest;
}

export function getMissedDays(habit, windowDays = 30) {
  const today = new Date();
  const start = addDays(today, -(windowDays - 1));
  const created = parseDateKey(habit.createdDate);
  const effectiveStart = created > start ? created : start;

  let missed = 0;
  const completed = new Set(habit.completedDates || []);
  const d = new Date(effectiveStart);
  d.setHours(0, 0, 0, 0);
  const end = new Date(today);
  end.setHours(0, 0, 0, 0);

  while (d <= end) {
    if (!completed.has(getDateKey(d))) missed++;
    d.setDate(d.getDate() + 1);
  }
  return missed;
}

export function getConsistency(habit) {
  const today = new Date();
  const created = parseDateKey(habit.createdDate);
  const days = Math.max(1, Math.floor((today - created) / (1000 * 60 * 60 * 24)) + 1);
  const completed = (habit.completedDates || []).filter((d) => d >= habit.createdDate).length;
  return Math.round((completed / days) * 100);
}

export function recalculateAllStreaks(habits) {
  habits.forEach((habit) => {
    habit.streakCount = getCurrentStreak(habit.completedDates || []);
  });
  return habits;
}

export function getBestStreak(habits) {
  const active = habits.filter((h) => !h.archived);
  if (active.length === 0) return 0;
  return Math.max(...active.map((h) => h.streakCount || 0));
}

export function getOverallLongestStreak(habits) {
  const active = habits.filter((h) => !h.archived);
  if (active.length === 0) return 0;
  return Math.max(...active.map((h) => getLongestStreak(h.completedDates || [])));
}
