// JSONデータのURL
const apiURL = "./departures.json";

// 発車標データを取得して表示
async function loadDepartures() {
  try {
    const response = await fetch(apiURL);
    const trainData = await response.json();

    const departureList = document.getElementById("departure-list");
    departureList.innerHTML = ""; // 初期化

    // データを順番通りに表示
    trainData.forEach(train => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${train.time}</td>
        <td>${train.destination}</td>
        <td>${train.trainName}</td>
        <td>${train.platform}</td>
        <td>${train.remarks}</td>
      `;
      departureList.appendChild(row);
    });
  } catch (error) {
    console.error("データの取得に失敗しました:", error);
  }
}

// ページ読み込み時に発車標を表示
window.addEventListener("DOMContentLoaded", loadDepartures);
