// Функция для загрузки JSON из URL
async function fetchJSON(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

function checkQuestion(text, answers) {
  for (let i = 0; i < answers.length; i++) {
    const question = answers[i].question.toLowerCase(); // Преобразуем вопрос в нижний регистр для более гибкого сравнения
    const textLower = text.toLowerCase(); // Преобразуем весь текст вопроса в нижний регистр

    // Если вопрос совпадает точно, возвращаем ответ
    if (textLower.includes(question)) {
      return answers[i].answer;
    }

    // Если вопрос совпадает с небольшой разницей, например, с разницей в 2-3 символа
    if (Math.abs(textLower.length - question.length) <= 3) {
      // Создаем массив символов для вопроса и текста вопроса
      const questionChars = question.split('');
      const textChars = textLower.split('');

      // Сравниваем символы
      let differences = 0;
      for (let j = 0; j < Math.min(questionChars.length, textChars.length); j++) {
        if (questionChars[j] !== textChars[j]) {
          differences++;
        }
      }

      // Если количество различных символов не превышает 3, считаем, что вопрос совпадает
      if (differences <= 3) {
        return answers[i].answer;
      }
    }
  }

  // Если ни один вопрос не совпал, возвращаем null
  return null;
}


// Функция для выполнения действий на основе найденного ответа
function processAnswer(answer) {
  return new Promise((resolve, reject) => {
    if (answer) {
      const answerElement = document.evaluate(`//*[contains(text(), "${answer}")]`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      if (answerElement) {
        const inputElement = answerElement.closest('.choice-view__choice-container').querySelector('input[type="radio"]');
        if (inputElement) {
          inputElement.click();
          inputElement.setAttribute('aria-checked', 'true');
          displayMessage("Ответ найден", "Ответ найден на сайте");
          resolve();
        } else {
          reject("Не удалось найти соответствующий input элемент");
        }
      } else {
        reject("Ответ не найден на сайте");
      }
    } else {
      reject("Ответ не найден в базе данных");
    }
  });
}

// Функция для отображения сообщения на странице
function displayMessage(questionStatus, answerStatus) {
  const messageContainer = document.createElement('div');
  messageContainer.style.position = 'fixed';
  messageContainer.style.top = '10000px';
  messageContainer.style.left = '10px';
  messageContainer.style.padding = '10px';
  messageContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
  messageContainer.style.border = '1px solid #ccc';
  messageContainer.style.zIndex = '9999';
  messageContainer.innerHTML = `
    <p>${questionStatus}</p>
    <p>${answerStatus}</p>
  `;
  document.body.appendChild(messageContainer);
  setTimeout(() => {
    messageContainer.remove();
  }, 3000);
}

function highlightCorrectAnswer(correctAnswer) {
  const answerElement = document.evaluate(`//*[contains(text(), "${correctAnswer}")]`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  if (answerElement) {
    const itemElement = answerElement.closest('.item');
    if (itemElement) {
      itemElement.style.backgroundColor = '#000000'; // Устанавливаем фоновый цвет элемента в черный
      answerElement.style.backgroundImage = 'linear-gradient(91.88deg, rgba(177, 255, 100, 1) 0%, rgba(83, 245, 255, 1) 100%)';
      answerElement.style.webkitBackgroundClip = 'text';
      answerElement.style.webkitTextFillColor = 'transparent';
      answerElement.style.mixBlendMode = 'difference';
      displayMessage("Ответ выделен", "Правильный ответ выделен градиентом");
    } else {
      displayMessage("Ошибка", "Не удалось найти элемент для выделения");
    }
  } else {
    displayMessage("Ошибка", "Правильный ответ не найден на сайте");
  }
}



// Функция для выполнения парсинга и действий
async function parseAndProcess() {
  const data = await fetchJSON('https://raw.githubusercontent.com/Over1Cloud/rostrans/main/answers.json');
  const textOnPage = document.body.innerText;
  const answer = checkQuestion(textOnPage, data);

  try {
    await processAnswer(answer);
  } catch (error) {
    displayMessage("Ошибка", error);

    // Проверка наличия элемента с классом component_base submit mobile
    const submitButton = document.querySelector('.component_base.submit.mobile');
    if (submitButton && answer) {
      highlightCorrectAnswer(answer);
    }
  }

  // Рекурсивный вызов функции для ожидания следующего вопроса
  setTimeout(parseAndProcess, 1000); // Установить задержку в 1 секунду для предотвращения возможных проблем с производительностью
}

// Вызов функции для парсинга и выполнения действий
parseAndProcess();
