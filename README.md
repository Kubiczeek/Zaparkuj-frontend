# Zaparkuj - Progressive web app

A web application for monitoring parking lot occupancy with data visualization and parking lot search capabilities.

## Features

- Interactive map with parking lot locations
- Real-time parking occupancy data
- Search functionality for finding nearby parking lots
- Distance-based sorting of parking lots
- Data visualization with graphs for historical occupancy
- CSV data upload and analysis
- Filter options for data visualization (by parking ID and day of week)

## Technology Stack

- Frontend: Svelte/SvelteKit
- Styling: CSS
- Data Visualization: Chart.js
- Maps: Leaflet

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## API Integration

The application connects to a backend service at `http://127.0.0.1:8000` to fetch current parking occupancy data.

To change the backend URL:
1. Open `src/lib/actions/fetchCurrentOccupancy.js`
2. Update the `BACKEND_URL` constant to your desired endpoint
`const BACKEND_URL = 'http://127.0.0.1:8000';`
## Configuration

Parking lot data is stored in `src/lib/parkingLots/data.json`. The file follows this structure:

```json
[
  {
    "id": "unique-id",
    "name": "Parking Lot Name",
    "center": [latitude, longitude],
    "coordinates": [
      [lat1, lng1],
      [lat2, lng2],
      ...
    ],
    "capacity": 100
  },
  ...
]
```

To add or modify parking lots, edit this file following the structure above.

## Project Structure

- `/src/routes`: SvelteKit routes for different pages
- `/src/lib`: Shared libraries and components
    - `/actions`: API and utility functions
    - `/assets`: Static assets like images
    - `/stores`: Svelte stores for state management
    - `/parkingLots`: Parking lot data

## Usage

1. View the map to see available parking lots
2. Search for specific parking locations using the search bar
3. Click on a parking lot to view details
4. Upload CSV data on the graphs page to analyze historical trends
5. Apply filters to visualize occupancy patterns by day and location

## Development

The project uses TypeScript/JavaScript and npm for package management.

## License

This project is licensed under the MIT License - see the LICENSE file for details.