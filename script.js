// JSONデータのURL
const apiURL = "./departures.json";

// 発車標データを取得して表示
async function loadDepartures(specifiedTime = null) {
  try {
    const response = await fetch(apiURL);
    if (!response.ok) {
      throw new Error(`HTTPエラー: ${response.status}`);
    }

    const trainData = await response.json();
    const departureList = document.getElementById("departure-list");
    departureList.innerHTML = ""; // 初期化

    // 現在時刻または指定時刻を基準に計算
    const now = new Date();
    const currentTime = specifiedTime 
      ? specifiedTime 
      : `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    console.log(`現在の基準時刻: ${currentTime}`);

    // 柔軟にフィルタリング処理を実装
    const upcomingTrains = trainData.filter(train => {
      const time = train.time || "00:00"; // デフォルト値
      return time >= currentTime;
    }).sort((a, b) => (a.time || "00:00").localeCompare(b.time || "00:00"));

    console.log("絞り込まれた列車データ:", upcomingTrains);

    // 今日の電車がない場合の処理
    if (upcomingTrains.length === 0) {
      const noTrainsRow = document.createElement("tr");
      noTrainsRow.innerHTML = `
        <td colspan="5" style="text-align: center; color: #ff0000;">本日の電車はもうありません</td>
      `;
      departureList.appendChild(noTrainsRow);
      return;
    }

    // データを順番通りに表示（柔軟にフィールドに対応）
    upcomingTrains.forEach(train => {
      const time = train.time || "時間未設定";
      const destination = train.destination || "行き先未設定";
      const trainName = train.trainName || "種別未設定";
      const platform = train.platform || "番線未設定";
      const remarks = train.remarks || "備考なし";

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${time}</td>
        <td>${destination}</td>
        <td class="train-type-${trainName === '快速' ? 'rapid' : trainName === '新快速' ? 'new-rapid' : ''}">
          ${trainName}
        </td>
        <td>${platform}</td>
        <td class="remarks">${remarks}</td>
      `;
      departureList.appendChild(row);
    });
  } catch (error) {
    console.error("データの取得に失敗しました:", error);
    const departureList = document.getElementById("departure-list");
    departureList.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: #ff0000;">
          データの取得に失敗しました: ${error.message}
        </td>
      </tr>
    `;
  }
}

// 時間を指定して表示する機能
function setSpecifiedTime() {
  const timeInput = document.getElementById("time-input").value;
  if (timeInput) {
    console.log(`指定された時刻: ${timeInput}`);
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
