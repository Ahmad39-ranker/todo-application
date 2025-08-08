// frontend/js/login.js

/**
 * Handles user login.
 * @param {Event} event - The form submission event.
 * @param {HTMLFormElement} loginForm - The login form element.
 * @param {Function} showMessage - Utility function to display messages.
 * @param {Function} updateNav - Utility function to update navigation.
 * @param {string} USER_SERVICE_URL - Base URL for the user service.
 * @param {Function} setToken - Function to set the current JWT token.
 */
export async function handleLogin(event, loginForm, showMessage, updateNav, USER_SERVICE_URL, setToken) {
    event.preventDefault();
    const email = loginForm.elements.email.value;
    const password = loginForm.elements.password.value;

    try {
        const response = await fetch(`${USER_SERVICE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_email: email, user_pwd: password })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(data.message, 'success');
            setToken(data.token); // Set the token in the main script
            localStorage.setItem('jwtToken', data.token); // Store in local storage
            loginForm.reset();
            updateNav(); // Update UI
        } else {
            showMessage(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Network error during login', 'error');
    }
}
