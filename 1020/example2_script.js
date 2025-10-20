// example2_script.js
// 變數宣告與基本型態操作

var text = '123';              // 字串
var num = 45;                  // 數字
var isPass = true;             // 布林
var emptyValue = null;         // 空值
var notAssigned;               // undefined（尚未指定）

// 型態檢查
var lines = '';
lines += 'text = ' + text + '，typeof: ' + (typeof text) + '\n';
lines += 'num = ' + num + '，typeof: ' + (typeof num) + '\n';
lines += 'isPass = ' + isPass + '，typeof: ' + (typeof isPass) + '\n';
lines += 'emptyValue = ' + emptyValue + '，typeof: ' + (typeof emptyValue) + '\n';
lines += 'notAssigned = ' + notAssigned + '，typeof: ' + (typeof notAssigned) + '\n\n';

// 轉型
var textToNumber = parseInt(text, 10); // 將 '123' → 123
lines += 'parseInt(\'123\') = ' + textToNumber + '\n';
lines += 'String(45) = ' + String(num) + '\n';

// 使用 prompt() 讀入兩個數字字串
var input1 = prompt('請輸入第一個數字：');
var input2 = prompt('請輸入第二個數字：');

// 將輸入字串轉成數字
var number1 = parseFloat(input1);
var number2 = parseFloat(input2);

// 相加結果
var sum = number1 + number2;

// 將結果加入顯示內容
lines += '=== 延伸練習：輸入兩數相加 ===\n';
lines += '第一個輸入：' + number1 + '\n';
lines += '第二個輸入：' + number2 + '\n';
lines += '相加結果：' + sum + '\n';

document.getElementById('result').textContent = lines;
