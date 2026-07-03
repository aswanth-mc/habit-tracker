import { getDateKey } from "../utils/dates.js";
import { getActiveHabits, isCompletedToday } from "../utils/progress.js";
import { getConsistency, getMissedDays } from "../utils/streaks.js";
import { renderBarChart, renderLineChart, renderDoughnutChart } from "./charts.js";
import { renderHeatmap, initHeatmapControls } from "./heatmap.js";

let heatmapUpdate = null;

export function initAnalytics(getHabits) {
  heatmapUpdate = initHeatmapControls([], getHabits);
}

export function renderAnalytics(habits) {
  const active = getActiveHabits(habits);
  const weekly = active.length > 0
    ? Math.round(active.reduce((s, h) => s + getConsistency(h), 0) / active.length)
    : 0;

  const monthlyHabits = active.filter((h) => {
    const created = new Date(h.createdDate);
    const now = new Date();
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
      ? true
      : h.completedDates?.some((d) => d.startsWith(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`));
  });

  const monthly = monthlyHabits.length > 0
    ? Math.round(monthlyHabits.reduce((s, h) => s + getConsistency(h), 0) / monthlyHabits.length)
    : weekly;

  const missed = active.reduce((s, h) => s + getMissedDays(h, 30), 0);
  const consistency = active.length > 0
    ? Math.round(active.reduce((s, h) => s + getConsistency(h), 0) / active.length)
    : 0;

  document.getElementById("analytics-weekly").textContent = `${weekly}%`;
  document.getElementById("analytics-monthly").textContent = `${monthly}%`;
  document.getElementById("analytics-consistency").textContent = `${consistency}%`;
  document.getElementById("analytics-missed").textContent = missed;

  renderBarChart("chart-bar", habits);
  renderLineChart("chart-line", habits);
  renderDoughnutChart("chart-doughnut", habits);

  if (heatmapUpdate) heatmapUpdate();
  else renderHeatmap("heatmap-full", habits, { view: "yearly" });
}
