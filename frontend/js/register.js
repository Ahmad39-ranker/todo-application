// frontend/js/register.js

/**
 * Handles user registration.
 * @param {Event} event - The form submission event.
 * @param {HTMLFormElement} registerForm - The registration form element.
 * @param {Function} showMessage - Utility function to display messages.
 * @param {Function} updateNav - Utility function to update navigation.
 * @param {string} USER_SERVICE_URL - Base URL for the user service.
 * @param {Function} setToken - Function to set the current JWT token.
 */
export async function handleRegister(event, registerForm, showMessage, updateNav, USER_SERVICE_URL, setToken) {
    event.preventDefault();
    const email = registerForm.elements.email.value;
    const password = registerForm.elements.password.value;

    try {
        const response = await fetch(`${USER_SERVICE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_email: email, user_pwd: password })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(data.message, 'success');
            registerForm.reset();
            // Auto-login after registration
            setToken(data.token); // Set the token in the main script
            localStorage.setItem('jwtToken', data.token); // Store in local storage
            updateNav(); // Update UI
        } else {
            showMessage(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showMessage('Network error during registration', 'error');
    }
}
