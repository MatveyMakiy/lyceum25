const API = {
    baseUrl: 'http://localhost:3000/api',

    async getCountries(filters = {}) {
        try {
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.region) params.append('region', filters.region);
            if (filters.minPopulation) params.append('minPopulation', filters.minPopulation);
            if (filters.maxPopulation) params.append('maxPopulation', filters.maxPopulation);
            if (filters.minArea) params.append('minArea', filters.minArea);
            if (filters.maxArea) params.append('maxArea', filters.maxArea);

            const response = await fetch(`${this.baseUrl}/countries?${params}`);
            if (!response.ok) throw new Error('Ошибка при загрузке стран');
            return await response.json();
        } catch (error) {
            console.error('Ошибка загрузки стран:', error);
            throw error;
        }
    },

    async getCountryDetails(code) {
        try {
            const response = await fetch(`${this.baseUrl}/countries/${code}`);
            if (!response.ok) {
                if (response.status === 404) throw new Error('Страна не найдена');
                throw new Error('Ошибка сети');
            }
            return await response.json();
        } catch (error) {
            console.error('Ошика загрузки деталей', error);
            throw error;
        }
    },

    formatNumber(num) {
        return new Intl.NumberFormat('ru-RU').format(num);
    },

    formatArea(area) {
        if (area >= 1000000) return `${(area / 1000000).toFixed(1)} млн км²`;
        if (area >= 1000) return `${(area / 1000).toFixed(1)} тыс км²`;
        return `${this.formatNumber(area)} км²`;
    },

    formatPopulation(pop) {
        if (pop >= 1000000000) return `${(pop / 1000000000).toFixed(1)} млрд`;
        if (pop >= 1000000) return `${(pop / 1000000).toFixed(1)} млн`;
        if (pop >= 1000) return `${(pop / 1000).toFixed(1)} тыс`;
        return this.formatNumber(pop);
    },

    getFlagUrl(code) {
        return `https://flagcdn.com/w320/${code.toLowerCase()}.png`;
    }
};