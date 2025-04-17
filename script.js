// JSONデータのURL
const apiURL = "./departures.json";

// 発車標データを取得して表示
async function loadDepartures(specifiedTime = null) {
  try {
    console.log("データ取得を開始します...");
    const response = await fetch(apiURL);
    if (!response.ok) {
      throw new Error(`HTTPエラー: ${response.status}`);
    }

    const trainData = await response.json();
    console.log("取得した列車データ:", trainData);

    const departureList = document.getElementById("departure-list");
    departureList.innerHTML = ""; // 初期化

    // 現在時刻または指定時刻を基準に計算
    const now = new Date();
    const currentTime = specifiedTime 
      ? specifiedTime 
      : `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    console.log(`基準時刻: ${currentTime}`);

    // 時刻フォーマットを標準化する関数
    const normalizeTime = (time) => {
      if (!time) return null; // 欠損時はnullを返す
      const [hour, minute] = time.split(":").map(num => parseInt(num, 10));
      return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    };

    // データのフィルタリング
    const upcomingTrains = trainData.filter(train => {
      const trainTime = normalizeTime(train.time); // 時刻を標準化
      console.log(`時刻フィルタリング中: trainTime=${trainTime} >= currentTime=${currentTime}`);
      return trainTime && trainTime >= currentTime;
    }).sort((a, b) => {
      const timeA = normalizeTime(a.time);
      const timeB = normalizeTime(b.time);
      return (timeA || "").localeCompare(timeB || "");
    });

    console.log("フィルタリング後の列車データ:", upcomingTrains);

    // 今日の電車がない場合の処理
    if (upcomingTrains.length === 0) {
      console.warn("本日の電車はもうありません");
      const noTrainsRow = document.createElement("tr");
      noTrainsRow.innerHTML = `
        <td colspan="5" style="text-align: center; color: #ff0000;">本日の電車はもうありません</td>
      `;
      departureList.appendChild(noTrainsRow);
      return;
    }

    // データを順番通りに表示（null対応）
    upcomingTrains.forEach(train => {
      const time = normalizeTime(train.time);
      const destination = train.destination !== undefined ? train.destination : null;
      const trainName = train.trainName !== undefined ? train.trainName : null;
      const platform = train.platform !== undefined ? train.platform : null;
      const remarks = train.remarks !== undefined && train.remarks !== "" ? train.remarks : null; // 備考が空の場合もnull

      console.log(`表示中: 時刻=${time}, 行き先=${destination}, 種別=${trainName}, 番線=${platform}, 備考=${remarks}`);

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${time !== null ? time : "null"}</td>
        <td>${destination !== null ? destination : "null"}</td>
        <td class="train-type-${trainName === '快速' ? 'rapid' : trainName === '新快速' ? 'new-rapid' : ''}">
          ${trainName !== null ? trainName : "null"}
        </td>
        <td>${platform !== null ? platform : "null"}</td>
        <td class="remarks">${remarks !== null ? remarks : "null"}</td>
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
  console.log(`指定された時刻: ${timeInput}`);
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
setInterval(() => {
  console.log("リアルタイムで発車標を更新します...");
  loadDepartures();
}, 60000); // 毎分更新
