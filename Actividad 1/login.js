document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const adminUser = { username: "admin", password: "password" };

    const user = users.find(
      (u) => u.username === username && u.password === password,
    );

    if (
      user ||
      (username === adminUser.username && password === adminUser.password)
    ) {
      sessionStorage.setItem("currentUser", username);
      console.log("Login exitoso: ", username);
      window.location.href = "welcome.html";
    } else {
      document.getElementById("message").textContent =
        "Usuario o contraseña incorrectos.";
      document.getElementById("message").style.color = "red";
    }
  });
