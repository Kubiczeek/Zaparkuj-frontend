<script>
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';

	let file1 = $state(null);
	let file2 = $state(null);
	let file1Name = $state('');
	let file2Name = $state('');
	let parsedData1 = $state([]);
	let parsedData2 = $state([]);
	let chart = $state(null);
	let parkingIds = $state([]);
	let selectedParkingId = $state('');
	let selectedDay = $state('');
	let isLoading = $state(false);
	let error = $state('');

	const days = [
		{ value: 0, label: 'Pondělí' },
		{ value: 1, label: 'Úterý' },
		{ value: 2, label: 'Středa' },
		{ value: 3, label: 'Čtvrtek' },
		{ value: 4, label: 'Pátek' },
		{ value: 5, label: 'Sobota' },
		{ value: 6, label: 'Neděle' }
	];

	onMount(() => {
		// Clean up chart when component is destroyed
		return () => {
			if (chart) {
				chart.destroy();
			}
		};
	});

	function handleFileUpload(event, fileNum) {
		const file = event.target.files[0];
		if (!file) return;

		isLoading = true;
		error = '';

		if (fileNum === 1) {
			file1 = file;
			file1Name = file.name;
		} else {
			file2 = file;
			file2Name = file.name;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const csv = e.target.result;
				const parsed = parseCSV(csv);

				if (fileNum === 1) {
					parsedData1 = parsed;
					updateParkingIds([...parsed]);
				} else {
					parsedData2 = parsed;
					updateParkingIds([...parsed, ...parsedData1]);
				}

				isLoading = false;
			} catch (err) {
				error = `Chyba při zpracování souboru: ${err.message}`;
				isLoading = false;
			}
		};

		reader.onerror = () => {
			error = 'Chyba při čtení souboru';
			isLoading = false;
		};

		reader.readAsText(file);
	}

	function parseCSV(csv) {
		const lines = csv.split('\n');
		const result = [];

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();
			if (!line) continue;

			const values = line.split(',');
			if (values.length !== 4) continue;

			const [identifier, day, time, occupancy] = values;

			// Zpracování hodnoty occupancy
			let occupancyValue = occupancy.trim();
			if (occupancyValue === "None") {
				occupancyValue = null;
			} else {
				occupancyValue = parseInt(occupancyValue, 10);
			}

			result.push({
				identifier: identifier.trim(),
				day: parseInt(day.trim(), 10),
				time: time.trim(),
				occupancy: occupancyValue
			});
		}

		return result;
	}


	function updateParkingIds(data) {
		const uniqueIds = new Set();
		data.forEach(item => uniqueIds.add(item.identifier));
		parkingIds = Array.from(uniqueIds);

		if (parkingIds.length > 0 && !selectedParkingId) {
			selectedParkingId = parkingIds[0];
		}
	}

	function createGraph() {
		if (!selectedParkingId || selectedDay === '') {
			error = 'Vyberte parkoviště a den pro zobrazení grafu';
			return;
		}

		error = '';
		const day = parseInt(selectedDay, 10);

		// Filter data for selected parking ID and day
		const data1ForGraph = parsedData1.filter(item =>
			item.identifier === selectedParkingId &&
			item.day === day
		);

		const data2ForGraph = parsedData2.filter(item =>
			item.identifier === selectedParkingId &&
			item.day === day
		);

		if (data1ForGraph.length === 0 && data2ForGraph.length === 0) {
			error = 'Pro vybrané parkoviště a den nejsou k dispozici žádná data';
			return;
		}

		const chartCanvas = document.getElementById('occupancyChart');
		if (!chartCanvas) {
			error = 'Graf nelze vykreslit - chybí canvas element';
			return;
		}

		// Destroy existing chart if there is one
		if (chart) {
			chart.destroy();
		}

		// Organize data by hour for simpler visualization
		const hourlyData1 = groupDataByHour(data1ForGraph);
		const hourlyData2 = groupDataByHour(data2ForGraph);

		// Get all hours from both datasets
		const allHours = Array.from(
			new Set([...Object.keys(hourlyData1), ...Object.keys(hourlyData2)].map(h => parseInt(h)))
		).sort((a, b) => a - b);

		// Create new chart
		chart = new Chart(chartCanvas, {
			type: 'line',
			data: {
				labels: allHours.map(h => `${h}:00`),
				datasets: [
					{
						label: file1Name || 'Dataset 1',
						data: allHours.map(hour => hourlyData1[hour] || null),
						borderColor: 'rgb(75, 192, 192)',
						tension: 0.1,
						fill: false
					},
					{
						label: file2Name || 'Dataset 2',
						data: allHours.map(hour => hourlyData2[hour] || null),
						borderColor: 'rgb(255, 99, 132)',
						tension: 0.1,
						fill: false
					}
				]
			},
			options: {
				responsive: true,
				plugins: {
					title: {
						display: true,
						text: `Obsazenost parkoviště ${selectedParkingId} - ${days.find(d => d.value === day)?.label}`
					},
					tooltip: {
						callbacks: {
							title: (tooltipItems) => {
								return `Čas: ${tooltipItems[0].label}`;
							}
						}
					}
				},
				scales: {
					y: {
						beginAtZero: true,
						title: {
							display: true,
							text: 'Průměrný počet vozidel'
						}
					},
					x: {
						title: {
							display: true,
							text: 'Hodina'
						}
					}
				}
			}
		});
	}

	// Group data by hour and calculate average occupancy for each hour
	function groupDataByHour(data) {
		const hourlyData = {};

		data.forEach(item => {
			// Přeskočit záznamy s hodnotou "None"
			if (item.occupancy === "None" || item.occupancy === null) return;

			const hour = parseInt(item.time.split(':')[0], 10);

			if (!hourlyData[hour]) {
				hourlyData[hour] = {
					sum: 0,
					count: 0
				};
			}

			hourlyData[hour].sum += item.occupancy;
			hourlyData[hour].count += 1;
		});

		// Výpočet průměrů pro každou hodinu
		const result = {};
		Object.keys(hourlyData).forEach(hour => {
			result[hour] = Math.round(hourlyData[hour].sum / hourlyData[hour].count);
		});

		return result;
	}

</script>

<div class="container">
    <div class="header">
        <h1>Porovnání obsazenosti parkovišť</h1>
        <p>Nahrajte dva CSV soubory s daty o obsazenosti parkovacích míst a porovnejte je.</p>
    </div>

    <div class="upload-section">
        <div class="file-upload">
            <h2>První dataset</h2>
            <label for="file1">
                <span class="upload-icon">📤</span>
                <span>{file1Name || 'Vyberte soubor CSV'}</span>
                <input
                        type="file"
                        id="file1"
                        accept=".csv"
                        onchange={(e) => handleFileUpload(e, 1)}
                />
            </label>
        </div>

        <div class="file-upload">
            <h2>Druhý dataset</h2>
            <label for="file2">
                <span class="upload-icon">📤</span>
                <span>{file2Name || 'Vyberte soubor CSV'}</span>
                <input
                        type="file"
                        id="file2"
                        accept=".csv"
                        onchange={(e) => handleFileUpload(e, 2)}
                />
            </label>
        </div>
    </div>

    {#if isLoading}
        <div class="loading">Načítání dat...</div>
    {/if}

    {#if error}
        <div class="error">{error}</div>
    {/if}

    {#if parsedData1.length > 0 || parsedData2.length > 0}
        <div class="filters">
            <div class="filter-item">
                <label for="parkingId">Parkoviště:</label>
                <select id="parkingId" bind:value={selectedParkingId}>
                    {#each parkingIds as id}
                        <option disabled={id==="identifier"} value={id}>{id === "identifier" ? "Vyberte id parkoviště" : id}</option>
                    {/each}
                </select>
            </div>

            <div class="filter-item">
                <label for="day">Den v týdnu:</label>
                <select id="day" bind:value={selectedDay}>
                    <option value="" disabled>Vyberte den</option>
                    {#each days as day}
                        <option value={day.value}>{day.label}</option>
                    {/each}
                </select>
            </div>

            <button class="generate-btn" onclick={createGraph}>Vygenerovat graf</button>
        </div>

        <div class="chart-container">
            <canvas id="occupancyChart"></canvas>
        </div>
    {/if}
    <div class="return-link">
        <a href="/">Návrat na hlavní stránku</a>
    </div>
</div>

<style>
    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
        font-family: system-ui, -apple-system, sans-serif;
    }

    .header {
        text-align: center;
        margin-bottom: 2rem;
    }

    h1 {
        color: var(--color-black, #333);
        margin-bottom: 0.5rem;
    }

    p {
        color: var(--color-black, #333);
        opacity: 0.7;
    }

    .upload-section {
        display: flex;
        gap: 2rem;
        margin-bottom: 2rem;
    }

    @media (max-width: 768px) {
        .upload-section {
            flex-direction: column;
        }
    }

    .file-upload {
        flex: 1;
    }

    .file-upload h2 {
        font-size: 1.2rem;
        margin-bottom: 1rem;
        color: var(--color-black, #333);
    }

    .file-upload label {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 2rem;
        background-color: #f8f9fa;
        border: 2px dashed #dee2e6;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .file-upload label:hover {
        border-color: var(--color-primary, #4dabf7);
        background-color: #f1f3f5;
    }

    .upload-icon {
        font-size: 2rem;
        margin-bottom: 1rem;
    }

    .file-upload input {
        display: none;
    }

    .loading, .error {
        text-align: center;
        padding: 1rem;
        margin-bottom: 1rem;
    }

    .loading {
        background-color: #e9ecef;
        border-radius: 4px;
    }

    .error {
        background-color: #ffe3e3;
        color: #c92a2a;
        border-radius: 4px;
    }

    .filters {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
        align-items: flex-end;
    }

    @media (max-width: 768px) {
        .filters {
            flex-direction: column;
        }
    }

    .filter-item {
        flex: 1;
    }

    .filter-item label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
    }

    .filter-item select {
        width: 100%;
        padding: 0.8rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        background-color: white;
    }

    .generate-btn {
        background-color: var(--color-green, #40c057);
        color: white;
        border: none;
        padding: 0.8rem 1.5rem;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        transition: background-color 0.2s;
    }

    .generate-btn:hover {
        background-color: var(--color-green-dark, #2b9348);
    }

    .chart-container {
        background-color: white;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .return-link {
        text-align: center;
        margin-top: 2rem;
    }

    .return-link a {
        color: var(--color-primary, #4dabf7);
        text-decoration: none;
        font-weight: 500;
        transition: opacity 0.2s;
    }

    .return-link a:hover {
        opacity: 0.8;
    }
</style>