// Chart plotting logic
import { bs_call, bs_put, implied_vol, calculateBreakeven, optionChain, selectedChain, selectedChain2 } from './options.js';

export function plotChart() {
    // Defensive: check required elements before reading value
    var currentDateInput = document.getElementById('current_date');
    var type1Input = document.getElementById('type');
    var position1Input = document.getElementById('position');
    var S0Input = document.getElementById('S0');
    var K1Input = document.getElementById('K');
    var P1Input = document.getElementById('P');
    var expDateInput1 = document.getElementById('expiration');
    var rInput = document.getElementById('r');
    var qInput = document.getElementById('q');
    var sigInput1 = document.getElementById('sig');
    if (!currentDateInput || !type1Input || !position1Input || !S0Input || !K1Input || !P1Input || !expDateInput1 || !rInput || !qInput || !sigInput1) {
        console.error('Missing required input element.');
        return;
    }
    var currentDateStr = currentDateInput.value;
    var currentDate = new Date(currentDateStr);
    var type1 = type1Input.value;
    var position1 = position1Input.value;
    var S0 = parseFloat(S0Input.value);
    var K1 = parseFloat(K1Input.value);
    var P1 = parseFloat(P1Input.value);
    var expDateStr1 = expDateInput1.value;
    var expDate1 = new Date(expDateStr1);
    var r = parseFloat(rInput.value);
    var q = parseFloat(qInput.value);
    var inputSig1 = parseFloat(sigInput1.value);

    var addSecond = document.getElementById('add_second').checked;
    var type2, position2, K2, P2, expDate2, inputSig2;
    if (addSecond) {
        var type2Input = document.getElementById('type2');
        var position2Input = document.getElementById('position2');
        var K2Input = document.getElementById('K2');
        var P2Input = document.getElementById('P2');
        var expDateInput2 = document.getElementById('expiration2');
        var sigInput2 = document.getElementById('sig2');
        if (!type2Input || !position2Input || !K2Input || !P2Input || !expDateInput2 || !sigInput2) {
            console.error('Missing required input element for second contract.');
            return;
        }
        type2 = type2Input.value;
        position2 = position2Input.value;
        K2 = parseFloat(K2Input.value);
        P2 = parseFloat(P2Input.value);
        var expDateStr2 = expDateInput2.value;
        expDate2 = new Date(expDateStr2);
        inputSig2 = parseFloat(sigInput2.value);
    }

    if (expDate1 <= currentDate || (addSecond && expDate2 <= currentDate)) {
        console.error('Expiration date must be after current date.');
        return;
    }

    var T_days1 = (expDate1 - currentDate) / (1000 * 60 * 60 * 24);
    var tau1_full = T_days1 / 365;
    var T_days2 = addSecond ? (expDate2 - currentDate) / (1000 * 60 * 60 * 24) : 0;
    var tau2_full = addSecond ? T_days2 / 365 : 0;
    var max_T_days = Math.max(T_days1, T_days2 || 0);

    var sig1 = inputSig1;
    var useImplied1 = false;
    if (sig1 <= 0) {
        sig1 = implied_vol(type1, P1, S0, K1, tau1_full, r, q);
        useImplied1 = true;
    }
    var sig2 = addSecond ? inputSig2 : 0;
    var useImplied2 = false;
    if (addSecond && sig2 <= 0) {
        sig2 = implied_vol(type2, P2, S0, K2, tau2_full, r, q);
        useImplied2 = true;
    }
    if (isNaN(sig1) || sig1 <= 0 || (addSecond && (isNaN(sig2) || sig2 <= 0))) {
        var infoDiv = document.getElementById('info');
        if (infoDiv) {
            infoDiv.classList.remove('d-none');
            infoDiv.innerHTML = '<span style="color:#d93025;"><b>Could not compute valid volatility for one or both contracts. Please check your inputs (premium, strike, expiration, etc.).</b></span>';
        }
        return;
    }

    var infoDiv = document.getElementById('info');
    if (infoDiv) {
        if (addSecond || sig1 > 0) {
            infoDiv.classList.remove('d-none');
            infoDiv.innerHTML = '<p>Volatility1 (sigma): ' + sig1.toFixed(4) + (useImplied1 ? ' (implied)' : ' (user input)') + '</p>';
            if (addSecond) {
                infoDiv.innerHTML += '<p>Volatility2 (sigma): ' + sig2.toFixed(4) + (useImplied2 ? ' (implied)' : ' (user input)') + '</p>';
                infoDiv.innerHTML += '<p>For strategies, breakeven points may vary and are not automatically calculated.</p>';
            } else {
                var breakeven = calculateBreakeven(type1, position1, K1, P1);
                infoDiv.innerHTML += '<p>Breakeven Stock Price at Expiration: ' + breakeven.toFixed(2) + '</p>';
            }
        } else {
            infoDiv.classList.add('d-none');
            infoDiv.innerHTML = '';
        }
    }

    var num_S = 100;
    var num_dates = 50;

    var S_min = 0.5 * Math.min(S0, K1, addSecond ? K2 : Infinity);
    var S_max = 1.5 * Math.max(S0, K1, addSecond ? K2 : 0);

    var x = [];
    for (var i = 0; i < num_S; i++) {
        x.push(S_min + i * (S_max - S_min) / (num_S - 1));
    }

    var y = [];
    var date_step = max_T_days / (num_dates - 1);
    for (var i = 0; i < num_dates; i++) {
        var date = new Date(currentDate);
        date.setDate(date.getDate() + Math.round(i * date_step));
        y.push(date.toISOString().split('T')[0]);
    }

    var z = [];
    for (var i = 0; i < num_dates; i++) {
        var row = [];
        var day = i * date_step;
        var tau_left1 = Math.max(0, (T_days1 - day) / 365);
        var tau_left2 = addSecond ? Math.max(0, (T_days2 - day) / 365) : 0;
        for (var j = 0; j < num_S; j++) {
            var S = x[j];
            var V1 = (type1 === 'call') ? bs_call(S, K1, tau_left1, r, sig1, q) : bs_put(S, K1, tau_left1, r, sig1, q);
            var profit1 = (position1 === 'long') ? V1 - P1 : P1 - V1;
            var profit2 = 0;
            if (addSecond) {
                var V2 = (type2 === 'call') ? bs_call(S, K2, tau_left2, r, sig2, q) : bs_put(S, K2, tau_left2, r, sig2, q);
                profit2 = (position2 === 'long') ? V2 - P2 : P2 - V2;
            }
            row.push(profit1 + profit2);
        }
        z.push(row);
    }

    // For 3D surface: symmetric colorscale around zero
    var allZ = z.flat();
    var minZ = Math.min(...allZ);
    var maxZ = Math.max(...allZ);
    var maxAbs = Math.max(Math.abs(minZ), Math.abs(maxZ));
    var data = [{
        x: x,
        y: y,
        z: z,
        type: 'surface',
        colorscale: [[0, 'red'], [0.5, 'white'], [1, 'green']],
        cmin: -maxAbs,
        cmax: maxAbs,
        showscale: true
    }];

    var layout = {
        title: 'Option Profit/Loss Analysis (3D Surface)',
        scene: {
            xaxis: { title: 'Stock Price' },
            yaxis: { title: 'Date', type: 'date' },
            zaxis: { title: 'Profit/Loss' }
        },
        width: 1000,
        height: 800
    };

    Plotly.newPlot('plot', data, layout);

    // Show plot and plot2d only when chart is rendered
    var plotDiv = document.getElementById('plot');
    var plot2dDiv = document.getElementById('plot2d');
    if (plotDiv) plotDiv.classList.remove('d-none');
    if (plot2dDiv) plot2dDiv.classList.remove('d-none');

    // For 2D plot: colored fills for profit/loss
    var exp_z = z[z.length - 1];
    var pos_y = exp_z.map(y => Math.max(y, 0));
    var neg_y = exp_z.map(y => Math.min(y, 0));

    var pos_fill = {
        x: x,
        y: pos_y,
        type: 'scatter',
        mode: 'none',
        fill: 'tozeroy',
        fillcolor: 'rgba(0, 255, 0, 0.5)',
        name: 'Profit Area',
        showlegend: true
    };

    var neg_fill = {
        x: x,
        y: neg_y,
        type: 'scatter',
        mode: 'none',
        fill: 'tozeroy',
        fillcolor: 'rgba(255, 0, 0, 0.5)',
        name: 'Loss Area',
        showlegend: true
    };

    var main_trace = {
        x: x,
        y: exp_z,
        type: 'scatter',
        mode: 'lines',
        name: 'Profit/Loss',
        line: {color: 'black'}
    };

    var data2d = [pos_fill, neg_fill, main_trace];

    if (!document.getElementById('add_second').checked) {
        var breakeven = calculateBreakeven(type1, position1, K1, P1);
        var breakevenTrace = {
            x: [breakeven, breakeven],
            y: [Math.min(...exp_z), Math.max(...exp_z)],
            type: 'scatter',
            mode: 'lines',
            name: 'Breakeven',
            line: {color: 'blue', dash: 'dash'}
        };
        data2d.push(breakevenTrace);
    }

    var layout2d = {
        title: 'Profit/Loss at Expiration (2D)',
        xaxis: { title: 'Stock Price' },
        yaxis: { title: 'Profit/Loss' },
        width: 1000,
        height: 600
    };

    Plotly.newPlot('plot2d', data2d, layout2d);
}
