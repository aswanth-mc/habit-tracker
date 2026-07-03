import { getDateKey, getStartOfWeek, addDays, getDaysInMonth, formatDisplayDate, parseDateKey } from "../utils/dates.js";
import { aggregateCompletionsByDate, getIntensityLevel } from "../utils/progress.js";

let tooltipEl = null;

function ensureTooltip() {
  if (!tooltipEl) {
    tooltipEl = document.createElement("div");
    tooltipEl.className = "heatmap-tooltip";
    tooltipEl.setAttribute("role", "tooltip");
    document.body.appendChild(tooltipEl);
  }
  return tooltipEl;
}

function showTooltip(e, text) {
  const tip = ensureTooltip();
  tip.textContent = text;
  tip.classList.add("heatmap-tooltip--visible");
  const x = e.clientX;
  const y = e.clientY;
  tip.style.left = `${x + 12}px`;
  tip.style.top = `${y - 36}px`;
}

function hideTooltip() {
  if (tooltipEl) tooltipEl.classList.remove("heatmap-tooltip--visible");
}

function bindCellEvents(cell, dateKey, count) {
  cell.addEventListener("mouseenter", (e) => {
    const label = count === 0 ? "No completions" : `${count} habit${count > 1 ? "s" : ""} completed`;
    showTooltip(e, `${formatDisplayDate(dateKey)} — ${label}`);
  });
  cell.addEventListener("mousemove", (e) => {
    if (tooltipEl) {
      tooltipEl.style.left = `${e.clientX + 12}px`;
      tooltipEl.style.top = `${e.clientY - 36}px`;
    }
  });
  cell.addEventListener("mouseleave", hideTooltip);
}

function renderYearlyHeatmap(container, habits, compact = false) {
  const completions = aggregateCompletionsByDate(habits);
  const maxCount = Math.max(1, ...Object.values(completions));
  const year = new Date().getFullYear();
  const today = getDateKey();

  const startDate = addDays(new Date(), -(52 * 7));
  const weeks = [];
  let current = getStartOfWeek(startDate);

  for (let w = 0; w < 53; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(current));
      current = addDays(current, 1);
    }
    weeks.push(week);
  }

  container.innerHTML = "";
  container.className = `heatmap-grid heatmap-grid--yearly${compact ? " heatmap-grid--compact" : ""}`;

  if (!compact) {
    const dayLabels = document.createElement("div");
    dayLabels.className = "heatmap-day-labels";
    ["", "Mon", "", "Wed", "", "Fri", ""].forEach((label) => {
      const span = document.createElement("span");
      span.textContent = label;
      dayLabels.appendChild(span);
    });
    container.appendChild(dayLabels);
  }

  const grid = document.createElement("div");
  grid.className = "heatmap-cells";

  weeks.forEach((week) => {
    const col = document.createElement("div");
    col.className = "heatmap-week";

    week.forEach((date) => {
      const key = getDateKey(date);
      const count = completions[key] || 0;
      const level = getIntensityLevel(count, maxCount);
      const cell = document.createElement("div");
      cell.className = `heatmap-cell heatmap-cell--${level}`;
      if (key === today) cell.classList.add("heatmap-cell--today");
      if (date.getFullYear() !== year) cell.classList.add("heatmap-cell--outside");
      cell.dataset.date = key;
      bindCellEvents(cell, key, count);
      col.appendChild(cell);
    });

    grid.appendChild(col);
  });

  container.appendChild(grid);
}

function renderMonthlyHeatmap(container, habits, year, month) {
  const completions = aggregateCompletionsByDate(habits);
  const maxCount = Math.max(1, ...Object.values(completions));
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = new Date(year, month, 1).getDay();
  const today = getDateKey();

  container.innerHTML = "";
  container.className = "heatmap-grid heatmap-grid--monthly";

  const header = document.createElement("div");
  header.className = "heatmap-month-header";
  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach((d) => {
    const span = document.createElement("span");
    span.textContent = d;
    header.appendChild(span);
  });
  container.appendChild(header);

  const grid = document.createElement("div");
  grid.className = "heatmap-month-cells";

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.className = "heatmap-cell heatmap-cell--empty";
    grid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const count = completions[key] || 0;
    const level = getIntensityLevel(count, maxCount);
    const cell = document.createElement("div");
    cell.className = `heatmap-cell heatmap-cell--month heatmap-cell--${level}`;
    if (key === today) cell.classList.add("heatmap-cell--today");
    cell.textContent = day;
    bindCellEvents(cell, key, count);
    grid.appendChild(cell);
  }

  container.appendChild(grid);
}

export function renderHeatmap(containerId, habits, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const { view = "yearly", year, month, compact = false } = options;

  if (view === "monthly") {
    const now = new Date();
    renderMonthlyHeatmap(container, habits, year ?? now.getFullYear(), month ?? now.getMonth());
  } else {
    renderYearlyHeatmap(container, habits, compact);
  }
}

export function initHeatmapControls(habits, getHabits) {
  const viewBtns = document.querySelectorAll("[data-heatmap-view]");
  const monthNav = document.getElementById("heatmap-month-nav");
  let currentView = "yearly";
  let currentYear = new Date().getFullYear();
  let currentMonth = new Date().getMonth();

  function update() {
    const h = getHabits ? getHabits() : habits;
    if (currentView === "yearly") {
      renderHeatmap("heatmap-full", h, { view: "yearly" });
      if (monthNav) monthNav.hidden = true;
    } else {
      renderHeatmap("heatmap-full", h, { view: "monthly", year: currentYear, month: currentMonth });
      if (monthNav) {
        monthNav.hidden = false;
        const label = document.getElementById("heatmap-month-label");
        if (label) {
          label.textContent = new Date(currentYear, currentMonth).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          });
        }
      }
    }
  }

  viewBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      viewBtns.forEach((b) => b.classList.remove("btn--active"));
      btn.classList.add("btn--active");
      currentView = btn.dataset.heatmapView;
      update();
    });
  });

  document.getElementById("heatmap-prev-month")?.addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    update();
  });

  document.getElementById("heatmap-next-month")?.addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    update();
  });

  return update;
}
