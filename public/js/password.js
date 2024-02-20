document.addEventListener("DOMContentLoaded", function() {
    const passwordForm = document.querySelector('#password-form');
    passwordForm.addEventListener('submit', async function() {
        const passwordValue  = passwordForm.querySelector('#password-value').value;
        const response = await fetch(`/cmbettingapi/pagelogin/${encodeURIComponent(passwordValue)}`);
        if (response.redirected) {
            // If the response is a redirect, manually redirect the user
            window.location.href = response.url;
        } else {
            // Handle other responses (e.g., error messages)
            passwordForm.querySelector('#password-error').style.display = 'block';
        }
    });
});