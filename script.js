// ຕົວແປ words ມາຈາກໄຟລ words.js
// ກົດຂອງເກມ

const views = {
  menu: document.getElementById("menu-view"),
  study: document.getElementById("study-view"),
  game: document.getElementById("game-view"),
  result: document.getElementById("result-view"),
  gameover: document.getElementById("gameover-view"),
};

const categoryList = document.getElementById("category-list");
const categoryTitle = document.getElementById("category-title");
const scoreText = document.getElementById("score");
const finalScoreText = document.getElementById("final-score");
const wordList = document.getElementById("word-list");
const board = document.getElementById("board");
const statusText = document.getElementById("status");
const restartButton = document.getElementById("restart");
const categoryPools = new Map();

const MAX_PAIRS = 4; // ຈຳນວນຄູສູງສຸດຕໍ່ເກມ
const START_SCORE = 100; // คะแนนเริ่มต้น
let WRONG_PENALTY = 0; // จะคำนวณใหม่ทุกครั้งที่เริ่มเกม ขึ้นกับจำนวนคู่

// ตัวแปรของเกมจับคู่
let currentCategory = null;
let selectedCard = null;
let matchedPairs = 0;
let totalPairs = 0;
let locked = false;
let wrongTimer = null;
let score = START_SCORE;
let overallMatched = 0;
let totalWords = 0;
let sessionQueue = [];

// ສະແດງຫນ້າທີ່ຕ້ອງການ
function showView(name) {
  Object.entries(views).forEach(([key, element]) => {
    element.hidden = key !== name;
  });
}

// ສະຫລັບລຳດັບຄຳສັບໃນແຕ່ລະຫມວດຫມູ້
function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ປຸ່ມຂອງແຕ່ລະຫມວດ
function renderMenu() {
  categoryList.innerHTML = "";
  categories.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "category-button";
    button.textContent = `${category.name} (${category.words.length})`;
    button.addEventListener("click", () => openCategory(category));
    categoryList.appendChild(button);
  });
}

//ສະແດງຄຳສັບໃນແຕ່ລະຫມວດທີ່ເລືອກ
function openCategory(category) {
  currentCategory = category;
  categoryTitle.textContent = category.name;
  wordList.innerHTML = "";

  category.words.forEach((word) => {
    const item = document.createElement("li");

    const korean = document.createElement("span");
    korean.className = "word-korean";
    korean.textContent = word.korean;

    const meaning = document.createElement("span");
    meaning.className = "word-meaning";
    meaning.textContent = word.meaning;

    item.append(korean, meaning);
    wordList.appendChild(item);
  });
  showView("study");
}

// side คือ "korean" (คอลัมน์ซ้าย) หรือ "meaning" (คอลัมน์ขวา)
// pairId คือเลขคู่ — การ์ดสองใบที่เป็นคู่กันจะมี pairId เหมือนกัน
function createCard(text, pairId, side) {
  const card = document.createElement("button");
  card.className = "card";
  card.type = "button";
  card.dataset.pair = pairId;
  card.dataset.side = side;
  card.textContent = text;
  return card;
}

function loadNextBatch() {
    board.innerHTML = "";
    matchedPairs = 0;

    const chosen = sessionQueue.splice(0, Math.min(MAX_PAIRS, sessionQueue.length));
    totalPairs = chosen.length;
    WRONG_PENALTY = Math.round(START_SCORE / totalWords);

    const koreanCards = shuffle(chosen.map((w, i) => createCard(w.korean, i, "korean")));
    const meaningCards = shuffle(chosen.map((w, i) => createCard(w.meaning, i, "meaning")));

    for (let i = 0; i < totalPairs; i++) {
      board.appendChild(koreanCards[i]);
      board.appendChild(meaningCards[i]);
    }
  }

//  ອັປເດດຂໍ້ຄວາມສະຖານະ
function updateStatus() {
  if (overallMatched === totalWords) {
    statusText.textContent = "ເກັ່ງຫຼາຍ! ຈັບຄູ່ຄົບແລ້ວ";
    finalScoreText.textContent = `ຄະແນນ: ${score}/${START_SCORE}`;
    showView("result");
  } else if (matchedPairs === totalPairs) {
    loadNextBatch();
    statusText.textContent = `ຈັບຄູ່ແລ້ວ ${overallMatched}/${totalPairs}`;
  } else {
    statusText.textContent = `ຈັບຄູ່ແລ້ວ ${overallMatched}/${totalWords}`;
  }
  scoreText.textContent = `ຄະແນນ: ${score}/${START_SCORE}`;
}

// เริ่มเกม: คอลัมน์ซ้าย = คำเกาหลี, คอลัมน์ขวา = ความหมาย
function startGame() {
  clearTimeout(wrongTimer);
  board.innerHTML = "";
  selectedCard = null;
  locked = false;
  overallMatched = 0;
  score = START_SCORE;

  sessionQueue = shuffle(currentCategory.words);
  totalWords = sessionQueue.length;

  loadNextBatch();
  updateStatus();
}

// จัดการตอนกดการ์ด
function handleCardClick(card) {
  // กดใบเดิมซ้ำ = ยกเลิกการเลือก
  if (card === selectedCard) {
    card.classList.remove("selected");
    selectedCard = null;
    return;
  }

  // ยังไม่ได้เลือกใบไหน = เลือกใบนี้ไว้
  if (!selectedCard) {
     card.classList.add("selected");
    selectedCard = card;
    return;
  }
  
  // กดฝั่งเดียวกับที่เลือกไว้ = เปลี่ยนไปเลือกใบใหม่
  if (card.dataset.side === selectedCard.dataset.side) {
    selectedCard.classList.remove("selected");
    card.classList.add("selected");
    selectedCard = card;
    return;
  }
  // กดคนละฝั่ง = ตรวจว่าเป็นคู่กันไหม
  if (card.dataset.pair === selectedCard.dataset.pair) {
    [card, selectedCard].forEach((c) => {
      c.classList.remove("selected");
      c.classList.add("matched");
      c.disabled = true;
    });
    selectedCard = null;
    matchedPairs++;
    overallMatched++;
    updateStatus();
  } else {
    const first = selectedCard;
    locked = true;
    first.classList.add("wrong");
    card.classList.add("wrong");
    wrongTimer = setTimeout(() => {
      first.classList.remove("wrong", "selected");
      card.classList.remove("wrong");
      selectedCard = null;
      locked = false;
      score = Math.max(0, score - WRONG_PENALTY);
      updateStatus();
      if (score === 0 && matchedPairs < totalPairs) {
        showView("gameover");
      }
    }, 600);
  }
}

// ฟังการกดที่กระดาน (ตัวเดียวดูแลการ์ดทุกใบ)
board.addEventListener("click", (event) => {
  const card = event.target.closest(".card");
  if (!card || locked || card.disabled) return;
  handleCardClick(card);
});

// เก็บคำที่ยังไม่ได้ใช้ของแต่ละหมวด
function getRoundWords(category) {
  const need = Math.min(MAX_PAIRS, category.words.length);
  let pool = categoryPools.get(category) || [];

  // ถ้าคำในถุงเหลือไม่พอ เติมคำชุดใหม่ (สุ่มลำดับใหม่) เข้าไป
  while (pool.length < need) {
    pool = pool.concat(shuffle(category.words));
  }

  const chosen = pool.slice(0, need);
  categoryPools.set(category, pool.slice(need)); // เก็บส่วนที่เหลือไว้ใช้รอบถัดไป
  return chosen;
}
// ປຸ່ມຕ່າງໆ
document.getElementById("back-to-menu").addEventListener("click", () => showView("menu"));
document.getElementById("back-to-study").addEventListener("click", () => showView("study"));
document.getElementById("start-game").addEventListener("click", () => {
    startGame();
  showView("game");
});
document.getElementById("back-to-form-result").addEventListener("click", () => showView("menu"));
document.getElementById("restart").addEventListener("click", startGame);
document.getElementById("play-again").addEventListener("click", () => {
  startGame();
  showView("game");
});
document.getElementById("back-to-menu-from-gameover").addEventListener("click", () => showView("menu"));
document.getElementById("try-again").addEventListener("click", () => {
  startGame();
  showView("game");
});

renderMenu();
showView("menu");