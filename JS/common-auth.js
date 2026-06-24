// Common authentication helpers used across the site

/**
 * Returns true if a JWT token exists in localStorage.
 */
function isAuthenticated() {
  return Boolean(localStorage.getItem('token'));
}

/**
 * Shows a Bootstrap modal prompting the user to log in.
 * @param {string} action - Description of the action that requires login.
 */
function requireLogin(action) {
  // Fill the action placeholder inside the modal
  const actionSpan = document.getElementById('login-action-text');
  if (actionSpan) actionSpan.textContent = action;

  const modalEl = document.getElementById('loginPromptModal');
  if (modalEl) {
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
    return;
  }
  // Fallback to simple alert if modal not found
  alert(`Bạn cần đăng nhập để ${action}.`);
}
