import {
  loadHabits,
  saveHabits,
  loadTheme,
  saveTheme,
  loadPreferences,
  savePreferences,
  resetAll,
} from "./utils/storage.js";
import { initSidebar, setActiveSection } from "./components/sidebar.js";
import { initToast, initModals } from "./components/modal.js";
import { initHabits, renderHabits } from "./components/habits.js";
import { renderDashboard } from "./components/dashboard.js";
import { initAnalytics, renderAnalytics } from "./components/analytics.js";
import { initSettings, renderSettings } from "./components/settings.js";
import { startReminderChecker } from "./utils/notifications.js";

const state = {
  habits: loadHabits(),
  theme: loadTheme(),
  preferences: loadPreferences(),
  currentSection: "dashboard",
};

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
}

function persistHabits() {
  saveHabits(state.habits);
  renderAll();
}

const handlers = {
  save: persistHabits,
  add(habit) {
    state.habits.push(habit);
    persistHabits();
  },
  delete(id) {
    state.habits = state.habits.filter((h) => h.id !== id);
    persistHabits();
  },
  render() {
    renderHabits(state.habits, handlers);
  },
  getSoundEnabled() {
    return state.preferences.soundEnabled;
  },
  reset() {
    resetAll();
    state.habits = [];
    state.theme = "dark";
    state.preferences = loadPreferences();
    applyTheme();
    setActiveSection("dashboard");
    state.currentSection = "dashboard";
    renderAll();
    initSettings(state, { render: renderAll, reset: handlers.reset });
  },
};

function renderAll() {
  renderHabits(state.habits, handlers);
  renderDashboard(state.habits);
  renderSettings(state);

  if (state.currentSection === "analytics") {
    renderAnalytics(state.habits);
  }
}

function navigate(section) {
  state.currentSection = section;
  setActiveSection(section);

  if (section === "analytics") {
    renderAnalytics(state.habits);
  }
}

function init() {
  applyTheme();
  initToast();
  initModals();
  initSidebar(navigate);
  initHabits(handlers);
  initAnalytics(() => state.habits);
  initSettings(state, { render: renderAll, reset: handlers.reset });

  document.getElementById("sidebar-theme-btn").addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    saveTheme(state.theme);
    applyTheme();
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) themeToggle.checked = state.theme === "light";
    renderAll();
  });

  startReminderChecker(
    () => state,
    (prefs) => {
      state.preferences = prefs;
      savePreferences(prefs);
    }
  );

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") renderAll();
  });

  renderAll();
  setActiveSection("dashboard");
}

init();
