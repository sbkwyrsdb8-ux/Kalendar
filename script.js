let state = {
  trackers: {}
};

let activeTracker = null;

let current = new Date();
let currentMonth = current.getMonth();
let currentYear = current.getFullYear();

const LS_KEY = "habit_calendar_v1";

/* ---------- INIT ---------- */

function load() {
  const data = localStorage.getItem(LS_KEY);
  if (data) {
    state = JSON.parse(data);
  }

  if (Object.keys(state.trackers).length === 0) {
    state.trackers["default"] = {};
  }

  activeTracker = Object.keys(state.trackers)[0];
}

function save() {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

/* ---------- TRACKERS ---------- */

function renderTrackers() {
  const el = document.getElementById("trackers");
  el.innerHTML = "";

  Object.keys(state.trackers).forEach(name => {
    const div = document.createElement("div");
    div.className = "tracker" + (name === activeTracker ? " active" : "");
    div.textContent = name;

    div.onclick = () => {
      activeTracker = name;
      renderTrackers();
      renderCalendar();
    };

    el.appendChild(div);
  });
}

document.getElementById("addTracker").onclick = () => {
  const name = prompt("Название трекера:");
  if (!name) return;

  if (!state.trackers[name]) {
    state.trackers[name] = {};
    activeTracker = name;
    save();
    renderTrackers();
    renderCalendar();
  }
};

/* ---------- CALENDAR ---------- */

function formatDate(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function renderCalendar() {
  const cal = document.getElementById("calendar");
  cal.innerHTML = "";

  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);

  document.getElementById("monthLabel").textContent =
    firstDay.toLocaleString("ru", { month: "long", year: "numeric" });

  let startDay = firstDay.getDay();
  startDay = startDay === 0 ? 7 : startDay;

  for (let i = 1; i < startDay; i++) {
    cal.appendChild(document.createElement("div"));
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = formatDate(currentYear, currentMonth, day);

    const cell = document.createElement("div");
    cell.className = "day";

    const today = new Date();
    if (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    ) {
      cell.classList.add("today");
    }

    const data = state.trackers[activeTracker]?.[date];
    if (data && data.length > 0) {
      cell.classList.add("hasData");
      const sum = data.reduce((a, b) => a + Number(b.value), 0);
      cell.innerHTML = `<div class="num">${day}</div><div>${sum}</div>`;
    } else {
      cell.innerHTML = `<div class="num">${day}</div>`;
    }

    cell.onclick = () => {
      const value = prompt("Введите число:");
      if (value === null || value === "") return;

      const now = new Date();
      const time = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;

      if (!state.trackers[activeTracker][date]) {
        state.trackers[activeTracker][date] = [];
      }

      state.trackers[activeTracker][date].push({
        value: Number(value),
        time
      });

      save();
      renderCalendar();
    };

    cal.appendChild(cell);
  }
}

/* ---------- MONTH NAV ---------- */

document.getElementById("prevMonth").onclick = () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
};

document.getElementById("nextMonth").onclick = () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
};

/* ---------- START ---------- */

load();
renderTrackers();
renderCalendar();
