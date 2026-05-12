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

const realCoordinates = {
    'hue': { lat: 16.4637, lng: 107.5905 },
    'ha-long': { lat: 20.9100, lng: 107.1839 },
    'hoi-an': { lat: 15.8801, lng: 108.3202 },
    'my-son': { lat: 15.7440, lng: 107.8268 },
    'thang-long': { lat: 21.0285, lng: 105.8542 },
    'phong-nha': { lat: 17.5906, lng: 106.2625 },
    'thanh-nha-ho': { lat: 20.0775, lng: 105.6045 },
    'nha-nhac': { lat: 16.4637, lng: 107.5905 },
    'cong-chieng': { lat: 13.9833, lng: 108.0000 },
    'quan-ho': { lat: 21.1861, lng: 106.0763 },
    'ca-tru': { lat: 21.0285, lng: 105.8542 },
    'hoi-giong': { lat: 21.2444, lng: 105.8239 },
    'hat-xoan': { lat: 21.3200, lng: 105.4000 },
    'don-ca-tai-tu': { lat: 10.0333, lng: 105.7833 },
    'vi-giam': { lat: 18.6700, lng: 105.6800 },
    'keo-co': { lat: 21.1333, lng: 105.8667 },
    'tho-mau': { lat: 20.4461, lng: 106.1750 },
    'bai-choi': { lat: 13.7820, lng: 109.2190 },
    'hat-then': { lat: 22.3000, lng: 105.8000 },
    'xoe-thai': { lat: 21.6000, lng: 104.5000 },
    'gom-cham': { lat: 11.5200, lng: 108.9400 },
    'via-ba': { lat: 10.6800, lng: 105.0800 },
    'dong-ho': { lat: 21.1000, lng: 106.1000 }
};
const markerContainer = document.getElementById('marker-container');
const infoTitle = document.getElementById('info-title');
const infoImg = document.getElementById('info-img');
const infoLocation = document.getElementById('info-location');
const infoYear = document.getElementById('info-year');
const infoDescription = document.getElementById('info-description');
const infoExtra = document.getElementById('info-extra');
const addItineraryBtn = document.getElementById('add-itinerary-btn');
const itineraryList = document.getElementById('itinerary-list');
const itineraryCount = document.getElementById('itinerary-count');
const emptyItinerary = document.getElementById('empty-itinerary');
const routeSvg = document.getElementById('route-svg');
const physicalBtn = document.getElementById('physicalBtn');
const intangibleBtn = document.getElementById('intangibleBtn');
const mapImg = document.querySelector('.map-bg');

let activeCategory = 'physical';
let activeSiteKey = categories.physical[0];
let itinerary = [];
let transportMode = 'motorcycle';
const transportSettings = {
    motorcycle: { speed: 40, timePerSite: 90 },
    car: { speed: 60, timePerSite: 90 }
};
const routeAnalysis = document.getElementById('route-analysis');
const geoBtn = document.getElementById('geo-btn');

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

function renderMarkers() {
    markerContainer.innerHTML = '';
    const sites = getSites(activeCategory);
    const renderedKeys = new Set();

    sites.forEach(site => {
        renderedKeys.add(site.key);
        const marker = document.createElement('button');
        marker.type = 'button';
        marker.className = 'map-marker';
        marker.dataset.siteKey = site.key;
        marker.dataset.posLeft = site.left;
        marker.dataset.posTop = site.top;
        marker.title = site.title;
        marker.innerHTML = `<i class="fas fa-map-pin"></i><span class="marker-year">${site.title || ''}</span>`;
        marker.addEventListener('click', () => selectSite(site.key));
        markerContainer.appendChild(marker);
    });

    itinerary.forEach(siteKey => {
        if (renderedKeys.has(siteKey)) return;
        const site = heritageDataSource[siteKey];
        if (!site || !mapPositions[siteKey]) return;
        const marker = document.createElement('button');
        marker.type = 'button';
        marker.className = 'map-marker itinerary-marker';
        marker.dataset.siteKey = siteKey;
        marker.dataset.posLeft = mapPositions[siteKey].left;
        marker.dataset.posTop = mapPositions[siteKey].top;
        marker.title = `${site.title} (Trong hành trình)`;
        marker.innerHTML = `<i class="fas fa-map-pin"></i><span class="marker-year">${site.title || ''}</span>`;
        marker.addEventListener('click', () => selectSite(siteKey));
        markerContainer.appendChild(marker);
    });

    positionMarkers();
    updateActiveMarker();
}

function positionMarkers() {
    if (!mapImg) return;
    const containerWidth = mapImg.clientWidth;
    const containerHeight = mapImg.clientHeight;
    if (!containerWidth || !containerHeight) return;

    const markers = Array.from(markerContainer.querySelectorAll('.map-marker'));
    const positions = markers.map(marker => {
        const leftPct = parseFloat(marker.dataset.posLeft || '0') / 100;
        const topPct = parseFloat(marker.dataset.posTop || '0') / 100;
        return {
            marker,
            x: containerWidth * leftPct,
            y: containerHeight * topPct,
            leftPct,
            topPct
        };
    });

    const groups = [];
    const radiusThreshold = 24;

    positions.forEach(pos => {
        let group = groups.find(g => Math.hypot(g.x - pos.x, g.y - pos.y) < radiusThreshold);
        if (!group) {
            group = { x: pos.x, y: pos.y, items: [] };
            groups.push(group);
        }
        group.items.push(pos);
    });

    groups.forEach(group => {
        const count = group.items.length;
        if (count === 1) {
            const item = group.items[0];
            item.finalX = Math.max(0, Math.min(containerWidth, item.x));
            item.finalY = Math.max(0, Math.min(containerHeight, item.y));
            return;
        }

        const spreadRadius = Math.min(18, radiusThreshold / 1.5);
        group.items.forEach((item, index) => {
            const angle = (Math.PI * 2 / count) * index;
            item.finalX = Math.max(0, Math.min(containerWidth, group.x + Math.cos(angle) * spreadRadius));
            item.finalY = Math.max(0, Math.min(containerHeight, group.y + Math.sin(angle) * spreadRadius));
        });
    });

    positions.forEach(item => {
        item.marker.style.left = `${item.finalX}px`;
        item.marker.style.top = `${item.finalY}px`;
    });
}

function selectSite(siteKey) {
    if (!heritageDataSource[siteKey]) return;
    activeSiteKey = siteKey;
    const site = heritageDataSource[siteKey];
    infoTitle.textContent = site.title;
    infoImg.src = site.img || 'image/VIETNAM1.jpg';
    infoImg.alt = site.title;
    infoLocation.textContent = site.location || 'Không rõ';
    infoYear.textContent = site.year || 'N/A';
    const shortDesc = extractText(site.content).slice(0, 120) + '...';
    infoDescription.textContent = shortDesc;
    const typeLabel = activeCategory === 'physical' ? 'Vật thể' : 'Phi vật thể';
    infoExtra.innerHTML = `
        <div class="mb-3"><strong>Loại:</strong> ${typeLabel}</div>
        <button class="btn btn-detail w-100">Xem chi tiết</button>
    `;
    document.querySelector('.btn-detail').addEventListener('click', () => {
        // navigate directly to the detailed page for this site
        window.location.href = `Detail.html?id=${siteKey}`;
    });
    updateActiveMarker();
    updateItineraryButton();
}

function updateActiveMarker() {
    document.querySelectorAll('.map-marker').forEach(marker => {
        marker.classList.toggle('active', marker.dataset.siteKey === activeSiteKey);
    });
}

function getMapCoordinate(siteKey) {
    const pos = mapPositions[siteKey];
    if (!pos || !mapImg) return null;
    const containerWidth = mapImg.clientWidth;
    const containerHeight = mapImg.clientHeight;
    if (!containerWidth || !containerHeight) return null;
    return {
        x: containerWidth * parseFloat(pos.left) / 100,
        y: containerHeight * parseFloat(pos.top) / 100
    };
}

function renderItinerary() {
    itineraryList.innerHTML = '';
    itineraryCount.textContent = `${itinerary.length} điểm`;
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
        item.querySelector('.itinerary-remove').addEventListener('click', () => {
            removeItineraryItem(index);
        });

        itineraryList.appendChild(item);
    });

    updateRoute();
}

function updateItineraryButton() {
    const alreadyAdded = itinerary.includes(activeSiteKey);
    addItineraryBtn.textContent = alreadyAdded ? 'Đã thêm vào hành trình' : 'Thêm vào lịch trình';
    addItineraryBtn.disabled = alreadyAdded;
}

function addToItinerary(siteKey) {
    if (!siteKey || itinerary.includes(siteKey)) return;
    itinerary.push(siteKey);
    saveItinerary();
    renderItinerary();
    updateItineraryButton();
}

function removeItineraryItem(index) {
    itinerary.splice(index, 1);
    saveItinerary();
    renderItinerary();
    updateItineraryButton();
}

function moveItineraryItem(fromIndex, toIndex) {
    const item = itinerary.splice(fromIndex, 1)[0];
    itinerary.splice(toIndex, 0, item);
    saveItinerary();
    renderItinerary();
}

let dragSourceIndex = null;
function onItineraryDragStart(event) {
    dragSourceIndex = Number(event.currentTarget.dataset.index);
    event.dataTransfer.effectAllowed = 'move';
}

function onItineraryDragOver(event) {
    event.preventDefault();
    const target = event.currentTarget;
    target.classList.add('drag-over');
}

function onItineraryDrop(event) {
    event.preventDefault();
    const target = event.currentTarget;
    target.classList.remove('drag-over');
    const targetIndex = Number(target.dataset.index);
    if (dragSourceIndex !== null && targetIndex !== dragSourceIndex) {
        moveItineraryItem(dragSourceIndex, targetIndex);
    }
    dragSourceIndex = null;
}

function updateRoute() {
    routeSvg.innerHTML = '';
    if (itinerary.length < 2) return;

    const containerWidth = markerContainer.clientWidth;
    const containerHeight = markerContainer.clientHeight;
    if (!containerWidth || !containerHeight) return;

    const points = itinerary
        .map(getMapCoordinate)
        .filter(Boolean);
    if (points.length < 2) return;

    routeSvg.setAttribute('viewBox', `0 0 ${containerWidth} ${containerHeight}`);

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    path.setAttribute('d', d);
    path.setAttribute('stroke', '#c8a96e');
    path.setAttribute('stroke-width', '4');
    path.setAttribute('stroke-dasharray', '12 8');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    routeSvg.appendChild(path);

    points.forEach((p, index) => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', p.x);
        circle.setAttribute('cy', p.y);
        circle.setAttribute('r', '8');
        circle.setAttribute('fill', '#c8a96e');
        circle.setAttribute('stroke', '#ffffff');
        circle.setAttribute('stroke-width', '3');
        routeSvg.appendChild(circle);
    });
}

function extractText(html) {
    const container = document.createElement('div');
    container.innerHTML = html || '';
    return container.textContent.replace(/\s+/g, ' ').trim();
}

function setCategory(category) {
    activeCategory = category;
    physicalBtn.classList.toggle('active', category === 'physical');
    intangibleBtn.classList.toggle('active', category === 'intangible');
    if (!categories[category].includes(activeSiteKey)) {
        activeSiteKey = categories[category][0];
    }
    renderMarkers();
    selectSite(activeSiteKey);
    renderItinerary();
}

physicalBtn.addEventListener('click', () => setCategory('physical'));
intangibleBtn.addEventListener('click', () => setCategory('intangible'));
addItineraryBtn.addEventListener('click', () => addToItinerary(activeSiteKey));
geoBtn && geoBtn.addEventListener('click', getCurrentLocation);

// reposition markers and redraw route when the image or window changes size
if (mapImg) {
    mapImg.addEventListener('load', () => {
        positionMarkers();
    updateRoute(); updateRouteAnalysis();
    });
}
window.addEventListener('resize', () => {
    positionMarkers();
    updateRoute();
});

renderMarkers();
selectSite(activeSiteKey);
loadItinerary();

// Additional map enhancements

function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c) * 1.25;
}

function calculateJourneyStats() {
    if (itinerary.length < 2) return null;
    let totalDistance = 0, totalDrivingTime = 0;
    for (let i = 0; i < itinerary.length - 1; i++) {
        const from = realCoordinates[itinerary[i]];
        const to = realCoordinates[itinerary[i + 1]];
        if (from && to) {
            const dist = calculateDistance(from.lat, from.lng, to.lat, to.lng);
            const dTime = dist / transportSettings[transportMode].speed;
            totalDistance += dist;
            totalDrivingTime += dTime;
        }
    }
    const timePerSite = transportSettings[transportMode].timePerSite;
    const totalSiteTime = (itinerary.length * timePerSite) / 60;
    const totalTime = totalDrivingTime + totalSiteTime;
    return { totalDistance, totalDrivingTime, totalSiteTime, totalTime };
}

function updateRouteAnalysis() {
    routeAnalysis.innerHTML = '';
    if (itinerary.length < 2) {
        routeAnalysis.innerHTML = '<div class=\'text-muted\'>Thêm ít nhất 2 điểm để xem phân tích.</div>';
        return;
    }
    const stats = calculateJourneyStats();
    const formatTime = (h) => `${Math.floor(h)}h ${Math.round((h - Math.floor(h)) * 60)}m`;
    routeAnalysis.innerHTML = `
        <div class='mb-2'>Tổng khoảng cách: ${stats.totalDistance.toFixed(1)} km</div>
        <div class='mb-2'>Thời gian dự kiến: ${formatTime(stats.totalTime)}</div>
        <button class='btn btn-primary w-100 mt-2' onclick='openInGoogleMaps()'>Mở trên Google Maps</button>
        <button class='btn btn-secondary w-100 mt-2' onclick='showShareOptions()'>Chia sẻ</button>
    `;
}

function openInGoogleMaps() {
    if (itinerary.length < 2) {
        alert('Vui lòng chọn ít nhất 2 địa điểm!');
        return;
    }
    const coordsList = itinerary.map(key => realCoordinates[key]).filter(c => c);
    const origin = `${coordsList[0].lat},${coordsList[0].lng}`;
    const destination = `${coordsList[coordsList.length - 1].lat},${coordsList[coordsList.length - 1].lng}`;
    let waypoints = '';
    if (coordsList.length > 2) {
        waypoints = coordsList.slice(1, -1).map(c => `${c.lat},${c.lng}`).join('|');
    }
    const mode = (transportMode === 'car') ? 'driving' : 'motorcycling';
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=${mode}`;
    window.open(url, '_blank');
}

function showShareOptions() {
    const coordsList = itinerary.map(key => realCoordinates[key]).filter(c => c);
    const origin = `${coordsList[0].lat},${coordsList[0].lng}`;
    const destination = `${coordsList[coordsList.length - 1].lat},${coordsList[coordsList.length - 1].lng}`;
    const waypoints = coordsList.slice(1, -1).map(c => `${c.lat},${c.lng}`).join('|');
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}`;
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(url).then(() => {
            alert('Đã sao chép link hành trình vào bộ nhớ tạm.');
        }).catch(() => {
            prompt('Sao chép link dưới đây:', url);
        });
    } else {
        prompt('Sao chép link dưới đây:', url);
    }
}

function getCurrentLocation() {
    if (!navigator.geolocation) {
        alert('Trình duyệt không hỗ trợ định vị!');
        return;
    }
    const btn = event.currentTarget;
    btn.innerHTML = '<i class=\'fas fa-spinner fa-spin\'></i> Đang lấy...';
    navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const key = 'custom_pos';
        heritageDataSource[key] = { title: 'Vị trí của tôi', location: 'Tọa độ GPS', isGPS: true };
        realCoordinates[key] = { lat, lng };
        if (!itinerary.includes(key)) itinerary.unshift(key);
        saveItinerary();
        renderItinerary();
        btn.innerHTML = '<i class=\'fas fa-location-crosshairs me-2\'></i>Lấy vị trí của tôi';
    }, (error) => {
        alert('Lỗi GPS: ' + error.message);
    }, { enableHighAccuracy: true });
}
renderItinerary();
