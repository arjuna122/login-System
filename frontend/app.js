const API = "https://login-system-production-3283.up.railway.app";

// ================= UI =================
function showLogin() {
  const c = document.querySelector(".container");
  c.classList.remove("dashboard-mode");
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
  const c = document.querySelector(".container");
  c.classList.remove("auth-mode");
  c.classList.add("dashboard-mode");

  document.getElementById("loginBox").classList.add("hidden");
  document.getElementById("registerBox").classList.add("hidden");
  document.getElementById("dashboardBox").classList.remove("hidden");
}

// ================= LOGIN =================
async function login() {
  try {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const res = await fetch(API + "/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok && data.token) {
      localStorage.setItem("token", data.token);
      showDashboard();
      loadPosts();
    } else {
      document.getElementById("msg").innerText = data.message;
    }

  } catch (err) {
    console.error(err);
  }
}

// ================= REGISTER =================
async function register() {
  try {
    const username = document.getElementById("rusername").value;
    const password = document.getElementById("rpassword").value;

    const res = await fetch(API + "/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
      document.getElementById("rmsg").style.color = "lightgreen";
      document.getElementById("rmsg").innerText = "Register berhasil";

      setTimeout(() => {
        showLogin();
      }, 1000);

    } else {
      document.getElementById("rmsg").innerText = data.message;
    }

  } catch (err) {
    console.error(err);
  }
}

// ================= LOAD POSTS =================
async function loadPosts() {
  try {
    const res = await fetch(API + "/api/posts");
    const data = await res.json();

    const token = localStorage.getItem("token");
    let username = "";

    document.getElementById("adminBtn").classList.add("hidden");

    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      username = payload.username;

      if (payload.role === "admin") {
        document.getElementById("adminBtn").classList.remove("hidden");
      }

      document.getElementById("welcomeText").innerText =
        "Welcome back, " + username + " 👋";
    }

    document.getElementById("totalPosts").innerText = data.length;

    let html = "";

    for (let i = 0; i < data.length; i++) {
      const post = data[i];

      html +=
        '<div class="post">' +
        "<h3>" + post.title + "</h3>" +
        "<p>" + post.content + "</p>" +
        "<small>by " + post.author + "</small>";

      if (post.author === username || (token && JSON.parse(atob(token.split(".")[1])).role === "admin")) {
        html +=
          '<div class="post-actions">' +
          '<button onclick="editPost(\'' + post._id + '\')">✏️ Edit</button>' +
          '<button onclick="deletePost(\'' + post._id + '\')">🗑 Delete</button>' +
          "</div>";
      }

      html += "</div>";
    }

    document.getElementById("posts").innerHTML = html;

  } catch (err) {
    console.error(err);
  }
}

// ================= CREATE POST =================
async function createPost() {
  try {
    const title = document.getElementById("postTitle").value;
    const content = document.getElementById("postContent").value;
    const token = localStorage.getItem("token");

    if (!title || !content) {
      alert("Isi judul dan isi post");
      return;
    }

    const res = await fetch(API + "/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ title, content })
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
  }
}

// ================= DELETE POST =================
async function deletePost(id) {
  try {
    const yes = confirm("Yakin hapus post ini?");
    if (!yes) return;

    const token = localStorage.getItem("token");

    const res = await fetch(API + "/api/posts/" + id, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token
      }
    });

    const data = await res.json();

    if (res.ok) {
      loadPosts();
    } else {
      alert(data.message);
    }

  } catch (err) {
    console.error(err);
  }
}

// ================= EDIT POST =================
async function editPost(id) {
  try {
    const newTitle = prompt("Edit judul:");
    if (!newTitle) return;

    const newContent = prompt("Edit isi post:");
    if (!newContent) return;

    const token = localStorage.getItem("token");

    const res = await fetch(API + "/api/posts/" + id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({
        title: newTitle,
        content: newContent
      })
    });

    const data = await res.json();

    if (res.ok) {
      loadPosts();
    } else {
      alert(data.message);
    }

  } catch (err) {
    console.error(err);
  }
}

// ================= ADMIN PANEL =================
async function loadUsers() {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(API + "/api/admin/users", {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    let html = "";

    for (let i = 0; i < data.length; i++) {
      html +=
        '<div class="post">' +
        "<p><b>" + data[i].username + "</b> (" + data[i].role + ")</p>";

      if (data[i].role !== "admin") {
        html +=
          '<button onclick="deleteUser(\'' + data[i]._id + '\')">Delete</button>';
      }

      html += "</div>";
    }

    document.getElementById("totalUsers").innerText = data.length;
    document.getElementById("usersList").innerHTML = html;

    document.getElementById("posts").classList.add("hidden");
    document.querySelector(".create-post").classList.add("hidden");
    document.getElementById("adminPanel").classList.remove("hidden");

  } catch (err) {
    console.error(err);
  }
}

// ================= DELETE USER =================
async function deleteUser(id) {
  try {
    const yes = confirm("Yakin hapus user ini?");
    if (!yes) return;

    const token = localStorage.getItem("token");

    const res = await fetch(API + "/api/admin/users/" + id, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token
      }
    });

    const data = await res.json();
    console.log(res.status, data);

    if (res.ok) {
      loadUsers();
    } else {
      alert(data.message);
    }

  } catch (err) {
    console.error(err);
  }
}

// ================= CLOSE ADMIN =================
function closeAdmin() {
  document.getElementById("adminPanel").classList.add("hidden");
  document.getElementById("posts").classList.remove("hidden");
  document.querySelector(".create-post").classList.remove("hidden");
}

// ================= LOGOUT =================
function logout() {
  localStorage.removeItem("token");
  showLogin();
}

// ================= GLOBAL =================
window.login = login;
window.register = register;
window.showLogin = showLogin;
window.showRegister = showRegister;
window.logout = logout;

window.loadPosts = loadPosts;
window.createPost = createPost;
window.editPost = editPost;
window.deletePost = deletePost;

window.loadUsers = loadUsers;
window.deleteUser = deleteUser;
window.closeAdmin = closeAdmin;

// ================= START =================
showLogin();