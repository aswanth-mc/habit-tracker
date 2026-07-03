import { getDailyQuote } from "../data/quotes.js";
import {
  getDailyProgress,
  getWeeklyProgress,
  getMonthlyProgress,
  getCompletedTodayCount,
  getActiveHabits,
  animateProgressBar,
  isCompletedToday,
} from "../utils/progress.js";
import { getBestStreak, getOverallLongestStreak } from "../utils/streaks.js";
import { renderHeatmap } from "./heatmap.js";

export function renderDashboard(habits) {
  const active = getActiveHabits(habits);
  const completedToday = getCompletedTodayCount(habits);
  const daily = getDailyProgress(habits);
  const weekly = getWeeklyProgress(habits);
  const monthly = getMonthlyProgress(habits);
  const quote = getDailyQuote();

  document.getElementById("stat-total").textContent = habits.length;
  document.getElementById("stat-active").textContent = active.length;
  document.getElementById("stat-completed").textContent = completedToday;
  document.getElementById("stat-streak").textContent = getBestStreak(habits);
  document.getElementById("stat-longest").textContent = getOverallLongestStreak(habits);

  document.getElementById("quote-text").textContent = `"${quote.text}"`;
  document.getElementById("quote-author").textContent = `— ${quote.author}`;

  const focusHabit = active
    .filter((h) => !isCompletedToday(h))
    .sort((a, b) => (b.streakCount || 0) - (a.streakCount || 0))[0];

  const focusEl = document.getElementById("focus-habit");
  if (focusHabit) {
    focusEl.innerHTML = `
      <div class="focus-habit__dot" style="background:${focusHabit.color}"></div>
      <div>
        <p class="focus-habit__title">${focusHabit.title}</p>
        <p class="focus-habit__meta">${focusHabit.category} · ${focusHabit.streakCount || 0} day streak</p>
      </div>
    `;
  } else if (active.length === 0) {
    focusEl.innerHTML = `<p class="focus-habit__empty">Add habits to see your focus for today.</p>`;
  } else {
    focusEl.innerHTML = `<p class="focus-habit__done">All habits completed today! Great work!</p>`;
  }

  animateProgressBar(document.getElementById("dash-daily-fill"), daily);
  animateProgressBar(document.getElementById("dash-weekly-fill"), weekly);
  animateProgressBar(document.getElementById("dash-monthly-fill"), monthly);

  document.getElementById("dash-daily-text").textContent = `${daily}%`;
  document.getElementById("dash-weekly-text").textContent = `${weekly}%`;
  document.getElementById("dash-monthly-text").textContent = `${monthly}%`;

  renderHeatmap("heatmap-mini", habits, { compact: true });
}
