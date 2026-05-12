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

// reposition markers and redraw route when the image or window changes size
if (mapImg) {
    mapImg.addEventListener('load', () => {
        positionMarkers();
        updateRoute();
    });
}
window.addEventListener('resize', () => {
    positionMarkers();
    updateRoute();
});

renderMarkers();
selectSite(activeSiteKey);
loadItinerary();
renderItinerary();
