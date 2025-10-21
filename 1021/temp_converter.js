// temp_converter.js
// 題目需求 + 延伸練習整合：巢狀條件 / 多重迴圈（是否再轉一次）/ 拆函式

// --- 拆函式（延伸） ---
function toNumber(str) {
  var n = parseFloat(str);
  return isNaN(n) ? null : n;
}
function normalizeUnit(u) {
  return (u || '').trim().toUpperCase();
}
function convertOnce() {
  var tStr = prompt('請輸入溫度數值：');
  var unit = prompt('請輸入單位（C 或 F）：');

  if (tStr === null || unit === null) return '輸入已取消。';

  var t = toNumber(tStr);
  var u = normalizeUnit(unit);
  var line = '';

  // 巢狀條件（延伸）：先驗證數字，再判斷單位
  if (t === null) {
    line = '溫度必須是數字！';
  } else if (u === 'C') {
    var f = t * 9 / 5 + 32;
    line = t + ' °C = ' + f.toFixed(2) + ' °F';
    alert(line); // 題目要求
  } else if (u === 'F') {
    var c = (t - 32) * 5 / 9;
    line = t + ' °F = ' + c.toFixed(2) + ' °C';
    alert(line); // 題目要求
  } else {
    line = '單位必須輸入 C 或 F';
  }
  return line;
}

var lines = [];
// 多重迴圈（延伸）：可連續多次轉換
while (true) {
  var result = convertOnce();
  lines.push(result);

  var again = prompt('要再轉換一次嗎？(Y/N)');
  if (!again || again.trim().toUpperCase() !== 'Y') break;
}

var text = lines.join('\n');
console.log(text); // 題目要求：Console 顯示
document.getElementById('result').textContent = text; // 題目要求：頁面 <pre> 顯示
