const API_BASE = 'http://localhost:8000';

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

async function getCsrfCookie() {
    try {
        await fetch(`${API_BASE}/sanctum/csrf-cookie`, {
            credentials: 'include',
        });
    } catch (error) {
        console.error('Erro ao buscar CSRF cookie:', error);
    }
}

async function login(email, password) {
    await getCsrfCookie();

    try {
        const xsrfToken = getCookie('XSRF-TOKEN');
        if (!xsrfToken) {
            console.error('Token CSRF não encontrado');
            return;
        }

        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-XSRF-TOKEN': decodeURIComponent(xsrfToken),
            },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            const data = await response.json();
            console.log('data', data);
            console.log('Login realizado com sucesso!', data);
            window.location.href = '../frontend/admin.html';
        } else {
            const errorData = await response.json();
            console.log('errorData', errorData);
            console.error('Falha no login:', errorData.message || 'Erro desconhecido');
        }
    } catch (error) {
        console.error('Erro na requisição de login:', error);
    }
}

async function getUserData() {
    try {
        const response = await fetch(`${API_BASE}/api/user`, {
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
            }
        });

        if (response.ok) {
            const user = await response.json();
            return user;
        } else {
            throw new Error('Não autenticado');
        }
    } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        return null;
    }
}
