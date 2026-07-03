import { getDateKey } from "./dates.js";
import { getActiveHabits, isCompletedToday } from "./progress.js";

let checkInterval = null;

export function requestNotificationPermission() {
  if (!("Notification" in window)) return Promise.resolve("unsupported");
  return Notification.requestPermission();
}

export function getNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}

export function sendNotification(title, body) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  new Notification(title, { body, icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✓</text></svg>" });
}

export function startReminderChecker(getState, onReminderSent) {
  if (checkInterval) clearInterval(checkInterval);

  checkInterval = setInterval(() => {
    const { habits, preferences } = getState();
    if (!preferences.notificationsEnabled) return;
    if (Notification.permission !== "granted") return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const today = getDateKey();

    if (timeStr !== preferences.reminderTime) return;
    if (preferences.lastReminderDate === today) return;

    const active = getActiveHabits(habits);
    const incomplete = active.filter((h) => !isCompletedToday(h));

    if (incomplete.length > 0) {
      sendNotification(
        "Habit Reminder",
        `You have ${incomplete.length} habit${incomplete.length > 1 ? "s" : ""} left today!`
      );
    } else {
      sendNotification("Great job!", "You've completed all your habits for today!");
    }

    preferences.lastReminderDate = today;
    onReminderSent(preferences);
  }, 60000);
}

export function stopReminderChecker() {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
}
