let draggedSeat = null;
let offsetX = 0;
let offsetY = 0;

function handleDragStart(event) {
    draggedSeat = event.target; // Das aktuelle Sitzplatz-Element speichern
    const rect = draggedSeat.getBoundingClientRect();
    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;
    event.target.classList.add("dragging");
}

function handleDragOver(event) {
    event.preventDefault(); // Standardverhalten verhindern
}

function handleDrop(event) {
    event.preventDefault(); // Standardverhalten verhindern
}

function handleDragEnd(event) {
    if (!draggedSeat) return;

    const x = event.clientX - offsetX;
    const y = event.clientY - offsetY;

    const seatId = Number(draggedSeat.dataset.id);
    const seat = seats.find((s) => s.id === seatId);

    if (seat) {
        seat.position.x = x;
        seat.position.y = y;
    }

    draggedSeat.style.left = `${x}px`;
    draggedSeat.style.top = `${y}px`;
    draggedSeat.classList.remove("dragging");

    draggedSeat = null;
}
