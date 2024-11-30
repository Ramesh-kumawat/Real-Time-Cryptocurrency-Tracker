const API_URL = 'https://api.coingecko.com/api/v3/coins/markets';
const params = {
    vs_currency: 'usd',
    order: 'market_cap_desc',
    per_page: 50,
    page: 1,
    sparkline: false
};

let selectedCryptos = JSON.parse(localStorage.getItem('selectedCryptos')) || [];
const loadingIndicator = $('#loading-indicator');

async function fetchCryptos() {
    showLoading(true);
    try {
        const url = `${API_URL}?${new URLSearchParams(params).toString()}`;
        const response = await fetch(url);
        const data = await response.json();
        displayCryptos(data);
    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        showLoading(false);
    }
}

function displayCryptos(cryptos) {
    const cryptoContainer = $('#cryptos');
    cryptoContainer.empty();
    cryptos.forEach(crypto => {
        const box = $(`
            <div class="crypto-box">
                <img src="${crypto.image}" alt="${crypto.name} icon" class="crypto-icon">
                <h3>${crypto.name} (${crypto.symbol.toUpperCase()})</h3>
                <p>Price: $${crypto.current_price}</p>
                <button data-id="${crypto.id}">Compare</button>
            </div>
        `);
        box.find('button').on('click', () => toggleComparison(crypto));
        cryptoContainer.append(box.hide().fadeIn(500));
    });
}

function toggleComparison(crypto) {
    const index = selectedCryptos.findIndex(c => c.id === crypto.id);
    if (index === -1) {
    
        if (selectedCryptos.length < 5) {
            selectedCryptos.push(crypto);
        } else {
            alert('You can only compare up to 5 cryptocurrencies at a time.');
        }
    } else {

        alert(`${crypto.name} is already selected for comparison.`);
    }
    localStorage.setItem('selectedCryptos', JSON.stringify(selectedCryptos));
    updateComparisonTable();
}

function updateComparisonTable() {
    const table = $('#comparison-table');
    table.empty();
    if (selectedCryptos.length === 0) {
        table.html('<p>Select cryptocurrencies to compare them here.</p>');
        return;
    }

    const rows = selectedCryptos.map(crypto => `
        <tr>
            <td>
                <img src="${crypto.image}" alt="${crypto.name} icon" class="crypto-icon">
                ${crypto.name}
            </td>
            <td>${crypto.symbol.toUpperCase()}</td>
            <td>$${crypto.current_price}</td>
            <td class="table-action"> <!-- Add the class here -->
                <button class="remove-btn" data-id="${crypto.id}">Remove</button>
            </td>
        </tr>
    `).join('');
    table.append(`
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Symbol</th>
                    <th>Price</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `);

 
    $('.remove-btn').on('click', function () {
        const cryptoId = $(this).data('id');
        removeFromComparison(cryptoId);
    });


    table.find('tr').hide().fadeIn(500);
}

function removeFromComparison(cryptoId) {
    selectedCryptos = selectedCryptos.filter(c => c.id !== cryptoId);
    localStorage.setItem('selectedCryptos', JSON.stringify(selectedCryptos));

    $(`button[data-id="${cryptoId}"]`).closest('tr').fadeOut(500, function () {
        $(this).remove();
        updateComparisonTable();
    });
}

function showLoading(isLoading) {
    if (isLoading) {
        loadingIndicator.removeClass('hidden').fadeIn(300); 
        loadingIndicator.fadeOut(300, function () {
            $(this).addClass('hidden');
        });
    }
}

$('#sort-by-market-cap').on('change', function () {
    params.order = this.checked ? 'market_cap_desc' : 'id_asc';
    fetchCryptos();
});


const themeToggleButton = document.getElementById('theme-toggle');

if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
}

themeToggleButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
   
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
});


fetchCryptos();
updateComparisonTable();
