document.addEventListener('DOMContentLoaded', function() {
  const currentUser = sessionStorage.getItem("currentUser");

  if (!currentUser) {
    window.location.href = "login.html";
  }

  const welcomeElement = document.querySelector('main h1');
  if (welcomeElement && currentUser && window.location.pathname.includes('welcome')) {
    welcomeElement.textContent = `¡Bienvenido, ${currentUser}!`;
  }
});

function logout() {
  sessionStorage.removeItem("currentUser");
  window.location.href = "login.html";
}
