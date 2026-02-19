document
  .getElementById("signupForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const fullname = document.getElementById("fullname").value.trim();
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
      document.getElementById("message").textContent =
        "Las contraseñas no coinciden.";
      document.getElementById("message").style.color = "red";
      return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    const userExists = users.some((user) => user.username === username);
    if (userExists) {
      document.getElementById("message").textContent =
        "El nombre de usuario ya existe.";
      document.getElementById("message").style.color = "red";
      return;
    }

    const newUser = {
      fullname: fullname,
      username: username,
      email: email,
      password: password,
      registeredAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    console.log("Nuevo usuario registrado: ", newUser);
    console.log("Todos los usuarios: ", users);

    document.getElementById("message").textContent =
      "Registro exitoso. Redirigiendo a login.";
    document.getElementById("message").style.color = "green";

    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);
  });
