document.addEventListener("DOMContentLoaded", () => {
  const switchToggle = document.querySelector("#header_switch-toggle");
  const elipsNight = switchToggle.querySelector(".elips_two");
  const elipsLight = switchToggle.querySelector(".elips.elips_one");
  const elips = switchToggle.querySelector(".elips");
  const itemLi = document.querySelectorAll(
    ".html_quiz-content-options-list-li"
  );
  const wrapperList = document.querySelector(".wellcome_inner-content-list");
  const wellcomeWrapper = document.querySelector(".wellcome_wrapper");
  const quizWrapper = document.querySelector(".html_quiz-wrapper");
  const quizTitle = document.querySelector(".html_quiz-ask-title");
  const questList = document.querySelector(".html_quiz-content-options-list");
  const answerBtn = document.querySelector(".html_quiz-content-options-btn");
  const finishWrapper = document.querySelector(".finish_wrapper");
  const btnPlayAgain = document.querySelector(".finish_content-results-btn");

  let quizesData = [];
  let currentQuiz = null;
  let currentQuestIndex = 0;
  let userAnser = [];
  let ringAnswer = 0;

  const body = document.body;

  // Проверяем, есть ли сохранённая тема в LocalStorage
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme == "night") {
    body.classList.add("nigth-style");
    elipsNight.classList.add("active");
    elipsLight.classList.remove("active");
  }

  // Обработчик переключения темы
  if (switchToggle && elipsNight && elipsLight && elips) {
    switchToggle.addEventListener("click", () => {
      const isNightMode = body.classList.toggle("nigth-style");
      elipsNight.classList.toggle("active");
      elipsLight.classList.toggle("active");

      // Сохраняем выбор пользователя в LocalStorage
      localStorage.setItem("theme", isNightMode ? "night" : "light");
    });
  }

  async function fetchQuizzes() {
    try {
      const response = await fetch(
        "https://dl.dropboxusercontent.com/scl/fi/0qa455rac5ml8ouyd4mjc/data.json?rlkey=hxpapn0qvvdfsqf0bkfgeena9"
      );
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      const data = await response.json();

      quizesData = data.quizzes;

      displayThemes();
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
    }
  }

  fetchQuizzes();

  function displayThemes() {
    quizesData.forEach((quiz, i) => {
      const list = document.createElement("li");
      list.classList.add("wellcome_inner-content-list-li");
      list.innerHTML = `
   <img src=${quiz.icon} alt=">${quiz.title}" class="list_li-img">${quiz.title}
  `;
      list.addEventListener("click", () => startQuiz(i));
      wrapperList.appendChild(list);
    });
    showLangs();
  }
  function showLangs() {
    const headerLengs = document.querySelectorAll(".header_langs");

    quizesData.forEach((quiz, i) => {
      const languag = document.createElement("div");
      languag.classList.add("header_lang-item", "hide");

      languag.innerHTML = `
 <img src=${quiz.icon} alt=">${quiz.title}" class="header_html-item-img">${quiz.title}</>
`;
      languag.dataset.index = i;
      headerLengs.forEach((lang) => {
        lang.appendChild(languag.cloneNode(true));
      });
    });
  }

  function startQuiz(i) {
    currentQuiz = quizesData[i];
    currentQuestIndex = 0;
    wellcomeWrapper.style.display = "none";
    quizWrapper.style.display = "block";
    const headerLangItems = document.querySelectorAll(".header_lang-item");
    headerLangItems.forEach((item) => {
      item.classList.add("hide");
    });
    const headerLang = document.querySelector(".header_langs");
    console.log(headerLang);
    if (headerLang) {
      headerLang.addEventListener("click", () => {
        playAgain();
      });
    } else {
      console.log("not found");
    }
    const selectedLanguage = document.querySelector(
      `.header_lang-item[data-index="${i}"]`
    );
    if (selectedLanguage) {
      selectedLanguage.classList.remove("hide");
    }
    updateQuestion();
  }

  function updateQuestion() {
    const questionData = currentQuiz.questions[currentQuestIndex];

    questList.innerHTML = "";

    // Обновляем заголовок вопроса
    quizTitle.textContent = questionData.question;

    const currentQuestion = document.querySelector("#currentQuestionNumber");
    currentQuestion.textContent = currentQuestIndex + 1;

    const totalQuestion = document.querySelector("#totalQuestionsNumber");
    totalQuestion.textContent = currentQuiz.questions.length;
    // Добавляем новые ответы
    questionData.options.slice(0, 4).forEach((item, index) => {
      const safeOption = item.replace(/</g, "&lt;").replace(/>/g, "&gt;");

      const li = document.createElement("li");
      li.classList.add("html_quiz-content-options-list-li");
      li.innerHTML = `
      <span class="options-list-li-decoration">${String.fromCharCode(
        65 + index
      )}</span>${safeOption}
    `;

      li.addEventListener("click", () => {
        userAnser[currentQuestIndex] = item;
        handleAnsver(li);
        li.dataset.index = index;
      });

      questList.appendChild(li);
    });
  }

  function handleAnsver(selectedElem) {
    const correctAnswer =
      currentQuiz.questions[currentQuestIndex].answer.trim();
    const allOptions = questList.querySelectorAll(
      ".html_quiz-content-options-list-li"
    );

    allOptions.forEach((item) => {
      const optionText = item.textContent.trim().slice(1);

      const span = item.querySelector(".options-list-li-decoration");

      console.log(span);
      if (optionText === correctAnswer) {
        span.classList.add("span_correct");
        item.classList.add("correct");
      }

      if (item === selectedElem && optionText !== correctAnswer) {
        span.classList.add("span_error");
        item.classList.add("error");
      }

      item.style.pointerEvents = "none";
    });
  }

  answerBtn.addEventListener("click", () => {
    if (userAnser[currentQuestIndex] === undefined) {
      let divError = document.querySelector(".div_error");

      if (!divError) {
        divError = document.createElement("div");
        divError.classList.add("div_error");
        divError.textContent = "Please select an answer";
        questList.insertAdjacentElement("afterend", divError);

        setTimeout(() => {
          divError.remove();
        }, 3000);
      } else {
        divError.classList.add("blink");
        setTimeout(() => {
          divError.classList.remove("blink");
        }, 300);
      }

      return;
    }

    const correctAnswer =
      currentQuiz.questions[currentQuestIndex].answer.trim();
    const selectedAnswer = userAnser[currentQuestIndex].toString().trim();

    if (correctAnswer == selectedAnswer) {
      ringAnswer++;
    }

    const divError = document.querySelector(".div_error");
    if (currentQuestIndex < currentQuiz.questions.length - 1) {
      currentQuestIndex++;
      updateQuestion();
      if (divError) {
        divError.remove();
      }
    } else {
      showResults();
      if (divError) {
        divError.remove();
      }
    }
    const progressBar = document.querySelector(".progress_bar");

    const currentWidth = parseFloat(progressBar.style.width || 10);
    progressBar.style.width = `${currentWidth + 10}%`;
  });

  function showResults() {
    quizWrapper.style.display = "none";
    finishWrapper.style.display = "block";

    const display = document.querySelector(
      ".finish_content-results-current-qual"
    );
    display.textContent = ringAnswer;

    const qualAsk = document.querySelector(
      ".finish_content-results-current-of"
    );
    qualAsk.textContent = `out of ${currentQuiz.questions.length}`;
  }

  btnPlayAgain.addEventListener("click", playAgain);

  function playAgain() {
    currentQuiz = null;
    currentQuestIndex = 0;
    userAnser = [];
    ringAnswer = 0;

    quizWrapper.style.display = "none";
    finishWrapper.style.display = "none";
    wellcomeWrapper.style.display = "block";

    const lang = document.querySelectorAll(".header_lang-item");
    lang.forEach((item) => {
      item.classList.add("hide");
    });
    const progressBar = document.querySelector(".progress_bar");

    progressBar.style.width = "10%";
  }
});
