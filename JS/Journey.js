// ============================================================
// KHỞI TẠO DỮ LIỆU & BIẾN TOÀN CỤC
// ============================================================

const heritageDataSource = typeof heritageData !== 'undefined' ? heritageData : {};

const categories = {
    physical: ['hue', 'ha-long', 'hoi-an', 'my-son', 'thang-long', 'phong-nha', 'thanh-nha-ho'],
    intangible: ['nha-nhac', 'cong-chieng', 'quan-ho', 'ca-tru', 'hoi-giong', 'hat-xoan', 'don-ca-tai-tu', 'vi-giam', 'keo-co', 'tho-mau', 'bai-choi', 'hat-then', 'xoe-thai', 'gom-cham', 'via-ba', 'dong-ho']
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

// DOM elements
const physicalBtn = document.getElementById('physicalBtn');
const intangibleBtn = document.getElementById('intangibleBtn');
const siteList = document.getElementById('site-list');
const itineraryList = document.getElementById('itinerary-list');
const emptyItinerary = document.getElementById('empty-itinerary');
const saveItineraryBtn = document.getElementById('save-itinerary-btn');
const clearItineraryBtn = document.getElementById('clear-itinerary-btn');
const routeAnalysis = document.getElementById('route-analysis');
const weatherSummary = document.getElementById('weather-summary');
const savedList = document.getElementById('saved-list');
const sampleToursContainer = document.getElementById('sample-tours-container');

// State
let activeCategory = 'physical';
let itinerary = [];
let dragSourceIndex = null;
let transportMode = 'motorcycle';

const transportSettings = {
    motorcycle: { speed: 40, timePerSite: 90 },
    car: { speed: 60, timePerSite: 90 }
};

// ============================================================
// TOUR MẪU GỢI Ý SẴN
// ============================================================

const sampleTours = [
    {
        id: 'central-3days',
        name: 'Tour di sản miền Trung 3 ngày',
        desc: 'Cố đô Huế, Mỹ Sơn, Hội An, Nhã nhạc cung đình',
        sites: ['hue', 'my-son', 'hoi-an', 'nha-nhac', 'bai-choi'],
        icon: 'fa-landmark'
    },
    {
        id: 'hanoi-halong',
        name: 'Tour Hà Nội - Hạ Long',
        desc: 'Hoàng thành Thăng Long, Vịnh Hạ Long, Quan họ',
        sites: ['thang-long', 'ha-long', 'quan-ho', 'dong-ho', 'ca-tru'],
        icon: 'fa-city'
    },
    {
        id: 'northern-heritage',
        name: 'Tour di sản Bắc Bộ',
        desc: 'Thành Nhà Hồ, Hát Xoan, Hội Gióng, Ca trù',
        sites: ['thang-long', 'thanh-nha-ho', 'hoi-giong', 'hat-xoan', 'keo-co'],
        icon: 'fa-mountain'
    },
    {
        id: 'southern-journey',
        name: 'Tour di sản phương Nam',
        desc: 'Đờn ca tài tử, Gốm Chăm, Lễ Vía Bà, Bài Chòi',
        sites: ['don-ca-tai-tu', 'via-ba', 'gom-cham', 'bai-choi'],
        icon: 'fa-umbrella-beach'
    },
    {
        id: 'grand-tour',
        name: 'Tour di sản Việt Nam',
        desc: 'Xuyên Việt qua các di sản tiêu biểu nhất',
        sites: ['thang-long', 'ha-long', 'hue', 'hoi-an', 'my-son', 'phong-nha', 'don-ca-tai-tu'],
        icon: 'fa-globe-asia'
    }
];

function loadSampleTour(tourId) {
    const tour = sampleTours.find(t => t.id === tourId);
    if (!tour) return;

    itinerary = tour.sites.filter(key => heritageDataSource[key]);
    saveItinerary();
    renderItinerary();

    const aside = document.querySelector('.info-panel');
    if (aside) {
        aside.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function renderSampleTours() {
    const cards = sampleTours.map(tour => {
        const firstSite = heritageDataSource[tour.sites[0]];
        const imgSrc = firstSite?.img || 'image/VIETNAM1.jpg';
        return `
            <div class="tour-card" onclick="loadSampleTour('${tour.id}')">
                <div class="tour-card-img">
                    <img src="${imgSrc}" alt="${escapeHTML(tour.name)}">
                    <div class="tour-card-overlay">
                        <i class="fas ${tour.icon}"></i>
                    </div>
                </div>
                <div class="tour-card-body">
                    <h6 class="tour-card-title">${escapeHTML(tour.name)}</h6>
                    <p class="tour-card-desc">${escapeHTML(tour.desc)}</p>
                    <div class="tour-card-footer">
                        <span class="tour-card-count"><i class="fas fa-map-pin me-1"></i>${tour.sites.length} điểm</span>
                        <span class="tour-card-btn">Dùng ngay <i class="fas fa-arrow-right ms-1"></i></span>
                    </div>
                </div>
            </div>`;
    }).join('');

    sampleToursContainer.innerHTML = `
        <div class="tour-section">
            <div class="tour-section-header">
                <span class="info-label">Gợi ý</span>
                <h6 class="mb-0 fw-bold">Tour mẫu cho bạn</h6>
            </div>
            <div class="tour-scroll-wrapper">
                <div class="tour-scroll">
                    ${cards}
                </div>
            </div>
        </div>`;
}

// ============================================================
// LƯU / TẢI NHIỀU HÀNH TRÌNH (LOCALSTORAGE)
// ============================================================

const SAVED_KEY = 'vhSavedItineraries';

function getSavedItineraries() {
    try { return JSON.parse(localStorage.getItem(SAVED_KEY)) || {}; } catch { return {}; }
}

function saveNamedItinerary(name) {
    const saved = getSavedItineraries();
    const customPoints = {};
    itinerary.forEach(key => {
        if (key.startsWith('custom_')) {
            customPoints[key] = { data: heritageDataSource[key], coords: realCoordinates[key] };
        }
    });
    saved[name] = {
        itinerary: [...itinerary],
        customPoints: customPoints,
        savedAt: new Date().toISOString()
    };
    localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
    renderSavedList();
}

function loadNamedItinerary(name) {
    const saved = getSavedItineraries();
    const entry = saved[name];
    if (!entry) return;

    if (entry.customPoints) {
        for (let key in entry.customPoints) {
            heritageDataSource[key] = entry.customPoints[key].data;
            realCoordinates[key] = entry.customPoints[key].coords;
        }
    }
    itinerary = [...(entry.itinerary || [])];
    saveItinerary();
    renderItinerary();
}

function deleteSavedItinerary(name) {
    const saved = getSavedItineraries();
    delete saved[name];
    localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
    renderSavedList();
}

function renderSavedList() {
    const saved = getSavedItineraries();
    const names = Object.keys(saved);

    savedList.innerHTML = '';
    if (names.length === 0) {
        savedList.innerHTML = '<li><span class="dropdown-item text-muted">Chưa có hành trình nào</span></li>';
        return;
    }

    names.forEach(name => {
        const li = document.createElement('li');
        li.className = 'dropdown-item d-flex align-items-center justify-content-between';
        li.style.cursor = 'default';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'flex-grow-1 py-1';
        nameSpan.style.cursor = 'pointer';
        nameSpan.innerHTML = `<i class="fas fa-map-marked-alt me-2 text-bronze"></i>${escapeHTML(name)} <small class="text-muted ms-1">(${(saved[name].itinerary || []).length} điểm)</small>`;
        nameSpan.addEventListener('click', (e) => {
            e.stopPropagation();
            loadNamedItinerary(name);
        });

        const delBtn = document.createElement('button');
        delBtn.className = 'btn btn-sm text-danger ms-2';
        delBtn.title = 'Xoá';
        delBtn.innerHTML = '<i class="fas fa-times"></i>';
        delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Xoá "${name}"?`)) {
                deleteSavedItinerary(name);
            }
        });

        li.appendChild(nameSpan);
        li.appendChild(delBtn);
        savedList.appendChild(li);
    });
}

// ============================================================
// HÀM TIỆN ÍCH
// ============================================================

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

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

// ============================================================
// THỜI TIẾT THEO LỘ TRÌNH
// ============================================================

const weatherCache = {};

function getWeatherIcon(code) {
    if (code === 0) return 'fa-sun';
    if (code <= 2) return 'fa-cloud-sun';
    if (code <= 3) return 'fa-cloud';
    if (code <= 48) return 'fa-smog';
    if (code <= 57) return 'fa-cloud-rain';
    if (code <= 67) return 'fa-cloud-showers-heavy';
    if (code <= 77) return 'fa-snowflake';
    if (code <= 82) return 'fa-cloud-rain';
    if (code <= 86) return 'fa-cloud-snow';
    return 'fa-cloud-bolt';
}

function getWeatherLabel(code) {
    if (code === 0) return 'Trời quang';
    if (code <= 2) return 'Ít mây';
    if (code <= 3) return 'Nhiều mây';
    if (code <= 48) return 'Sương mù';
    if (code <= 57) return 'Mưa phùn';
    if (code <= 67) return 'Mưa lớn';
    if (code <= 77) return 'Tuyết';
    if (code <= 82) return 'Mưa rào';
    if (code <= 86) return 'Mưa tuyết';
    return 'Dông bão';
}

async function fetchWeather(key) {
    const coord = realCoordinates[key];
    if (!coord || key.startsWith('custom_')) return null;
    const cacheKey = `${coord.lat.toFixed(1)}_${coord.lng.toFixed(1)}`;

    if (weatherCache[cacheKey] && Date.now() - weatherCache[cacheKey].timestamp < 1800000) {
        return weatherCache[cacheKey].data;
    }

    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coord.lat}&longitude=${coord.lng}&current_weather=true`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.current_weather) {
            weatherCache[cacheKey] = { data: data.current_weather, timestamp: Date.now() };
            return data.current_weather;
        }
    } catch (e) {
        console.warn('Weather fetch failed for', key);
    }
    return null;
}

async function updateWeather() {
    const weatherDisplay = document.getElementById('weather-summary');
    const uniqueKeys = [...new Set(itinerary.filter(k => !k.startsWith('custom_')))];

    if (uniqueKeys.length === 0) {
        if (weatherDisplay) weatherDisplay.innerHTML = '';
        return;
    }

    if (weatherDisplay) {
        weatherDisplay.innerHTML = `<div class="small text-muted text-center py-1"><i class="fas fa-spinner fa-spin me-1"></i>Đang cập nhật thời tiết...</div>`;
    }

    const results = await Promise.allSettled(uniqueKeys.map(k => fetchWeather(k)));

    let weatherHtml = '';
    let allTemps = [];
    results.forEach((result, idx) => {
        const key = uniqueKeys[idx];
        if (result.status === 'fulfilled' && result.value) {
            const w = result.value;
            allTemps.push(w.temperature);
            const icon = getWeatherIcon(w.weathercode);
            const label = getWeatherLabel(w.weathercode);
            weatherHtml += `<span class="me-2" title="${escapeHTML(heritageDataSource[key]?.title)}: ${label}, ${w.temperature}°C">
                <i class="fas ${icon}"></i> ${Math.round(w.temperature)}°</span>`;
        }
    });

    if (weatherDisplay) {
        if (weatherHtml) {
            let avgTemp = '--';
            if (allTemps.length > 0) {
                avgTemp = Math.round(allTemps.reduce((a, b) => a + b, 0) / allTemps.length) + '°C';
            }
            weatherDisplay.innerHTML = `
                <div class="small p-2 bg-light rounded-3 text-center">
                    <i class="fas fa-temperature-half me-1 text-bronze"></i>
                    <strong>Thời tiết:</strong> ${weatherHtml}
                    <span class="ms-1 badge bg-success">TB ${avgTemp}</span>
                </div>`;
        } else {
            weatherDisplay.innerHTML = '';
        }
    }
}

// ============================================================
// ĐỊNH VỊ GPS
// ============================================================

function getCurrentLocation() {
    if (!navigator.geolocation) {
        alert("Trình duyệt không hỗ trợ định vị!");
        return;
    }

    const btn = event.currentTarget;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lấy...';

    navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const myLocationKey = `custom_pos`;

        heritageDataSource[myLocationKey] = {
            title: "Vị trí của tôi",
            location: "Tọa độ GPS",
            isGPS: true
        };
        realCoordinates[myLocationKey] = { lat, lng };

        if (!itinerary.includes(myLocationKey)) {
            itinerary.unshift(myLocationKey);
        }

        saveItinerary();
        renderItinerary();
        btn.innerHTML = '<i class="fas fa-location-crosshairs me-2"></i> Lấy vị trí của tôi';
    }, (error) => {
        alert("Lỗi GPS: " + error.message);
    }, { enableHighAccuracy: true });
}

// ============================================================
// GOOGLE MAPS & CHIA SẺ
// ============================================================

function openInGoogleMaps() {
    if (itinerary.length < 2) {
        alert("Vui lòng chọn ít nhất 2 địa điểm!");
        return;
    }

    const coordsList = itinerary.map(key => realCoordinates[key]).filter(c => c);
    if (coordsList.length < 2) return;

    const origin = `${coordsList[0].lat},${coordsList[0].lng}`;
    const destination = `${coordsList[coordsList.length - 1].lat},${coordsList[coordsList.length - 1].lng}`;

    let waypoints = "";
    if (coordsList.length > 2) {
        waypoints = coordsList.slice(1, -1).map(c => `${c.lat},${c.lng}`).join('|');
    }

    const mode = (transportMode === 'car') ? 'driving' : 'motorcycling';
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=${mode}`;

    window.open(url, '_blank');
}

function getShareUrl() {
    const coordsList = itinerary.map(key => realCoordinates[key]).filter(c => c);
    const origin = `${coordsList[0].lat},${coordsList[0].lng}`;
    const destination = `${coordsList[coordsList.length - 1].lat},${coordsList[coordsList.length - 1].lng}`;
    const waypoints = coordsList.slice(1, -1).map(c => `${c.lat},${c.lng}`).join('|');
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}`;
}

function showShareOptions() {
    if (itinerary.length < 2) {
        alert("Vui lòng tạo hành trình trước khi chia sẻ!");
        return;
    }
    const shareUrl = getShareUrl();

    let container = document.getElementById('share-options');
    if (container) {
        container.style.display = container.style.display === 'none' ? 'block' : 'none';
        return;
    }

    container = document.createElement('div');
    container.id = 'share-options';
    container.className = 'mt-2 p-2 border rounded mx-auto share-options';

    const textarea = document.createElement('textarea');
    textarea.id = 'share-url';
    textarea.className = 'form-control mb-2';
    textarea.rows = 3;
    textarea.readOnly = true;
    textarea.value = shareUrl;
    container.appendChild(textarea);

    const btnGroup = document.createElement('div');
    btnGroup.className = 'd-flex flex-wrap gap-2';

    const fbBtn = document.createElement('button');
    fbBtn.type = 'button';
    fbBtn.className = 'btn btn-primary btn-sm flex-fill';
    fbBtn.innerHTML = '<i class="fab fa-facebook me-1"></i>Facebook';
    fbBtn.onclick = () => {
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(fbUrl, '_blank', 'width=600,height=400');
    };
    btnGroup.appendChild(fbBtn);

    const zaloBtn = document.createElement('button');
    zaloBtn.type = 'button';
    zaloBtn.className = 'btn btn-success btn-sm flex-fill';
    zaloBtn.innerHTML = '<i class="fas fa-sms me-1"></i>Zalo';
    zaloBtn.onclick = () => {
        const zaloUrl = `https://zalo.me/share?url=${encodeURIComponent(shareUrl)}`;
        window.open(zaloUrl, '_blank', 'width=600,height=400');
    };
    btnGroup.appendChild(zaloBtn);

    const messengerBtn = document.createElement('button');
    messengerBtn.type = 'button';
    messengerBtn.className = 'btn btn-primary btn-sm flex-fill';
    messengerBtn.innerHTML = '<i class="fab fa-facebook-messenger me-1"></i>Messenger';
    messengerBtn.onclick = () => {
        const appId = 'YOUR_APP_ID';
        const redirectUri = encodeURIComponent(window.location.href);
        const messengerUrl = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(shareUrl)}&app_id=${appId}&redirect_uri=${redirectUri}`;
        window.open(messengerUrl, '_blank', 'width=600,height=400');
    };
    btnGroup.appendChild(messengerBtn);

    const whatsappBtn = document.createElement('button');
    whatsappBtn.type = 'button';
    whatsappBtn.className = 'btn btn-success btn-sm flex-fill';
    whatsappBtn.innerHTML = '<i class="fab fa-whatsapp me-1"></i>WhatsApp';
    whatsappBtn.onclick = () => {
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareUrl)}`;
        window.open(whatsappUrl, '_blank', 'width=600,height=400');
    };
    btnGroup.appendChild(whatsappBtn);

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'btn btn-secondary btn-sm flex-fill';
    copyBtn.innerHTML = '<i class="fas fa-copy me-1"></i>Sao chép link';
    copyBtn.onclick = () => {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(shareUrl).then(() => {
                alert('Đã sao chép link vào bộ nhớ tạm!');
            }).catch(() => {
                prompt('Sao chép link dưới đây:', shareUrl);
            });
        } else {
            prompt('Sao chép link dưới đây:', shareUrl);
        }
    };
    btnGroup.appendChild(copyBtn);

    container.appendChild(btnGroup);

    const shareBtn = document.querySelector('button[onclick="showShareOptions()"]');
    if (shareBtn) {
        shareBtn.parentNode.insertBefore(container, shareBtn.nextSibling);
    }
}

// ============================================================
// PHÂN TÍCH LỘ TRÌNH
// ============================================================

function calculateJourneyStats() {
    if (itinerary.length < 2) return null;
    let totalDistance = 0, totalDrivingTime = 0, segments = [];

    for (let i = 0; i < itinerary.length - 1; i++) {
        const from = realCoordinates[itinerary[i]], to = realCoordinates[itinerary[i + 1]];
        if (from && to) {
            const dist = calculateDistance(from.lat, from.lng, to.lat, to.lng);
            const dTime = dist / transportSettings[transportMode].speed;
            totalDistance += dist;
            totalDrivingTime += dTime;
            segments.push({
                from: heritageDataSource[itinerary[i]].title,
                to: heritageDataSource[itinerary[i + 1]].title,
                distance: dist,
                drivingTime: dTime
            });
        }
    }

    const timePerSite = transportSettings[transportMode].timePerSite;
    const totalSiteTime = (itinerary.length * timePerSite) / 60;
    const totalTime = totalDrivingTime + totalSiteTime;

    let suggestedDays = "";
    let suggestedTime = "";
    let intensity = "";

    if (totalTime <= 5) {
        suggestedDays = "Nửa ngày (Sáng hoặc Chiều) - Thời gian di chuyển ngắn, phù hợp cho chuyến đi nhanh.";
        suggestedTime = "Khởi hành lúc 7:30 sáng hoặc 13:30 chiều, lịch trình nhẹ nhàng và không gây áp lực.";
        intensity = "Thoải mái - Nhịp độ nhẹ nhàng, tập trung vào nghỉ ngơi.";
    } else if (totalTime <= 10) {
        suggestedDays = "1 ngày trọn vẹn - Khám phá các điểm nổi bật trong một ngày.";
        suggestedTime = "Nên khởi hành sớm từ 7:00 để kịp về trước buổi tối, tối đa 10h di chuyển và tham quan.";
        intensity = "Vừa sức - Cân bằng giữa di chuyển và tham quan.";
    } else if (totalTime <= 20) {
        suggestedDays = "2 ngày 1 đêm - Thời gian nghỉ ngơi hợp lý, trải nghiệm sâu hơn.";
        suggestedTime = "Nên nghỉ đêm tại " + segments[Math.floor(segments.length / 2)].to + ", bắt đầu sớm ngày đầu và tiếp tục ngày thứ hai.";
        intensity = "Lý tưởng cho cuối tuần - Thời gian vừa đủ, không gấp rối.";
    } else if (totalDistance > 500) {
        const days = Math.ceil(totalTime / 7);
        suggestedDays = `${days} ngày ${days - 1} đêm - Hành trình kéo dài, khám phá nhiều địa điểm.`;
        suggestedTime = "Hành trình dài: Cần kiểm tra bảo dưỡng xe, chuẩn bị thể lực, và nghỉ ngơi mỗi ngày để duy trì sức khỏe.";
        intensity = "Khám phá chuyên sâu - Mức độ dày đặc, phù hợp cho du khách yêu thích khám phá.";
    } else {
        const days = Math.ceil(totalTime / 8);
        suggestedDays = `${days} ngày - Lịch trình dàn trải, thích hợp cho gia đình và nhóm.`;
        suggestedTime = "Lịch trình dàn trải, phù hợp đi cùng gia đình, mỗi ngày không quá 8h di chuyển và tham quan.";
        intensity = "Trung bình - Nhịp độ cân bằng, thích hợp cho mọi nhóm.";
    }

    return {
        totalDistance,
        totalDrivingTime,
        totalSiteTime,
        totalTime,
        segments,
        suggestedDays,
        suggestedTime,
        intensity
    };
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
                <button class="btn btn-sm btn-outline-success transport-btn ${transportMode === 'motorcycle' ? 'active' : ''}" data-mode="motorcycle"><i class="fas fa-motorcycle"></i> Xe máy</button>
                <button class="btn btn-sm btn-outline-success transport-btn ${transportMode === 'car' ? 'active' : ''}" data-mode="car"><i class="fas fa-car"></i> Ô tô</button>
            </div>
        </div>
        <div class="p-3 bg-light rounded-3 mb-3">
            <div class="h3 mb-1 text-success fw-bold">${stats.totalDistance.toFixed(1)} km</div>
            <div class="small text-muted mb-2">Tổng thời gian dự kiến: ${formatTime(stats.totalTime)}</div>
            <div class="small text-muted mb-2">Thời gian tham quan: ${formatTime(stats.totalSiteTime)}</div>
            <div class="badge bg-success-subtle text-dark p-2 w-100 text-start text-wrap">📅 Ước tính: ${escapeHTML(stats.suggestedDays)}</div>
            <div class="badge bg-success-subtle text-dark p-2 w-100 text-start text-wrap">⏰ Kế hoạch: ${escapeHTML(stats.suggestedTime)}</div>
            <div class="badge bg-success-subtle text-dark p-2 w-100 text-start text-wrap">🔥 Mức độ: ${escapeHTML(stats.intensity)}</div>
        </div>
        <button onclick="openInGoogleMaps()" class="btn btn-google-maps w-100 mt-2 shadow-sm">
            <i class="fab fa-google me-2"></i> Bắt đầu trên Google Maps
        </button>
        <button onclick="showShareOptions()" class="btn btn-danger w-100 mt-2">
            <i class="fas fa-share-alt me-2"></i> Chia sẻ lộ trình
        </button>
        <div class="d-flex align-items-center justify-content-center mt-3">
            <div id="qr-code" class="text-center"></div>
            <p class="ms-3 mb-0 small text-muted">Quét mã QR để mở lộ trình trên Google Maps</p>
        </div>
        <div class="small text-muted">Chi tiết lộ trình:</div>
        <div class="mt-2 route-segments">
            ${stats.segments.map((s, i) => `<div class="mb-2 border-bottom pb-1"><strong>${i + 1}.</strong> ${escapeHTML(s.from)} → ${escapeHTML(s.to)} <br> <span class="text-success">${s.distance.toFixed(1)}km</span></div>`).join('')}
        </div>
    `;

    // Tạo QR code
    const qrCoords = itinerary.map(key => realCoordinates[key]).filter(c => c);
    if (qrCoords.length >= 2) {
        const qrOrigin = `${qrCoords[0].lat},${qrCoords[0].lng}`;
        const qrDestination = `${qrCoords[qrCoords.length - 1].lat},${qrCoords[qrCoords.length - 1].lng}`;
        const qrWaypoints = qrCoords.slice(1, -1).map(c => `${c.lat},${c.lng}`).join('|');
        const qrGoogleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${qrOrigin}&destination=${qrDestination}&waypoints=${qrWaypoints}`;

        let qrDiv = document.getElementById('qr-code');
        if (!qrDiv) {
            qrDiv = document.createElement('div');
            qrDiv.id = 'qr-code';
            qrDiv.className = 'mt-3 text-center';
            routeAnalysis.appendChild(qrDiv);
        } else {
            qrDiv.innerHTML = '';
        }

        if (typeof QRCode !== 'undefined') {
            new QRCode(qrDiv, {
                text: qrGoogleMapsUrl,
                width: 128,
                height: 128,
                correctLevel: QRCode.CorrectLevel.H
            });
        } else {
            console.warn('QRCode library not loaded, using image fallback.');
            const img = document.createElement('img');
            img.src = `https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=${encodeURIComponent(qrGoogleMapsUrl)}`;
            img.alt = 'QR code';
            qrDiv.appendChild(img);
        }
    }
}

// ============================================================
// RENDER DANH SÁCH DI SẢN
// ============================================================

function renderSiteCards() {
    siteList.innerHTML = '';
    categories[activeCategory].forEach(key => {
        const site = heritageDataSource[key];
        if (!site) return;

        const isAdded = itinerary.includes(key);
        const col = document.createElement('div');
        col.className = 'col';
        col.innerHTML = `
            <div class="journey-card card h-100 shadow-sm border-0 d-flex flex-column">
                <img src="${site.img || 'image/VIETNAM1.jpg'}" class="card-img-top" style="height:150px; object-fit:cover" alt="${site.title}">
                <div class="card-body p-3 d-flex flex-column">
                    <h6 class="fw-bold mb-1">${site.title}</h6>
                    <p class="small text-muted mb-2">${site.location}</p>
                    <button class="btn btn-sm ${isAdded ? 'btn-secondary' : 'btn-success'} w-100 mt-auto" onclick="addToItinerary('${key}')" ${isAdded ? 'disabled' : ''}>
                        ${isAdded ? 'Đã thêm' : '<i class="fas fa-plus"></i> Thêm'}
                    </button>
                </div>
            </div>`;
        siteList.appendChild(col);
    });
}

// ============================================================
// RENDER LỊCH TRÌNH (KÉO THẢ + THỜI TIẾT)
// ============================================================

async function renderItinerary() {
    itineraryList.innerHTML = '';
    emptyItinerary.style.display = itinerary.length ? 'none' : 'block';

    itinerary.forEach((key, index) => {
        const site = heritageDataSource[key];
        const li = document.createElement('li');
        li.className = 'itinerary-item d-flex align-items-center mb-2 p-2 bg-white rounded shadow-sm';
        li.draggable = true;
        li.innerHTML = `
            <span class="me-2 badge bg-success">${index + 1}</span>
            <div class="flex-grow-1">
                <div class="small fw-bold">${site.title}</div>
                <div class="small text-muted site-weather-display" data-site-key="${key}">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
            </div>
            <button class="btn btn-sm text-danger" onclick="removeItineraryItem(${index})">×</button>`;

        li.addEventListener('dragstart', () => { dragSourceIndex = index; });
        li.addEventListener('dragover', e => e.preventDefault());
        li.addEventListener('drop', () => {
            const [moved] = itinerary.splice(dragSourceIndex, 1);
            itinerary.splice(index, 0, moved);
            saveItinerary();
            renderItinerary();
        });
        itineraryList.appendChild(li);
    });

    renderSiteCards();
    updateRouteAnalysis();
    updateWeather();

    // Gọi thời tiết từng điểm
    itinerary.forEach(key => {
        const coord = realCoordinates[key];
        if (!coord || key.startsWith('custom_')) return;
        fetchWeather(key).then(w => {
            if (!w) return;
            const el = document.querySelector(`.site-weather-display[data-site-key="${key}"]`);
            if (el) {
                const icon = getWeatherIcon(w.weathercode);
                el.innerHTML = `<i class="fas ${icon}"></i> ${Math.round(w.temperature)}°C`;
            }
        });
    });
}

// ============================================================
// THAO TÁC LỊCH TRÌNH (THÊM / XOÁ / XOÁ TẤT CẢ)
// ============================================================

function addToItinerary(key) {
    if (!itinerary.includes(key)) {
        itinerary.push(key);
        saveItinerary();
        renderItinerary();
    }
}

function removeItineraryItem(idx) {
    itinerary.splice(idx, 1);
    saveItinerary();
    renderItinerary();
}

function clearItinerary() {
    itinerary = [];
    saveItinerary();
    renderItinerary();
}

// ============================================================
// LƯU / TẢI LỊCH TRÌNH (LOCALSTORAGE)
// ============================================================

function saveItinerary() {
    localStorage.setItem('vhJourney', JSON.stringify(itinerary));

    const customPoints = {};
    itinerary.forEach(key => {
        if (key.startsWith('custom_')) {
            customPoints[key] = {
                data: heritageDataSource[key],
                coords: realCoordinates[key]
            };
        }
    });
    localStorage.setItem('vhCustomPoints', JSON.stringify(customPoints));
}

function loadItinerary() {
    try {
        itinerary = JSON.parse(localStorage.getItem('vhJourney')) || [];
        const customPoints = JSON.parse(localStorage.getItem('vhCustomPoints')) || {};

        for (let key in customPoints) {
            heritageDataSource[key] = customPoints[key].data;
            realCoordinates[key] = customPoints[key].coords;
        }
    } catch (e) {
        itinerary = [];
    }
}

// ============================================================
// EVENT LISTENERS
// ============================================================

physicalBtn.addEventListener('click', () => {
    activeCategory = 'physical';
    physicalBtn.classList.add('active');
    intangibleBtn.classList.remove('active');
    renderSiteCards();
});

intangibleBtn.addEventListener('click', () => {
    activeCategory = 'intangible';
    intangibleBtn.classList.add('active');
    physicalBtn.classList.remove('active');
    renderSiteCards();
});

saveItineraryBtn.addEventListener('click', () => {
    if (itinerary.length === 0) {
        alert('Vui lòng thêm điểm vào hành trình trước!');
        return;
    }
    const name = prompt('Đặt tên cho hành trình này:');
    if (!name || !name.trim()) return;
    saveNamedItinerary(name.trim());
    alert(`Đã lưu hành trình "${name.trim()}"!`);
});

clearItineraryBtn.addEventListener('click', clearItinerary);

document.addEventListener('click', function (e) {
    const btn = e.target.closest('.transport-btn');
    if (btn) {
        transportMode = btn.dataset.mode;
        updateRouteAnalysis();
    }
});

// ============================================================
// KHỞI ĐỘNG
// ============================================================

loadItinerary();
renderSampleTours();
renderSavedList();
renderItinerary();

window.addEventListener('storage', (e) => {
    if (e.key === 'vhJourney' || e.key === 'vhCustomPoints') {
        loadItinerary();
        renderItinerary();
    }
    if (e.key === SAVED_KEY) {
        renderSavedList();
    }
});
