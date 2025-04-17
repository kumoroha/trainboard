// JSONデータのURL
const apiURL = "./departures.json";

// 発車標データをリアルタイムで更新
async function loadDepartures() {
  try {
    const response = await fetch(apiURL);
    const trainData = await response.json();

    const departureList = document.getElementById("departure-list");
    departureList.innerHTML = ""; // 初期化

    // 現在時刻を取得
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // 時刻順にソートして、現在時刻以降の列車のみ表示
    const upcomingTrains = trainData
      .filter(train => train.time >= currentTime) // 現在時刻以降の列車をフィルタ
      .sort((a, b) => a.time.localeCompare(b.time)); // 時刻順にソート

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

// 一定間隔で発車標を更新
setInterval(loadDepartures, 60000); // 毎分更新
window.addEventListener("DOMContentLoaded", loadDepartures);
