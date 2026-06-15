/* =========================================================
   Learn for Free — App Logic (vanilla JS, offline-first)
   ========================================================= */

(() => {
  'use strict';

  /* ---------------------------------------------------------
     1. Bottom Nav — view switching
     --------------------------------------------------------- */

  const navItems = document.querySelectorAll('.nav-item');
  const views = document.querySelectorAll('.view');

  function showView(target) {
    views.forEach((view) => {
      view.hidden = view.dataset.view !== target;
    });
    navItems.forEach((item) => {
      item.classList.toggle('is-active', item.dataset.target === target);
    });
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }

  navItems.forEach((item) => {
    item.addEventListener('click', () => showView(item.dataset.target));
  });

  /* ---------------------------------------------------------
     2. Lesson topics — metadata + data loading
     --------------------------------------------------------- */

  const TOPICS = {
    'parts-of-speech': { title: 'Parts of Speech', file: 'data/parts-of-speech.json' },
    tenses: { title: 'Tenses', file: 'data/tenses.json' },
    adjectives: { title: 'Adjectives', file: 'data/adjectives.json' },
    pronouns: { title: 'Pronouns', file: 'data/pronouns.json' },
    prepositions: { title: 'Prepositions', file: 'data/prepositions.json' },
    'wh-questions': { title: 'Wh- Questions', file: 'data/wh-questions.json' },
    writing: { title: 'Writing & Commas', file: 'data/writing.json' },
  };

  const topicDataCache = {};
  let currentTopicId = null;
  let currentLessonId = null;

  async function loadTopic(topicId) {
    if (topicDataCache[topicId]) return topicDataCache[topicId];
    const meta = TOPICS[topicId];
    if (!meta) return null;
    try {
      const res = await fetch(meta.file);
      const data = await res.json();
      topicDataCache[topicId] = data;
      return data;
    } catch (err) {
      console.warn('Could not load topic data:', topicId, err);
      return null;
    }
  }

  /* ---------------------------------------------------------
     3. Lesson list view
     --------------------------------------------------------- */

  const lessonsEyebrow = document.getElementById('lessonsEyebrow');
  const lessonsTitle = document.getElementById('lessonsTitle');
  const lessonListEl = document.getElementById('lessonList');
  const lessonsBackBtn = document.getElementById('lessonsBackBtn');

  async function openTopic(topicId, lessonId) {
    currentTopicId = topicId;
    const meta = TOPICS[topicId];
    lessonsEyebrow.textContent = 'Topic';
    lessonsTitle.textContent = meta ? meta.title : topicId;
    lessonListEl.innerHTML = '<div class="empty-state"><div class="empty-state__icon">⏳</div><div>Lessons များ Load လုပ်နေပါသည်...</div></div>';
    showView('lessons');

    const data = await loadTopic(topicId);
    if (!data || !Array.isArray(data.lessons)) {
      lessonListEl.innerHTML = '<div class="empty-state"><div class="empty-state__icon">⚠️</div><div>Lesson များ ဖွင့်ဖို့ မအောင်မြင်ပါ။ Internet/Offline cache ကို စစ်ကြည့်ပါ။</div></div>';
      return;
    }

    lessonsTitle.textContent = data.titleMM ? `${data.title} — ${data.titleMM}` : data.title;
    renderLessonList(data);

    if (lessonId) {
      const lesson = data.lessons.find((l) => l.id === lessonId);
      if (lesson) {
        openLesson(lesson);
        return;
      }
    }
  }

  function renderLessonList(data) {
    lessonListEl.innerHTML = '';
    data.lessons.forEach((lesson, i) => {
      const btn = document.createElement('button');
      btn.className = 'lesson-card';
      btn.innerHTML = `
        <div class="lesson-card__index">${i + 1}</div>
        <div class="lesson-card__body">
          <div class="lesson-card__title">${lesson.title}</div>
          <div class="lesson-card__tag">${lesson.tag || ''}</div>
        </div>
        <div class="lesson-card__arrow">›</div>
      `;
      btn.addEventListener('click', () => openLesson(lesson));
      lessonListEl.appendChild(btn);
    });
  }

  lessonsBackBtn.addEventListener('click', () => showView('home'));

  /* ---------------------------------------------------------
     4. Lesson detail view
     --------------------------------------------------------- */

  const lessonContentEl = document.getElementById('lessonContent');
  const lessonBackBtn = document.getElementById('lessonBackBtn');

  function openLesson(lesson) {
    currentLessonId = lesson.id;
    const meta = TOPICS[currentTopicId];

    let html = '';
    html += `<div class="lesson-detail__eyebrow">${meta ? meta.title : ''}</div>`;
    html += `<h1 class="lesson-detail__title">${lesson.title}</h1>`;

    if (Array.isArray(lesson.explain) && lesson.explain.length) {
      html += '<div class="lesson-block"><div class="lesson-block__title">ရှင်းလင်းချက်</div>';
      lesson.explain.forEach((p) => {
        html += `<p>${p}</p>`;
      });
      html += '</div>';
    }

    if (Array.isArray(lesson.structure) && lesson.structure.length) {
      html += '<div class="lesson-block"><div class="lesson-block__title">Structure</div><div class="lesson-structure">';
      lesson.structure.forEach((row) => {
        html += `
          <div class="lesson-structure__row">
            <span class="lesson-structure__label">${row.label}</span>
            <span class="lesson-structure__value">${row.value}</span>
          </div>
        `;
      });
      html += '</div></div>';
    }

    if (Array.isArray(lesson.examples) && lesson.examples.length) {
      html += '<div class="lesson-block"><div class="lesson-block__title">Examples</div><div class="lesson-examples">';
      lesson.examples.forEach((ex) => {
        html += `
          <div class="lesson-example">
            <div class="lesson-example__en">${ex.en}</div>
            <div class="lesson-example__mm">${ex.mm || ''}</div>
          </div>
        `;
      });
      html += '</div></div>';
    }

    if (Array.isArray(lesson.tips) && lesson.tips.length) {
      html += '<div class="lesson-block"><div class="lesson-block__title">မှတ်စရာ</div><ul class="lesson-tips">';
      lesson.tips.forEach((tip) => {
        html += `<li>${tip}</li>`;
      });
      html += '</ul></div>';
    }

    if (Array.isArray(lesson.quiz) && lesson.quiz.length) {
      html += '<button class="btn btn--primary mb-lg" id="lessonPracticeBtn">ဒီ Lesson ကို Quiz လေ့ကျင့်မယ် ▸</button>';
    }

    lessonContentEl.innerHTML = html;
    showView('lesson');

    const practiceBtn = document.getElementById('lessonPracticeBtn');
    if (practiceBtn) {
      practiceBtn.addEventListener('click', () => {
        setQuizCategory(currentTopicId);
        showView('test');
      });
    }
  }

  lessonBackBtn.addEventListener('click', () => showView('lessons'));

  /* ---------------------------------------------------------
     5. Bento cards — open topic / lesson
     --------------------------------------------------------- */

  document.querySelectorAll('.bento-card[data-topic]').forEach((card) => {
    card.addEventListener('click', () => {
      openTopic(card.dataset.topic, card.dataset.lesson || null);
    });
  });

  /* ---------------------------------------------------------
     6. Test / Quiz logic
     --------------------------------------------------------- */

  // Question bank — built dynamically from each topic's lesson quiz arrays.
  let QUESTION_BANK = {};

  const chipRow = document.getElementById('testCategoryChips');
  const quizQuestionEl = document.getElementById('quizQuestion');
  const quizOptionsEl = document.getElementById('quizOptions');
  const quizCounterEl = document.getElementById('quizCounter');
  const quizProgressFill = document.getElementById('quizProgressFill');
  const quizNextBtn = document.getElementById('quizNextBtn');

  let currentCategory = 'tenses';
  let currentIndex = 0;
  let selectedOption = null;

  function setQuizCategory(category) {
    if (!category) return;
    currentCategory = category;
    currentIndex = 0;
    if (chipRow) {
      chipRow.querySelectorAll('.chip').forEach((c) => {
        c.classList.toggle('is-active', c.dataset.category === category);
      });
    }
    loadQuestion();
  }

  function loadQuestion() {
    const set = QUESTION_BANK[currentCategory];

    if (!set || !set.length) {
      quizQuestionEl.textContent = 'Quiz Load လုပ်နေပါသည်... ခဏစောင့်ပါ။';
      quizOptionsEl.innerHTML = '';
      quizCounterEl.textContent = '';
      quizProgressFill.style.width = '0%';
      quizNextBtn.disabled = true;
      return;
    }

    const item = set[currentIndex];

    selectedOption = null;
    quizQuestionEl.textContent = item.q;
    quizCounterEl.textContent = `Question ${currentIndex + 1} / ${set.length}`;
    quizProgressFill.style.width = `${((currentIndex + 1) / set.length) * 100}%`;

    quizOptionsEl.innerHTML = '';
    item.options.forEach((optionText, i) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option';
      btn.textContent = optionText;
      btn.dataset.index = i;
      btn.addEventListener('click', () => selectOption(btn, i, item.correct));
      quizOptionsEl.appendChild(btn);
    });

    quizNextBtn.disabled = true;
    quizNextBtn.textContent = 'အဖြေရွေးပါ';
  }

  function selectOption(btn, index, correctIndex) {
    if (selectedOption !== null) return; // already answered
    selectedOption = index;

    const allOptions = quizOptionsEl.querySelectorAll('.quiz-option');
    allOptions.forEach((opt, i) => {
      if (i === correctIndex) {
        opt.classList.add('is-correct');
      } else if (i === index) {
        opt.classList.add('is-incorrect');
      }
    });

    quizNextBtn.disabled = false;
    const set = QUESTION_BANK[currentCategory];
    quizNextBtn.textContent = currentIndex < set.length - 1 ? 'နောက်တစ်ခု ▸' : 'ပြီးပါပြီ 🎉';
  }

  quizNextBtn.addEventListener('click', () => {
    const set = QUESTION_BANK[currentCategory];
    if (!set || !set.length) return;
    if (currentIndex < set.length - 1) {
      currentIndex += 1;
      loadQuestion();
    } else {
      // Finished — restart this category from the top.
      currentIndex = 0;
      loadQuestion();
    }
  });

  if (chipRow) {
    chipRow.querySelectorAll('.chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        chipRow.querySelectorAll('.chip').forEach((c) => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        currentCategory = chip.dataset.category;
        currentIndex = 0;
        loadQuestion();
      });
    });
  }

  // Show a "loading" placeholder immediately, then fetch all topic data.
  loadQuestion();

  (async () => {
    const ids = Object.keys(TOPICS);
    await Promise.all(ids.map((id) => loadTopic(id)));

    const bank = {};
    ids.forEach((id) => {
      const data = topicDataCache[id];
      const questions = [];
      if (data && Array.isArray(data.lessons)) {
        data.lessons.forEach((lesson) => {
          if (Array.isArray(lesson.quiz)) {
            lesson.quiz.forEach((q) => questions.push(q));
          }
        });
      }
      bank[id] = questions;
    });

    QUESTION_BANK = bank;
    currentIndex = 0;
    loadQuestion();
  })();

  /* ---------------------------------------------------------
     7. About — reset progress
     --------------------------------------------------------- */

  const resetBtn = document.getElementById('resetProgressBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      const ok = window.confirm('Progress အားလုံးကို ပြန်လည်သတ်မှတ်မှာ သေချာပါသလား?');
      if (ok) {
        // Future: clear stored progress from localStorage / IndexedDB here.
        window.alert('Progress ကို ပြန်စပြီးပါပြီ ✅');
      }
    });
  }

  /* ---------------------------------------------------------
     8. Service Worker registration (offline support)
     --------------------------------------------------------- */

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch((err) => {
        console.warn('Service worker registration failed:', err);
      });
    });
  }
})();
