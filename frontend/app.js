const API = "https://login-system-production-3283.up.railway.app";

// ================= NAVIGATION =================
function showLogin() {
  window.location.href = "login.html";
}

function showRegister() {
  window.location.href = "register.html";
}

// ================= LOGIN =================
async function login() {
  try {
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
      window.location.href = "dashboard.html";
    } else {
      document.getElementById("msg").innerText = data.message;
    }

  } catch (err) {
    document.getElementById("msg").innerText = "Server error";
  }
}

// ================= REGISTER =================
async function register() {
  try {
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
        window.location.href = "login.html";
      }, 1500);

    } else {
      document.getElementById("rmsg").innerText = data.message;
    }

  } catch (err) {
    document.getElementById("rmsg").innerText = "Server error";
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
        <small>by ${p.author}</small>
      </div>
    `;
  });

  document.getElementById("posts").innerHTML = html;
}

// ================= LOGOUT =================
function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

// ================= FIX GLOBAL SCOPE (PENTING) =================
window.login = login;
window.register = register;
window.loadPosts = loadPosts;
window.logout = logout;
window.showLogin = showLogin;
window.showRegister = showRegister;