// ຕົວແປ words ມາຈາກໄຟລ words.js

const board = document.getElementById("board");
const status = document.getElementById("status");
const restartButton = document.getElementById("restart");

//  ສຸ່ມຄຳແລະສ້າງກາດ
function startGame() {
  status.textContent = "ຕຽມພ້ອມ";
  console.log("ໂຫລດຄຳສັບແລ້ວ:", words.length, "ຄຳ");
}

restartButton.addEventListener("click", startGame);

startGame();
