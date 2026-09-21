// ຕົວແປ words ມາຈາກໄຟລ words.js
// ກົດຂອງເກມ

const views = {
  menu: document.getElementById("menu-view"),
  study: document.getElementById("study-view"),
  game: document.getElementById("game-view"),
};

const categoryList = document.getElementById("category-list");
const categoryTitle = document.getElementById("category-title");
const wordList = document.getElementById("word-list");
const board = document.getElementById("board");
const statusText = document.getElementById("status");
const restartButton = document.getElementById("restart");

const MAX_PAIRS = 6; // ຈຳນວນຄູສູງສຸດຕໍ່ເກມ
let currentCategory = null;

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

// สร้างการ์ดหนึ่งใบ (เก็บเลขคู่ไว้ใน data-pair เพื่อใช้ตรวจตอนขั้นที่ 4)
function createCard(text, pairId) {
  const card = document.createElement("button");
  card.className = "card";
  card.type = "button";
  card.dataset.pair = pairId;
  card.textContent = text;
  return card;
}

// หน้าที่ 3: เริ่มเกมด้วยคำในหมวดที่เลือก
function startGame() {
  boardoard.innerHTML = "";
  statusText.textContent = "ຕຽມພ້ອມ";

  const pairs = Math.min(MAX_PAIRS, currentCategory.words.length);
  const chosen = shuffle(currentCategory.words).slice(0, pairs);
  const cards = [];

   chosen.forEach((word, index) => {
     cards.push({ text: word.korean, pair: index });
    cards.push({ text: word.meaning, pair: index });
   });

   shuffle(cards).forEach((c) => {
    board.appendChild(createCard(c.text, c.pair));
   });
}

// ปุ่มต่าง ๆ
document.getElementById("back-to-menu").addEventListener("click", () => showView("menu"));
document.getElementById("back-to-study").addEventListener("click", () => showView("study"));
document.getElementById("start-game").addEventListener("click", () => {
  startGame();
  showView("game");
});
document.getElementById("restart").addEventListener("click", startGame);

renderMenu();
showView("menu");

function startGame() {
  statusText.textContent = "ຕຽມພ້ອມ";
  console.log("ໂຫລດຄຳສັບແລ້ວ:", words.length, "ຄຳ");
}

restartButton.addEventListener("click", startGame);

startGame();
