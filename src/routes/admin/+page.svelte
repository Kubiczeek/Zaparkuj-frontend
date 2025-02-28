<script>
    let password = $state("");
    let downloading = $state(false);

	async function downloadCsv() {
		if (password === "Hesloo1") {
			downloading = true;
			const response = await fetch(`http://127.0.0.1:8000/api/v1/admin/csv`, {
				method: 'GET',
				headers: {
					'Authorization': 'Basic ' + btoa('kubiczeek:xvylUhi&]%,WH@1')
				}
			}).then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response;
            });

			// Convert the response to a blob
            const blob = await response.blob();

			// Create a link element
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
			const currentDate = new Date().toISOString().split('T')[0];
			link.download = `parking-statistics-${currentDate}.csv`;
			document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            downloading = false;
        }
    }
</script>

<div>
    <h1>Admin Page</h1>
    <p>Zadejte heslo pro stáhnutní statistik z parkovišť</p>
    <input type="password" bind:value={password} placeholder="Heslo" />
    <button onclick={async () => await downloadCsv()}>{downloading ? "Stahuji..." : "Stáhnout"}</button>
    <a href="/">Návrat na hlavní stránku</a>
</div>

<style>
    div {
        max-width: 400px;
        margin: 2rem auto;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        background-color: var(--color-white);
        text-align: center;
    }

    h1 {
        color: var(--color-black);
        margin-bottom: 1rem;
    }

    p {
        color: var(--color-black);
        opacity: 0.7;
        margin-bottom: 1.5rem;
    }

    input {
        width: 100%;
        padding: 0.8rem;
        margin-bottom: 1rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
        box-sizing: border-box;
    }

    input:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 2px rgba(40, 127, 255, 0.2);
    }

    button {
        background-color: var(--color-green);
        color: var(--color-white);
        border: none;
        padding: 0.8rem 1.5rem;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    button:hover {
        background-color: color-mix(in srgb, var(--color-green) 90%, black);
    }

    button:active {
        transform: translateY(1px);
    }

    a {
        display: block;
        color: var(--color-primary);
        text-decoration: none;
        margin-top: 1rem;
        font-size: 0.9rem;
        transition: opacity 0.2s;
    }

    a:hover {
        opacity: 0.8;
    }

    a:active {
        transform: translateY(1px);
    }
</style>