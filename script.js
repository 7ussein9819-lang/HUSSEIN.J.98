const editor     = document.getElementById('editor');
const wordCount  = document.getElementById('wordCount');
const charCount  = document.getElementById('charCount');

/* ---------- العدادات ---------- */
function updateCounts() {
  const text  = editor.innerText.trim();
  const words = text ? text.split(/\s+/).length : 0;
  wordCount.textContent = 'كلمات: ' + words;
  charCount.textContent = 'أحرف: ' + text.length;
}

/* ---------- حفظ تلقائي ---------- */
let saveTimer;
function autosave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    localStorage.setItem('editor_content', editor.innerHTML);
  }, 800);
}

editor.addEventListener('input', () => {
  updateCounts();
  autosave();
});

/* ---------- تحميل المحتوى عند البدء ---------- */
(function loadSaved() {
  const saved = localStorage.getItem('editor_content');
  if (saved) editor.innerHTML = saved;
  updateCounts();
})();

/* ---------- أزرار التنسيق ---------- */
document.querySelectorAll('[data-cmd]').forEach(btn => {
  // يمنع فقدان التحديد داخل المحرر
  btn.addEventListener('mousedown', e => e.preventDefault());
  btn.addEventListener('click', () => {
    document.execCommand(btn.dataset.cmd, false, null);
    editor.focus();
  });
});

/* ---------- نوع وحجم الخط ---------- */
document.getElementById('fontFamily').addEventListener('change', function () {
  document.execCommand('fontName', false, this.value);
  editor.focus();
});

document.getElementById('fontSize').addEventListener('change', function () {
  document.execCommand('fontSize', false, this.value);
  editor.focus();
});

/* ---------- الألوان ---------- */
document.getElementById('textColor').addEventListener('input', function () {
  document.execCommand('styleWithCSS', false, true);
  document.execCommand('foreColor', false, this.value);
  editor.focus();
});

document.getElementById('bgColor').addEventListener('input', function () {
  document.execCommand('styleWithCSS', false, true);
  document.execCommand('hiliteColor', false, this.value);
  editor.focus();
});

/* ---------- الأزرار الرئيسية ---------- */
document.getElementById('btnNew').addEventListener('click', () => {
  if (editor.innerText.trim() && !confirm('هل تريد مسح المحتوى الحالي؟')) return;
  editor.innerHTML = '';
  localStorage.removeItem('editor_content');
  updateCounts();
  editor.focus();
});

document.getElementById('btnSave').addEventListener('click', () => {
  localStorage.setItem('editor_content', editor.innerHTML);
  alert('تم حفظ المستند ✓');
});

document.getElementById('btnLoad').addEventListener('click', () => {
  const saved = localStorage.getItem('editor_content');
  if (!saved) return alert('لا يوجد مستند محفوظ');
  editor.innerHTML = saved;
  updateCounts();
});

document.getElementById('btnDownload').addEventListener('click', () => {
  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="UTF-8"><title>مستندي</title>
<style>body{font-family:Tahoma,sans-serif;padding:24px;line-height:1.9}</style>
</head><body>${editor.innerHTML}</body></html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'document.html';
  a.click();
  URL.revokeObjectURL(a.href);
});

document.getElementById('btnPrint').addEventListener('click', () => window.print());

/* ---------- لصق كنص عادي (بدون تنسيق غريب) ---------- */
editor.addEventListener('paste', e => {
  e.preventDefault();
  const text = (e.clipboardData || window.clipboardData).getData('text/plain');
  document.execCommand('insertText', false, text);
});

/* ---------- اختصارات كيبورد ---------- */
editor.addEventListener('keydown', e => {
  if (!(e.ctrlKey || e.metaKey)) return;
  const k = e.key.toLowerCase();
  if (k === 'b') { e.preventDefault(); document.execCommand('bold'); }
  if (k === 'i') { e.preventDefault(); document.execCommand('italic'); }
  if (k === 'u') { e.preventDefault(); document.execCommand('underline'); }
  if (k === 's') { e.preventDefault(); document.getElementById('btnSave').click(); }
});
