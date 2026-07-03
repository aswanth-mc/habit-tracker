import { exportData, resetAll, saveTheme, savePreferences } from "../utils/storage.js";
import { requestNotificationPermission, getNotificationPermission } from "../utils/notifications.js";
import { openConfirmModal, showToast } from "./modal.js";

export function initSettings(state, onUpdate) {
  const themeToggle = document.getElementById("theme-toggle");
  const soundToggle = document.getElementById("sound-toggle");
  const notifToggle = document.getElementById("notif-toggle");
  const reminderTime = document.getElementById("reminder-time");
  const notifBtn = document.getElementById("notif-permission-btn");
  const exportBtn = document.getElementById("export-btn");
  const resetBtn = document.getElementById("reset-btn");

  themeToggle.checked = state.theme === "light";
  soundToggle.checked = state.preferences.soundEnabled;
  notifToggle.checked = state.preferences.notificationsEnabled;
  reminderTime.value = state.preferences.reminderTime;

  updateNotifStatus();

  themeToggle.addEventListener("change", () => {
    const theme = themeToggle.checked ? "light" : "dark";
    state.theme = theme;
    saveTheme(theme);
    document.documentElement.dataset.theme = theme;
    document.getElementById("settings-theme-label").textContent =
      theme === "light" ? "Light" : "Dark";
    onUpdate.render();
    showToast(`${theme === "light" ? "Light" : "Dark"} theme applied`, "info");
  });

  soundToggle.addEventListener("change", () => {
    state.preferences.soundEnabled = soundToggle.checked;
    savePreferences(state.preferences);
  });

  notifToggle.addEventListener("change", () => {
    state.preferences.notificationsEnabled = notifToggle.checked;
    savePreferences(state.preferences);
  });

  reminderTime.addEventListener("change", () => {
    state.preferences.reminderTime = reminderTime.value;
    state.preferences.lastReminderDate = null;
    savePreferences(state.preferences);
    showToast("Reminder time updated", "info");
  });

  notifBtn.addEventListener("click", async () => {
    const result = await requestNotificationPermission();
    updateNotifStatus();
    if (result === "granted") showToast("Notifications enabled!", "success");
    else if (result === "denied") showToast("Notifications blocked", "error");
  });

  exportBtn.addEventListener("click", () => {
    const blob = new Blob([exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `habit-tracker-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Data exported", "success");
  });

  resetBtn.addEventListener("click", () => {
    openConfirmModal("Reset all data? This will delete all habits and settings.", () => {
      resetAll();
      onUpdate.reset();
      showToast("All data reset", "info");
    });
  });

  function updateNotifStatus() {
    const status = document.getElementById("notif-status");
    const perm = getNotificationPermission();
    const labels = {
      granted: "Permission granted",
      denied: "Permission denied",
      default: "Permission not requested",
      unsupported: "Not supported in this browser",
    };
    status.textContent = labels[perm] || perm;
    status.className = `settings-status settings-status--${perm}`;
  }
}

export function renderSettings(state) {
  document.getElementById("settings-habit-count").textContent = state.habits.length;
  document.getElementById("settings-theme-label").textContent =
    state.theme === "light" ? "Light" : "Dark";
}
