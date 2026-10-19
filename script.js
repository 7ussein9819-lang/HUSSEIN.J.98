/* ============================================
   استيراد TipTap والامتدادات من CDN
   ============================================ */
import { Editor } from 'https://esm.sh/@tiptap/core@3.31.3';
import StarterKit from 'https://esm.sh/@tiptap/starter-kit@3.31.3';
import Placeholder from 'https://esm.sh/@tiptap/extension-placeholder@3.31.3';
import TextAlign from 'https://esm.sh/@tiptap/extension-text-align@3.31.3';
import Underline from 'https://esm.sh/@tiptap/extension-underline@3.31.3';
import TextStyle from 'https://esm.sh/@tiptap/extension-text-style@3.31.3';
import Color from 'https://esm.sh/@tiptap/extension-color@3.31.3';
import Highlight from 'https://esm.sh/@tiptap/extension-highlight@3.31.3';

/* ============================================
   عناصر الصفحة
   ============================================ */
const editorElement = document.querySelector('#editor');
const toolbar = document.querySelector('#toolbar');
const wordCounter = document.querySelector('#wordCounter');
const headingSelect = document.querySelector('#headingSelect');
const colorInput = document.querySelector('#colorInput');
const highlightInput = document.querySelector('#highlightInput');
const btnTheme = document.querySelector('#btnTheme');
const btnSave = document.querySelector('#btnSave');
const btnExportWord = document.querySelector('#btnExportWord');
const btnExportHtml = document.querySelector('#btnExportHtml');
const btnPrint = document.querySelector('#btnPrint');

/* ============================================
   مفتاح التخزين المحلي
   ============================================ */
const STORAGE_KEY = 'myeditor:content';

/* ============================================
   المحتوى الافتراضي
   ============================================ */
const defaultContent = `
  <h1>مرحباً بك في محرري 👋</h1>
  <p>هذا محرر نصوص عصري مبني على <strong>TipTap</strong>. اكتب هنا، وكل شيء يُحفظ تلقائياً في متصفحك.</p>
  <p>جرّب التنسيقات من شريط الأدوات، أو استخدم اختصارات لوحة المفاتيح مثل <code>Ctrl+B</code> للخط العريض.</p>
  <blockquote>نصيحة: يمكنك التبديل بين الوضع الليلي والنهاري من الزر أعلى الصفحة.</blockquote>
`;

/* ============================================
   تهيئة محرر TipTap
   ============================================ */
const editor = new Editor({
  element: editorElement,
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3]
      }
    }),
    Placeholder.configure({
      placeholder: 'ابدأ الكتابة هنا…'
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
      alignments: ['left', 'center', 'right', 'justify']
    }),
    Underline,
    TextStyle,
    Color,
    Highlight.configure({
      multicolor: true
    })
  ],
  content: localStorage.getItem(STORAGE_KEY) || defaultContent,
  textDirection: 'auto',
  autofocus: false,
  editorProps: {
    attributes: {
      class: 'ProseMirror',
      spellcheck: 'true'
    }
  },
  onUpdate: function ({ editor }) {
    updateWordCounter();
    scheduleAutoSave();
    updateToolbarStates();
  },
  onSelectionUpdate: function () {
    updateToolbarStates();
  }
});

/* ============================================
   تحديث عداد الكلمات
   ============================================ */
function updateWordCounter() {
  const text = editor.getText().trim();
  const words = text ? text.split(/\s+/).length : 0;
  wordCounter.textContent = words + ' كلمة';
}

/* ============================================
   الحفظ التلقائي
   ============================================ */
let autoSaveTimer = null;

function scheduleAutoSave() {
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(function () {
    localStorage.setItem(STORAGE_KEY, editor.getHTML());
  }, 600);
}

/* ============================================
   حفظ فوري (يدوي)
   ============================================ */
function saveNow() {
  localStorage.setItem(STORAGE_KEY, editor.getHTML());
  showToast('تم الحفظ ✓');
}

/* ============================================
   إظهار رسالة مؤقتة
   ============================================ */
function showToast(message) {
  const previous = wordCounter.textContent;
  wordCounter.textContent = message;

  setTimeout(function () {
    wordCounter.textContent = previous;
    updateWordCounter();
  }, 1400);
}

/* ============================================
   تحديث حالة أزرار شريط الأدوات
   ============================================ */
function updateToolbarStates() {
  const stateMap = {
    bold: editor.isActive('bold'),
    italic: editor.isActive('italic'),
    underline: editor.isActive('underline'),
    strike: editor.isActive('strike'),
    bulletList: editor.isActive('bulletList'),
    orderedList: editor.isActive('orderedList'),
    alignRight: editor.isActive({ textAlign: 'right' }),
    alignCenter: editor.isActive({ textAlign: 'center' }),
    alignLeft: editor.isActive({ textAlign: 'left' })
  };

  toolbar.querySelectorAll('[data-action]').forEach(function (btn) {
    const action = btn.dataset.action;
    if (Object.prototype.hasOwnProperty.call(stateMap, action)) {
      btn.classList.toggle('is-active', stateMap[action]);
    }
  });

  // تحديث القائمة المنسدلة للعناوين
  updateHeadingSelect();
}

/* ============================================
   تحديث القائمة المنسدلة للعناوين
   ============================================ */
function updateHeadingSelect() {
  let currentValue = 'p';

  if (editor.isActive('heading', { level: 1 })) {
    currentValue = 'h1';
  } else if (editor.isActive('heading', { level: 2 })) {
    currentValue = 'h2';
  } else if (editor.isActive('heading', { level: 3 })) {
    currentValue = 'h3';
  }

  headingSelect.value = currentValue;
}

/* ============================================
   تنفيذ الأوامر من شريط الأدوات
   ============================================ */
toolbar.addEventListener('click', function (event) {
  const button = event.target.closest('[data-action]');
  if (!button) {
    return;
  }

  const action = button.dataset.action;
  const chain = editor.chain().focus();

  switch (action) {
    case 'bold':
      chain.toggleBold().run();
      break;

    case 'italic':
      chain.toggleItalic().run();
      break;

    case 'underline':
      chain.toggleUnderline().run();
      break;

    case 'strike':
      chain.toggleStrike().run();
      break;

    case 'bulletList':
      chain.toggleBulletList().run();
      break;

    case 'orderedList':
      chain.toggleOrderedList().run();
      break;

    case 'alignRight':
      chain.setTextAlign('right').run();
      break;

    case 'alignCenter':
      chain.setTextAlign('center').run();
      break;

    case 'alignLeft':
      chain.setTextAlign('left').run();
      break;

    case 'undo':
      editor.chain().focus().undo().run();
      break;

    case 'redo':
      editor.chain().focus().redo().run();
      break;

    case 'clear':
      editor.chain().focus().clearNodes().unsetAllMarks().run();
      break;
  }
});

/* ============================================
   تغيير نمط الفقرة (عنوان / نص عادي)
   ============================================ */
headingSelect.addEventListener('change', function () {
  const value = headingSelect.value;
  const chain = editor.chain().focus();

  if (value === 'p') {
    chain.setParagraph().run();
  } else {
    const level = parseInt(value.replace('h', ''), 10);
    chain.toggleHeading({ level: level }).run();
  }
});

/* ============================================
   لون النص
   ============================================ */
colorInput.addEventListener('input', function () {
  editor.chain().focus().setColor(colorInput.value).run();
});

/* ============================================
   تظليل النص
   ============================================ */
highlightInput.addEventListener('input', function () {
  editor.chain().focus().setHighlight({ color: highlightInput.value }).run();
});

/* ============================================
   الوضع الليلي / النهاري
   ============================================ */
btnTheme.addEventListener('click', function () {
  document.body.classList.toggle('dark');

  const isDark = document.body.classList.contains('dark');
  localStorage.setItem('myeditor:theme', isDark ? 'dark' : 'light');
});

/* استعادة الوضع المحفوظ */
(function restoreTheme() {
  const savedTheme = localStorage.getItem('myeditor:theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
  }
})();

/* ============================================
   زر الحفظ اليدوي
   ============================================ */
btnSave.addEventListener('click', saveNow);

/* ============================================
   تصدير Word (.doc)
   ============================================ */
btnExportWord.addEventListener('click', function () {
  const content = editor.getHTML();

  const html =
    '<html xmlns:o="urn:schemas-microsoft-com:office:office"\n' +
    '      xmlns:w="urn:schemas-microsoft-com:office:word"\n' +
    '      xmlns="http://www.w3.org/TR/REC-html40">\n' +
    '<head>\n' +
    '  <meta charset="utf-8">\n' +
    '  <title>مستندي</title>\n' +
    '  <style>\n' +
    '    body {\n' +
    '      font-family: Arial, sans-serif;\n' +
    '      line-height: 1.8;\n' +
    '      direction: rtl;\n' +
    '      padding: 20px;\n' +
    '    }\n' +
    '    h1 { font-size: 2em; }\n' +
    '    h2 { font-size: 1.5em; }\n' +
    '    h3 { font-size: 1.2em; }\n' +
    '    blockquote {\n' +
    '      border-right: 4px solid #4f46e5;\n' +
    '      padding-right: 16px;\n' +
    '      margin: 1em 0;\n' +
    '      color: #555;\n' +
    '    }\n' +
    '  </style>\n' +
    '</head>\n' +
    '<body dir="rtl">\n' +
    content +
    '\n</body>\n' +
    '</html>';

  download('\ufeff' + html, 'document.doc', 'application/msword');
});

/* ============================================
   تصدير HTML
   ============================================ */
btnExportHtml.addEventListener('click', function () {
  const content = editor.getHTML();

  const html =
    '<!DOCTYPE html>\n' +
    '<html lang="ar" dir="rtl">\n' +
    '<head>\n' +
    '  <meta charset="utf-8">\n' +
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
    '  <title>مستندي</title>\n' +
    '  <style>\n' +
    '    body {\n' +
    '      font-family: "Segoe UI", Tahoma, sans-serif;\n' +
    '      line-height: 1.9;\n' +
    '      direction: rtl;\n' +
    '      max-width: 800px;\n' +
    '      margin: 40px auto;\n' +
    '      padding: 0 20px;\n' +
    '      color: #1f2937;\n' +
    '    }\n' +
    '    h1 { font-size: 2em; }\n' +
    '    h2 { font-size: 1.5em; }\n' +
    '    h3 { font-size: 1.2em; }\n' +
    '    blockquote {\n' +
    '      border-right: 4px solid #4f46e5;\n' +
    '      padding-right: 16px;\n' +
    '      margin: 1em 0;\n' +
    '      color: #555;\n' +
    '      font-style: italic;\n' +
    '    }\n' +
    '    code {\n' +
    '      background: #eef2ff;\n' +
    '      padding: 2px 6px;\n' +
    '      border-radius: 4px;\n' +
    '      font-family: monospace;\n' +
    '    }\n' +
    '  </style>\n' +
    '</head>\n' +
    '<body>\n' +
    content +
    '\n</body>\n' +
    '</html>';

  download(html, 'document.html', 'text/html');
});

/* ============================================
   الطباعة / PDF
   ============================================ */
btnPrint.addEventListener('click', function () {
  window.print();
});

/* ============================================
   دالة التنزيل العامة
   ============================================ */
function download(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = fileName;
  anchor.click();

  URL.revokeObjectURL(url);
}

/* ============================================
   اختصارات لوحة المفاتيح
   ============================================ */
document.addEventListener('keydown', function (event) {
  const isCtrl = event.ctrlKey || event.metaKey;

  if (!isCtrl) {
    return;
  }

  // Ctrl + S → حفظ
  if (event.key === 's') {
    event.preventDefault();
    saveNow();
  }

  // Ctrl + P → طباعة
  if (event.key === 'p') {
    event.preventDefault();
    window.print();
  }
});

/* ============================================
   التهيئة الأولية
   ============================================ */
updateWordCounter();
updateToolbarStates();
