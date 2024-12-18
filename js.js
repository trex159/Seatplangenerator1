const seatContainer = document.getElementById("seat-container");
const loadingScreen = document.getElementById("loading-screen");
const loadingStatus = document.getElementById("loading-status");
const optimizeButton = document.getElementById("optimize-btn");
const showBestButton = document.getElementById("show-best-btn");
const clearStorageButton = document.getElementById("clear-storage-btn");

const seats = Array.from({ length: 32 }, (_, i) => ({
    id: i + 1,
    student: null,
    position: { x: 0, y: 0 },
}));

const students = [
    { id: 1, name: "Steve", shouldSitWith: [], shouldNotSitWith: [20, 23, 19] },
    { id: 2, name: "Carl", shouldSitWith: [], shouldNotSitWith: [7, 14] },
    { id: 3, name: "Santa Claus", shouldSitWith: [5, 10, 18], shouldNotSitWith: [] },
    { id: 4, name: "Rudolph", shouldSitWith: [], shouldNotSitWith: [1, 8, 15, 17, 23, 5] },
    { id: 5, name: "Stephan", shouldSitWith: [3, 10, 18], shouldNotSitWith: [] },
    { id: 6, name: "Luisa", shouldSitWith: [], shouldNotSitWith: [19, 16] },
    { id: 7, name: "Kunigunde", shouldSitWith: [], shouldNotSitWith: [23, 20, 19, 17, 12, 16, 2] },
    { id: 8, name: "Waltraut", shouldSitWith: [], shouldNotSitWith: [17, 15, 4, 9] },
    { id: 9, name: "Johannes", shouldSitWith: [23], shouldNotSitWith: [] },
    { id: 10, name: "Werner", shouldSitWith: [3, 5, 18], shouldNotSitWith: [] },
    { id: 11, name: "Shaun", shouldSitWith: [], shouldNotSitWith: [] },
    { id: 12, name: "Elias", shouldSitWith: [], shouldNotSitWith: [7, 2, 17] },
    { id: 13, name: "Titus", shouldSitWith: [], shouldNotSitWith: [23, 7, 14, 22] },
    { id: 14, name: "Cäsar", shouldSitWith: [], shouldNotSitWith: [21, 15] },
    { id: 15, name: "Max", shouldSitWith: [], shouldNotSitWith: [17, 4, 23, 7, 11, 1, 14, 16, 2, 18] },
    { id: 16, name: "Igooor", shouldSitWith: [], shouldNotSitWith: [19, 6] },
    { id: 17, name: "Elina", shouldSitWith: [], shouldNotSitWith: [4, 8, 15, 1, 23] },
    { id: 18, name: "Sina", shouldSitWith: [10, 5, 3], shouldNotSitWith: [] },
    { id: 19, name: "Boris", shouldSitWith: [], shouldNotSitWith: [24, 8, 10] },
    { id: 20, name: "Dominik", shouldSitWith: [], shouldNotSitWith: [19, 16, 6, 7] },
    { id: 21, name: "Freddy", shouldSitWith: [22], shouldNotSitWith: [] },
    { id: 22, name: "Kevin", shouldSitWith: [21], shouldNotSitWith: [13, 17, 19] },
    { id: 23, name: "Daniel", shouldSitWith: [9], shouldNotSitWith: [19, 15, 7, 4, 17, 13] },
    { id: 24, name: "Eliah", shouldSitWith: [], shouldNotSitWith: [20, 8] },
    { id: 25, name: "LEER", shouldSitWith: [], shouldNotSitWith: [] },
    { id: 26, name: "LEER", shouldSitWith: [], shouldNotSitWith: [] },
    { id: 27, name: "LEER", shouldSitWith: [], shouldNotSitWith: [] },
    { id: 28, name: "LEER", shouldSitWith: [], shouldNotSitWith: [] },
    { id: 29, name: "LEER", shouldSitWith: [], shouldNotSitWith: [] },
    { id: 30, name: "LEER", shouldSitWith: [], shouldNotSitWith: [] },
    { id: 31, name: "LEER", shouldSitWith: [], shouldNotSitWith: [] },
    { id: 32, name: "LEER", shouldSitWith: [], shouldNotSitWith: [] },
    // Leerer Schüler
    { id: "empty", name: "LEER", shouldSitWith: [], shouldNotSitWith: [] },
];

const MAX_ATTEMPTS = 5000;

function renderSeats() {
    seatContainer.innerHTML = "";
    seats.forEach((seat) => {
        const seatEl = document.createElement("div");
        seatEl.classList.add("seat");
        seatEl.setAttribute("draggable", true);
        seatEl.dataset.id = seat.id;

        seatEl.textContent = seat.student ? seat.student.name : "LEER";

        seatEl.style.left = `${seat.position.x}px`;
        seatEl.style.top = `${seat.position.y}px`;

        seatEl.addEventListener("dragstart", handleDragStart);
        seatEl.addEventListener("dragover", handleDragOver);
        seatEl.addEventListener("drop", handleDrop);
        seatEl.addEventListener("dragend", handleDragEnd);

        seatContainer.appendChild(seatEl);
    });
}

function initializeSeats() {
    const shuffledStudents = [...students].sort(() => Math.random() - 0.5);

    seats.forEach((seat, index) => {
        const row = Math.floor(index / 8);
        const column = index % 8;
        const x = column < 4 ? column * 100 : column * 100 + 130;
        const y = row * 100;
        seat.position = { x, y };
        seat.student = shuffledStudents[index] || students.find((s) => s.id === "empty");
    });
}

function saveBestPlan(seats, score) {
    const currentBest = JSON.parse(localStorage.getItem("bestPlan")) || { score: Infinity };

    if (score < currentBest.score) {
        const savedSeats = seats.map((seat) => ({
            id: seat.id,
            student: seat.student,
            position: seat.position,
        }));
        localStorage.setItem("bestPlan", JSON.stringify({ savedSeats, score }));
    }
}

function loadBestPlan() {
    const bestPlan = JSON.parse(localStorage.getItem("bestPlan"));
    if (bestPlan) {
        bestPlan.savedSeats.forEach((savedSeat, index) => {
            seats[index].student = savedSeat.student;
            seats[index].position = savedSeat.position;
        });
        renderSeats();
    } else {
        alert("Kein bester Versuch im Local Storage gefunden!");
    }
}

function clearLocalStorage() {
    localStorage.removeItem("bestPlan");
    alert("Local Storage wurde gelöscht!");
}

function getNearestSeats(currentSeat) {
    return seats
        .filter((seat) => seat !== currentSeat)
        .map((seat) => ({
            seat,
            distance: Math.hypot(
                seat.position.x - currentSeat.position.x,
                seat.position.y - currentSeat.position.y
            ),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 9) /* 9 nähesten Schüler kontrollieren */
        .map((entry) => entry.seat);
}

function evaluateSeating() {
    let score = 0;
    seats.forEach((seat) => {
        if (!seat.student) return;

        const nearestSeats = getNearestSeats(seat);
        nearestSeats.forEach((neighbor) => {
            const distance = Math.hypot(
                neighbor.position.x - seat.position.x,
                neighbor.position.y - seat.position.y
            );

            if (seat.student.shouldNotSitWith.includes(neighbor.student.id)) {
                score += distance;
            }
            if (seat.student.shouldSitWith.includes(neighbor.student.id)) {
                score -= distance;
            }
        });
    });
    return score;
}

async function optimizeSeatingPlan() {
    loadingScreen.hidden = false;
    let bestScore = Infinity;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        loadingStatus.textContent = `Versuch ${attempt}/${MAX_ATTEMPTS}: Wertung wird berechnet...`;

        initializeSeats();
        const score = evaluateSeating();

        loadingStatus.textContent = `Versuch ${attempt}/${MAX_ATTEMPTS}: Wertung ${score}`;
        await new Promise((resolve) => setTimeout(resolve, 50));

        if (score < bestScore) {
            bestScore = score;
            saveBestPlan(seats, bestScore);
        }
    }

    loadBestPlan();
    loadingScreen.hidden = true;
}

optimizeButton.addEventListener("click", optimizeSeatingPlan);
showBestButton.addEventListener("click", loadBestPlan);
clearStorageButton.addEventListener("click", clearLocalStorage);

initializeSeats();
renderSeats();
