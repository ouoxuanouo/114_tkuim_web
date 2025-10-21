// guess_number.js
// 題目需求 + 延伸練習整合：巢狀條件 / 多重迴圈（可重玩多回合） / 拆函式

// --- 拆函式（延伸） ---
function randInt1to100() {
  return Math.floor(Math.random() * 100) + 1;
}
function toInt(str) {
  var n = parseInt(str, 10);
  return isNaN(n) ? null : n;
}
function playOneRound() {
  var answer = randInt1to100();
  var count = 0;
  var logLine = '';

  while (true) { // 題目需求：反覆猜到答對
    var input = prompt('請輸入 1~100 的數字（取消可結束本回合）：');
    if (input === null) { // 放棄本回合
      logLine = '本回合結束（使用者取消），答案：' + answer;
      break;
    }

    var guess = toInt(input);
    // 巢狀條件（延伸）：先驗證整數，再驗證範圍
    if (guess === null) {
      alert('請輸入整數！');
      continue;
    } else if (guess < 1 || guess > 100) {
      alert('請輸入 1~100 的有效整數！');
      continue;
    }

    count++;
    if (guess === answer) {
      alert('恭喜答對！答案是 ' + answer + '，共猜了 ' + count + ' 次。'); // 題目要求
      logLine = '答對！答案：' + answer + '（共猜了 ' + count + ' 次）';
      break;
    } else if (guess < answer) {
      alert('再大一點！'); // 題目要求
    } else {
      alert('再小一點！'); // 題目要求
    }
  }

  return logLine;
}

var logs = [];
// 多重迴圈（延伸）：可選擇是否重玩另一回合
while (true) {
  var summary = playOneRound();
  logs.push(summary);

  var again = prompt('要再玩一回合嗎？(Y/N)');
  if (!again || again.trim().toUpperCase() !== 'Y') break;
}

var text = logs.join('\n');
console.log(text); // 題目要求：Console 顯示
document.getElementById('result').textContent = text; // 題目要求：頁面 <pre> 顯示
