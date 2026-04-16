const API = "https://login-system-production-3283.up.railway.app";

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
    window.location.href = "dashboard.html";
  } else {
    document.getElementById("msg").innerText = data.message;
  }
}

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

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}