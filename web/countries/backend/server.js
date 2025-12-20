const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const COUNTRIES_FILE = path.join(__dirname, 'countries.json');

let dataCounties = [];
try {
    const data = fs.readFileSync(COUNTRIES_FILE, 'utf8');
    dataCounties = JSON.parse(data);
    console.log('Загрузка успешна')
} catch (error) {
    console.error('Ошибка загрузки данных:', error);
    process.exit(1);
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.method === 'GET' && pathname === '/api/countries') {
        handleGetCountries(req, res, parsedUrl.query);
    } else if (req.method === 'GET' && pathname.startsWith('/api/countries/')) {
        const code = pathname.split('/')[3];
        handleGetCountry(req, res, code);
    } else {
        serveStatic(req, res);
    }
});

function handleGetCountries(req, res, query) {
    try {
        let filtered = [...dataCounties];

        if (query.search) {
            const search = query.search.toLowerCase();
            filtered = filtered.filter(country => {
                if (country.name.common.toLowerCase().includes(search)) return true;
                if (country.name.official.toLowerCase().includes(search)) return true;

                for (const lang in country.translations) {
                    const trans = country.translations[lang];
                    if (trans.common?.toLowerCase().includes(search) || trans.official?.toLowerCase().includes(search)) return true;
                }
                return false;
            });
        }

        if (query.region) {
            filtered = filtered.filter(c => c.region === query.region);
        }

        if (query.minPopulation) {
            filtered = filtered.filter(c => c.population >= parseInt(query.minPopulation));
        }
        if (query.maxPopulation) {
            filtered = filtered.filter(c => c.population <= parseInt(query.maxPopulation));
        }

        if (query.minArea) {
            filtered = filtered.filter(c => c.area >= parseInt(query.minArea));
        }
        if (query.maxArea) {
            filtered = filtered.filter(c => c.area <= parseInt(query.maxArea));
        }

        const result = filtered.map(country => ({
            cca3: country.cca3,
            name: country.name.common,
            flag: country.flag,
            region: country.region,
            capital: country.capital?.[0] || '',
            area: country.area,
            population: country.population,
            latlng: country.latlng
        }));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));

    } catch (error) {
        console.error('Ошибка:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Ошибка сервера'}));
    }
}

function handleGetCountry (req, res, code) {
    try {
        const country = dataCounties.find(c => c.cca3 === code || c.cca2 === code);

        if (!country) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Страна не найдена' }));
            return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(country));

    } catch (error) {
        console.error('Ошибка:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Ошибка сервера' }));
    }
}

function serveStatic(req, res) {
    let filePath = path.join(__dirname, '../frontend', req.url === '/' ? 'index.html' : req.url);

    const ext = path.extname(filePath);
    const contentTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg'
    };

    const contentType = contentTypes[ext] || 'text/plain';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                const indexPath = path.join(__dirname, '../frontend/index.html');
                fs.readFile(indexPath, (err, data) => {
                    if (err) {
                        res.writeHead(404);
                        res.end('File not found');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(data);
                    }
                });
            } else {
                res.writeHead('500');
                res.end('Server error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
}

server.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});