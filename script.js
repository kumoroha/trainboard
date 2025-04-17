const departuresDiv = document.getElementById('departures');
const realtimeRadio = document.getElementById('realtime');
const specifiedTimeRadio = document.getElementById('specifiedTime');
const specifiedTimeInput = document.getElementById('specifiedTimeInput');
const applyTimeButton = document.getElementById('applyTime');
let allDepartures = [];
let displayedDepartures = [];
const maxDisplayCount = 4;
let noUpcomingTrainsMessageShown = false;
let displayMode = 'realtime';
let specified時刻 = null;

function displayDepartures(referenceTime) {
    departuresDiv.innerHTML = '';
    let nowMinutes;
    let nowForCalculation = new Date();

    if (displayMode === 'realtime') {
        nowMinutes = nowForCalculation.getHours() * 60 + nowForCalculation.getMinutes();
    } else if (displayMode === 'specifiedTime' && referenceTime) {
        const timeParts = referenceTime.split(':');
        nowMinutes = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]);
        nowForCalculation.setHours(parseInt(timeParts[0]));
        nowForCalculation.setMinutes(parseInt(timeParts[1]));
        nowForCalculation.setSeconds(0);
        nowForCalculation.setMilliseconds(0);
    } else {
        nowMinutes = nowForCalculation.getHours() * 60 + nowForCalculation.getMinutes();
    }

    const upcomingDepartures = allDepartures.filter(departure => {
        const departureTimeParts = departure.time.split(':');
        const departureMinutes = parseInt(departureTimeParts[0]) * 60 + parseInt(departureTimeParts[1]);
        return departureMinutes >= nowMinutes;
    }).sort((a, b) => {
        const timeA = a.time.replace(':', '');
        const timeB = b.time.replace(':', '');
        return parseInt(timeA) - parseInt(timeB);
    });

    displayedDepartures = upcomingDepartures.slice(0, maxDisplayCount);

    if (displayedDepartures.length === 0 && allDepartures.length > 0 && !noUpcomingTrainsMessageShown) {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = '指定された時間以降の電車はありません。';
        messageDiv.style.padding = '10px';
        messageDiv.style.textAlign = 'center';
        departuresDiv.appendChild(messageDiv);
        noUpcomingTrainsMessageShown = true;
    } else if (displayedDepartures.length === 0 && allDepartures.length === 0 && departuresDiv.textContent !== '発車情報の取得に失敗しました。') {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = '発車情報はありません。';
        messageDiv.style.padding = '10px';
        messageDiv.style.textAlign = 'center';
        departuresDiv.appendChild(messageDiv);
    } else {
        displayedDepartures.forEach(departure => {
            const item = document.createElement('div');
            item.classList.add('departure-item');

            const departureTimeParts = departure.time.split(':');
            const departureMinutes = parseInt(departureTimeParts[0]) * 60 + parseInt(departureTimeParts[1]);
            let remainingMinutes;
            let remainingTimeText = '';

            const departureDate = new Date(nowForCalculation);
            departureDate.setHours(parseInt(departureTimeParts[0]));
            departureDate.setMinutes(parseInt(departureTimeParts[1]));
            departureDate.setSeconds(0);
            departureDate.setMilliseconds(0);

            const diffMilliseconds = departureDate.getTime() - nowForCalculation.getTime();
            remainingMinutes = Math.ceil(diffMilliseconds / (1000 * 60));

            if (remainingMinutes > 0) {
                remainingTimeText = `あと ${remainingMinutes} 分`;
            } else if (remainingMinutes === 0) {
                remainingTimeText = 'まもなく発車';
            } else {
                remainingTimeText = '発車済';
            }

            const trainTypeClass = `train-type-${departure.trainName.replace(/\s+/g, '')}`;

            item.innerHTML = `
                <span class="time">${departure.time}</span>
                <span class="${trainTypeClass}">${departure.trainName}</span>
                <span class="platform">${departure.platform}番線</span>
                <span class="trainName" style="display:none;">${departure.trainName}</span>
                <span class="destination">${departure.destination}</span>
                <span class="remarks">${departure.remarks}</span>
                <span>${remainingTimeText}</span>
            `;
            departuresDiv.appendChild(item);
        });

        if (displayMode === 'realtime' && displayedDepartures.length > 0 && displayedDepartures[0].time) {
            const firstDepartureTimeParts = displayedDepartures[0].time.split(':');
            const firstDepartureMinutes = parseInt(firstDepartureTimeParts[0]) * 60 + parseInt(firstDepartureTimeParts[1]);
            const currentNow = new Date();
            const currentNowMinutes = currentNow.getHours() * 60 + currentNow.getMinutes();

            if (firstDepartureMinutes < currentNowMinutes) {
                const departedItem = departuresDiv.firstChild;
                if (departedItem) {
                    departedItem.classList.add('departed');
                    setTimeout(() => {
                        departuresDiv.removeChild(departedItem);
                        displayedDepartures.shift();
                        if (upcomingDepartures.length > displayedDepartures.length) {
                            const nextDeparture = upcomingDepartures[displayedDepartures.length];
                            const newItem = document.createElement('div');
                            newItem.classList.add('departure-item');
                            const nextDepartureTimeParts = nextDeparture.time.split(':');
                            const nextDepartureMinutes = parseInt(nextDepartureTimeParts[0]) * 60 + parseInt(nextDepartureTimeParts[1]);
                            let nextRemainingMinutes = nextDepartureMinutes - currentNowMinutes;
                            let nextRemainingTimeText = '';
                            if (nextRemainingMinutes > 0) {
                                nextRemainingTimeText = `あと ${nextRemainingMinutes} 分`;
                            } else if (nextRemainingMinutes === 0) {
                                nextRemainingTimeText = 'まもなく発車';
                            } else {
                                nextRemainingTimeText = '発車済';
                            }
                            const nextTrainTypeClass = `train-type-${nextDeparture.trainName.replace(/\s+/g, '')}`;
                            newItem.innerHTML = `
                                <span class="time">${nextDeparture.time}</span>
                                <span class="${nextTrainTypeClass}">${nextDeparture.trainName}</span>
                                <span class="platform">${nextDeparture.platform}番線</span>
                                <span class="trainName" style="display:none;">${nextDeparture.trainName}</span>
                                <span class="destination">${nextDeparture.destination}</span>
                                <span class="remarks">${nextDeparture.remarks}</span>
                                <span>${remainingTimeText}</span>
                            `;
                            departuresDiv.appendChild(newItem);
                            displayedDepartures.push(nextDeparture);
                        }
                    }, 500);
                }
            }
        }
    }

    function fetchDepartureData() {
        const apiUrl = 'https://kumoroha.github.io/trainboard/departures.json';

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("APIからのデータ:", data);
                allDepartures = data.map(item => ({
                    time: item.time,
                    destination: item.destination,
                    platform: item.platform,
                    trainName: item.trainName,
                    remarks: item.remarks || '',
                }));
                displayDepartures();
                setInterval(() => {
                    if (displayMode === 'realtime') {
                        displayDepartures();
                    } else if (displayMode === 'specifiedTime' && specified時刻) {
                        displayDepartures(specified時刻);
                    }
                }, 60000);
            })
            .catch(error => {
                console.error('APIからのデータ取得エラー:', error);
                departuresDiv.textContent = '発車情報の取得に失敗しました。';
            });
    }

    realtimeRadio.addEventListener('change', () => {
        displayMode = 'realtime';
        specifiedTimeInput.disabled = true;
        displayDepartures();
    });

    specifiedTimeRadio.addEventListener('change', () => {
        displayMode = 'specifiedTime';
        specifiedTimeInput.disabled = false;
    });

    applyTimeButton.addEventListener('click', () => {
        if (displayMode === 'specifiedTime' && specifiedTimeInput.value) {
            specified時刻 = specifiedTimeInput.value;
            displayDepartures(specified時刻);
        }
    });

    fetchDepartureData();
