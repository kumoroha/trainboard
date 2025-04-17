// JSONデータのURL
const apiURL = "./departures.json";

let intervalId = null; // 毎分更新のためのInterval ID

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
      if (!time || time.trim() === "") return null; // 空欄ならnullを返す
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

    // データを順番通りに表示
    upcomingTrains.forEach(train => {
      const time = normalizeTime(train.time);
      const destination = train.destination !== undefined ? train.destination : "行き先未設定";
      const trainName = train.trainName !== undefined ? train.trainName : "種別未設定";
      const platform = train.platform !== undefined ? train.platform : "番線未設定";
      const remarks = train.remarks !== undefined ? train.remarks : ""; // 備考は空欄のまま

      console.log(`表示中: 時刻=${time}, 行き先=${destination}, 種別=${trainName}, 番線=${platform}, 備考=${remarks}`);

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${time !== null ? time : "null"}</td>
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
  console.log(`指定された時刻: ${timeInput}`);
  if (timeInput) {
    loadDepartures(timeInput);
  }
}

// ラジオボタンの切り替えでリアルタイム・時間指定を制御
function handleModeChange() {
  const realtimeRadio = document.getElementById("realtime-mode");
  const specifiedRadio = document.getElementById("specified-mode");

  if (realtimeRadio.checked) {
    console.log("リアルタイムモードを有効化します...");
    // リアルタイム更新を開始
    loadDepartures(); // 初回ロード
    intervalId = setInterval(() => {
      loadDepartures();
    }, 60000); // 毎分更新
    document.getElementById("time-input-container").style.display = "none"; // 時間指定入力を非表示
  } else if (specifiedRadio.checked) {
    console.log("時間指定モードを有効化します...");
    // リアルタイム更新を停止
    clearInterval(intervalId);
    intervalId = null;
    document.getElementById("time-input-container").style.display = "block"; // 時間指定入力を表示
  }
}

// イベントリスナーを追加
document.addEventListener("DOMContentLoaded", () => {
  const timeButton = document.getElementById("time-button");
  const modeRadios = document.querySelectorAll("input[name='mode']");
  timeButton.addEventListener("click", setSpecifiedTime);
  modeRadios.forEach(radio => radio.addEventListener("change", handleModeChange));

  // 初期状態をリアルタイムモードに設定
  document.getElementById("realtime-mode").checked = true;
  handleModeChange();
});
