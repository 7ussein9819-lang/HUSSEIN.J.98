import { Editor } from 'https://cdn.jsdelivr.net/npm/@tiptap/core@3.31.3/+esm';
import StarterKit from 'https://cdn.jsdelivr.net/npm/@tiptap/starter-kit@3.31.3/+esm';
import Placeholder from 'https://cdn.jsdelivr.net/npm/@tiptap/extension-placeholder@3.31.3/+esm';
import TextAlign from 'https://cdn.jsdelivr.net/npm/@tiptap/extension-text-align@3.31.3/+esm';
import Underline from 'https://cdn.jsdelivr.net/npm/@tiptap/extension-underline@3.31.3/+esm';
import TextStyle from 'https://cdn.jsdelivr.net/npm/@tiptap/extension-text-style@3.31.3/+esm';
import Color from 'https://cdn.jsdelivr.net/npm/@tiptap/extension-color@3.31.3/+esm';
import Highlight from 'https://cdn.jsdelivr.net/npm/@tiptap/extension-highlight@3.31.3/+esm';

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

const STORAGE_KEY = 'myeditor:content';
const THEME_KEY = 'myeditor:theme';

const defaultContent = `
  <h1>مرحباً بك في محرري 👋</h1>
  <p>هذا محرر نصوص عصري مبني على <strong>TipTap</strong>. اكتب هنا، وكل شيء يُحفظ تلقائياً في متصفحك.</p>
  <p>جرّب التنسيقات من شريط الأدوات، أو استخدم اختصارات لوحة المفاتيح مثل <code>Ctrl+B</code> للخط العريض.</p>
  <blockquote>نصيحة: يمكنك التبديل بين الوضع الليلي والنهاري من الزر أعلى الصفحة.</blockquote>
`;

const editor = new Editor({
  element: editorElement,
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] }
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
    Highlight.configure({ multicolor: true })
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

function updateWordCounter() {
  const text = editor.getText().trim();
  const words = text ? text.split(/\s+/).length : 0;
  wordCounter.textContent = words + ' كلمة';
}

let autoSaveTimer = null;

function scheduleAutoSave() {
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(function () {
    localStorage.setItem(STORAGE_KEY, editor.getHTML());
  }, 600);
}

function saveNow() {
  localStorage.setItem(STORAGE_KEY, editor.getHTML());
  showToast('تم الحفظ ✓');
}

function showToast(message) {
  const previous = wordCounter.textContent;
  wordCounter.textContent = message;
  setTimeout(function () {
    wordCounter.textContent = previous;
    updateWordCounter();
  }, 1400);
}

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

  updateHeadingSelect();
}

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

toolbar.addEventListener('click', function (event) {
  const button = event.target.closest('[data-action]');
  if (!button) return;

  const action = button.dataset.action;
  const chain = editor.chain().focus();

  switch (action) {
    case 'bold': chain.toggleBold().run(); break;
    case 'italic': chain.toggleItalic().run(); break;
    case 'underline': chain.toggleUnderline().run(); break;
    case 'strike': chain.toggleStrike().run(); break;
    case 'bulletList': chain.toggleBulletList().run(); break;
    case 'orderedList': chain.toggleOrderedList().run(); break;
    case 'alignRight': chain.setTextAlign('right').run(); break;
    case 'alignCenter': chain.setTextAlign('center').run(); break;
    case 'alignLeft': chain.setTextAlign('left').run(); break;
    case 'undo': editor.chain().focus().undo().run(); break;
    case 'redo': editor.chain().focus().redo().run(); break;
    case 'clear': editor.chain().focus().clearNodes().unsetAllMarks().run(); break;
  }
});

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

colorInput.addEventListener('input', function () {
  editor.chain().focus().setColor(colorInput.value).run();
});

highlightInput.addEventListener('input', function () {
  editor.chain().focus().setHighlight({ color: highlightInput.value }).run();
});

btnTheme.addEventListener('click', function () {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
});

(function restoreTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark') document.body.classList.add('dark');
})();

btnSave.addEventListener('click', saveNow);

btnExportWord.addEventListener('click', function () {
  const content = editor.getHTML();
  const html =
    '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">\n' +
    '<head><meta charset="utf-8"><title>مستندي</title>\n' +
    '<style>body{font-family:Arial;line-height:1.8;direction:rtl;padding:20px;}blockquote{border-right:4px solid #4f46e5;padding-right:16px;color:#555;}</style>\n' +
    '</head>\n<body dir="rtl">\n' + content + '\n</body>\n</html>';
  download('\ufeff' + html, 'document.doc', 'application/msword');
});

btnExportHtml.addEventListener('click', function () {
  const content = editor.getHTML();
  const html =
    '<!DOCTYPE html>\n<html lang="ar" dir="rtl">\n<head><meta charset="utf-8"><title>مستندي</title>\n' +
    '<style>body{font-family:"Segoe UI",Tahoma,sans-serif;line-height:1.9;direction:rtl;max-width:800px;margin:40px auto;padding:0 20px;color:#1f2937;}blockquote{border-right:4px solid #4f46e5;padding-right:16px;color:#555;font-style:italic;}</style>\n' +
    '</head>\n<body>\n' + content + '\n</body>\n</html>';
  download(html, 'document.html', 'text/html');
});

btnPrint.addEventListener('click', function () {
  window.print();
});

function download(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

document.addEventListener('keydown', function (event) {
  const isCtrl = event.ctrlKey || event.metaKey;
  if (!isCtrl) return;
  if (event.key === 's') { event.preventDefault(); saveNow(); }
  if (event.key === 'p') { event.preventDefault(); window.print(); }
});

updateWordCounter();
updateToolbarStates();
