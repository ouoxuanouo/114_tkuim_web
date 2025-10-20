// example1_script.js
// 傳統語法：僅使用 var、function、字串串接

// 顯示提示窗
alert('歡迎來到 JavaScript！');

// 在 Console 顯示訊息
console.log('Hello JavaScript from console');

// 在頁面指定區域輸出文字
var el = document.getElementById('result');
el.textContent = '這行文字是由外部 JS 檔案寫入的。\n413637397 魏廷軒';

var btn = document.getElementById('showMsgBtn');

btn.onclick = function() {
  alert('選一個億還是清華錄取通知書');
  console.log('使用者點擊了顯示提示的按鈕');
};