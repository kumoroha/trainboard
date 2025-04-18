// JSONデータのURL
const apiURL = "./departures.json";

let intervalId = null; // リアルタイム更新用
let announcements = ["お知らせ1: ご利用ありがとうございます", "お知らせ2: 運行情報にご注意ください", "お知らせ3: 本日も良い旅を！"];
let announcementIndex = 0;

// 発車標データを取得して表示
async function loadDepartures(specifiedTime = null, allRows = false, searchQuery = "") {
  try {
    const response = await fetch(apiURL);
    if (!response.ok) {
      throw new Error(`HTTPエラー: ${response.status}`);
    }

    const trainData = await response.json();
    const departureList = document.getElementById("departure-list");
    departureList.innerHTML = ""; // 初期化

    const now = new Date();
    const currentTime = specifiedTime 
      ? specifiedTime 
      : `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const isTimeAfter = (trainTime, referenceTime) => {
      const [trainHour, trainMinute] = trainTime.split(":").map(Number);
      const [refHour, refMinute] = referenceTime.split(":").map(Number);
      if (trainHour > refHour) return true;
      if (trainHour === refHour && trainMinute >= refMinute) return true;
      return false;
    };

    let filteredTrains = trainData.filter(train => {
      const trainTime = train.time || "00:00";
      if (searchQuery) {
        return train.destination.includes(searchQuery) || 
               train.trainName.includes(searchQuery) ||
               trainTime.startsWith(searchQuery);
      }
      return isTimeAfter(trainTime, currentTime);
    });

    if (!allRows) {
      filteredTrains = filteredTrains.slice(0, 4);
    }

    filteredTrains.forEach(train => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${train.time || "null"}</td>
        <td>${train.destination || "null"}</td>
        <td>${train.trainName || "null"}</td>
        <td>${train.platform || "null"}</td>
        <td>${train.remarks || ""}</td>
      `;
      departureList.appendChild(row);
    });

    // お知らせを5行目に追加
    const announcementRow = document.createElement("tr");
    announcementRow.id = "announcement-row";
    announcementRow.innerHTML = `
      <td colspan="5" class="announcement-cell">
        <div class="scrolling-announcement">
          ${announcements[announcementIndex]}
        </div>
      </td>
    `;
    departureList.appendChild(announcementRow);

    if (filteredTrains.length === 0) {
      const noDataRow = document.createElement("tr");
      noDataRow.innerHTML = `
        <td colspan="5" style="text-align: center; color: red;">該当する列車はありません</td>
      `;
      departureList.appendChild(noDataRow);
    }
  } catch (error) {
    console.error("データの取得に失敗しました:", error);
    const departureList = document.getElementById("departure-list");
    departureList.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: red;">データの取得に失敗しました</td>
      </tr>
    `;
  }
}

// お知らせを更新
function updateAnnouncement() {
  announcementIndex = (announcementIndex + 1) % announcements.length;
  const scrollingAnnouncement = document.querySelector(".scrolling-announcement");
  if (scrollingAnnouncement) {
    scrollingAnnouncement.textContent = announcements[announcementIndex];
  }
}

// モード切り替え
function handleModeChange() {
  const realtimeRadio = document.getElementById("realtime-mode");
  const specifiedRadio = document.getElementById("specified-mode");
  const searchRadio = document.getElementById("search-mode");

  document.getElementById("time-input-container").classList.toggle("hidden", !specifiedRadio.checked);
  document.getElementById("search-input-container").classList.toggle("hidden", !searchRadio.checked);

  clearInterval(intervalId);

  if (realtimeRadio.checked) {
    loadDepartures();
    intervalId = setInterval(() => loadDepartures(), 60000); // 毎分更新
  } else if (specifiedRadio.checked) {
    const timeInput = document.getElementById("time-input");
    timeInput.addEventListener("change", () => loadDepartures(timeInput.value));
    loadDepartures(timeInput.value);
  } else if (searchRadio.checked) {
    // 検索モードでは全行を初期表示
    loadDepartures(null, true);
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    searchButton.addEventListener("click", () => loadDepartures(null, true, searchInput.value));
  }
}

// 初期処理
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("input[name='mode']").forEach(radio => {
    radio.addEventListener("change", handleModeChange);
  });

  handleModeChange();

  setInterval(updateAnnouncement, 5000); // 5秒ごとにお知らせを更新
});
