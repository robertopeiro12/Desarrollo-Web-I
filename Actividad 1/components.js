async function loadComponent(elementId, filePath) {
  try {
    const response = await fetch(filePath);
    const html = await response.text();
    document.getElementById(elementId).innerHTML = html;
  } catch (error) {
    console.error('Error cargando componente:', error);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  loadComponent('header', 'components/header.html');
  loadComponent('footer', 'components/footer.html');
});
