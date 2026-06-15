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
     2. Test / Quiz logic
     --------------------------------------------------------- */

  // Sample question bank — Burmese explanations, universal English examples.
  const QUESTION_BANK = {
    tenses: [
      {
        q: '"She _____ to school every morning."',
        options: ['go', 'goes', 'going', 'gone'],
        correct: 1,
      },
      {
        q: '"They _____ football yesterday."',
        options: ['play', 'plays', 'played', 'playing'],
        correct: 2,
      },
      {
        q: '"I _____ watching TV right now."',
        options: ['am', 'is', 'are', 'be'],
        correct: 0,
      },
      {
        q: '"By next year, she _____ here for 10 years."',
        options: ['will live', 'will have lived', 'lives', 'lived'],
        correct: 1,
      },
      {
        q: '"He _____ his homework before dinner."',
        options: ['finish', 'finishes', 'had finished', 'finishing'],
        correct: 2,
      },
    ],
    adjectives: [
      {
        q: '"This phone is _____ than my old one." (good)',
        options: ['gooder', 'more good', 'better', 'best'],
        correct: 2,
      },
      {
        q: '"That was the _____ movie I have ever seen."',
        options: ['bad', 'worse', 'worst', 'baddest'],
        correct: 2,
      },
      {
        q: '"She is _____ than her sister." (tall)',
        options: ['taller', 'tallest', 'more tall', 'most tall'],
        correct: 0,
      },
      {
        q: '"This is the _____ question on the test." (easy)',
        options: ['easyer', 'more easy', 'easiest', 'easier'],
        correct: 2,
      },
      {
        q: '"He is as _____ as his father." (strong)',
        options: ['strong', 'stronger', 'strongest', 'more strong'],
        correct: 0,
      },
    ],
    pronouns: [
      {
        q: '"Is this _____ bag or mine?" (belonging to him)',
        options: ['he', 'his', 'him', 'himself'],
        correct: 1,
      },
      {
        q: '"The teacher _____ explained the lesson is new."',
        options: ['who', 'which', 'whose', 'whom'],
        correct: 0,
      },
      {
        q: '"_____ are you talking to?"',
        options: ['Who', 'Whom', 'Whose', 'Which'],
        correct: 0,
      },
      {
        q: '"The book _____ I borrowed was great."',
        options: ['who', 'whose', 'which', 'whom'],
        correct: 2,
      },
      {
        q: '"They did it by _____." (no one helped)',
        options: ['them', 'themselves', 'their', 'theirs'],
        correct: 1,
      },
    ],
    prepositions: [
      {
        q: '"I will meet you _____ Monday."',
        options: ['in', 'on', 'at', 'by'],
        correct: 1,
      },
      {
        q: '"The meeting starts _____ 9 AM."',
        options: ['in', 'on', 'at', 'for'],
        correct: 2,
      },
      {
        q: '"She has lived here _____ 2019."',
        options: ['since', 'for', 'from', 'at'],
        correct: 0,
      },
      {
        q: '"The cat is hiding _____ the table."',
        options: ['on', 'under', 'at', 'to'],
        correct: 1,
      },
      {
        q: '"We are going _____ vacation next week."',
        options: ['on', 'in', 'at', 'to'],
        correct: 0,
      },
    ],
    commas: [
      {
        q: 'Which sentence uses commas correctly?',
        options: [
          'I bought apples, oranges and, bananas.',
          'I bought apples, oranges, and bananas.',
          'I bought, apples oranges and bananas.',
          'I bought apples oranges, and, bananas.',
        ],
        correct: 1,
      },
      {
        q: 'Which sentence uses a comma correctly with "however"?',
        options: [
          'I was tired, however I kept working.',
          'I was tired however, I kept working.',
          'I was tired; however, I kept working.',
          'I was tired however I kept, working.',
        ],
        correct: 2,
      },
      {
        q: 'Choose the correctly punctuated sentence.',
        options: [
          'My brother, who lives in Yangon is a teacher.',
          'My brother who lives in Yangon, is a teacher.',
          'My brother, who lives in Yangon, is a teacher.',
          'My brother who, lives in Yangon is a teacher.',
        ],
        correct: 2,
      },
      {
        q: 'Choose the correctly punctuated sentence.',
        options: [
          'After the rain stopped, we went outside.',
          'After the rain stopped we, went outside.',
          'After, the rain stopped we went outside.',
          'After the rain, stopped we went outside.',
        ],
        correct: 0,
      },
      {
        q: 'Choose the correctly punctuated sentence.',
        options: [
          'Yes I understand the lesson.',
          'Yes, I understand the lesson.',
          'Yes I, understand the lesson.',
          'Yes understand, I the lesson.',
        ],
        correct: 1,
      },
    ],
  };

  const chipRow = document.getElementById('testCategoryChips');
  const quizQuestionEl = document.getElementById('quizQuestion');
  const quizOptionsEl = document.getElementById('quizOptions');
  const quizCounterEl = document.getElementById('quizCounter');
  const quizProgressFill = document.getElementById('quizProgressFill');
  const quizNextBtn = document.getElementById('quizNextBtn');

  let currentCategory = 'tenses';
  let currentIndex = 0;
  let selectedOption = null;

  function loadQuestion() {
    const set = QUESTION_BANK[currentCategory];
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

  // Initial render
  loadQuestion();

  /* ---------------------------------------------------------
     3. About — reset progress
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
     4. Service Worker registration (offline support)
     --------------------------------------------------------- */

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch((err) => {
        console.warn('Service worker registration failed:', err);
      });
    });
  }
})();
