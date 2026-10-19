
export function renderReport(levels, parts, elements, passPercent) {
  elements.reportRows.innerHTML = "";

  let correctCount = 0;

  levels.forEach(function (level) {
    const row = document.createElement("tr");

    const levelCell = document.createElement("td");
    levelCell.textContent = level.data.title;

    const triesCell = document.createElement("td");
    triesCell.textContent = level.tries;

    const quizCell = document.createElement("td");
    quizCell.textContent = level.passedQuiz ? "Correct" : "Not correct";

    if (level.passedQuiz) {
      correctCount = correctCount + 1;
    }

    row.append(levelCell, triesCell, quizCell);
    elements.reportRows.append(row);
  });

  const score = Math.round((correctCount / levels.length) * 100);
  elements.finalScore.textContent = score + "% - " +
    (score >= passPercent ? "Passed" : "Keep practising");
    
  elements.conductorList.innerHTML = "";
  elements.insulatorList.innerHTML = "";

  levels.forEach(function (level) {
    level.testedMaterials.forEach(function (partName) {
      const item = document.createElement("li");
      item.textContent = parts[partName].label;

      if (parts[partName].conductor) {
        elements.conductorList.append(item);
      } else {
        elements.insulatorList.append(item);
      }
    });
  });
}
