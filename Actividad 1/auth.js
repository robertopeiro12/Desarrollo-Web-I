//  Busca el sessionStorage para verificar si el usuario está autenticado
document.addEventListener('DOMContentLoaded', function() {
  const currentUser = sessionStorage.getItem("currentUser");
  
  // Si no hay usuario autenticado, redirige al login
  if (!currentUser) {
    window.location.href = "login.html";
  }
  
  // Si el usuario está autenticado, muestra un mensaje de bienvenida
  const welcomeElement = document.querySelector('main h1');
  if (welcomeElement && currentUser && window.location.pathname.includes('welcome')) {
    welcomeElement.textContent = `¡Bienvenido, ${currentUser}!`;
  }
});

// Función para cerrar sesión
function logout() {
  sessionStorage.removeItem("currentUser");
  window.location.href = "login.html";
}
