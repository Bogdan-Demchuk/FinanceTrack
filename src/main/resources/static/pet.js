const PET_API = "/api/pet";

const PET_STAGE_NAMES = ["Very small", "Small", "Medium", "Large", "Very large"];

// Pet width in pixels for each stage (index 0 = stage 1)
const PET_SIZES = [64, 88, 116, 148, 184];

// Drawings (SVG, viewBox 0 0 100 112). Clothes are clipped to the body.
const PET_CLOTHING_ART = {
    tshirt: {
        front: `<rect x="10" y="68" width="80" height="40" fill="#38bdf8"/>
                <rect x="10" y="76" width="80" height="4" fill="#fff" opacity="0.6"/>`
    },
    hoodie: {
        front: `<rect x="10" y="66" width="80" height="44" fill="#fb923c"/>
                <rect x="37" y="82" width="26" height="9" rx="4" fill="#ea580c"/>
                <path d="M38 66 Q50 78 62 66 Z" fill="#ea580c"/>
                <line x1="45" y1="72" x2="45" y2="79" stroke="#fff" stroke-width="2"/>
                <line x1="55" y1="72" x2="55" y2="79" stroke="#fff" stroke-width="2"/>`
    },
    suit: {
        front: `<rect x="10" y="66" width="80" height="44" fill="#1e293b"/>
                <path d="M42 66 L50 82 L58 66 Z" fill="#fff"/>
                <path d="M48 69 L52 69 L53 81 L50 85 L47 81 Z" fill="#ef4444"/>`
    },
    cape: {
        back: `<path d="M20 50 Q4 80 10 98 L90 98 Q96 80 80 50 Z" fill="#ef4444"/>`,
        front: `<circle cx="50" cy="67" r="3.5" fill="#fbbf24"/>`
    }
};

const PET_HAT_ART = {
    cap: `<path d="M27 36 Q27 12 52 12 Q73 12 73 36 Z" fill="#ef4444"/>
          <rect x="60" y="32" width="30" height="6" rx="3" fill="#b91c1c"/>`,
    party: `<path d="M36 36 L50 -6 L64 36 Z" fill="#f472b6"/>
            <path d="M42 22 L58 22" stroke="#fff" stroke-width="3"/>
            <circle cx="50" cy="-7" r="4" fill="#fbbf24"/>`,
    tophat: `<rect x="34" y="4" width="32" height="28" fill="#1e293b"/>
             <rect x="34" y="22" width="32" height="6" fill="#ef4444"/>
             <ellipse cx="50" cy="32" rx="26" ry="5" fill="#0f172a"/>`,
    crown: `<path d="M30 34 L30 14 L40 24 L50 8 L60 24 L70 14 L70 34 Z"
                  fill="#fbbf24" stroke="#d97706" stroke-width="2" stroke-linejoin="round"/>
            <circle cx="50" cy="26" r="3" fill="#ef4444"/>`
};

let petData = null;      // latest data from /api/pet
let petReady = false;    // drag + click handlers are attached once
let petDrag = null;      // info about the drag in progress


// ========================================
// LOAD / SAVE
// ========================================

// Called after the dashboard loads, so the pet follows every transaction change.
async function loadPet() {

    try {

        const response = await apiFetch(PET_API);

        if (!response.ok) {
            throw new Error("Failed to load pet");
        }

        showPet(await response.json());

    } catch (error) {
        console.error(error);
    }
}

async function equipPetItem(slot, id) {

    const body = {
        clothing: petData.clothing,
        hat: petData.hat
    };

    body[slot] = id;

    try {

        const response = await apiFetch(PET_API, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            showNotification(error.error || "Could not change the outfit.", "error");
            return;
        }

        showPet(await response.json());

    } catch (error) {
        console.error(error);
        showNotification("Server error. Please try again.", "error");
    }
}


// ========================================
// DRAWING
// ========================================

function showPet(data) {

    const isFirstTime = petData === null;

    petData = data;

    const root = $("pet");
    const body = $("petBody");
    const clothing = PET_CLOTHING_ART[petData.clothing] || {};

    body.style.width = `${PET_SIZES[petData.stage - 1]}px`;

    body.innerHTML = `
        <svg viewBox="0 -12 100 112" aria-hidden="true">
            <defs>
                <clipPath id="petClip"><ellipse cx="50" cy="58" rx="34" ry="32"/></clipPath>
            </defs>
            ${clothing.back || ""}
            <ellipse cx="38" cy="90" rx="10" ry="5" fill="#6d5fe0"/>
            <ellipse cx="62" cy="90" rx="10" ry="5" fill="#6d5fe0"/>
            <circle cx="24" cy="30" r="9" fill="#6d5fe0"/>
            <circle cx="76" cy="30" r="9" fill="#6d5fe0"/>
            <ellipse cx="50" cy="58" rx="34" ry="32" fill="#8b7cff"/>
            <g clip-path="url(#petClip)">${clothing.front || ""}</g>
            <circle cx="39" cy="50" r="7" fill="#fff"/>
            <circle cx="61" cy="50" r="7" fill="#fff"/>
            <circle cx="40" cy="51" r="3.5" fill="#1e1b4b"/>
            <circle cx="60" cy="51" r="3.5" fill="#1e1b4b"/>
            <circle cx="41.5" cy="49.5" r="1.2" fill="#fff"/>
            <circle cx="61.5" cy="49.5" r="1.2" fill="#fff"/>
            <circle cx="29" cy="61" r="4" fill="#f9a8d4" opacity="0.6"/>
            <circle cx="71" cy="61" r="4" fill="#f9a8d4" opacity="0.6"/>
            <path d="M43 62 Q50 69 57 62" stroke="#1e1b4b" stroke-width="2.5"
                  fill="none" stroke-linecap="round"/>
            ${PET_HAT_ART[petData.hat] || ""}
        </svg>`;

    renderPetPanel();

    if (isFirstTime) {
        root.hidden = false;
        setPetPosition(
            window.innerWidth - root.offsetWidth - 24,
            window.innerHeight - root.offsetHeight - 24
        );
    } else {
        // the size may have changed, keep it fully on screen
        setPetPosition(root.offsetLeft, root.offsetTop);
    }

    if (!petReady) {
        petReady = true;
        setupPetEvents();
    }
}

function renderPetPanel() {

    const slotHtml = (slot, title) => {

        const buttons = petData.items
            .filter(item => item.slot === slot)
            .map(item => {

                const locked = item.requiredStage > petData.stage;
                const active = petData[slot] === item.id;

                return `
                    <button type="button"
                            class="pet-item ${active ? "active" : ""} ${locked ? "locked" : ""}"
                            data-slot="${slot}" data-id="${item.id}"
                            data-stage="${item.requiredStage}"
                            ${locked ? 'aria-disabled="true"' : ""}>
                        ${locked ? '<i data-lucide="lock"></i>' : ""}
                        <span>${item.name}</span>
                        ${locked ? `<small>Stage ${item.requiredStage}</small>` : ""}
                    </button>`;
            }).join("");

        const noneActive = petData[slot] === null;

        return `
            <div class="pet-slot-title">${title}</div>
            <div class="pet-items">
                <button type="button" class="pet-item ${noneActive ? "active" : ""}"
                        data-slot="${slot}" data-id="">
                    <span>None</span>
                </button>
                ${buttons}
            </div>`;
    };

    $("petPanel").innerHTML = `
        <div class="pet-panel-head">
            <strong>Stage ${petData.stage} · ${PET_STAGE_NAMES[petData.stage - 1]}</strong>
            <span>Balance ${formatMoney(petData.balance)}</span>
        </div>
        ${slotHtml("clothing", "Clothing")}
        ${slotHtml("hat", "Hats")}`;

    icons();
}


// ========================================
// DRAGGING AND PANEL
// ========================================

function setPetPosition(x, y) {

    const root = $("pet");

    const maxX = window.innerWidth - root.offsetWidth;
    const maxY = window.innerHeight - root.offsetHeight;

    root.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
    root.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
}

function togglePetPanel() {

    const root = $("pet");
    const panel = $("petPanel");

    if (!panel.hidden) {
        panel.hidden = true;
        return;
    }

    panel.hidden = false;

    // open the panel on the side that has room
    const rect = root.getBoundingClientRect();

    panel.classList.toggle("below", rect.top < panel.offsetHeight + 12);
    panel.classList.toggle("to-right", rect.left + panel.offsetWidth <= window.innerWidth);
}

function setupPetEvents() {

    const root = $("pet");
    const body = $("petBody");

    body.addEventListener("pointerdown", (e) => {

        if (e.button !== 0) return;

        const rect = root.getBoundingClientRect();

        petDrag = {
            offsetX: e.clientX - rect.left,
            offsetY: e.clientY - rect.top,
            startX: e.clientX,
            startY: e.clientY,
            moved: false
        };

        body.setPointerCapture(e.pointerId);
    });

    body.addEventListener("pointermove", (e) => {

        if (!petDrag) return;

        const distance = Math.hypot(e.clientX - petDrag.startX, e.clientY - petDrag.startY);

        // small movements still count as a click
        if (!petDrag.moved && distance > 4) {
            petDrag.moved = true;
            root.classList.add("dragging");
            $("petPanel").hidden = true;
        }

        if (petDrag.moved) {
            setPetPosition(e.clientX - petDrag.offsetX, e.clientY - petDrag.offsetY);
        }
    });

    body.addEventListener("pointerup", () => {

        if (petDrag && !petDrag.moved) {
            togglePetPanel();
        }

        petDrag = null;
        root.classList.remove("dragging");
    });

    body.addEventListener("pointercancel", () => {
        petDrag = null;
        root.classList.remove("dragging");
    });

    $("petPanel").addEventListener("click", (e) => {

        const btn = e.target.closest(".pet-item");
        if (!btn) return;

        if (btn.classList.contains("locked")) {
            const stage = Number(btn.dataset.stage);
            showNotification(
                `Unlocks at stage ${stage} (${PET_STAGE_NAMES[stage - 1]}). Grow your balance!`,
                "info"
            );
            return;
        }

        equipPetItem(btn.dataset.slot, btn.dataset.id || null);
    });

    // click anywhere else closes the panel
    document.addEventListener("click", (e) => {
        if (!root.contains(e.target)) {
            $("petPanel").hidden = true;
        }
    });

    window.addEventListener("resize", () => {
        setPetPosition(root.offsetLeft, root.offsetTop);
    });
}