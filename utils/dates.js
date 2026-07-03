export function getDateKey(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseDateKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function isSameDay(a, b) {
  return getDateKey(a) === getDateKey(b);
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function getStartOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getStartOfMonth(date = new Date()) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getDaysBetween(start, end) {
  const days = [];
  const current = new Date(start);
  current.setHours(0, 0, 0, 0);
  const endDate = new Date(end);
  endDate.setHours(0, 0, 0, 0);
  while (current <= endDate) {
    days.push(getDateKey(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

export function getWeeksInYear(year) {
  const weeks = [];
  const start = getStartOfWeek(new Date(year, 0, 1));
  const end = new Date(year, 11, 31);
  let current = new Date(start);
  while (current <= end || weeks.length < 53) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
    if (current.getFullYear() > year && weeks.length >= 52) break;
  }
  return weeks;
}

export function formatDisplayDate(key) {
  const d = parseDateKey(key);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getDaysElapsedThisWeek() {
  return new Date().getDay() + 1;
}

export function getDaysElapsedThisMonth() {
  return new Date().getDate();
}
