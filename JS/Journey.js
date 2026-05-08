const heritageDataSource = typeof heritageData !== 'undefined' ? heritageData : {};

const categories = {
    physical: ['hue', 'ha-long', 'hoi-an', 'my-son', 'thang-long', 'phong-nha', 'thanh-nha-ho'],
    intangible: ['nha-nhac', 'cong-chieng', 'quan-ho', 'ca-tru', 'hoi-giong', 'hat-xoan', 'don-ca-tai-tu', 'vi-giam', 'keo-co', 'tho-mau', 'bai-choi', 'hat-then', 'xoe-thai', 'gom-cham', 'via-ba', 'dong-ho']
};

const mapPositions = {
    'hue': { left: '44%', top: '48%' }, 'ha-long': { left: '39.7%', top: '14%' },
    'hoi-an': { left: '49%', top: '61%' }, 'my-son': { left: '47%', top: '65%' },
    'thang-long': { left: '32.7%', top: '30%' }, 'phong-nha': { left: '45%', top: '50%' },
    'thanh-nha-ho': { left: '35.7%', top: '35%' }, 'nha-nhac': { left: '44%', top: '49%' },
    'cong-chieng': { left: '48%', top: '58%' }, 'quan-ho': { left: '34.1%', top: '26%' },
    'ca-tru': { left: '36%', top: '25%' }, 'hoi-giong': { left: '33.1%', top: '29%' },
    'hat-xoan': { left: '35%', top: '23%' }, 'don-ca-tai-tu': { left: '46%', top: '68%' },
    'vi-giam': { left: '37.6%', top: '38%' }, 'keo-co': { left: '36.9%', top: '24%' },
    'tho-mau': { left: '42%', top: '44%' }, 'bai-choi': { left: '45%', top: '55%' },
    'hat-then': { left: '31.7%', top: '18%' }, 'xoe-thai': { left: '34%', top: '20%' },
    'gom-cham': { left: '49%', top: '67%' }, 'via-ba': { left: '48%', top: '70%' },
    'dong-ho': { left: '33.3%', top: '28%' }
};

const realCoordinates = {
    'hue': { lat: 16.4637, lng: 107.5905 }, 'ha-long': { lat: 20.9100, lng: 107.1839 },
    'hoi-an': { lat: 15.8801, lng: 108.3202 }, 'my-son': { lat: 15.7440, lng: 107.8268 },
    'thang-long': { lat: 21.0285, lng: 105.8542 }, 'phong-nha': { lat: 17.5906, lng: 106.2625 },
    'thanh-nha-ho': { lat: 20.0775, lng: 105.6045 }, 'nha-nhac': { lat: 16.4637, lng: 107.5905 },
    'cong-chieng': { lat: 13.9833, lng: 108.0000 }, 'quan-ho': { lat: 21.1861, lng: 106.0763 },
    'ca-tru': { lat: 21.0285, lng: 105.8542 }, 'hoi-giong': { lat: 21.2444, lng: 105.8239 },
    'hat-xoan': { lat: 21.3200, lng: 105.4000 }, 'don-ca-tai-tu': { lat: 10.0333, lng: 105.7833 },
    'vi-giam': { lat: 18.6700, lng: 105.6800 }, 'keo-co': { lat: 21.1333, lng: 105.8667 },
    'tho-mau': { lat: 20.4461, lng: 106.1750 }, 'bai-choi': { lat: 13.7820, lng: 109.2190 },
    'hat-then': { lat: 22.3000, lng: 105.8000 }, 'xoe-thai': { lat: 21.6000, lng: 104.5000 },
    'gom-cham': { lat: 11.5200, lng: 108.9400 }, 'via-ba': { lat: 10.6800, lng: 105.0800 },
    'dong-ho': { lat: 21.1000, lng: 106.1000 }
};

const physicalBtn = document.getElementById('physicalBtn');
const intangibleBtn = document.getElementById('intangibleBtn');
const siteList = document.getElementById('site-list');
const itineraryList = document.getElementById('itinerary-list');
const emptyItinerary = document.getElementById('empty-itinerary');
const saveItineraryBtn = document.getElementById('save-itinerary-btn');
const clearItineraryBtn = document.getElementById('clear-itinerary-btn');
const routeAnalysis = document.getElementById('route-analysis');

let activeCategory = 'physical';
let itinerary = [];
let dragSourceIndex = null;
let transportMode = 'motorcycle';

const transportSettings = {
    motorcycle: { speed: 40, timePerSite: 90 },
    car: { speed: 60, timePerSite: 90 }
};

function loadItinerary() {
    try { itinerary = JSON.parse(localStorage.getItem('vhJourney')) || []; } catch { itinerary = []; }
}

function saveItinerary() { localStorage.setItem('vhJourney', JSON.stringify(itinerary)); }

function extractText(html) {
    const container = document.createElement('div');
    container.innerHTML = html || '';
    return container.textContent.replace(/\s+/g, ' ').trim();
}

function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c) * 1.25; // Hệ số uốn lượn đường bộ Việt Nam
}

function openInGoogleMaps() {
    if (itinerary.length === 0) return;
    const coordsList = itinerary.map(key => realCoordinates[key]).filter(c => c);
    const origin = `${coordsList[0].lat},${coordsList[0].lng}`;
    const destination = `${coordsList[coordsList.length - 1].lat},${coordsList[coordsList.length - 1].lng}`;
    let waypoints = "";
    if (coordsList.length > 2) {
        waypoints = coordsList.slice(1, -1).map(c => `${c.lat},${c.lng}`).join('|');
    }
    const mode = (transportMode === 'motorcycle') ? 'motorcycling' : 'driving';
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=${mode}`;
    window.open(url, '_blank');
}

function calculateJourneyStats() {
    if (itinerary.length < 2) return null;
    let totalDistance = 0, totalDrivingTime = 0, segments = [];
    for (let i = 0; i < itinerary.length - 1; i++) {
        const from = realCoordinates[itinerary[i]], to = realCoordinates[itinerary[i+1]];
        if (from && to) {
            const dist = calculateDistance(from.lat, from.lng, to.lat, to.lng);
            const dTime = dist / transportSettings[transportMode].speed;
            totalDistance += dist; totalDrivingTime += dTime;
            segments.push({ from: heritageDataSource[itinerary[i]].title, to: heritageDataSource[itinerary[i+1]].title, distance: dist, drivingTime: dTime });
        }
    }
    const totalSiteTime = (itinerary.length * transportSettings[transportMode].timePerSite) / 60;
    const totalTime = totalDrivingTime + totalSiteTime;
    let suggestedDays = Math.ceil(totalTime / 8) + ' ngày';
    let suggestedTime = totalTime <= 8 ? 'Khởi hành sáng sớm' : 'Nên lên kế hoạch nhiều chặng nghỉ';
    return { totalDistance, totalDrivingTime, totalSiteTime, totalTime, segments, suggestedDays, suggestedTime };
}

function updateRouteAnalysis() {
    routeAnalysis.innerHTML = '';
    if (itinerary.length < 2) {
        routeAnalysis.innerHTML = '<div class="text-muted text-center">Thêm ít nhất 2 điểm để xem phân tích.</div>';
        return;
    }
    const stats = calculateJourneyStats();
    const formatTime = (h) => `${Math.floor(h)}h ${Math.round((h - Math.floor(h)) * 60)}m`;

    routeAnalysis.innerHTML = `
        <div class="mb-3">
            <span class="info-label">Phương tiện</span>
            <div class="btn-group w-100 mb-3">
                <button class="btn btn-sm btn-outline-success transport-btn ${transportMode === 'motorcycle'?'active':''}" data-mode="motorcycle"><i class="fas fa-motorcycle"></i> Xe máy</button>
                <button class="btn btn-sm btn-outline-success transport-btn ${transportMode === 'car'?'active':''}" data-mode="car"><i class="fas fa-car"></i> Ô tô</button>
            </div>
        </div>
        <div class="p-3 bg-light rounded-3 mb-3">
            <div class="h3 mb-1 text-success fw-bold">${stats.totalDistance.toFixed(1)} km</div>
            <div class="small text-muted mb-2">Tổng thời gian dự kiến: ${formatTime(stats.totalTime)}</div>
            <div class="badge bg-success-subtle text-success p-2 w-100 text-start">📅 Ước tính: ${stats.suggestedDays}</div>
        </div>
        <button onclick="openInGoogleMaps()" class="btn btn-primary w-100 mb-4 shadow-sm" style="background:#4285F4; border:none">
            <i class="fab fa-google me-2"></i> Bắt đầu trên Google Maps
        </button>
        <div class="small text-muted">Chi tiết lộ trình:</div>
        <div class="mt-2" style="max-height: 200px; overflow-y: auto;">
            ${stats.segments.map((s, i) => `<div class="mb-2 border-bottom pb-1"><strong>${i+1}.</strong> ${s.from} → ${s.to} <br> <span class="text-success">${s.distance.toFixed(1)}km</span></div>`).join('')}
        </div>
    `;

    document.querySelectorAll('.transport-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            transportMode = e.currentTarget.dataset.mode;
            updateRouteAnalysis();
        });
    });
}

function renderSiteCards() {
    siteList.innerHTML = '';
    categories[activeCategory].forEach(key => {
        const site = heritageDataSource[key];
        if (!site) return;
        const isAdded = itinerary.includes(key);
        const col = document.createElement('div');
        col.className = 'col';
        col.innerHTML = `
            <div class="journey-card card h-100 shadow-sm border-0">
                <img src="${site.img || 'image/VIETNAM1.jpg'}" class="card-img-top" style="height:150px; object-fit:cover">
                <div class="card-body p-3">
                    <h6 class="fw-bold mb-1">${site.title}</h6>
                    <p class="small text-muted mb-2">${site.location}</p>
                    <button class="btn btn-sm ${isAdded?'btn-secondary':'btn-success'} w-100" onclick="addToItinerary('${key}')" ${isAdded?'disabled':''}>
                        ${isAdded?'Đã thêm':'<i class="fas fa-plus"></i> Thêm'}
                    </button>
                </div>
            </div>`;
        siteList.appendChild(col);
    });
}

function renderItinerary() {
    itineraryList.innerHTML = '';
    emptyItinerary.style.display = itinerary.length ? 'none' : 'block';
    itinerary.forEach((key, index) => {
        const site = heritageDataSource[key];
        const li = document.createElement('li');
        li.className = 'itinerary-item d-flex align-items-center mb-2 p-2 bg-white rounded shadow-sm';
        li.draggable = true;
        li.innerHTML = `<span class="me-2 badge bg-success">${index+1}</span><div class="flex-grow-1 small fw-bold">${site.title}</div><button class="btn btn-sm text-danger" onclick="removeItineraryItem(${index})">×</button>`;
        li.addEventListener('dragstart', () => { dragSourceIndex = index; });
        li.addEventListener('dragover', e => e.preventDefault());
        li.addEventListener('drop', () => {
            const [moved] = itinerary.splice(dragSourceIndex, 1);
            itinerary.splice(index, 0, moved);
            saveItinerary(); renderItinerary();
        });
        itineraryList.appendChild(li);
    });
    renderSiteCards();
    updateRouteAnalysis();
}

function addToItinerary(key) { if(!itinerary.includes(key)) { itinerary.push(key); saveItinerary(); renderItinerary(); } }
function removeItineraryItem(idx) { itinerary.splice(idx, 1); saveItinerary(); renderItinerary(); }
function clearItinerary() { itinerary = []; saveItinerary(); renderItinerary(); }

physicalBtn.addEventListener('click', () => { activeCategory='physical'; physicalBtn.classList.add('active'); intangibleBtn.classList.remove('active'); renderSiteCards(); });
intangibleBtn.addEventListener('click', () => { activeCategory='intangible'; intangibleBtn.classList.add('active'); physicalBtn.classList.remove('active'); renderSiteCards(); });
saveItineraryBtn.addEventListener('click', () => { saveItinerary(); alert('Hành trình đã được lưu!'); });
clearItineraryBtn.addEventListener('click', clearItinerary);

loadItinerary();
renderItinerary();