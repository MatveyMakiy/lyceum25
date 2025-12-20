class CountriesApp {
    constructor() {
        this.countries = [];
        this.currentCountry = null;
        this.viewType = 'table';
        this.filters = {
            search: '',
            region: '',
            minPopulation: '',
            maxPopulation: '',
            minArea: '',
            maxArea: ''
        };
        this.map = null;

        this.initElements();
        this.setupEventListeners();
        this.init();
    }

    initElements() {
        this.elements = {
            themeToggle: document.getElementById('themeToggle'),
            themeIcon: document.getElementById('themeIcon'),
            mainView: document.getElementById('mainView'),
            detailView: document.getElementById('detailView'),
            countryList: document.getElementById('countryList'),
            countryDetail: document.getElementById('detailContent'),
            searchInput: document.getElementById('searchInput'),
            regionSelect: document.getElementById('regionSelect'),
            populationMin: document.getElementById('populationMin'),
            populationMax: document.getElementById('populationMax'),
            areaMin: document.getElementById('areaMin'),
            areaMax: document.getElementById('areaMax'),
            loading: document.getElementById('loading'),
            error: document.getElementById('error'),
            detailLoading: document.getElementById('detailLoading'),
            detailError: document.getElementById('detailError'),
            homeButton: document.getElementById('homeButton'),
            detailViewButton: document.getElementById('detailViewButton'),
            backButton: document.getElementById('backButton')
        };

        this.viewButtons = document.querySelectorAll('input[name="viewType"]');
    }

    setupEventListeners() {
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.elements.homeButton.addEventListener('click', () => this.showMainView());
        this.elements.backButton.addEventListener('click', () => this.showMainView());

        this.elements.searchInput.addEventListener('input', (e) => {
            this.filters.search = e.target.value;
            this.debouncedFilter();
        });

        this.elements.regionSelect.addEventListener('change', (e) => {
            this.filters.region = e.target.value;
            this.filterCountries();
        });

        this.elements.populationMin.addEventListener('input', (e) => {
            this.filters.minPopulation = e.target.value;
            this.debouncedFilter();
        });
        
        this.elements.populationMax.addEventListener('input', (e) => {
            this.filters.maxPopulation = e.target.value;
            this.debouncedFilter();
        });
        
        this.elements.areaMin.addEventListener('input', (e) => {
            this.filters.minArea = e.target.value;
            this.debouncedFilter();
        });
        
        this.elements.areaMax.addEventListener('input', (e) => {
            this.filters.maxArea = e.target.value;
            this.debouncedFilter();
        });

        this.viewButtons.forEach(btn => {
            btn.addEventListener('change', (e) => {
                this.viewType = e.target.value;
                this.renderCountryList();
            });
        });
    }

    async init() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            this.elements.themeIcon.textContent = '☀️';
        }

        await this.loadRegions();
        await this.loadCountries();
    }
    toggleTheme() {
        const isDark = document.body.classList.toggle('dark-theme');
        this.elements.themeIcon.textContent = isDark ? '☀️' : '🌙';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }

    async loadRegions() {
        try {
            const countries = await API.getCountries();
            const regions = [...new Set(countries.map(c => c.region).filter(Boolean))].sort();

            regions.forEach(region => {
                const option = document.createElement('option');
                option.value = region;
                option.textContent = region;
                this.elements.regionSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Ошибка загрузки регионов:', error);
        }
    }

    async loadCountries() {
        try {
            this.showLoading();
            this.hideError();

            this.countries = await API.getCountries(this.filters);
            this.renderCountryList();
            this.hideLoading();

        } catch (error) {
            this.hideLoading();
            this.showError('Ошибка загрузки данных');
            console.error(error);
        }
    }

    async filterCountries() {
        try {
            this.countries = await API.getCountries(this.filters);
            this.renderCountryList();
        } catch (error) {
            console.error('Ошибка фильтрации стран:', error);
        }
    }

    debouncedFilter = this.debounce(() => this.filterCountries(), 300);

    debounce(func, delay) {
        let timeout;
        return function exuctedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, delay);
        };
    }

    renderCountryList() {
    const container = this.elements.countryList;
    container.innerHTML = '';

    if (!this.countries.length) {
        container.innerHTML = '<p>Страны не найдены</p>';
        return;
    }

    this.viewType === 'table'
        ? this.renderTableView(container)
        : this.renderCardsView(container);
}

    renderCardsView(container) {
        container.className = 'cards-view';

        this.countries.forEach(country => {
            const card = document.createElement('div');
            card.className = 'country-card';
            card.innerHTML = `
                <div class="country-flag">${country.flag}</div>
                <div class="country-name">${country.name}</div>
                <div class="country-info">
                    <div><strong>Регион:</strong> ${country.region}</div>
                    <div><strong>Столица:</strong> ${country.capital}</div>
                    <div><strong>Площадь:</strong> ${API.formatArea(country.area)}</div>
                    <div><strong>Население:</strong> ${API.formatPopulation(country.population)}</div>
                </div>
            `;

            card.addEventListener('click', () => this.showCountryDetail(country.cca3));
            container.appendChild(card);

        });
    }

    renderTableView(container) {
        container.innerHTML = '';
        
        if (this.countries.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 40px;">Страны не найдены</p>';
            return;
        }
        
        if (this.viewType === 'table') {
            this.renderTableView(container);
        } else {
            this.renderCardsView(container);
        }
    }
    
    renderTableView(container) {
        const table = document.createElement('table');
        table.className = 'table-view';
        
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Флаг</th>
                    <th>Название</th>
                    <th>Регион</th>
                    <th>Столица</th>
                    <th>Площадь</th>
                    <th>Население</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
                ${this.countries.map(country => `
                    <tr>
                        <td style="text-align: center; font-size: 24px;">${country.flag}</td>
                        <td>${country.name}</td>
                        <td>${country.region}</td>
                        <td>${country.capital}</td>
                        <td>${API.formatArea(country.area)}</td>
                        <td>${API.formatPopulation(country.population)}</td>
                        <td>
                            <button class="table-button" onclick="app.showCountryDetail('${country.cca3}')">
                                Подробнее
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        
        container.appendChild(table);
    }

    async showCountryDetail(code) {
        try {
            this.elements.mainView.classList.add('hidden');
            this.elements.detailView.classList.remove('hidden');
            this.elements.detailLoading.classList.remove('hidden');
            this.elements.detailError.classList.add('hidden');
            this.elements.countryDetail.innerHTML = '';
            
            this.currentCountry = await API.getCountryDetails(code);
            this.renderCountryDetail();
            
            this.elements.detailLoading.classList.add('hidden');
            this.elements.detailViewButton.disabled = false;
            
        } catch (error) {
            this.elements.detailLoading.classList.add('hidden');
            this.elements.detailError.classList.remove('hidden');
            this.elements.detailError.textContent = error.message;
        }
    }

    renderCountryDetail() {
        const country = this.currentCountry;
        const detail = this.elements.countryDetail;
        
        detail.innerHTML = `
            <div class="detail-header">
                <div class="detail-flag">${country.flag}</div>
                <div>
                    <div class="detail-title">${country.name.common}</div>
                    <div>${country.name.official}</div>
                </div>
            </div>
            
            <div class="detail-content">
                <div>
                    <div class="detail-section">
                        <h3>Основная информация</h3>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <div class="detail-label">Регион</div>
                                <div>${country.region} / ${country.subregion}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Столица</div>
                                <div>${country.capital?.[0] || 'Нет данных'}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Площадь</div>
                                <div>${API.formatArea(country.area)}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Население</div>
                                <div>${API.formatPopulation(country.population)}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Языки</div>
                                <div>${Object.values(country.languages || {}).join(', ') || 'Нет данных'}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Валюта</div>
                                <div>${Object.values(country.currencies || {}).map(c => `${c.name} (${c.symbol})`).join(', ')}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h3>Дополнительная информация</h3>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <div class="detail-label">Независимость</div>
                                <div>${country.independent ? 'Да' : 'Нет'}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Член ООН</div>
                                <div>${country.unMember ? 'Да' : 'Нет'}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Координаты</div>
                                <div>${country.latlng?.join(', ') || 'Нет данных'}</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div>
                    <div class="detail-section">
                        <h3>Флаг страны</h3>
                        <img src="${API.getFlagUrl(country.cca2)}" 
                             alt="Флаг ${country.name.common}" 
                             class="flag-image"
                             onerror="this.style.display='none'">
                    </div>
                    
                    <div class="detail-section">
                        <h3>Карта страны</h3>
                        <div id="map"></div>
                    </div>
                </div>
            </div>
        `;
        
        if (country.latlng && country.latlng.length === 2) {
            this.initMap(country.latlng, country.name.common);
        }
    }

    initMap(coords, name) {
        if (this.map) {
            this.map.remove();
        }
        
        this.map = L.map('map').setView(coords, 5);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
        
        L.marker(coords)
            .addTo(this.map)
            .bindPopup(`<b>${name}</b>`)
            .openPopup();
    }

    showMainView() {
        this.elements.detailView.classList.add('hidden');
        this.elements.mainView.classList.remove('hidden');
    }
    
    showDetailView() {
        if (this.currentCountry) {
            this.showCountryDetail(this.currentCountry.cca3);
        }
    }
    
    showLoading() {
        this.elements.loading.classList.remove('hidden');
        this.elements.error.classList.add('hidden');
    }
    
    hideLoading() {
        this.elements.loading.classList.add('hidden');
    }
    
    showError(message) {
        this.elements.error.textContent = message;
        this.elements.error.classList.remove('hidden');
    }
    
    hideError() {
        this.elements.error.classList.add('hidden');
    }
}

const app = new CountriesApp();
window.app = app;