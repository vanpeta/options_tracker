// Finnhub API functions
export async function fetchOptionChain(apiKey, ticker) {
    const url = `https://finnhub.io/api/v1/stock/option-chain?symbol=${ticker}&token=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok: ' + response.status);
    const data = await response.json();
    return data.data || [];
}

export async function fetchQuote(apiKey, ticker) {
    const url = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    return data.c || 0;
}

export async function fetchDividendYield(apiKey, ticker) {
    const url = `https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) return 0;
    const data = await response.json();
    return data.dividendYield || 0;
}
