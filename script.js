// JSONデータのURL
const apiURL = "./departures.json";

// 電車データを取得して表示
async function loadDepartures(specifiedTime = null) {
  try {
    const response = await fetch(apiURL);
    const trainData = await response.json();

    const departureList = document.getElementById("departure-list");
    departureList.innerHTML = ""; // 初期化

    // 現在時刻または指定時刻を基準に計算
    const now = new Date();
    const currentTime = specifiedTime 
      ? specifiedTime 
      : `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // 時刻順にソートし、現在時刻以降の列車のみ表示
    const upcomingTrains = trainData
      .filter(train => train.time >= currentTime) // 現在時刻以降の列車をフィルタ
      .sort((a, b) => a.time.localeCompare(b.time)); // 時刻順にソート

    // 今日の電車がない場合の処理
    if (upcomingTrains.length === 0) {
      const noTrainsRow = document.createElement("tr");
      noTrainsRow.innerHTML = `
        <td colspan="5" style="text-align: center; color: #ff0000;">本日の電車はもうありません</td>
      `;
      departureList.appendChild(noTrainsRow);
      return;
    }

    // データを順番通りに表示
    upcomingTrains.forEach(train => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${train.time}</td>
        <td>${train.destination}</td>
        <td class="train-type-${train.trainName === '快速' ? 'rapid' : train.trainName === '新快速' ? 'new-rapid' : ''}">
          ${train.trainName}
        </td>
        <td>${train.platform}</td>
        <td class="remarks">${train.remarks}</td>
      `;
      departureList.appendChild(row);
    });
  } catch (error) {
    console.error("データの取得に失敗しました:", error);
  }
}

// 時間を指定して表示する機能
function setSpecifiedTime() {
  const timeInput = document.getElementById("time-input").value;
  if (timeInput) {
    loadDepartures(timeInput);
  }
}

// イベントリスナーを追加
document.addEventListener("DOMContentLoaded", () => {
  const timeButton = document.getElementById("time-button");
  timeButton.addEventListener("click", setSpecifiedTime);
  loadDepartures(); // 初期ロード（現在時刻）
});

// 一定間隔で発車標を更新（リアルタイム表示）
setInterval(() => loadDepartures(), 60000); // 毎分更新
