// Navbar authentication helper – chạy trên mọi trang có navbar
(() => {
  const token = localStorage.getItem('token');
  const nav = document.querySelector('.navbar-nav');
  if (!nav) return; // no navbar found

  // Remove existing login link if present (to avoid duplicate after reload)
  const loginLink = nav.querySelector('a[href="Login.html"]');

  if (token) {
    // Decode JWT payload (no verification needed client‑side)
    let role = null;
    try {
      function parseJwt(t){
  const base64Url = t.split('.')[1];
  const base64 = base64Url.replace(/-/g,'+').replace(/_/g,'/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(c=>`%${('00'+c.charCodeAt(0).toString(16)).slice(-2)}`).join(''));
  return JSON.parse(jsonPayload);
}
const payload = parseJwt(token);
      role = payload.role;
    } catch (e) {
      console.warn('Invalid token');
    }

    // Add user avatar dropdown with settings & logout
    const userDropdownLi = document.createElement('li');
    userDropdownLi.className = 'nav-item dropdown';
    userDropdownLi.innerHTML = `
      <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
        <i class="fas fa-user-circle me-1"></i>
      </a>
      <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
        <li><a class="dropdown-item" href="#" id="settings-link"><i class="fas fa-cog me-1"></i>Cài đặt</a></li>
        ${role === 'admin' ? '<li><a class="dropdown-item" href="Admin.html"><i class="fas fa-tools me-1"></i>Quản trị</a></li>' : ''}
        <li><hr class="dropdown-divider"></li>
        <li><a class="dropdown-item" href="#" id="logout-link"><i class="fas fa-sign-out-alt me-1"></i>Đăng xuất</a></li>
      </ul>`;
    nav.appendChild(userDropdownLi);

    // Remove login link
    if (loginLink) loginLink.remove();

    // Logout handler
    const logoutEl = document.getElementById('logout-link');
    logoutEl && logoutEl.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('token');
      window.location.reload();
    });
  } else {
    // No token – keep login link unchanged (already in HTML)
    // Ensure admin link is not present
    const adminLink = nav.querySelector('a[href="Admin.html"]');
    if (adminLink) adminLink.remove();
  }
})();
