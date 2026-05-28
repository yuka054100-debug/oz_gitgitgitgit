// ================================================
// 실시간 암호화폐 가격 변동 추적기
// ================================================

// ===== 1. DOM 요소 선택 =====
const cryptoList = document.querySelector("#crypto-list");
const searchInput = document.querySelector("#search-input");
const tabAll = document.querySelector("#tab-all");
const tabFavorites = document.querySelector("#tab-favorites");

// ===== 2. 상태 변수 =====
const API_URL = "https://api4.binance.com/api/v3/ticker/24hr";
let allData = [];         // 전체 USDT 코인 데이터
let currentTab = "all";  // 현재 탭 ("all" or "favorites")
let searchQuery = "";     // 검색어

// ===== 3. LocalStorage - 관심항목 관리 =====
function getFavorites() {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
}

function saveFavorites(favorites) {
    localStorage.setItem("favorites", JSON.stringify(favorites));
}

function toggleFavorite(symbol) {
    const favorites = getFavorites();
    const index = favorites.indexOf(symbol);

    if (index === -1) {
        favorites.push(symbol);
    } else {
        favorites.splice(index, 1);
    }

    saveFavorites(favorites);
    renderTable();
}

function isFavorite(symbol) {
    return getFavorites().includes(symbol);
}

// ===== 4. API 데이터 가져오기 =====
async function fetchData() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        // USDT 항목만 필터링
        allData = data.filter(item => item.symbol.endsWith("USDT"));

        renderTable();
    } catch (error) {
        console.error("API 오류:", error);
        cryptoList.innerHTML = `<tr><td colspan="6" class="empty">데이터를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.</td></tr>`;
    }
}

// ===== 5. 테이블 렌더링 =====
function renderTable() {
    const favorites = getFavorites();

    // 현재 탭에 따라 데이터 필터링
    let filtered = allData;

    // 관심항목 탭이면 관심 코인만
    if (currentTab === "favorites") {
        filtered = filtered.filter(item => favorites.includes(item.symbol));
    }

    // 검색어 필터링
    if (searchQuery) {
        filtered = filtered.filter(item =>
            item.symbol.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    // 빈 상태 처리
    if (filtered.length === 0) {
        if (currentTab === "favorites") {
            cryptoList.innerHTML = `<tr><td colspan="6" class="empty">⭐ 관심항목을 추가해주세요.</td></tr>`;
        } else {
            cryptoList.innerHTML = `<tr><td colspan="6" class="empty">검색 결과가 없습니다.</td></tr>`;
        }
        return;
    }

    // 테이블 행 생성
    cryptoList.innerHTML = filtered.map(item => {
        const price = parseFloat(item.lastPrice);
        const change = parseFloat(item.priceChangePercent);
        const high = parseFloat(item.highPrice);
        const low = parseFloat(item.lowPrice);
        const favorite = isFavorite(item.symbol);

        // 변동률 색상 결정
        let changeClass = "change-zero";
        let changePrefix = "";
        if (change > 0) {
            changeClass = "change-up";
            changePrefix = "+";
        } else if (change < 0) {
            changeClass = "change-down";
        }

        // 가격 포맷 (소수점 자리 조정)
        const formatPrice = (num) => {
            if (num >= 1000) return num.toLocaleString("ko-KR", { maximumFractionDigits: 2 });
            if (num >= 1) return num.toFixed(3);
            return num.toFixed(4);
        };

        return `
            <tr class="crypto-row" data-symbol="${item.symbol}">
                <td>
                    <button class="star-btn ${favorite ? "active" : ""}"
                        onclick="toggleFavorite('${item.symbol}')">
                        ${favorite ? "★" : "☆"}
                    </button>
                </td>
                <td class="symbol">${item.symbol}</td>
                <td class="price">${formatPrice(price)}</td>
                <td class="${changeClass}">${changePrefix}${change.toFixed(2)}%</td>
                <td>${formatPrice(high)}</td>
                <td>${formatPrice(low)}</td>
            </tr>
        `;
    }).join("");
}

// ===== 6. 탭 전환 이벤트 =====
tabAll.addEventListener("click", function () {
    currentTab = "all";
    tabAll.classList.add("active");
    tabFavorites.classList.remove("active");
    renderTable();
});

tabFavorites.addEventListener("click", function () {
    currentTab = "favorites";
    tabFavorites.classList.add("active");
    tabAll.classList.remove("active");
    renderTable();
});

// ===== 7. 검색 이벤트 =====
searchInput.addEventListener("input", function () {
    searchQuery = searchInput.value.trim();
    renderTable();
});

// ===== 8. 최초 실행 + 1초마다 업데이트 =====
fetchData(); // 최초 실행

setInterval(fetchData, 1000); // 1초마다 API 요청
