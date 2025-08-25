// Option pricing and utility functions
export let optionChain = { value: null };
export let selectedChain = null;
export let selectedChain2 = null;

export function loadStrikes() {
    const date = document.getElementById('expiration').value;
    const typeValue = document.getElementById('type').value.toUpperCase();
    if (!date || !optionChain.value) return;
    selectedChain = optionChain.value.find(c => c.expirationDate === date);
    if (!selectedChain) return;
    const chain = selectedChain.options[typeValue] || [];
    const strikes = [...new Set(chain.map(o => o.strike))].sort((a, b) => a - b);
    const grid = document.getElementById('strike-grid');
    grid.innerHTML = '';
    strikes.forEach(strike => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-outline-primary strike-btn';
        btn.textContent = `$ ${strike}`;
        btn.onclick = () => {
            document.getElementById('strike').value = strike;
            Array.from(grid.querySelectorAll('button')).forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updatePremium();
        };
        grid.appendChild(btn);
    });
    document.getElementById('K').value = '';
    document.getElementById('P').value = '';
    document.getElementById('sig').value = '';
    document.getElementById('strike').value = '';
    updatePremium();
}

export function loadStrikes2() {
    const date = document.getElementById('expiration2').value;
    const typeValue = document.getElementById('type2').value.toUpperCase();
    if (!date || !optionChain.value) return;
    selectedChain2 = optionChain.value.find(c => c.expirationDate === date);
    if (!selectedChain2) return;
    const chain = selectedChain2.options[typeValue] || [];
    const strikes = [...new Set(chain.map(o => o.strike))].sort((a, b) => a - b);
    const grid = document.getElementById('strike-grid2');
    grid.innerHTML = '';
    strikes.forEach(strike => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-outline-primary strike-btn';
        btn.textContent = `$ ${strike}`;
        btn.onclick = () => {
            document.getElementById('strike2').value = strike;
            Array.from(grid.querySelectorAll('button')).forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updatePremium2();
        };
        grid.appendChild(btn);
    });
    document.getElementById('K2').value = '';
    document.getElementById('P2').value = '';
    document.getElementById('sig2').value = '';
    document.getElementById('strike2').value = '';
    updatePremium2();
}

export function updatePremium() {
    const strike = parseFloat(document.getElementById('strike').value);
    const type = document.getElementById('type').value;
    if (!selectedChain || isNaN(strike)) return;
    const chainType = type.toUpperCase();
    const chain = selectedChain.options[chainType] || [];
    const opt = chain.find(o => o.strike === strike);
    if (opt) {
        const P = opt.lastPrice || ((opt.bid + opt.ask) / 2) || 0;
        document.getElementById('P').value = P.toFixed(2);
        const sig = opt.impliedVol || 0;
        document.getElementById('sig').value = sig.toFixed(4);
        document.getElementById('K').value = strike.toFixed(2);
    } else {
        document.getElementById('P').value = '';
        document.getElementById('sig').value = '';
        document.getElementById('K').value = '';
    }
}

export function updatePremium2() {
    const strike = parseFloat(document.getElementById('strike2').value);
    const type = document.getElementById('type2').value;
    if (!selectedChain2 || isNaN(strike)) return;
    const chainType = type.toUpperCase();
    const chain = selectedChain2.options[chainType] || [];
    const opt = chain.find(o => o.strike === strike);
    if (opt) {
        const P = opt.lastPrice || ((opt.bid + opt.ask) / 2) || 0;
        document.getElementById('P2').value = P.toFixed(2);
        const sig = opt.impliedVol || 0;
        document.getElementById('sig2').value = sig.toFixed(4);
        document.getElementById('K2').value = strike.toFixed(2);
    } else {
        document.getElementById('P2').value = '';
        document.getElementById('sig2').value = '';
        document.getElementById('K2').value = '';
    }
}

// Option pricing formulas
export function cum_normdist(x) {
    var b1 = 0.319381530;
    var b2 = -0.356563782;
    var b3 = 1.781477937;
    var b4 = -1.821255978;
    var b5 = 1.330274429;
    var p = 0.2316419;
    var c = 0.39894228;
    if (x >= 0.0) {
        var t = 1.0 / (1.0 + p * x);
        return (1.0 - c * Math.exp(-x * x / 2.0) * t * (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1));
    } else {
        var t = 1.0 / (1.0 - p * x);
        return (c * Math.exp(-x * x / 2.0) * t * (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1));
    }
}

export function d1(S, K, tau, r, sig, q) {
    return (Math.log(S / K) + (r - q + sig * sig / 2) * tau) / (sig * Math.sqrt(tau));
}

export function d2(S, K, tau, r, sig, q) {
    return d1(S, K, tau, r, sig, q) - sig * Math.sqrt(tau);
}

export function bs_call(S, K, tau, r, sig, q) {
    if (tau <= 0) return Math.max(0, S - K);
    return S * Math.exp(-q * tau) * cum_normdist(d1(S, K, tau, r, sig, q)) - K * Math.exp(-r * tau) * cum_normdist(d2(S, K, tau, r, sig, q));
}

export function bs_put(S, K, tau, r, sig, q) {
    if (tau <= 0) return Math.max(0, K - S);
    return K * Math.exp(-r * tau) * cum_normdist(-d2(S, K, tau, r, sig, q)) - S * Math.exp(-q * tau) * cum_normdist(-d1(S, K, tau, r, sig, q));
}

export function implied_vol(type, P, S, K, tau, r, q) {
    var low = 0.0001;
    var high = 5.0;
    var max_iter = 100;
    var epsilon = 0.00001;
    for (var i = 0; i < max_iter; i++) {
        var mid = (low + high) / 2;
        var price = (type === 'call') ? bs_call(S, K, tau, r, mid, q) : bs_put(S, K, tau, r, mid, q);
        if (Math.abs(price - P) < epsilon) return mid;
        if (price > P) high = mid;
        else low = mid;
    }
    return (low + high) / 2;
}

export function calculateBreakeven(type, position, K, P) {
    if (type === 'call') {
        return position === 'long' ? K + P : K - P;
    } else {
        return position === 'long' ? K - P : K + P;
    }
}
