let toastContainer = null;

export function initToast() {
  toastContainer = document.getElementById("toast-container");
}

export function showToast(message, type = "info") {
  if (!toastContainer) return;

  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("toast--visible"));

  setTimeout(() => {
    toast.classList.remove("toast--visible");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

let habitModalCallback = null;
let confirmModalCallback = null;

export function initModals() {
  const habitModal = document.getElementById("habit-modal");
  const confirmModal = document.getElementById("confirm-modal");
  const habitForm = document.getElementById("habit-form");
  const habitCancel = document.getElementById("habit-cancel");
  const confirmCancel = document.getElementById("confirm-cancel");
  const confirmOk = document.getElementById("confirm-ok");

  habitForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("habit-title").value.trim();
    const category = document.getElementById("habit-category").value;
    const color = document.getElementById("habit-color").value;
    if (!title) return;
    if (habitModalCallback) habitModalCallback({ title, category, color });
    closeHabitModal();
  });

  habitCancel.addEventListener("click", closeHabitModal);
  habitModal.querySelector(".modal-overlay").addEventListener("click", closeHabitModal);

  confirmCancel.addEventListener("click", closeConfirmModal);
  confirmModal.querySelector(".modal-overlay").addEventListener("click", closeConfirmModal);
  confirmOk.addEventListener("click", () => {
    if (confirmModalCallback) confirmModalCallback();
    closeConfirmModal();
  });
}

export function openHabitModal(habit = null, onSave) {
  habitModalCallback = onSave;
  const modal = document.getElementById("habit-modal");
  const title = document.getElementById("habit-modal-title");
  const titleInput = document.getElementById("habit-title");
  const categoryInput = document.getElementById("habit-category");
  const colorInput = document.getElementById("habit-color");

  title.textContent = habit ? "Edit Habit" : "Add Habit";
  titleInput.value = habit ? habit.title : "";
  categoryInput.value = habit ? habit.category : "Personal";
  colorInput.value = habit ? habit.color : "#f59e0b";

  modal.classList.add("modal--open");
  titleInput.focus();
}

export function closeHabitModal() {
  document.getElementById("habit-modal").classList.remove("modal--open");
  habitModalCallback = null;
}

export function openConfirmModal(message, onConfirm) {
  confirmModalCallback = onConfirm;
  document.getElementById("confirm-message").textContent = message;
  document.getElementById("confirm-modal").classList.add("modal--open");
}

export function closeConfirmModal() {
  document.getElementById("confirm-modal").classList.remove("modal--open");
  confirmModalCallback = null;
}
