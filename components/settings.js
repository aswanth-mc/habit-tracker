import { exportData, importData, resetAll, saveTheme, savePreferences } from "../utils/storage.js";
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

  const importBtn = document.createElement("button");
  importBtn.type = "button";
  importBtn.className = "btn btn--secondary btn--ripple";
  importBtn.textContent = "Import JSON";
  importBtn.setAttribute("aria-label", "Import habits and settings from a JSON file");

  const importInput = document.createElement("input");
  importInput.type = "file";
  importInput.accept = ".json,application/json";
  importInput.hidden = true;
  importInput.setAttribute("aria-label", "Choose a JSON backup file to import");
  exportBtn.parentElement.insertBefore(importBtn, exportBtn);
  exportBtn.parentElement.appendChild(importInput);

  importBtn.addEventListener("click", () => importInput.click());
  importInput.addEventListener("change", async () => {
    const file = importInput.files?.[0];
    if (!file) return;

    try {
      const json = await file.text();
      // Validate before asking, so a bad file can never replace the current data.
      const parsed = JSON.parse(json);
      const habits = Array.isArray(parsed) ? parsed : parsed?.habits;
      if (!Array.isArray(habits)) throw new Error("The JSON file must contain a habits array.");

      openConfirmModal(
        `Import ${habits.length} habit${habits.length === 1 ? "" : "s"}? This will replace your current habits and settings.`,
        () => {
          try {
            const imported = importData(json);
            state.habits = imported.habits;
            state.theme = imported.theme;
            state.preferences = imported.preferences;
            document.documentElement.dataset.theme = state.theme;
            themeToggle.checked = state.theme === "light";
            soundToggle.checked = state.preferences.soundEnabled;
            notifToggle.checked = state.preferences.notificationsEnabled;
            reminderTime.value = state.preferences.reminderTime;
            onUpdate.render();
            showToast(`Imported ${state.habits.length} habit${state.habits.length === 1 ? "" : "s"}`, "success");
          } catch (error) {
            showToast(error.message || "Could not import this file", "error");
          }
        }
      );
    } catch (error) {
      showToast(error.message || "Could not read this JSON file", "error");
    } finally {
      importInput.value = "";
    }
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
