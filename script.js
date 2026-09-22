// ຕົວແປ words ມາຈາກໄຟລ words.js
// ກົດຂອງເກມ

const views = {
  menu: document.getElementById("menu-view"),
  study: document.getElementById("study-view"),
  game: document.getElementById("game-view"),
  result: document.getElementById("result-view"),
};

const categoryList = document.getElementById("category-list");
const categoryTitle = document.getElementById("category-title");
const scoreText = document.getElementById("score");
const finalScoreText = document.getElementById("final-score");
const wordList = document.getElementById("word-list");
const board = document.getElementById("board");
const statusText = document.getElementById("status");
const restartButton = document.getElementById("restart");

const MAX_PAIRS = 6; // ຈຳນວນຄູສູງສຸດຕໍ່ເກມ
const START_SCORE = 100; // คะแนนเริ่มต้น

// ตัวแปรของเกมจับคู่
let currentCategory = null;
let selectedCard = null;
let matchedPairs = 0;
let totalPairs = 0;
let locked = false;
let wrongTimer = null;
let score = START_SCORE;

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

//  ອັປເດດຂໍ້ຄວາມສະຖານະ
function updateStatus() {
  if (matchedPairs === totalPairs) {
    statusText.textContent = "ເກັ່ງຫຼາຍ! ຈັບຄູ່ຄົບແລ້ວ";
    finalScoreText.textContent = `ຄະແນນ: ${score}/${START_SCORE}`;
    showView("result");
  } else {
    statusText.textContent = `ຈັບຄູ່ແລ້ວ ${matchedPairs}/${totalPairs}`;
  }
  scoreText.textContent = `ຄະແນນ: ${score}/${START_SCORE}`;
}

// เริ่มเกม: คอลัมน์ซ้าย = คำเกาหลี, คอลัมน์ขวา = ความหมาย
function startGame() {
  clearTimeout(wrongTimer);
  board.innerHTML = "";
  selectedCard = null;
  locked = false;
  matchedPairs = 0;
  score = START_SCORE;

  const pairs = Math.min(MAX_PAIRS, currentCategory.words.length);
  const chosen = shuffle(currentCategory.words).slice(0, pairs);
  totalPairs = chosen.length;

  const koreanCards = shuffle(chosen.map((w, i) => createCard(w.korean, i, "korean")));
  const meaningCards = shuffle(chosen.map((w, i) => createCard(w.meaning, i, "meaning")));

  // วางทีละแถว: ซ้าย (เกาหลี) แล้วขวา (ความหมาย)
  for (let i = 0; i < totalPairs; i++) {
    board.appendChild(koreanCards[i]);
    board.appendChild(meaningCards[i]);
  }
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
      score = 0;
      updateStatus();
    }, 600);
  }
}

// ฟังการกดที่กระดาน (ตัวเดียวดูแลการ์ดทุกใบ)
board.addEventListener("click", (event) => {
  const card = event.target.closest(".card");
  if (!card || locked || card.disabled) return;
  handleCardClick(card);
});
// ປຸ່ມຕ່າງໆ
document.getElementById("back-to-menu").addEventListener("click", () => showView("menu"));
document.getElementById("back-to-study").addEventListener("click", () => showView("study"));
document.getElementById("start-game").addEventListener("click", () => {
    startGame();
  showView("game");
});
document.getElementById("back-to-result").addEventListener("click", () => showView("menu"));
document.getElementById("restart").addEventListener("click", startGame);
document.getElementById("play-again").addEventListener("click", () => {
  startGame();
  showView("game");
});


renderMenu();
showView("menu");