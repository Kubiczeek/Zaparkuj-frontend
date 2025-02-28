<script>
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	const status = page.status;
	const message = getDefaultMessage(status);

	function getDefaultMessage(status) {
		switch (status) {
			case 404:
				return 'Stránka nenalezena';
			case 500:
				return 'Chyba serveru';
			case 403:
				return 'Přístup odepřen';
			default:
				return 'Došlo k neočekávané chybě';
		}
	}

	function goHome() {
		goto('/');
	}
</script>

<div class="error-container">
    <h1>{status}</h1>
    <p class="error-message">{message}</p>
    <button class="home-button" on:click={goHome}>
        Zpět na hlavní stránku
    </button>
</div>

<style>
    .error-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 80dvh;
        width: 100%;
        padding: 2rem;
    }

    h1 {
        font-size: 4rem;
        margin: 0;
        line-height: 1;
        color: var(--color-red);
    }

    .error-message {
        font-size: 1.25rem;
        margin-bottom: .5rem;
        color: #333;
    }

    .home-button {
        background-color: #3498db;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 1.5rem;
        font-size: 1rem;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .home-button:hover {
        background-color: #2980b9;
    }
</style>