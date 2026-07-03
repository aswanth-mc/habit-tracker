export function initSidebar(onNavigate) {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  const menuBtn = document.getElementById("menu-btn");
  const navLinks = sidebar.querySelectorAll(".nav-link");

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const section = link.dataset.section;
      navLinks.forEach((l) => l.classList.remove("nav-link--active"));
      link.classList.add("nav-link--active");
      onNavigate(section);
      closeSidebar();
    });
  });

  menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("sidebar--open");
    overlay.classList.toggle("overlay--visible");
  });

  overlay.addEventListener("click", closeSidebar);

  function closeSidebar() {
    sidebar.classList.remove("sidebar--open");
    overlay.classList.remove("overlay--visible");
  }
}

export function setActiveSection(section) {
  document.querySelectorAll(".section").forEach((s) => {
    s.classList.toggle("section--active", s.id === `section-${section}`);
  });
  document.querySelectorAll(".nav-link").forEach((l) => {
    l.classList.toggle("nav-link--active", l.dataset.section === section);
  });
  const titles = {
    dashboard: "Dashboard",
    habits: "Habits",
    analytics: "Analytics",
    settings: "Settings",
  };
  document.getElementById("page-title").textContent = titles[section] || "Dashboard";
}
