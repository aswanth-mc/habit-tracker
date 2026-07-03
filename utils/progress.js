import { getDateKey, getStartOfWeek, getStartOfMonth, getDaysElapsedThisWeek, getDaysElapsedThisMonth } from "./dates.js";

export function getActiveHabits(habits) {
  return habits.filter((h) => !h.archived);
}

export function isCompletedToday(habit) {
  return (habit.completedDates || []).includes(getDateKey());
}

export function getDailyProgress(habits) {
  const active = getActiveHabits(habits);
  if (active.length === 0) return 0;
  const completed = active.filter(isCompletedToday).length;
  return Math.round((completed / active.length) * 100);
}

export function getWeeklyProgress(habits) {
  const active = getActiveHabits(habits);
  if (active.length === 0) return 0;

  const weekStart = getDateKey(getStartOfWeek());
  const daysElapsed = getDaysElapsedThisWeek();
  const totalExpected = active.length * daysElapsed;

  let completions = 0;
  active.forEach((habit) => {
    (habit.completedDates || []).forEach((d) => {
      if (d >= weekStart) completions++;
    });
  });

  return Math.round((completions / totalExpected) * 100);
}

export function getMonthlyProgress(habits) {
  const active = getActiveHabits(habits);
  if (active.length === 0) return 0;

  const monthStart = getDateKey(getStartOfMonth());
  const daysElapsed = getDaysElapsedThisMonth();
  const totalExpected = active.length * daysElapsed;

  let completions = 0;
  active.forEach((habit) => {
    (habit.completedDates || []).forEach((d) => {
      if (d >= monthStart) completions++;
    });
  });

  return Math.round((completions / totalExpected) * 100);
}

export function getCompletedTodayCount(habits) {
  return getActiveHabits(habits).filter(isCompletedToday).length;
}

export function aggregateCompletionsByDate(habits) {
  const map = {};
  habits.forEach((habit) => {
    if (habit.archived) return;
    (habit.completedDates || []).forEach((d) => {
      map[d] = (map[d] || 0) + 1;
    });
  });
  return map;
}

export function getIntensityLevel(count, maxCount) {
  if (count === 0) return 0;
  if (maxCount <= 1) return count >= 1 ? 4 : 0;
  const ratio = count / maxCount;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

export function animateProgressBar(fillEl, percent) {
  if (!fillEl) return;
  fillEl.style.width = "0%";
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      fillEl.style.width = `${percent}%`;
    });
  });
}
