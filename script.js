document.addEventListener("DOMContentLoaded", function () {
    // 1. Ambil Elemen DOM
    const timeDisplay = document.getElementById("timeDisplay");
    const btnStartPause = document.getElementById("btnStartPause");
    const btnLap = document.getElementById("btnLap");
    const btnReset = document.getElementById("btnReset");
    const lapList = document.getElementById("lapList");
    const statsSummary = document.getElementById("statsSummary");
    const fastestLapDisplay = document.getElementById("fastestLap");
    const slowestLapDisplay = document.getElementById("slowestLap");

    // Variable Status Stopwatch
    let timerInterval = null;
    let startTime = 0;
    let elapsedTime = 0;
    let lastLapTime = 0;
    let isRunning = false;
    let laps = [];

    // Helper: Pad angka agar berformat 00
    function padZero(num, length = 2) {
        return String(num).padStart(length, "0");
    }

    // Format Milidetik ke Teks Jam (HH:MM:SS.MS)
    function formatTime(ms) {
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const milliseconds = Math.floor((ms % 1000) / 10);

        const mainTime = `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
        const msTime = `.${padZero(milliseconds)}`;

        return { mainTime, msTime, fullText: `${mainTime}${msTime}` };
    }

    // Update Tampilan Utama Stopwatch
    function updateDisplay() {
        const timeObj = formatTime(elapsedTime);
        timeDisplay.innerHTML = `${timeObj.mainTime}<span class="milliseconds">${timeObj.msTime}</span>`;
    }

    // Start / Pause Toggle
    function toggleStartPause() {
        if (!isRunning) {
            // Mulai Timer
            isRunning = true;
            startTime = Date.now() - elapsedTime;
            timerInterval = setInterval(() => {
                elapsedTime = Date.now() - startTime;
                updateDisplay();
            }, 10);

            btnStartPause.textContent = "Jeda";
            btnStartPause.className = "btn btn-pause";
            btnLap.disabled = false;
            btnReset.disabled = false;
        } else {
            // Jeda Timer
            isRunning = false;
            clearInterval(timerInterval);

            btnStartPause.textContent = "Lanjut";
            btnStartPause.className = "btn btn-start";
            btnLap.disabled = true;
        }
    }

    // Catat Putaran (Lap)
    function recordLap() {
        if (!isRunning) return;

        const currentTotal = elapsedTime;
        const lapDuration = currentTotal - lastLapTime;
        lastLapTime = currentTotal;

        laps.unshift({
            lapNumber: laps.length + 1,
            lapDuration: lapDuration,
            totalTime: currentTotal
        });

        renderLaps();
    }

    // Renderting Tabel Lap dan Highlight Tercepat/Terlambat
    function renderLaps() {
        if (laps.length === 0) {
            lapList.innerHTML = `<tr class="empty-row"><td colspan="3">Belum ada catatan putaran.</td></tr>`;
            statsSummary.style.display = "none";
            return;
        }

        statsSummary.style.display = "flex";

        // Cari ID lap tercepat dan terlambat (jika lap > 1)
        let minDur = Infinity;
        let maxDur = -1;

        if (laps.length > 1) {
            laps.forEach(l => {
                if (l.lapDuration < minDur) minDur = l.lapDuration;
                if (l.lapDuration > maxDur) maxDur = l.lapDuration;
            });
        }

        // Tampilkan statistik
        const fastestObj = laps.find(l => l.lapDuration === minDur);
        const slowestObj = laps.find(l => l.lapDuration === maxDur);

        fastestLapDisplay.textContent = fastestObj ? `#${fastestObj.lapNumber} (${formatTime(fastestObj.lapDuration).fullText})` : "-";
        slowestLapDisplay.textContent = slowestObj ? `#${slowestObj.lapNumber} (${formatTime(slowestObj.lapDuration).fullText})` : "-";

        // Render baris tabel
        lapList.innerHTML = laps.map(lap => {
            let rowClass = "";
            if (laps.length > 1) {
                if (lap.lapDuration === minDur) rowClass = "highlight-fastest";
                else if (lap.lapDuration === maxDur) rowClass = "highlight-slowest";
            }

            return `
                <tr class="${rowClass}">
                    <td>Putaran ${lap.lapNumber}</td>
                    <td>${formatTime(lap.lapDuration).fullText}</td>
                    <td>${formatTime(lap.totalTime).fullText}</td>
                </tr>
            `;
        }).join("");
    }

    // Reset Stopwatch
    function resetStopwatch() {
        isRunning = false;
        clearInterval(timerInterval);
        elapsedTime = 0;
        lastLapTime = 0;
        laps = [];

        btnStartPause.textContent = "Mulai";
        btnStartPause.className = "btn btn-start";
        btnLap.disabled = true;
        btnReset.disabled = true;

        updateDisplay();
        renderLaps();
    }

    // Event Listener Tombol
    btnStartPause.addEventListener("click", toggleStartPause);
    btnLap.addEventListener("click", recordLap);
    btnReset.addEventListener("click", resetStopwatch);

    // Inisialisasi tampilan
    updateDisplay();
});
