const API = "https://login-system-production-3283.up.railway.app";

// ================= UI CONTROL =================
function showLogin() {
  document.getElementById("loginBox").classList.remove("hidden");
  document.getElementById("registerBox").classList.add("hidden");
  document.getElementById("dashboardBox").classList.add("hidden");
}

function showRegister() {
  document.getElementById("loginBox").classList.add("hidden");
  document.getElementById("registerBox").classList.remove("hidden");
  document.getElementById("dashboardBox").classList.add("hidden");
}

function showDashboard() {
  document.getElementById("loginBox").classList.add("hidden");
  document.getElementById("registerBox").classList.add("hidden");
  document.getElementById("dashboardBox").classList.remove("hidden");
}

// ================= LOGIN =================
async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`${API}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (data.token) {
    localStorage.setItem("token", data.token);
    showDashboard();
    loadPosts();
  } else {
    document.getElementById("msg").innerText = data.message;
  }
}

// ================= REGISTER =================
async function register() {
  const username = document.getElementById("rusername").value;
  const password = document.getElementById("rpassword").value;

  const res = await fetch(`${API}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (res.ok) {
    document.getElementById("rmsg").style.color = "green";
    document.getElementById("rmsg").innerText = "Register berhasil";

    setTimeout(() => {
      showLogin();
    }, 1000);
  } else {
    document.getElementById("rmsg").innerText = data.message;
  }
}

// ================= POSTS =================
async function loadPosts() {
  const res = await fetch(`${API}/api/posts`);
  const data = await res.json();

  let html = "";

  data.forEach(p => {
    html += `
      <div class="post">
        <h3>${p.title}</h3>
        <p>${p.content}</p>
        <small>${p.author}</small>
      </div>
    `;
  });

  document.getElementById("posts").innerHTML = html;
}

// ================= LOGOUT =================
function logout() {
  localStorage.removeItem("token");
  showLogin();
}

// ================= GLOBAL =================
window.login = login;
window.register = register;
window.loadPosts = loadPosts;
window.logout = logout;
window.showLogin = showLogin;
window.showRegister = showRegister;