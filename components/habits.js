import { getDateKey } from "../utils/dates.js";
import { createHabit, saveHabits, CATEGORIES } from "../utils/storage.js";
import { isCompletedToday } from "../utils/progress.js";
import { getConsistency } from "../utils/streaks.js";
import { openHabitModal, openConfirmModal, showToast } from "./modal.js";

let filters = {
  search: "",
  category: "all",
  status: "all",
  sort: "streak",
};

let searchTimeout = null;

function playCompletionSound(enabled) {
  if (!enabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  } catch {
    /* audio not available */
  }
}

function filterHabits(habits) {
  let result = [...habits];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter((h) => h.title.toLowerCase().includes(q));
  }

  if (filters.category !== "all") {
    result = result.filter((h) => h.category === filters.category);
  }

  if (filters.status === "completed") {
    result = result.filter((h) => !h.archived && isCompletedToday(h));
  } else if (filters.status === "incomplete") {
    result = result.filter((h) => !h.archived && !isCompletedToday(h));
  } else if (filters.status === "archived") {
    result = result.filter((h) => h.archived);
  } else {
    result = result.filter((h) => !h.archived);
  }

  if (filters.sort === "streak") {
    result.sort((a, b) => (b.streakCount || 0) - (a.streakCount || 0));
  } else if (filters.sort === "progress") {
    result.sort((a, b) => getConsistency(b) - getConsistency(a));
  } else {
    result.sort((a, b) => a.title.localeCompare(b.title));
  }

  return result;
}

function renderHabitCard(habit, onUpdate) {
  const done = isCompletedToday(habit);
  const card = document.createElement("div");
  card.className = `habit-card${done ? " habit-card--done" : ""}${habit.archived ? " habit-card--archived" : ""}`;
  card.dataset.id = habit.id;

  card.innerHTML = `
    <div class="habit-card__left">
      <button class="habit-check${done ? " habit-check--done" : ""}" data-action="toggle" aria-label="Toggle completion">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="habit-card__color" style="background:${habit.color}"></div>
      <div class="habit-card__info">
        <span class="habit-card__title">${habit.title}</span>
        <span class="habit-card__category">${habit.category}</span>
      </div>
    </div>
    <div class="habit-card__right">
      <span class="streak-badge" title="Current streak">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 23c-3.9 0-7-3.1-7-7 0-2.8 1.6-5.2 4-6.4V7c0-2.2 1.8-4 4-4s4 1.8 4 4v2.6c2.4 1.2 4 3.6 4 6.4 0 3.9-3.1 7-7 7z"/></svg>
        ${habit.streakCount || 0}
      </span>
      <div class="habit-card__actions">
        <button class="btn-icon" data-action="edit" title="Edit">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
        </button>
        <button class="btn-icon" data-action="archive" title="${habit.archived ? "Unarchive" : "Archive"}">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12v2H2V4zm1 2v8h10V6M6 6V4h4v2" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
        </button>
        <button class="btn-icon btn-icon--danger" data-action="delete" title="Delete">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M6 4V2h4v2M5 4v9h6V4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
      </div>
    </div>
  `;

  card.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === "toggle") {
      const today = getDateKey();
      if (!habit.completedDates) habit.completedDates = [];
      const idx = habit.completedDates.indexOf(today);
      if (idx >= 0) {
        habit.completedDates.splice(idx, 1);
      } else {
        habit.completedDates.push(today);
        playCompletionSound(onUpdate.getSoundEnabled());
        showToast(`"${habit.title}" completed!`, "success");
      }
      onUpdate.save();
    } else if (action === "edit") {
      openHabitModal(habit, ({ title, category, color }) => {
        habit.title = title;
        habit.category = category;
        habit.color = color;
        onUpdate.save();
        showToast("Habit updated", "success");
      });
    } else if (action === "archive") {
      habit.archived = !habit.archived;
      onUpdate.save();
      showToast(habit.archived ? "Habit archived" : "Habit restored", "info");
    } else if (action === "delete") {
      openConfirmModal(`Delete "${habit.title}"? This cannot be undone.`, () => {
        onUpdate.delete(habit.id);
        showToast("Habit deleted", "info");
      });
    }
  });

  return card;
}

export function initHabits(onUpdate) {
  document.getElementById("add-habit-btn").addEventListener("click", () => {
    openHabitModal(null, ({ title, category, color }) => {
      const habit = createHabit({ title, category, color });
      onUpdate.add(habit);
      showToast("Habit added!", "success");
    });
  });

  const searchInput = document.getElementById("habit-search");
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      filters.search = e.target.value.trim();
      onUpdate.render();
    }, 200);
  });

  ["habit-filter-category", "habit-filter-status", "habit-filter-sort"].forEach((id) => {
    document.getElementById(id).addEventListener("change", (e) => {
      const key = id.replace("habit-filter-", "");
      filters[key === "category" ? "category" : key === "status" ? "status" : "sort"] = e.target.value;
      onUpdate.render();
    });
  });
}

export function renderHabits(habits, onUpdate) {
  const list = document.getElementById("habit-list");
  const empty = document.getElementById("habit-empty");
  const filtered = filterHabits(habits);

  list.innerHTML = "";
  if (filtered.length === 0) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  const fragment = document.createDocumentFragment();
  filtered.forEach((habit) => {
    fragment.appendChild(renderHabitCard(habit, onUpdate));
  });
  list.appendChild(fragment);
}

export { CATEGORIES };
