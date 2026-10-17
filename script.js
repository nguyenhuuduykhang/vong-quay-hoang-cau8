"use strict";

// ================================================
// 1. KẾT NỐI VỚI HTML
// ================================================
const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");

const spinButton = document.getElementById("spinButton");
const statusText = document.getElementById("statusText");

const resultScreen = document.getElementById("resultScreen");
const resultCard = document.getElementById("resultCard");
const resultHeading = document.getElementById("resultHeading");
const resultPrize = document.getElementById("resultPrize");
const closeResultButton = document.getElementById("closeResult");

const celebrationCanvas = document.getElementById("celebrationCanvas");
const celebrationCtx = celebrationCanvas.getContext("2d");

const spinMusic = document.getElementById("spinMusic");
const prizeSound = document.getElementById("prizeSound");

// ================================================
// 2. CẤU HÌNH VÒNG QUAY
// ================================================
const TOTAL_SLICES = 12;
const TAU = Math.PI * 2;
const SLICE_ANGLE = TAU / TOTAL_SLICES;
const NO_PRIZE_NAME = "Khăn Giấy";

const prizes = [
    { name: "Bình giữ nhiệt YAMAHA", color: "#FFD45A", textColor: "#12385B" },
    { name: NO_PRIZE_NAME, color: "#70C9F2", textColor: "#12385B" },
    { name: "Túi vải YAMABLUE", color: "#F4F4F4", textColor: "#12385B" },
    { name: NO_PRIZE_NAME, color: "#70C9F2", textColor: "#12385B" },
    { name: "Áo thun trắng YAMAHA", color: "#FFD45A", textColor: "#12385B" },
    { name: "Túi Cói + Khăn giấy", color: "#174A7E", textColor: "#FFFFFF" },
    { name: "Áo thun đen YAMAHA ", color: "#F4F4F4", textColor: "#12385B" },
    { name: NO_PRIZE_NAME, color: "#70C9F2", textColor: "#12385B" },
    { name: "Túi Cói + Khăn giấy", color: "#174A7E", textColor: "#FFFFFF" },
    { name: NO_PRIZE_NAME, color: "#70C9F2", textColor: "#12385B" },
    { name: "Túi Cói + Khăn giấy", color: "#174A7E", textColor: "#FFFFFF" },
    { name: NO_PRIZE_NAME, color: "#70C9F2", textColor: "#12385B" }
];

let currentRotation = 0;
let isSpinning = false;
let resizeTimeout = null;

// ================================================
// 3. VẼ VÒNG QUAY
// ================================================
function setupCanvas() {
    const rect = canvas.getBoundingClientRect();
    const size = Math.floor(Math.min(rect.width, rect.height));

    if (size <= 0) return;

    const dpr = Math.max(1, window.devicePixelRatio || 1);

    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    drawWheel(size);

    canvas.style.transform = `rotate(${currentRotation}rad)`;
}

function drawWheel(size) {
    const center = size / 2;
    const radius = center - 5;

    ctx.clearRect(0, 0, size, size);

    prizes.forEach((prize, index) => {
        const startAngle = -Math.PI / 2 + index * SLICE_ANGLE;
        const endAngle = startAngle + SLICE_ANGLE;
        const middleAngle = startAngle + SLICE_ANGLE / 2;

        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, radius, startAngle, endAngle);
        ctx.closePath();

        ctx.fillStyle = prize.color;
        ctx.fill();

        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(center, center, radius - 1, startAngle, endAngle);
        ctx.strokeStyle = "rgba(255,212,90,.85)";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.save();

        ctx.translate(center, center);
        ctx.rotate(middleAngle);

        const fontSize = Math.max(10, Math.min(15, size * 0.031));

        ctx.font = `600 ${fontSize}px "Segoe UI", Arial, sans-serif`;
        ctx.fillStyle = prize.textColor;
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";

        drawWrappedText(
            prize.name,
            radius * 0.86,
            0,
            radius * 0.47,
            fontSize * 1.18,
            4
        );

        ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(center, center, radius * 0.105, 0, TAU);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#FFD45A";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center, center, radius * 0.055, 0, TAU);
    ctx.fillStyle = "#12385B";
    ctx.fill();
}

function drawWrappedText(text, x, y, maxWidth, lineHeight, maxLines) {
    const words = text.split(/\s+/);
    const lines = [];
    let line = "";

    for (const word of words) {
        const testLine = line ? `${line} ${word}` : word;

        if (line && ctx.measureText(testLine).width > maxWidth) {
            lines.push(line);
            line = word;
        } else {
            line = testLine;
        }
    }

    if (line) lines.push(line);

    const visibleLines = lines.slice(0, maxLines);
    const startY = y - ((visibleLines.length - 1) * lineHeight) / 2;

    visibleLines.forEach((lineText, index) => {
        ctx.fillText(
            lineText,
            x,
            startY + index * lineHeight,
            maxWidth
        );
    });
}

// ================================================
// 4. NHẠC VÒNG QUAY VÀ TIẾNG VỖ TAY
// ================================================
function startSpinMusic() {
    if (!spinMusic) return;

    spinMusic.pause();
    spinMusic.currentTime = 0;
    spinMusic.loop = true;
    spinMusic.volume = 0.7;

    spinMusic.play().catch(error => {
        console.warn("Không thể phát nhạc. Kiểm tra file MP3.", error);
    });
}

function stopSpinMusic() {
    if (!spinMusic) return;

    spinMusic.pause();
    spinMusic.currentTime = 0;
}

function playPrizeSound() {
    if (!prizeSound) return;

    prizeSound.pause();
    prizeSound.currentTime = 0;
    prizeSound.volume = 1;
    prizeSound.muted = false;

    prizeSound.play().catch(error => {
        console.warn("Không thể phát tiếng vỗ tay:", error);
    });
}

function stopPrizeSound() {
    if (!prizeSound) return;

    prizeSound.pause();
    prizeSound.currentTime = 0;
}

// ================================================
// 5. PHÁO HOA VÀ RUY BĂNG
// ================================================
let particles = [];
let celebrationAnimationId = null;
let celebrationEndTime = 0;

const celebrationColors = [
    "#FFD45A",
    "#FF5252",
    "#70C9F2",
    "#FFFFFF",
    "#FF80AB",
    "#7CE7AC",
    "#B388FF",
    "#FF9F43"
];

function setupCelebrationCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    celebrationCanvas.width = Math.round(window.innerWidth * dpr);
    celebrationCanvas.height = Math.round(window.innerHeight * dpr);

    celebrationCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function startCelebration() {
    stopCelebration();
    setupCelebrationCanvas();

    particles = [];
    celebrationEndTime = performance.now() + 4500;

    for (let i = 0; i < 100; i++) {
        particles.push({
            x: Math.random() * window.innerWidth,
            y: -Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 3,
            vy: 2 + Math.random() * 4,
            size: 4 + Math.random() * 7,
            rotation: Math.random() * TAU,
            rotationSpeed: (Math.random() - 0.5) * 0.12,
            color: celebrationColors[
                Math.floor(Math.random() * celebrationColors.length)
            ],
            life: 1
        });
    }

    animateCelebration();
}

function animateCelebration() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    celebrationCtx.clearRect(0, 0, width, height);

    particles = particles.filter(
        p => p.y < height + 30 && p.life > 0
    );

    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.life -= 0.004;

        celebrationCtx.save();
        celebrationCtx.globalAlpha = Math.max(0, p.life);
        celebrationCtx.translate(p.x, p.y);
        celebrationCtx.rotate(p.rotation);
        celebrationCtx.fillStyle = p.color;

        celebrationCtx.fillRect(
            -p.size / 2,
            -p.size,
            p.size,
            p.size * 2
        );

        celebrationCtx.restore();
    });

    if (
        performance.now() < celebrationEndTime ||
        particles.length > 0
    ) {
        celebrationAnimationId = requestAnimationFrame(animateCelebration);
    } else {
        celebrationAnimationId = null;
        celebrationCtx.clearRect(0, 0, width, height);
    }
}

function stopCelebration() {
    if (celebrationAnimationId !== null) {
        cancelAnimationFrame(celebrationAnimationId);
        celebrationAnimationId = null;
    }

    particles = [];

    celebrationCtx.clearRect(
        0,
        0,
        window.innerWidth,
        window.innerHeight
    );
}

// ================================================
// 6. CHỌN GIẢI THEO TỈ LỆ PHẦN TRĂM
// ================================================
function randomItem(indices) {
    return indices[Math.floor(Math.random() * indices.length)];
}

function choosePrize() {
    const random = Math.random() * 100;

    // Túi Cói + Khăn giấy: 30%
    if (random < 30) {
        return randomItem([5, 8, 10]);
    }

    // Túi vải YAMABLUE: 22%
    if (random < 52) {
        return 2;
    }

    // Áo thun đen YAMAHA: 9%
    if (random < 61) {
        return 6;
    }

    // Khăn Giấy: 21%
    if (random < 82) {
        return randomItem([1, 3, 7, 9, 11]);
    }

    // Áo thun trắng YAMAHA: 9%
    if (random < 91) {
        return 4;
    }

    // Bình giữ nhiệt YAMAHA: 9%
    return 0;
}

// ================================================
// 7. QUAY VÒNG - ĐỒNG BỘ ĐIỂM DỪNG VÀ GIẢI THƯỞNG
// ================================================
function normalizeAngle(angle) {
    return ((angle % TAU) + TAU) % TAU;
}

function spinWheel() {
    if (isSpinning) return;

    isSpinning = true;

    spinButton.disabled = true;
    spinButton.innerHTML = "<span>⏳</span><span>ĐANG QUAY...</span>";

    statusText.textContent = "Chúc bạn may mắn!";

    hideResult();
    stopCelebration();
    stopPrizeSound();

    // Chọn giải đúng một lần cho lượt quay hiện tại
    const winningIndex = choosePrize();

    // Góc chính giữa ô trúng thưởng lúc chưa xoay
    const targetAngle =
        -Math.PI / 2 + (winningIndex + 0.5) * SLICE_ANGLE;

    // Mũi tên cố định tại vị trí 12 giờ
    const pointerAngle = -Math.PI / 2;

    // Tính góc cần xoay để tâm ô trúng thưởng nằm dưới mũi tên
    const desiredRotation = normalizeAngle(
        pointerAngle - targetAngle
    );

    // Góc hiện tại của vòng quay
    const currentNormalized = normalizeAngle(currentRotation);

    // Góc xoay thêm để đến đúng ô được chọn
    const extraRotation = normalizeAngle(
        desiredRotation - currentNormalized
    );

    // Quay thêm từ 6 đến 9 vòng
    const fullSpins = 6 + Math.floor(Math.random() * 4);

    const startRotation = currentRotation;
    const totalRotation = fullSpins * TAU + extraRotation;
    const endRotation = startRotation + totalRotation;

    // Thời gian quay: 15 giây
    const duration = 15000;
    const startTime = performance.now();

    startSpinMusic();

    function animate(now) {
        const progress = Math.min(
            (now - startTime) / duration,
            1
        );

        // Hiệu ứng giảm tốc khi gần đến điểm dừng
        const easedProgress = 1 - Math.pow(1 - progress, 4);

        currentRotation =
            startRotation + totalRotation * easedProgress;

        canvas.style.transform = `rotate(${currentRotation}rad)`;

        if (progress < 1) {
            requestAnimationFrame(animate);
            return;
        }

        // Chốt góc cuối cùng để tránh sai số animation
        currentRotation = endRotation;

        canvas.style.transform = `rotate(${currentRotation}rad)`;

        // Trả đúng kết quả đã chọn cho lượt quay này
        finishSpin(winningIndex);
    }

    requestAnimationFrame(animate);
}

// ================================================
// 8. HIỂN THỊ KẾT QUẢ
// ================================================
function finishSpin(winningIndex) {
    const prize = prizes[winningIndex];
    const isNoPrize = prize.name.trim() === NO_PRIZE_NAME;

    stopSpinMusic();
    stopPrizeSound();

    isSpinning = false;

    spinButton.disabled = false;

    spinButton.innerHTML =
        '<span class="button-icon">🎁</span><span>QUAY LẠI</span>';

    if (isNoPrize) {
        resultCard.classList.add("no-prize");

        resultHeading.textContent = "";
        resultPrize.textContent = NO_PRIZE_NAME;
        statusText.textContent = NO_PRIZE_NAME;
    } else {
        resultCard.classList.remove("no-prize");

        resultHeading.textContent = "CHÚC MỪNG BẠN!";
        resultPrize.textContent = prize.name.trim();

        statusText.textContent = "Vòng quay đã hoàn tất!";

        playPrizeSound();
        startCelebration();
    }

    resultScreen.classList.add("show");
    resultScreen.setAttribute("aria-hidden", "false");
}

function hideResult() {
    resultScreen.classList.remove("show");
    resultScreen.setAttribute("aria-hidden", "true");
}

function closeResult() {
    if (isSpinning) return;

    stopPrizeSound();
    hideResult();

    spinButton.focus();
}

// ================================================
// 9. SỰ KIỆN VÀ KHỞI TẠO
// ================================================
spinButton.addEventListener("click", spinWheel);

closeResultButton.addEventListener("click", closeResult);

resultScreen.addEventListener("click", event => {
    if (event.target === resultScreen) {
        closeResult();
    }
});

document.addEventListener("keydown", event => {
    if (
        event.key === "Escape" &&
        resultScreen.classList.contains("show")
    ) {
        closeResult();
    }
});

window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);

    resizeTimeout = setTimeout(() => {
        setupCanvas();
        setupCelebrationCanvas();
    }, 100);
});

// Khởi tạo vòng quay
setupCanvas();
setupCelebrationCanvas();
