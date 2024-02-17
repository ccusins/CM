document.addEventListener("DOMContentLoaded", function() {
    const passwordForm = document.querySelector('#password-form');
    passwordForm.addEventListener('submit', async function() {
        const passwordValue  = passwordForm.querySelector('#password-value').value;
        const response = await fetch(`/cmbettingapi/supportpagelogin/${encodeURIComponent(passwordValue)}`);
        if (response.redirected) {
            window.location.href = response.url;
        } else {
            passwordForm.querySelector('#password-error').style.display = 'block';
        }
    });
});