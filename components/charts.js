import { getDateKey, addDays } from "../utils/dates.js";
import { getActiveHabits, aggregateCompletionsByDate } from "../utils/progress.js";
import { getConsistency } from "../utils/streaks.js";

let chartInstances = {};

function destroyChart(id) {
  if (chartInstances[id]) {
    chartInstances[id].destroy();
    delete chartInstances[id];
  }
}

function getChartColors() {
  const isDark = document.documentElement.dataset.theme !== "light";
  return {
    text: isDark ? "#94a3b8" : "#64748b",
    grid: isDark ? "rgba(148,163,184,0.1)" : "rgba(100,116,139,0.15)",
    primary: "#3b82f6",
    success: "#22c55e",
    palette: ["#8b5cf6", "#22c55e", "#06b6d4", "#3b82f6", "#f59e0b"],
  };
}

export function renderBarChart(canvasId, habits) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof Chart === "undefined") return;

  destroyChart(canvasId);
  const colors = getChartColors();
  const active = getActiveHabits(habits);
  const labels = [];
  const data = [];

  for (let i = 6; i >= 0; i--) {
    const d = addDays(new Date(), -i);
    const key = getDateKey(d);
    labels.push(d.toLocaleDateString("en-US", { weekday: "short" }));
    let count = 0;
    active.forEach((h) => {
      if ((h.completedDates || []).includes(key)) count++;
    });
    data.push(count);
  }

  chartInstances[canvasId] = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Completions",
        data,
        backgroundColor: colors.primary + "99",
        borderColor: colors.primary,
        borderWidth: 1,
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: colors.text } },
        y: {
          beginAtZero: true,
          ticks: { color: colors.text, stepSize: 1 },
          grid: { color: colors.grid },
        },
      },
    },
  });
}

export function renderLineChart(canvasId, habits) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof Chart === "undefined") return;

  destroyChart(canvasId);
  const colors = getChartColors();
  const active = getActiveHabits(habits);
  const labels = [];
  const data = [];

  for (let w = 7; w >= 0; w--) {
    const weekEnd = addDays(new Date(), -(w * 7));
    const weekStart = addDays(weekEnd, -6);
    const startKey = getDateKey(weekStart);
    const endKey = getDateKey(weekEnd);

    let completions = 0;
    let expected = active.length * 7;
    active.forEach((h) => {
      (h.completedDates || []).forEach((d) => {
        if (d >= startKey && d <= endKey) completions++;
      });
    });

    labels.push(weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
    data.push(expected > 0 ? Math.round((completions / expected) * 100) : 0);
  }

  chartInstances[canvasId] = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Weekly %",
        data,
        borderColor: colors.success,
        backgroundColor: colors.success + "33",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: colors.text } },
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { color: colors.text, callback: (v) => v + "%" },
          grid: { color: colors.grid },
        },
      },
    },
  });
}

export function renderDoughnutChart(canvasId, habits) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof Chart === "undefined") return;

  destroyChart(canvasId);
  const colors = getChartColors();
  const active = getActiveHabits(habits);
  const categories = ["Study", "Fitness", "Health", "Work", "Personal"];
  const data = categories.map((cat) => {
    const catHabits = active.filter((h) => h.category === cat);
    if (catHabits.length === 0) return 0;
    const avg = catHabits.reduce((sum, h) => sum + getConsistency(h), 0) / catHabits.length;
    return Math.round(avg);
  });

  chartInstances[canvasId] = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: categories,
      datasets: [{
        data,
        backgroundColor: colors.palette,
        borderWidth: 0,
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "65%",
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: colors.text, padding: 16, usePointStyle: true },
        },
      },
    },
  });
}

export function destroyAllCharts() {
  Object.keys(chartInstances).forEach(destroyChart);
}
