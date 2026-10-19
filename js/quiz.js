
export function showQuestion(question, elements, levelNumber) {
  elements.quizLevelLabel.textContent = "LEVEL " + levelNumber + " COMPLETE";
  elements.questionText.textContent = question.text;
  elements.answerOptions.innerHTML = "";

  const legend = document.createElement("legend");
  legend.textContent = question.type === "multiple"
    ? "Select all that apply"
    : "Choose one answer";
  elements.answerOptions.append(legend);

  question.options.forEach(function (answer, index) {
    const label = document.createElement("label");
    label.className = "answer-option";

    const input = document.createElement("input");
    input.type = question.type === "multiple" ? "checkbox" : "radio";
    input.name = "answer";
    input.value = index;

    input.addEventListener("change", function () {
      const selected = elements.answerOptions.querySelector("input:checked");
      elements.submitAnswer.disabled = !selected;
    });

    label.append(input, document.createTextNode(answer));
    elements.answerOptions.append(label);
  });

  elements.quizFeedback.hidden = true;
  elements.submitAnswer.hidden = false;
  elements.submitAnswer.disabled = true;
  elements.nextButton.hidden = true;
}
export function checkAnswer(question, selectedAnswers) {
  if (selectedAnswers.length !== question.correct.length) {
    return false;
  }

  for (const answer of question.correct) {
    if (!selectedAnswers.includes(answer)) {
      return false;
    }
  }

  return true;
}
export function showQuestionResult(question, elements, selectedAnswers) {
  const correct = checkAnswer(question, selectedAnswers);
  const options = elements.answerOptions.querySelectorAll("label");

  options.forEach(function (label, index) {
    const input = label.querySelector("input");
    input.disabled = true;

    if (question.correct.includes(index) && selectedAnswers.includes(index)) {
      label.classList.add("correct");
    } else if (question.correct.includes(index) && !selectedAnswers.includes(index)) {
      label.classList.add("missed");
    } else if (selectedAnswers.includes(index)) {
      label.classList.add("wrong");
    }
  });

  elements.quizFeedback.textContent = question.explanation;
  elements.quizFeedback.hidden = false;
  elements.submitAnswer.hidden = true;
  elements.nextButton.hidden = false;

  return correct;
}
