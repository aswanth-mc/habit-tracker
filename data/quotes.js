export const QUOTES = [
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { text: "Small daily improvements are the key to staggering long-term results.", author: "Robin Sharma" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "You'll never change your life until you change something you do daily.", author: "John C. Maxwell" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "A journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
  { text: "Your future is created by what you do today, not tomorrow.", author: "Unknown" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
  { text: "First forget inspiration. Habit and persistence will get you further.", author: "Octavia Butler" },
];

export function getDailyQuote() {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
  );
  return QUOTES[dayOfYear % QUOTES.length];
}
