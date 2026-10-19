/* ============================================
   عناصر الصفحة
   ============================================ */
const editor = document.getElementById('editor');
const counter = document.getElementById('counter');
const KEY = 'myeditor:doc';

/* ============================================
   التهيئة الأولية
   ============================================ */
document.execCommand('styleWithCSS', false, true);

editor.innerHTML = localStorage.getItem(KEY) ||
  '<h1>مرحباً بك 👋</h1><p>اكتب هنا… كل شيء يُحفظ تلقائياً.</p>';

updateCounter();

/* ============================================
   أزرار التنسيق (data-cmd)
   ============================================ */
document.querySelectorAll('[data-cmd]').forEach(function (btn) {
  // منع فقدان التحديد عند الضغط على الزر
  btn.addEventListener('mousedown', function (e) {
    e.preventDefault();
  });

  btn.addEventListener('click', function () {
    document.execCommand(btn.dataset.cmd, false, null);
    editor.focus();
    refreshStates();
  });
});

/* ============================================
   تغيير نمط الفقرة
   ============================================ */
document.getElementById('blockFmt').addEventListener('change', function (e) {
  document.execCommand('formatBlock', false, e.target.value);
  editor.focus();
});

/* ============================================
   تغيير حجم الخط
   ============================================ */
document.getElementById('fontSize').addEventListener('change', function (e) {
  if (e.target.value) {
    document.execCommand('fontSize', false, e.target.value);
  }
  editor.focus();
  e.target.value = '';
});

/* ============================================
   لون النص والتظليل
   ============================================ */
document.getElementById('textColor').addEventListener('input', function (e) {
  document.execCommand('foreColor', false, e.target.value);
});

document.getElementById('highlight').addEventListener('input', function (e) {
  document.execCommand('hiliteColor', false, e.target.value);
});

/* ============================================
   تحديث حالة الأزرار (نشط / غير نشط)
   ============================================ */
function refreshStates() {
  const commands = [
    'bold',
    'italic',
    'underline',
    'strikeThrough',
    'justifyRight',
    'justifyCenter',
    'justifyLeft',
    'justifyFull',
    'insertUnorderedList',
    'insertOrderedList'
  ];

  commands.forEach(function (cmd) {
    const btn = document.querySelector('[data-cmd="' + cmd + '"]');
    if (btn) {
      btn.classList.toggle('active', document.queryCommandState(cmd));
    }
  });
}

document.addEventListener('selectionchange', function () {
  if (document.activeElement === editor) {
    refreshStates();
  }
});

/* ============================================
   عدّ الكلمات والحروف
   ============================================ */
function updateCounter() {
  const text = editor.innerText.trim();
  const words = text ? text.split(/\s+/).length : 0;
  counter.textContent = words + ' كلمة · ' + text.length + ' حرف';
}

/* ============================================
   الحفظ التلقائي في localStorage
   ============================================ */
let saveTimer;

editor.addEventListener('input', function () {
  updateCounter();

  clearTimeout(saveTimer);
  saveTimer = setTimeout(function () {
    localStorage.setItem(KEY, editor.innerHTML);
  }, 500);
});

/* ============================================
   الوضع الليلي
   ============================================ */
document.getElementById('btnDark').addEventListener('click', function () {
  document.body.classList.toggle('dark');
});

/* ============================================
   زر الحفظ اليدوي
   ============================================ */
document.getElementById('btnSave').addEventListener('click', function () {
  localStorage.setItem(KEY, editor.innerHTML);
  flash('تم الحفظ ✓');
});

/* ============================================
   تصدير HTML
   ============================================ */
document.getElementById('btnHtml').addEventListener('click', function () {
  const html =
    '<!DOCTYPE html>\n' +
    '<html lang="ar" dir="rtl">\n' +
    '<head>\n' +
    '  <meta charset="utf-8">\n' +
    '  <title>مستندي</title>\n' +
    '</head>\n' +
    '<body>\n' +
    editor.innerHTML +
    '\n</body>\n' +
    '</html>';

  download(html, 'document.html', 'text/html');
});

/* ============================================
   تصدير Word (.doc)
   ============================================ */
document.getElementById('btnWord').addEventListener('click', function () {
  const html =
    '<html xmlns:o="urn:schemas-microsoft-com:office:office"\n' +
    '      xmlns:w="urn:schemas-microsoft-com:office:word"\n' +
    '      xmlns="http://www.w3.org/TR/REC-html40">\n' +
    '<head>\n' +
    '  <meta charset="utf-8">\n' +
    '  <style>\n' +
    '    body { font-family: Arial; line-height: 1.8; direction: rtl; }\n' +
    '  </style>\n' +
    '</head>\n' +
    '<body dir="rtl">\n' +
    editor.innerHTML +
    '\n</body>\n' +
    '</html>';

  download('\ufeff' + html, 'document.doc', 'application/msword');
});

/* ============================================
   الطباعة / PDF
   ============================================ */
document.getElementById('btnPrint').addEventListener('click', function () {
  window.print();
});

/* ============================================
   دالة التنزيل العامة
   ============================================ */
function download(content, name, type) {
  const blob = new Blob([content], { type: type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download = name;
  a.click();

  URL.revokeObjectURL(url);
}

/* ============================================
   رسالة مؤقتة في العداد
   ============================================ */
function flash(msg) {
  const old = counter.textContent;
  counter.textContent = msg;

  setTimeout(function () {
    counter.textContent = old;
    updateCounter();
  }, 1200);
}

/* ============================================
   اختصارات لوحة المفاتيح
   ============================================ */
editor.addEventListener('keydown', function (e) {
  if (!e.ctrlKey && !e.metaKey) {
    return;
  }

  // Ctrl + S → حفظ
  if (e.key === 's') {
    e.preventDefault();
    localStorage.setItem(KEY, editor.innerHTML);
    flash('تم الحفظ ✓');
  }

  // Ctrl + P → طباعة
  if (e.key === 'p') {
    e.preventDefault();
    window.print();
  }
});
