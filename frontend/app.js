const API = "https://login-system-production-3283.up.railway.app";

// ================= UI CONTROL =================
function showLogin() {
  const c = document.querySelector(".container");
  c.classList.remove("dashboard-mode")
  c.classList.add("auth-mode");

  document.getElementById("loginBox").classList.remove("hidden");
  document.getElementById("registerBox").classList.add("hidden");
  document.getElementById("dashboardBox").classList.add("hidden");
}

function showRegister() {
  const c = document.querySelector(".container");
  c.classList.remove("dashboard-mode");
  c.classList.add("auth-mode");

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
  try {
    const res = await fetch(`${API}/api/posts`);
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

    // total posts
    document.getElementById("totalPosts").innerText = data.length;

    // welcome user
    const token = localStorage.getItem("token");

    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      document.getElementById("welcomeText").innerText =
        `Welcome back, ${payload.username} 👋`;
    }

  } catch (err) {
    console.error(err);
  }
}

async function createPost() {
  try {
    const title = document.getElementById("postTitle").value;
    const content = document.getElementById("postContent").value;

    const token = localStorage.getItem("token");

    if (!title || !content) {
      alert("Isi judul dan isi post");
      return;
    }

    const res = await fetch(`${API}/api/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title,
        content
      })
    });

    const data = await res.json();

    if (res.ok) {
      document.getElementById("postTitle").value = "";
      document.getElementById("postContent").value = "";

      loadPosts();
    } else {
      alert(data.message);
    }

  } catch (err) {
    console.error(err);
    alert("Gagal membuat post");
  }
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

showLogin();