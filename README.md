# Enhanced 3D Options Analysis Chart

This project provides an interactive web-based tool for analyzing options contracts using real-time market data from the Finnhub API. The main file is `chart.html`, which features a modern UI built with Bootstrap and advanced charting via Plotly.js.

## Features
- **Real-Time Data:** Fetches live stock price, dividend yield, option premiums, and implied volatility from Finnhub.
- **Options Chain Analysis:** Supports S&P 500 and NASDAQ-100 tickers with auto-complete.
- **Strategy Visualization:** Allows analysis of single or dual option contracts (spreads, straddles, etc.).
- **3D and 2D Charts:** Visualizes profit/loss over time and stock price, including breakeven points.
- **User-Friendly Interface:** Grid-based strike selection, auto-filled fields, and clear descriptions for each input.

## Usage
1. Open `chart.html` in your browser.
2. Enter your Finnhub API key (register at [finnhub.io](https://finnhub.io/register) for a free key).
3. Select a ticker symbol and load expirations.
4. Choose contract details (expiration, type, strike, position).
5. Optionally add a second contract for strategy analysis.
6. Click "Generate Chart" to view interactive 3D and 2D profit/loss charts.

## Requirements
- Internet connection (to fetch data from Finnhub)
- Finnhub API key

## Technologies Used
- HTML, CSS (Bootstrap)
- JavaScript (Plotly.js for charting)
- Finnhub API

## License
This project is for educational and personal use. Please check Finnhub's terms for API usage limits and restrictions.
