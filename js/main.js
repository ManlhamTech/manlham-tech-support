document.addEventListener("DOMContentLoaded", () => {
  if (!localStorage.getItem("users")) {
  localStorage.setItem("users", JSON.stringify([
    { name: "Super Admin", email: "admin@manlham.com", password: "admin123", role: "admin" }
  ]));
}

  // ===== Dark Mode =====
  const toggleBtn = document.getElementById("toggle-dark");
  if (localStorage.getItem("darkMode") === "true") document.body.classList.add("dark-mode");
  if (toggleBtn) toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
  });

  // ===== Mobile Menu =====
  const menuToggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector("header nav ul");
  if (menuToggle && navMenu) menuToggle.addEventListener("click", () => navMenu.classList.toggle("open"));

  // ===== Smooth Scroll =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => anchor.addEventListener("click", function (e) {
    const target = document.querySelector(this.getAttribute("href"));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: "smooth" }); }
  }));

  // ===== LOGIN =====
  const loginForm = document.getElementById("login-form");
  if (loginForm) loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const password = document.getElementById("login-password").value;
    const status = document.getElementById("login-status");
    let users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) { status.textContent = "❌ Invalid email or password."; status.style.color = "red"; return; }
    localStorage.setItem("loggedInUser", JSON.stringify(user));
    status.textContent = "✅ Login successful! Redirecting..."; status.style.color = "green";
    setTimeout(() => window.location.href = "dashboard.html", 1000);
  });

  // ===== DASHBOARD =====
  const onDashboard = document.title.includes("Dashboard");
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser") || "null");

  if (onDashboard) {
    if (!loggedInUser) { window.location.href = "login.html"; return; }

    document.getElementById("user-name").textContent = loggedInUser.name;
    document.getElementById("user-role").textContent = loggedInUser.role;

    // Admin-only sections
    document.querySelectorAll(".admin-only").forEach(el => { if (loggedInUser.role !== "admin") el.style.display = "none"; });

    // Logout
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) logoutBtn.addEventListener("click", () => { localStorage.removeItem("loggedInUser"); window.location.href = "login.html"; });

    // ===== Tabs =====
    const tabs = document.querySelectorAll(".sidebar ul li a");
    const sections = document.querySelectorAll("main.dashboard section");
    tabs.forEach(tab => tab.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = tab.getAttribute("href").replace("#", "");
      sections.forEach(sec => sec.style.display = "none");
      const targetSection = document.getElementById(targetId);
      if (targetSection) targetSection.style.display = "block";
    }));
    sections.forEach(sec => sec.style.display = "none");
    const overviewSection = document.getElementById("overview");
    if (overviewSection) overviewSection.style.display = "block";

    // ===== TICKETS =====
    const TICKETS_KEY = "tickets";
    const ticketsTableBody = document.querySelector("#tickets-table tbody");
    const ticketForm = document.getElementById("ticket-form");
    const ticketFilter = document.getElementById("ticket-filter");
    const statOpen = document.getElementById("stat-open");
    const statResolved = document.getElementById("stat-resolved");
    const statMembers = document.getElementById("stat-members");

    function loadTickets() { return JSON.parse(localStorage.getItem(TICKETS_KEY) || "[]"); }
    function saveTickets(all) { localStorage.setItem(TICKETS_KEY, JSON.stringify(all)); }
    function renderTickets() {
      const filter = ticketFilter ? ticketFilter.value : "All";
      const tickets = loadTickets();
      const filtered = tickets.filter(t => filter === "All" ? true : t.status === filter);
      if (ticketsTableBody) ticketsTableBody.innerHTML = filtered.map(t => `
        <tr>
          <td>#${t.id}</td>
          <td>${t.subject}</td>
          <td>${t.status}</td>
          <td>${t.assigned || "Unassigned"}</td>
          <td>
            <button class="action-btn" data-action="toggle" data-id="${t.id}">${t.status==="Open"?"Resolve":"Reopen"}</button>
            <button class="action-btn" data-action="delete" data-id="${t.id}">Delete</button>
          </td>
        </tr>`).join("");
      statOpen.textContent = tickets.filter(t=>t.status==="Open").length;
      statResolved.textContent = tickets.filter(t=>t.status==="Resolved").length;
      statMembers.textContent = JSON.parse(localStorage.getItem("users")||"[]").length;
    }

    if (!localStorage.getItem(TICKETS_KEY)) localStorage.setItem(TICKETS_KEY, JSON.stringify([]));
    if (ticketForm) ticketForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const subject = document.getElementById("ticket-subject").value.trim();
      if (!subject) return;
      const tickets = loadTickets();
      tickets.push({ id: Date.now(), subject, status: document.getElementById("ticket-status").value, assigned: document.getElementById("ticket-assigned").value.trim() || "" });
      saveTickets(tickets);
      ticketForm.reset();
      renderTickets();
    });
    if (ticketFilter) ticketFilter.addEventListener("change", renderTickets);
    if (ticketsTableBody) ticketsTableBody.addEventListener("click", (e) => {
      if (!e.target.classList.contains("action-btn")) return;
      const id = parseInt(e.target.dataset.id);
      const action = e.target.dataset.action;
      let tickets = loadTickets();
      const ticket = tickets.find(t=>t.id===id);
      if (action==="toggle") ticket.status=ticket.status==="Open"?"Resolved":"Open";
      else if(action==="delete") tickets=tickets.filter(t=>t.id!==id);
      saveTickets(tickets);
      renderTickets();
    });
    renderTickets();

    // ===== USER MANAGEMENT =====
    const userList = document.getElementById("user-list");
    const createUserForm = document.getElementById("create-user-form");

    function renderUsers() {
      let users = JSON.parse(localStorage.getItem("users") || "[]");
      if (userList) {
        userList.innerHTML = users.map((u, index) => `
          <tr>
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td>${u.role}</td>
            <td>${u.email !== loggedInUser.email ? `<button class="delete-user-btn" data-index="${index}">Delete</button>` : ""}</td>
          </tr>
        `).join("");

        document.querySelectorAll(".delete-user-btn").forEach(btn => {
          btn.addEventListener("click", () => {
            const idx = parseInt(btn.dataset.index);
            if (confirm(`Are you sure you want to delete user "${users[idx].name}"?`)) {
              users.splice(idx, 1);
              localStorage.setItem("users", JSON.stringify(users));
              renderUsers();
            }
          });
        });
      }
    }

    if (createUserForm) createUserForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("new-user-name").value.trim();
      const email = document.getElementById("new-user-email").value.trim().toLowerCase();
      const password = document.getElementById("new-user-password").value;
      const role = document.getElementById("new-user-role").value;
      let users = JSON.parse(localStorage.getItem("users") || "[]");
      if (users.some(u => u.email === email)) return alert("Email already exists");
      users.push({ name, email, password, role });
      localStorage.setItem("users", JSON.stringify(users));
      createUserForm.reset();
      renderUsers();
    });

    renderUsers();

    // ===== SYSTEM SETTINGS =====
    const systemForm = document.getElementById("system-settings-form");
    if (systemForm) {
      const themeSelect = document.getElementById("site-theme");
      const roleSelect = document.getElementById("default-user-role");
      const emailCheckbox = document.getElementById("email-notifications");
      const status = document.getElementById("system-settings-status");

      const settings = JSON.parse(localStorage.getItem("systemSettings") || "{}");
      if (settings.theme) themeSelect.value = settings.theme;
      if (settings.defaultRole) roleSelect.value = settings.defaultRole;
      if (settings.emailNotifications) emailCheckbox.checked = settings.emailNotifications;

      systemForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const newSettings = {
          theme: themeSelect.value,
          defaultRole: roleSelect.value,
          emailNotifications: emailCheckbox.checked
        };
        localStorage.setItem("systemSettings", JSON.stringify(newSettings));
        status.textContent = "✅ Settings saved!";
        status.style.color = "green";
      });
    }
  }
});
