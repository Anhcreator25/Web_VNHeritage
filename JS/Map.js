const heritageDataSource = typeof heritageData !== 'undefined' ? heritageData : {};

const categories = {
    physical: ['hue', 'ha-long', 'hoi-an', 'my-son', 'thang-long', 'phong-nha', 'thanh-nha-ho'],
    intangible: ['nha-nhac', 'cong-chieng', 'quan-ho', 'ca-tru', 'hoi-giong', 'hat-xoan', 'don-ca-tai-tu', 'vi-giam', 'keo-co', 'tho-mau', 'bai-choi', 'hat-then', 'xoe-thai', 'gom-cham', 'via-ba', 'dong-ho']
};

const mapPositions = {
    'hue': { left: '44%', top: '48%' },
    'ha-long': { left: '48%', top: '14%' },
    'hoi-an': { left: '49%', top: '61%' },
    'my-son': { left: '47%', top: '65%' },
    'thang-long': { left: '36%', top: '30%' },
    'phong-nha': { left: '45%', top: '50%' },
    'thanh-nha-ho': { left: '39%', top: '35%' },
    'nha-nhac': { left: '44%', top: '49%' },
    'cong-chieng': { left: '48%', top: '58%' },
    'quan-ho': { left: '40%', top: '26%' },
    'ca-tru': { left: '38%', top: '25%' },
    'hoi-giong': { left: '38%', top: '29%' },
    'hat-xoan': { left: '35%', top: '23%' },
    'don-ca-tai-tu': { left: '46%', top: '68%' },
    'vi-giam': { left: '39%', top: '38%' },
    'keo-co': { left: '42%', top: '24%' },
    'tho-mau': { left: '42%', top: '44%' },
    'bai-choi': { left: '45%', top: '55%' },
    'hat-then': { left: '32%', top: '18%' },
    'xoe-thai': { left: '34%', top: '20%' },
    'gom-cham': { left: '49%', top: '67%' },
    'via-ba': { left: '48%', top: '70%' },
    'dong-ho': { left: '39%', top: '28%' }
};

const markerContainer = document.getElementById('marker-container');
const infoTitle = document.getElementById('info-title');
const infoImg = document.getElementById('info-img');
const infoLocation = document.getElementById('info-location');
const infoYear = document.getElementById('info-year');
const infoDescription = document.getElementById('info-description');
const infoExtra = document.getElementById('info-extra');
const physicalBtn = document.getElementById('physicalBtn');
const intangibleBtn = document.getElementById('intangibleBtn');

let activeCategory = 'physical';
let activeSiteKey = categories.physical[0];

function getSites(category) {
    return categories[category]
        .filter(key => heritageDataSource[key])
        .map(key => ({ key, ...heritageDataSource[key], ...mapPositions[key] }));
}

function renderMarkers() {
    markerContainer.innerHTML = '';
    const sites = getSites(activeCategory);
    sites.forEach(site => {
        const marker = document.createElement('button');
        marker.type = 'button';
        marker.className = 'map-marker';
        marker.dataset.siteKey = site.key;
        // store the percentage positions on the element for later pixel calculation
        marker.dataset.posLeft = site.left;
        marker.dataset.posTop = site.top;
        marker.title = site.title;
        marker.innerHTML = `<i class="fas fa-map-pin"></i><span class="marker-year">${site.title || ''}</span>`;
        marker.addEventListener('click', () => selectSite(site.key));
        markerContainer.appendChild(marker);
    });
    // position markers after they are in the DOM
    positionMarkers();
    updateActiveMarker();
}

function positionMarkers() {
    const mapImg = document.querySelector('.map-bg');
    if (!mapImg) return;
    const imgRect = mapImg.getBoundingClientRect();
    const containerRect = markerContainer.getBoundingClientRect();
    const markers = markerContainer.querySelectorAll('.map-marker');
    markers.forEach(marker => {
        const leftPct = parseFloat(marker.dataset.posLeft || '0') / 100;
        const topPct = parseFloat(marker.dataset.posTop || '0') / 100;
        // pixel offsets relative to markerContainer
        const offsetX = (imgRect.left - containerRect.left) + imgRect.width * leftPct;
        const offsetY = (imgRect.top - containerRect.top) + imgRect.height * topPct;
        marker.style.left = `${Math.max(0, Math.min(containerRect.width, offsetX))}px`;
        marker.style.top = `${Math.max(0, Math.min(containerRect.height, offsetY))}px`;
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
}

function updateActiveMarker() {
    document.querySelectorAll('.map-marker').forEach(marker => {
        marker.classList.toggle('active', marker.dataset.siteKey === activeSiteKey);
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
}

physicalBtn.addEventListener('click', () => setCategory('physical'));
intangibleBtn.addEventListener('click', () => setCategory('intangible'));

// reposition markers when the image or window changes size
const mapImg = document.querySelector('.map-bg');
if (mapImg) {
    mapImg.addEventListener('load', () => positionMarkers());
}
window.addEventListener('resize', () => positionMarkers());

renderMarkers();
selectSite(activeSiteKey);
