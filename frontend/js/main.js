document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('#login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.querySelector('#email').value;
            const password = document.querySelector('#password').value;

            await login(email, password);
        });
    }
});
