const habitInput = document.getElementById("habitInput");
const addBtn = document.getElementById("addBtn");
const habitList = document.getElementById("habitList");

const dailyProgress = document.getElementById("dailyProgress");
const monthlyProgress = document.getElementById("monthlyProgress");

const dailyText = document.getElementById("dailyText");
const monthlyText = document.getElementById("monthlyText");

let habits = JSON.parse(localStorage.getItem("habits")) || [];

function saveHabits() {
  localStorage.setItem("habits", JSON.stringify(habits));
}

function renderHabits() {
  habitList.innerHTML = "";

  habits.forEach((habit, index) => {

    const habitDiv = document.createElement("div");
    habitDiv.classList.add("habit");

    if (habit.completed) {
      habitDiv.classList.add("completed");
    }

    habitDiv.innerHTML = `
      <div class="habit-left">
        <span>${habit.name}</span>
      </div>

      <div class="actions">
        <button class="complete-btn" onclick="toggleComplete(${index})">
          ✓
        </button>

        <button class="edit-btn" onclick="editHabit(${index})">
          Edit
        </button>

        <button class="delete-btn" onclick="deleteHabit(${index})">
          Delete
        </button>
      </div>
    `;

    habitList.appendChild(habitDiv);
  });

  updateProgress();
}

function addHabit() {

  const habitName = habitInput.value.trim().charAt(0).toUpperCase() + habitInput.value.trim().slice(1);

  if (habitName === "") {
    alert("Please enter a habit");
    return;
  }

  habits.push({
    name: habitName,
    completed: false
  });

  saveHabits();
  renderHabits();

  habitInput.value = "";
}

function deleteHabit(index) {
  habits.splice(index, 1);

  saveHabits();
  renderHabits();
}

function editHabit(index) {

  const newName = prompt(
    "Edit Habit",
    habits[index].name
  );

  if (newName !== null && newName.trim() !== "") {

    habits[index].name = newName;

    saveHabits();
    renderHabits();
  }
}

function toggleComplete(index) {

  habits[index].completed = !habits[index].completed;

  saveHabits();
  renderHabits();
}

function updateProgress() {

  const total = habits.length;

  const completed = habits.filter(
    habit => habit.completed
  ).length;

  let dailyPercent = 0;

  if (total > 0) {
    dailyPercent = Math.round(
      (completed / total) * 100
    );
  }

  dailyProgress.style.width = dailyPercent + "%";
  dailyText.innerText = dailyPercent + "% Completed";

  // Monthly Progress Example
  const monthlyPercent = Math.min(
    Math.round(dailyPercent * 0.8),
    100
  );

  monthlyProgress.style.width = monthlyPercent + "%";
  monthlyText.innerText = monthlyPercent + "% Completed";
}

addBtn.addEventListener("click", addHabit);

renderHabits();