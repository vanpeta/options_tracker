// Form and UI logic
import { fetchOptionChain, fetchQuote, fetchDividendYield } from './api.js';
import { loadStrikes, loadStrikes2, updatePremium, updatePremium2, optionChain, selectedChain, selectedChain2 } from './options.js';

export function setupForm(allTickers) {
    document.addEventListener('DOMContentLoaded', () => {
        const datalist = document.getElementById('tickers-list');
        allTickers.forEach(ticker => {
            const option = document.createElement('option');
            option.value = ticker;
            datalist.appendChild(option);
        });
    });
}

export async function loadExpirations() {
    const apiKey = document.getElementById('api_key').value;
    if (!apiKey) {
        console.error('API key is required.');
        return;
    }
    const ticker = document.getElementById('ticker').value.toUpperCase();
    try {
        optionChain.value = await fetchOptionChain(apiKey, ticker);
        const expirations = [...new Set(optionChain.value.map(c => c.expirationDate))].sort();
        // Defensive: check if expiration elements exist
        const expSelect = document.getElementById('expiration');
        if (expSelect) {
            expSelect.value = expirations[0] || '';
            expSelect.setAttribute('min', expirations[0]);
            expSelect.setAttribute('max', expirations[expirations.length-1]);
            expSelect.onkeydown = function(e) { e.preventDefault(); };
            expSelect.oninput = function(e) {
                if (!expirations.includes(e.target.value)) {
                    e.target.classList.remove('exp-date-available');
                    e.target.classList.add('is-invalid');
                } else {
                    e.target.classList.add('exp-date-available');
                    e.target.classList.remove('is-invalid');
                }
            };
            expSelect.onblur = function(e) {
                if (!expirations.includes(e.target.value)) e.target.value = expirations[0];
            };
        }
        const expList = document.getElementById('expirations-list');
        if (expList) {
            expList.innerHTML = '';
            expirations.forEach(date => {
                const option = document.createElement('option');
                option.value = date;
                expList.appendChild(option);
            });
        }
        const expSelect2 = document.getElementById('expiration2');
        if (expSelect2) {
            expSelect2.value = expirations[0] || '';
            expSelect2.setAttribute('min', expirations[0]);
            expSelect2.setAttribute('max', expirations[expirations.length-1]);
            expSelect2.onkeydown = function(e) { e.preventDefault(); };
            expSelect2.oninput = function(e) {
                if (!expirations.includes(e.target.value)) {
                    e.target.classList.remove('exp-date-available');
                    e.target.classList.add('is-invalid');
                } else {
                    e.target.classList.add('exp-date-available');
                    e.target.classList.remove('is-invalid');
                }
            };
            expSelect2.onblur = function(e) {
                if (!expirations.includes(e.target.value)) e.target.value = expirations[0];
            };
        }
        const expList2 = document.getElementById('expirations-list2');
        if (expList2) {
            expList2.innerHTML = '';
            expirations.forEach(date => {
                const option = document.createElement('option');
                option.value = date;
                expList2.appendChild(option);
            });
        }
        // Fetch current stock price
        const S0 = await fetchQuote(apiKey, ticker);
        const S0Input = document.getElementById('S0');
        if (S0Input) S0Input.value = S0.toFixed(2);
        // Fetch dividend yield
        const q = await fetchDividendYield(apiKey, ticker);
        const qInput = document.getElementById('q');
        if (qInput) qInput.value = q.toFixed(4);
        loadStrikes();
    } catch (error) {
        console.error('Error fetching expirations: ' + error.message);
    }
}

export function toggleSecondContract() {
    const second = document.getElementById('second-contract');
    second.style.display = document.getElementById('add_second').checked ? 'block' : 'none';
    if (second.style.display === 'block') {
        loadStrikes2();
    }
}

export function setupFormValidation() {
    function validateInputs() {
        // Required for first contract
        const requiredIds = [
            'api_key', 'ticker', 'current_date', 'expiration', 'type', 'position', 'S0', 'r', 'q'
        ];
        let missing = [];
        requiredIds.forEach(id => {
            const el = document.getElementById(id);
            if (!el || el.value === '' || el.value === null) {
                missing.push(id);
            }
        });
        // Only require strike, K, P, sig if a strike is selected for contract 1
        if (document.getElementById('strike').value !== '') {
            ['strike', 'K', 'P', 'sig'].forEach(id => {
                const el = document.getElementById(id);
                if (!el || el.value === '' || el.value === null) {
                    missing.push(id);
                }
            });
        }
        // If second contract enabled AND a strike is selected, check those too
        if (document.getElementById('add_second').checked && document.getElementById('strike2').value !== '') {
            const required2 = ['expiration2', 'type2', 'position2', 'strike2', 'K2', 'P2', 'sig2'];
            required2.forEach(id => {
                const el = document.getElementById(id);
                if (!el || el.value === '' || el.value === null) {
                    missing.push(id);
                }
            });
        }
        return missing;
    }

    function updateChartButtonState() {
        const btn = document.querySelector('button.btn-success');
        const missing = validateInputs();
        let msgDiv = document.getElementById('chart-btn-msg');
        if (!msgDiv) {
            msgDiv = document.createElement('div');
            msgDiv.id = 'chart-btn-msg';
            msgDiv.style.color = 'red';
            msgDiv.style.fontSize = '0.95em';
            msgDiv.style.marginTop = '8px';
            btn.parentNode.insertBefore(msgDiv, btn.nextSibling);
        }
        if (missing.length > 0) {
            msgDiv.textContent = 'Please fill in all required fields: ' + missing.join(', ');
        } else {
            msgDiv.textContent = '';
        }
        btn.dataset.missing = missing.join(', ');
    }

    // Listen for changes to all relevant inputs
    const inputIds = [
        'api_key', 'ticker', 'current_date', 'expiration', 'type', 'position',
        'strike', 'K', 'P', 'sig', 'S0', 'r', 'q',
        'add_second', 'expiration2', 'type2', 'position2', 'strike2', 'K2', 'P2', 'sig2'
    ];
    inputIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', updateChartButtonState);
            el.addEventListener('change', updateChartButtonState);
        }
    });

    // Also update on form load
    window.addEventListener('DOMContentLoaded', updateChartButtonState);

    // Intercept chart button click if missing fields
    const chartBtn = document.querySelector('button.btn-success');
    if (chartBtn) {
        chartBtn.addEventListener('click', function(e) {
            const missing = chartBtn.dataset.missing || '';
            if (missing.length > 0) {
                e.preventDefault();
                let msg = 'Cannot generate chart. Please fill in all required fields.';
                msg += '\nMissing or invalid: ' + missing.replace(/,/g, ', ');
                alert(msg);
                return; // Prevent chart generation
            }
            // Only generate chart if no missing fields
            window.plotChart();
        });
    }

    // Ensure strike grid for second contract is shown when appropriate
    window.toggleSecondContract = function() {
        const second = document.getElementById('second-contract');
        second.style.display = document.getElementById('add_second').checked ? 'block' : 'none';
        if (second.style.display === 'block') {
            loadStrikes2();
            updateChartButtonState();
        } else {
            updateChartButtonState();
        }
    };

    window.loadExpirations = loadExpirations;
    window.loadStrikes = loadStrikes;
    window.loadStrikes2 = loadStrikes2;
    window.updatePremium = updatePremium;
    window.updatePremium2 = updatePremium2;
    window.toggleSecondContract = toggleSecondContract;
}
