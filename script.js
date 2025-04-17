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

    // 現在時刻の取得または指定時刻を基準とする
    const now = new Date();
    const currentTime = specifiedTime 
      ? specifiedTime 
      : `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // リアルタイム・時間指定・検索モードのフィルタリング
    let filteredTrains = trainData.filter(train => {
      const trainTime = train.time || "00:00";
      // 検索クエリがある場合は、行き先・種別・時間でフィルタリング
      if (searchQuery) {
        return train.destination.includes(searchQuery) || 
               train.trainName.includes(searchQuery) ||
               trainTime.startsWith(searchQuery);
      }
      // リアルタイム・時間指定では、現在時刻または指定時刻以降を表示
      return trainTime >= currentTime;
    });

    // リアルタイム・時間指定モードでは最大4行のみ表示
    if (!allRows) {
      filteredTrains = filteredTrains.slice(0, 4);
    }

    // データをテーブルに追加
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

    // データがない場合のメッセージ
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

// お知らせを横スクロール
function startAnnouncementScroll() {
  const announcementText = document.getElementById("announcement-text");
  setInterval(() => {
    announcementIndex = (announcementIndex + 1) % announcements.length;
    announcementText.textContent = announcements[announcementIndex];
  }, 5000); // 5秒ごとに次のお知らせを表示
}

// モード切り替え
function handleModeChange() {
  const realtimeRadio = document.getElementById("realtime-mode");
  const specifiedRadio = document.getElementById("specified-mode");
  const searchRadio = document.getElementById("search-mode");

  // モードに応じて入力フィールドを表示/非表示
  document.getElementById("time-input-container").classList.toggle("hidden", !specifiedRadio.checked);
  document.getElementById("search-input-container").classList.toggle("hidden", !searchRadio.checked);

  // リアルタイム更新の停止
  clearInterval(intervalId);

  if (realtimeRadio.checked) {
    loadDepartures(); // 初期ロード
    intervalId = setInterval(() => loadDepartures(), 60000); // 毎分更新
  } else if (specifiedRadio.checked) {
    const timeInput = document.getElementById("time-input");
    timeInput.addEventListener("change", () => loadDepartures(timeInput.value));
  } else if (searchRadio.checked) {
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    searchButton.addEventListener("click", () => loadDepartures(null, true, searchInput.value));
    loadDepartures(null, true); // 検索モードでは初期表示ですべての行を表示
  }
}

// 初期処理
document.addEventListener("DOMContentLoaded", () => {
  // モード切り替えイベントの設定
  document.querySelectorAll("input[name='mode']").forEach(radio => {
    radio.addEventListener("change", handleModeChange);
  });

  // 初期モード設定
  handleModeChange();

  // お知らせのスクロールを開始
  startAnnouncementScroll();
});
