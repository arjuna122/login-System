const API = "https://login-system-production-3283.up.railway.app";

// ================= NAVIGATION =================
function showLogin() {
  window.location.href = "login.html";
}

function showRegister() {
  window.location.href = "register.html";
}

function goDashboard() {
  window.location.href = "dashboard.html";
}

// ================= LOGIN =================
async function login() {
  try {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!username || !password) {
      document.getElementById("msg").innerText = "Isi semua field";
      return;
    }

    const res = await fetch(`${API}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      document.getElementById("msg").innerText = data.message;
      return;
    }

    localStorage.setItem("token", data.token);
    goDashboard();

  } catch (err) {
    console.error(err);
    document.getElementById("msg").innerText = "Server tidak terhubung";
  }
}

// ================= REGISTER =================
async function register() {
  try {
    const username = document.getElementById("rusername").value;
    const password = document.getElementById("rpassword").value;

    if (!username || !password) {
      document.getElementById("rmsg").innerText = "Isi semua field";
      return;
    }

    const res = await fetch(`${API}/api/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      document.getElementById("rmsg").innerText = data.message;
      return;
    }

    document.getElementById("rmsg").style.color = "green";
    document.getElementById("rmsg").innerText = "Register berhasil";

    setTimeout(() => {
      showLogin();
    }, 1200);

  } catch (err) {
    console.error(err);
    document.getElementById("rmsg").innerText = "Server tidak terhubung";
  }
}

// ================= LOAD POSTS =================
async function loadPosts() {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API}/api/posts`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : ""
      }
    });

    if (!res.ok) {
      console.error("Gagal load posts");
      return;
    }

    const data = await res.json();

    let html = "";

    data.forEach(post => {
      html += `
        <div class="post">
          <h3>${post.title}</h3>
          <p>${post.content}</p>
          <small>by ${post.author}</small>
        </div>
      `;
    });

    document.getElementById("posts").innerHTML = html;

  } catch (err) {
    console.error("Error load posts:", err);
  }
}

// ================= LOGOUT =================
function logout() {
  localStorage.removeItem("token");
  showLogin();
}

// ================= GLOBAL EXPORT (IMPORTANT VERCEL) =================
window.login = login;
window.register = register;
window.loadPosts = loadPosts;
window.logout = logout;
window.showLogin = showLogin;
window.showRegister = showRegister;