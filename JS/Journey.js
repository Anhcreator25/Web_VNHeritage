const heritageDataSource = typeof heritageData !== 'undefined' ? heritageData : {};

const categories = {
    physical: ['hue', 'ha-long', 'hoi-an', 'my-son', 'thang-long', 'phong-nha', 'thanh-nha-ho'],
    intangible: ['nha-nhac', 'cong-chieng', 'quan-ho', 'ca-tru', 'hoi-giong', 'hat-xoan', 'don-ca-tai-tu', 'vi-giam', 'keo-co', 'tho-mau', 'bai-choi', 'hat-then', 'xoe-thai', 'gom-cham', 'via-ba', 'dong-ho']
};

const mapPositions = {
    'hue': { left: '44%', top: '48%' },
    'ha-long': { left: '39.7%', top: '14%' },
    'hoi-an': { left: '49%', top: '61%' },
    'my-son': { left: '47%', top: '65%' },
    'thang-long': { left: '32.7%', top: '30%' },
    'phong-nha': { left: '45%', top: '50%' },
    'thanh-nha-ho': { left: '35.7%', top: '35%' },
    'nha-nhac': { left: '44%', top: '49%' },
    'cong-chieng': { left: '48%', top: '58%' },
    'quan-ho': { left: '34.1%', top: '26%' },
    'ca-tru': { left: '36%', top: '25%' },
    'hoi-giong': { left: '33.1%', top: '29%' },
    'hat-xoan': { left: '35%', top: '23%' },
    'don-ca-tai-tu': { left: '46%', top: '68%' },
    'vi-giam': { left: '37.6%', top: '38%' },
    'keo-co': { left: '36.9%', top: '24%' },
    'tho-mau': { left: '42%', top: '44%' },
    'bai-choi': { left: '45%', top: '55%' },
    'hat-then': { left: '31.7%', top: '18%' },
    'xoe-thai': { left: '34%', top: '20%' },
    'gom-cham': { left: '49%', top: '67%' },
    'via-ba': { left: '48%', top: '70%' },
    'dong-ho': { left: '33.3%', top: '28%' }
};

// Approximate real-world coordinates for Vietnamese heritage sites (lat/lng)
const realCoordinates = {
    'hue': { lat: 16.4637, lng: 107.5905 },
    'ha-long': { lat: 20.9100, lng: 107.1839 },
    'hoi-an': { lat: 15.8801, lng: 108.3202 },
    'my-son': { lat: 15.7440, lng: 107.8268 },
    'thang-long': { lat: 21.0285, lng: 105.8542 },
    'phong-nha': { lat: 17.3384, lng: 106.2500 },
    'thanh-nha-ho': { lat: 17.4833, lng: 106.5667 },
    'nha-nhac': { lat: 16.4637, lng: 107.5905 },
    'cong-chieng': { lat: 15.8801, lng: 108.3202 },
    'quan-ho': { lat: 21.5500, lng: 105.9000 },
    'ca-tru': { lat: 21.0285, lng: 105.8542 },
    'hoi-giong': { lat: 21.2333, lng: 105.4000 },
    'hat-xoan': { lat: 21.0000, lng: 105.3000 },
    'don-ca-tai-tu': { lat: 15.8801, lng: 108.3202 },
    'vi-giam': { lat: 18.5000, lng: 106.0000 },
    'keo-co': { lat: 21.0000, lng: 105.2000 },
    'tho-mau': { lat: 16.0000, lng: 107.0000 },
    'bai-choi': { lat: 16.2000, lng: 107.5000 },
    'hat-then': { lat: 21.5000, lng: 104.5000 },
    'xoe-thai': { lat: 21.8000, lng: 104.3000 },
    'gom-cham': { lat: 15.7440, lng: 107.8268 },
    'via-ba': { lat: 15.5000, lng: 108.0000 },
    'dong-ho': { lat: 21.1333, lng: 105.8667 }
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
let transportMode = 'motorcycle'; // 'motorcycle' or 'car'

// Average speeds (km/h) and time per site (minutes)
const transportSettings = {
    motorcycle: { speed: 40, timePerSite: 90 },
    car: { speed: 60, timePerSite: 90 }
};

function loadItinerary() {
    try {
        itinerary = JSON.parse(localStorage.getItem('vhJourney')) || [];
    } catch {
        itinerary = [];
    }
}

function saveItinerary() {
    localStorage.setItem('vhJourney', JSON.stringify(itinerary));
}

function getSites(category) {
    return categories[category]
        .filter(key => heritageDataSource[key])
        .map(key => ({ key, ...heritageDataSource[key], ...mapPositions[key] }));
}

function updateCategoryButtons() {
    physicalBtn.classList.toggle('active', activeCategory === 'physical');
    intangibleBtn.classList.toggle('active', activeCategory === 'intangible');
}

function renderSiteCards() {
    siteList.innerHTML = '';
    const sites = getSites(activeCategory);
    sites.forEach(site => {
        const col = document.createElement('div');
        col.className = 'col';
        const hasItinerary = itinerary.includes(site.key);
        col.innerHTML = `
            <div class="journey-card card h-100 shadow-sm">
                <img src="${site.img || 'image/VIETNAM1.jpg'}" class="card-img-top" alt="${site.title}">
                <div class="card-body journey-card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h3 class="journey-card-title mb-1">${site.title}</h3>
                            <div class="text-secondary" style="font-size:0.92rem">${site.location}</div>
                        </div>
                        <span class="badge bg-warning text-dark">${site.year}</span>
                    </div>
                    <p class="journey-card-desc text-muted mb-3">${extractText(site.content).slice(0, 110)}...</p>
                    <button type="button" class="btn btn-sm ${hasItinerary ? 'btn-outline-secondary' : 'btn-success'} w-100 add-btn" data-site-key="${site.key}" ${hasItinerary ? 'disabled' : ''}>
                        ${hasItinerary ? 'Đã thêm' : '<i class="fas fa-plus me-2"></i>Thêm vào hành trình'}
                    </button>
                </div>
            </div>
        `;
        col.querySelector('.add-btn').addEventListener('click', () => addToItinerary(site.key));
        siteList.appendChild(col);
    });
}

function renderItinerary() {
    itineraryList.innerHTML = '';
    emptyItinerary.style.display = itinerary.length ? 'none' : 'block';

    itinerary.forEach((siteKey, index) => {
        const site = heritageDataSource[siteKey];
        if (!site) return;

        const item = document.createElement('li');
        item.className = 'itinerary-item';
        item.draggable = true;
        item.dataset.index = index;
        item.innerHTML = `
            <span class="itinerary-number">${index + 1}</span>
            <div class="itinerary-body">
                <strong>${site.title}</strong>
                <span>${site.location || 'Vị trí chưa rõ'}</span>
            </div>
            <button type="button" class="btn btn-sm btn-light itinerary-remove" aria-label="Xóa">×</button>
        `;

        item.addEventListener('dragstart', onItineraryDragStart);
        item.addEventListener('dragover', onItineraryDragOver);
        item.addEventListener('drop', onItineraryDrop);
        item.addEventListener('dragleave', () => item.classList.remove('drag-over'));
        item.querySelector('.itinerary-remove').addEventListener('click', () => removeItineraryItem(index));
        itineraryList.appendChild(item);
    });

    renderSiteCards();
    updateRouteAnalysis();
}

function addToItinerary(siteKey) {
    if (!siteKey || itinerary.includes(siteKey)) return;
    itinerary.push(siteKey);
    saveItinerary();
    renderItinerary();
}

function removeItineraryItem(index) {
    itinerary.splice(index, 1);
    saveItinerary();
    renderItinerary();
}

function clearItinerary() {
    itinerary = [];
    saveItinerary();
    renderItinerary();
}

function onItineraryDragStart(event) {
    dragSourceIndex = Number(event.currentTarget.dataset.index);
    event.dataTransfer.effectAllowed = 'move';
}

function onItineraryDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('drag-over');
}

function onItineraryDrop(event) {
    event.preventDefault();
    const targetIndex = Number(event.currentTarget.dataset.index);
    event.currentTarget.classList.remove('drag-over');
    if (dragSourceIndex === null || targetIndex === dragSourceIndex) return;
    const [moved] = itinerary.splice(dragSourceIndex, 1);
    itinerary.splice(targetIndex, 0, moved);
    saveItinerary();
    renderItinerary();
    dragSourceIndex = null;
}

function extractText(html) {
    const container = document.createElement('div');
    container.innerHTML = html || '';
    return container.textContent.replace(/\s+/g, ' ').trim();
}

// Haversine formula: calculate distance between two points on Earth
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // distance in km
}

// Calculate total journey distance and segment analysis
function calculateJourneyStats() {
    if (itinerary.length < 2) return null;

    let totalDistance = 0;
    let totalDrivingTime = 0;
    const segments = [];

    for (let i = 0; i < itinerary.length - 1; i++) {
        const fromKey = itinerary[i];
        const toKey = itinerary[i + 1];
        
        const fromCoords = realCoordinates[fromKey];
        const toCoords = realCoordinates[toKey];
        
        if (fromCoords && toCoords) {
            const distance = calculateDistance(fromCoords.lat, fromCoords.lng, toCoords.lat, toCoords.lng);
            totalDistance += distance;
            
            const settings = transportSettings[transportMode];
            const drivingTime = distance / settings.speed; // hours
            totalDrivingTime += drivingTime;
            
            const fromSite = heritageDataSource[fromKey];
            const toSite = heritageDataSource[toKey];
            segments.push({
                from: fromSite?.title || 'Không rõ',
                to: toSite?.title || 'Không rõ',
                distance: distance,
                drivingTime: drivingTime
            });
        }
    }

    // Total time at sites (hours)
    const settings = transportSettings[transportMode];
    const totalSiteTime = (itinerary.length * settings.timePerSite) / 60;
    const totalTime = totalDrivingTime + totalSiteTime;

    // Suggest number of days and when to go
    let suggestedDays, suggestedTime;
    if (totalTime <= 4) {
        suggestedDays = '1 ngày';
        suggestedTime = 'Sáng sớm (7h) để kết thúc trước 18h';
    } else if (totalTime <= 8) {
        suggestedDays = '1-2 ngày';
        suggestedTime = 'Khởi hành sáng (7h), qua đêm tại điểm cuối';
    } else if (totalTime <= 16) {
        suggestedDays = '2-3 ngày';
        suggestedTime = 'Tối tưu: khởi hành Thứ 5, kết thúc Thứ 7';
    } else {
        suggestedDays = Math.ceil(totalTime / 8) + ' ngày';
        suggestedTime = 'Nên lên kế hoạch chi tiết với nhiều điểm dừng';
    }

    return { 
        totalDistance, 
        totalDrivingTime,
        totalSiteTime,
        totalTime,
        segments,
        suggestedDays,
        suggestedTime
    };
}

function updateRouteAnalysis() {
    routeAnalysis.innerHTML = '';
    
    if (itinerary.length < 2) {
        routeAnalysis.innerHTML = '<div class="text-muted">Thêm ít nhất 2 điểm để xem phân tích.</div>';
        return;
    }

    const stats = calculateJourneyStats();
    if (!stats) {
        routeAnalysis.innerHTML = '<div class="text-muted">Không thể tính khoảng cách.</div>';
        return;
    }

    // Convert hours to hours:minutes format
    const formatTime = (hours) => {
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        return `${h}h ${m}m`;
    };

    let html = `
        <div class="mb-4">
            <span class="info-label">Loại phương tiện</span>
            <div class="btn-group w-100" role="group" style="margin-bottom: 1rem;">
                <button type="button" class="btn btn-sm btn-outline-success transport-btn ${transportMode === 'motorcycle' ? 'active' : ''}" data-transport="motorcycle" style="flex: 1;">
                    <i class="fas fa-motorcycle"></i> Xe máy
                </button>
                <button type="button" class="btn btn-sm btn-outline-success transport-btn ${transportMode === 'car' ? 'active' : ''}" data-transport="car" style="flex: 1;">
                    <i class="fas fa-car"></i> Oto
                </button>
            </div>
        </div>

        <div class="mb-4">
            <span class="info-label">Phân tích lộ trình</span>
            <h4 class="schedule-title">Tổng khoảng cách</h4>
            <div style="font-size: 1.8rem; font-weight: 700; color: var(--bronze-accent); margin-bottom: 1rem;">
                ${stats.totalDistance.toFixed(1)} km
            </div>

            <div class="mb-3 p-3" style="background: #f5f5f5; border-radius: 12px;">
                <div class="mb-2">
                    <span style="font-weight: 600;">Thời gian lái xe:</span> <strong>${formatTime(stats.totalDrivingTime)}</strong>
                </div>
                <div class="mb-2">
                    <span style="font-weight: 600;">Thời gian tham quan:</span> <strong>${formatTime(stats.totalSiteTime)}</strong>
                </div>
                <div class="border-top pt-2">
                    <span style="font-weight: 700; color: var(--bronze-accent);">Tổng thời gian:</span> 
                    <strong style="font-size: 1.1rem; color: var(--bronze-accent);">${formatTime(stats.totalTime)}</strong>
                </div>
            </div>

            <div class="mb-3 p-3" style="background: #e8f5e9; border-left: 4px solid var(--forest-green); border-radius: 8px;">
                <div class="mb-2" style="font-weight: 600;">📅 ${stats.suggestedDays}</div>
                <div style="font-size: 0.9rem; color: #333;">🕐 ${stats.suggestedTime}</div>
            </div>
        </div>

        <div>
            <span class="info-label">Chi tiết từng đoạn</span>
            <ul class="list-unstyled" style="font-size: 0.93rem;">
    `;

    stats.segments.forEach((seg, idx) => {
        html += `
            <li class="mb-2 pb-2 ${idx < stats.segments.length - 1 ? 'border-bottom' : ''}">
                <div><strong>${idx + 1}. ${seg.from}</strong></div>
                <div class="text-muted">→ ${seg.to}</div>
                <div style="color: var(--bronze-accent); font-weight: 600;">
                    ${seg.distance.toFixed(1)} km (${formatTime(seg.drivingTime)})
                </div>
            </li>
        `;
    });

    html += `
            </ul>
        </div>
    `;

    routeAnalysis.innerHTML = html;

    // Add event listeners for transport buttons
    document.querySelectorAll('.transport-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            transportMode = e.currentTarget.dataset.transport;
            updateRouteAnalysis();
        });
    });
}

function setCategory(category) {
    activeCategory = category;
    updateCategoryButtons();
    renderSiteCards();
}

physicalBtn.addEventListener('click', () => setCategory('physical'));
intangibleBtn.addEventListener('click', () => setCategory('intangible'));
saveItineraryBtn.addEventListener('click', () => {
    saveItinerary();
    saveItineraryBtn.textContent = 'Đã lưu';
    setTimeout(() => { saveItineraryBtn.textContent = 'Lưu hành trình'; }, 1200);
});
clearItineraryBtn.addEventListener('click', clearItinerary);

loadItinerary();
updateCategoryButtons();
renderSiteCards();
renderItinerary();
