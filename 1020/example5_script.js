// example5_script.js
// 以巢狀 for 產生 1~9 的乘法表

var output = '';

// 🔸【延伸練習開始：讓使用者輸入範圍】
var start = prompt('請輸入起始數字（1～9）：');
var end = prompt('請輸入結束數字（1～9）：');

// 將輸入字串轉為數字
var s = parseInt(start, 10);
var e = parseInt(end, 10);

// 驗證輸入是否有效
if (isNaN(s) || isNaN(e) || s < 1 || e > 9 || s > e) {
  output = '⚠️ 輸入範圍無效，請重新整理頁面再試！（範圍需在 1～9 且起始 ≤ 結束）';
} else {
  output += '【顯示 ' + s + ' 到 ' + e + ' 的乘法表】\n\n';
  // 🔸【延伸練習結束：開始巢狀迴圈輸出】
  
  for (var i = s; i <= e; i++) {
    for (var j = 1; j <= 9; j++) {
      output += i + 'x' + j + '=' + (i * j) + '\t';
    }
    output += '\n';
  }
}

document.getElementById('result').textContent = output;