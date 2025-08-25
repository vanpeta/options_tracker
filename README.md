# Enhanced 3D Options Analysis Chart

This project provides an interactive web-based tool for analyzing options contracts using real-time market data from the Finnhub API. The main file is `chart.html`, which features a modern UI built with Bootstrap, Google-inspired custom CSS, Material icons, and advanced charting via Plotly.js.

## Features
- **Real-Time Data:** Fetches live stock price, dividend yield, option premiums, and implied volatility from Finnhub.
- **Options Chain Analysis:** Supports S&P 500 and NASDAQ-100 tickers with auto-complete.
- **Strategy Visualization:** Analyze single or dual option contracts (spreads, straddles, etc.).
- **3D and 2D Charts:** Visualizes profit/loss over time and stock price, including breakeven points.
- **User-Friendly Interface:**
  - Modern Google-inspired visual identity: rounded cards, gradients, Material icons, and improved input styling.
  - All styles are now in `style.css` for maintainability.
  - Only shows info and chart panels when relevant (no empty cards on load).
  - Improved spacing and layout for better readability and aesthetics.
  - Error messages and validation are shown in the UI, not just the console.
  - Responsive design for desktop and mobile.
- **Robust Error Handling:**
  - User-friendly messages for missing/invalid inputs and option data issues.
  - Chart only renders when all required fields are valid.

## Usage
1. Open `chart.html` in your browser (served via a local web server).
2. Enter your Finnhub API key (register at [finnhub.io](https://finnhub.io/register) for a free key).
3. Select a ticker symbol and load expirations.
4. Choose contract details (expiration, type, strike, position).
5. Optionally add a second contract for strategy analysis.
6. Click "Generate Chart" to view interactive 3D and 2D profit/loss charts.

## Requirements
- Internet connection (to fetch data from Finnhub)
- Finnhub API key
- Local web server (do not open `chart.html` directly as a file)

## Technologies Used
- HTML, CSS (`style.css` for all custom styles)
- Bootstrap 4 (layout)
- Google Material Icons
- JavaScript (Plotly.js for charting)
- Finnhub API

## License
This project is for educational and personal use. Please check Finnhub's terms for API usage limits and restrictions.
