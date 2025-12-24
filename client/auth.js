// ============================================
// Authentication Page JavaScript
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Check if user is already logged in
  const token = localStorage.getItem('token');
  if (token) {
    // Redirect to main app
    window.location.href = 'index.html';
    return;
  }

  // Elements
  const tabBtns = document.querySelectorAll('.tab-btn');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const authMessage = document.getElementById('auth-message');

  // Tab switching
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      
      // Update active tab
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Show/hide forms
      if (tab === 'login') {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
      } else {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
      }

      // Clear message
      hideMessage();
    });
  });

  // Login form submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    // Disable button
    const submitBtn = loginForm.querySelector('button');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>⏳</span><span>Logging in...</span>';

    try {
      const data = await apiService.login(email, password);
      
      // Store token and user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        id: data._id,
        name: data.name,
        email: data.email
      }));

      // Show success message
      showMessage('Login successful! Redirecting...', 'success');

      // Redirect to main app
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);

    } catch (error) {
      showMessage(error.message || 'Login failed. Please try again.', 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>🔓</span><span>Login</span>';
    }
  });

  // Signup form submission
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    // Validate password match
    if (password !== confirmPassword) {
      showMessage('Passwords do not match!', 'error');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      showMessage('Password must be at least 6 characters!', 'error');
      return;
    }

    // Disable button
    const submitBtn = signupForm.querySelector('button');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>⏳</span><span>Creating account...</span>';

    try {
      const data = await apiService.register(name, email, password);
      
      // Store token and user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        id: data._id,
        name: data.name,
        email: data.email
      }));

      // Show success message
      showMessage('Account created! Redirecting...', 'success');

      // Redirect to main app
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);

    } catch (error) {
      showMessage(error.message || 'Sign up failed. Please try again.', 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>✨</span><span>Create Account</span>';
    }
  });

  // Helper functions
  function showMessage(text, type) {
    authMessage.textContent = text;
    authMessage.className = `auth-message ${type}`;
  }

  function hideMessage() {
    authMessage.className = 'auth-message hidden';
  }
});
