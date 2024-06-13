// Функция для загрузки JSON из URL

async function fetchJSON(url) {

  const response = await fetch(url);

  const data = await response.json();

  return data;

}



// Функция для проверки совпадения вопроса

function checkQuestion(text, answers) {

  for (let i = 0; i < answers.length; i++) {

    if (text.includes(answers[i].question)) {

      return answers[i].answer;

    }

  }

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

  messageContainer.style.top = '-9999px';

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



// Функция для выполнения парсинга и действий

async function parseAndProcess() {

  const data = await fetchJSON('https://raw.githubusercontent.com/Over1Cloud/soft-club/main/answers.json');

  const textOnPage = document.body.innerText;

  const answer = checkQuestion(textOnPage, data);



  try {

    await processAnswer(answer);

  } catch (error) {

    displayMessage("Ошибка", error);

  }



  // Рекурсивный вызов функции для ожидания следующего вопроса

  await new Promise(resolve => setTimeout(resolve, 0));

  parseAndProcess();

}



// Вызов функции для парсинга и выполнения действий

parseAndProcess();
