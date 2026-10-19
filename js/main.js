
import { loadLabData } from "./dataLoader.js";
import { Level, drawPalette, drawSlots } from "./board.js";
import { checkCircuit, classifyMaterial } from "./simulation.js";
import { showQuestion, showQuestionResult } from "./quiz.js";
import { renderReport } from "./report.js";

function getElement(id) {
  return document.getElementById(id);
}

const page = {
  title: getElement("appTitle"),
  levelNav: getElement("levelNav"),
  labScreen: getElement("labScreen"),
  palette: getElement("palette"),
  slots: getElement("slots"),
  board: getElement("board"),
  levelTitle: getElement("levelTitle"),
  levelGoal: getElement("levelGoal"),
  status: getElement("statusMessage"),
  tries: getElement("triesCount"),
  testButton: getElement("testButton"),
  quizButton: getElement("quizButton"),
  resetButton: getElement("resetLevelButton"),
  reportButton: getElement("reportButton"),
  switchArea: getElement("switchArea"),
  materialProgress: getElement("materialProgress"),
  quizScreen: getElement("quizScreen"),
  answerOptions: getElement("answerOptions"),
  quizLevelLabel: getElement("quizLevelLabel"),
  questionText: getElement("questionText"),
  quizFeedback: getElement("quizFeedback"),
  submitAnswer: getElement("submitAnswer"),
  nextButton: getElement("nextButton"),
  reportScreen: getElement("reportScreen"),
  reportRows: getElement("reportRows"),
  finalScore: getElement("finalScore"),
  conductorList: getElement("conductorList"),
  insulatorList: getElement("insulatorList"),
  errorMessage: getElement("errorMessage"),
  helpDialog: getElement("helpDialog")
};

let appData;
let levels = [];
let currentLevelNumber = 0;
let draggedPart = "";
let dragPreview = null;

function showStatus(message, type) {
  page.status.textContent = message;
  page.status.className = "message " + (type || "");
}

function getCurrentLevel() {
  return levels[currentLevelNumber];
}

function showLevelButtons() {
  page.levelNav.innerHTML = "";

  levels.forEach(function (level, index) {
    const listItem = document.createElement("li");
    const button = document.createElement("button");

    button.textContent = "Level " + level.data.id;

    if (index === currentLevelNumber) {
      button.className = "active";
    }

    if (index > 0 && !levels[index - 1].passedQuiz) {
      button.disabled = true;
    }

    button.addEventListener("click", function () {
      openLevel(index);
    });

    listItem.appendChild(button);
    page.levelNav.appendChild(listItem);
  });
}

function drawLevel() {
  const level = getCurrentLevel();

  page.title.textContent = appData.app.title;

  page.levelTitle.textContent =
    "Level " + level.data.id + " - " + level.data.title;

  page.levelGoal.textContent = level.data.goal;
  page.tries.textContent = level.tries;

  drawPalette(level, appData.parts, page, startDragging);
  drawSlots(level, appData.parts, page, removePart);


  page.testButton.hidden = Boolean(level.data.testGap);
  page.testButton.disabled = !level.isComplete;

  page.quizButton.hidden = false;
  page.quizButton.disabled = !level.circuitPassed;


  if (level.data.testGap) {
    const allMaterialsTested =
      level.testedMaterials.length === level.data.palette.length;

    page.quizButton.hidden = !allMaterialsTested;
    page.quizButton.disabled = !allMaterialsTested;
  }

  page.reportButton.hidden = true;

  showLevelButtons();
  showSwitchButton();
  showMaterialCount();
  showFixedParts();
}

function showFixedParts() {
  const level = getCurrentLevel();
  let fixedArea = getElement("fixedParts");

  if (!fixedArea) {
    fixedArea = document.createElement("div");
    fixedArea.id = "fixedParts";
    page.board.appendChild(fixedArea);
  }

  fixedArea.innerHTML = "";

  if (!level.data.testGap) {
    return;
  }
  const fixedNames = ["battery", "bulb", "wire"];

  const positions = [
    { x: "18%", y: "50%" },
    { x: "50%", y: "22%" },
    { x: "82%", y: "50%" }
  ];

  fixedNames.forEach(function (partName, index) {
    const part = appData.parts[partName];

    const box = document.createElement("div");
    box.className = "fixed-part";

    box.style.left = positions[index].x;
    box.style.top = positions[index].y;

    const image = document.createElement("img");
    image.src = part.icon;
    image.alt = "";
    image.className = "part-icon";

    const label = document.createElement("span");
    label.textContent = part.label;

    box.appendChild(image);
    box.appendChild(label);
    fixedArea.appendChild(box);
  });

  const materialName = level.placedParts.get("gap");

  if (materialName) {
    const part = appData.parts[materialName];

    const box = document.createElement("div");
    box.className = "fixed-part";
    box.style.left = "50%";
    box.style.top = "78%";

    const image = document.createElement("img");
    image.src = part.icon;
    image.alt = "";
    image.className = "part-icon";

    const label = document.createElement("span");
    label.textContent = part.label;

    box.appendChild(image);
    box.appendChild(label);
    fixedArea.appendChild(box);

    const conducts = classifyMaterial(materialName, appData.parts);

    page.board.classList.toggle("bulb-on", conducts);
    page.board.classList.toggle("current-on", conducts);
  } else {
    page.board.classList.remove("bulb-on");
    page.board.classList.remove("current-on");
  }
}

function showSwitchButton() {
  const level = getCurrentLevel();

  page.switchArea.innerHTML = "";

  if (level.data.id !== 2 || !level.isComplete) {
    return;
  }

  const button = document.createElement("button");

  if (level.switchOn) {
    button.textContent = "Switch ON";
  } else {
    button.textContent = "Switch OFF";
  }

  button.addEventListener("click", function () {
    
    level.switchOn = !level.switchOn;

    if (level.switchOn) {
      level.switchWasOn = true;
      showStatus("The bulb is on.", "success");
    } else {
      showStatus("The bulb is off.");
    }

    page.board.classList.toggle("bulb-on", level.switchOn);
    page.board.classList.toggle("current-on", level.switchOn);

    page.quizButton.disabled = !level.switchWasOn;

    showSwitchButton();
  });

  page.switchArea.appendChild(button);
}

function showMaterialCount() {
  const level = getCurrentLevel();

  page.materialProgress.innerHTML = "";

  if (!level.data.testGap) {
    return;
  }

  const text = document.createElement("p");

  text.textContent =
    "Materials tested: " +
    level.testedMaterials.length +
    " of " +
    level.data.palette.length;

  const progress = document.createElement("progress");

  progress.max = level.data.palette.length;
  progress.value = level.testedMaterials.length;

  page.materialProgress.appendChild(text);
  page.materialProgress.appendChild(progress);
}

// Start dragging a part from the palette
function startDragging(event, partName) {
  const level = getCurrentLevel();

  // Do not drag a part that is already placed
  for (const part of level.placedParts.values()) {
    if (part === partName) {
      return;
    }
  }

  if (
    level.data.testGap &&
    level.testedMaterials.includes(partName)
  ) {
    return;
  }

  draggedPart = partName;

  const part = appData.parts[partName];
  dragPreview = document.createElement("div");
  dragPreview.className = "drag-preview";

  const image = document.createElement("img");
  image.src = part.icon;
  image.alt = "";
  image.className = "part-icon";

  const label = document.createElement("span");
  label.textContent = part.label;

  dragPreview.append(image, label);
  document.body.appendChild(dragPreview);


  moveDragging(event);

  document.addEventListener("mousemove", moveDragging);

  document.addEventListener("mouseup", stopDragging);

  event.preventDefault();
}

function moveDragging(event) {
  if (dragPreview !== null) {
    dragPreview.style.left = event.clientX + 12 + "px";
    dragPreview.style.top = event.clientY + 12 + "px";
  }
}
function stopDragging(event) {
  if (draggedPart === "") {
    return;
  }

  const level = getCurrentLevel();
  const slots = page.slots.querySelectorAll(".slot");
  let targetSlot = null;

  slots.forEach(function (slot) {
    const box = slot.getBoundingClientRect();

    if (
      event.clientX >= box.left &&
      event.clientX <= box.right &&
      event.clientY >= box.top &&
      event.clientY <= box.bottom
    ) {
      targetSlot = slot;
    }
  });

  if (targetSlot !== null) {
    const slotId = targetSlot.dataset.slot;

    if (level.data.testGap) {
      level.placedParts.set(slotId, draggedPart);

      if (!level.testedMaterials.includes(draggedPart)) {
        level.testedMaterials.push(draggedPart);
      }

      const conducts = classifyMaterial(draggedPart, appData.parts);
      const partLabel = appData.parts[draggedPart].label;

      if (conducts) {
        showStatus(partLabel + " conducts electricity.", "success");
      } else {
        showStatus(partLabel + " is an insulator.", "warning");
      }
    } else {
    
      level.placedParts.forEach(function (part, oldSlotId) {
        if (part === draggedPart) {
          level.placedParts.delete(oldSlotId);
        }
      });


      level.placedParts.set(slotId, draggedPart);
      showStatus(appData.parts[draggedPart].label + " placed.");
    }
  } else {
    showStatus("Drop the part inside a dotted slot.", "warning");
  }

  draggedPart = "";
  document.removeEventListener("mousemove", moveDragging);
  document.removeEventListener("mouseup", stopDragging);

  if (dragPreview !== null) {
    dragPreview.remove();
    dragPreview = null;
  }

  drawLevel();
}

function removePart(slotId) {
  const level = getCurrentLevel();

  level.placedParts.delete(slotId);

  showStatus("Part removed.");

  drawLevel();
}

function testCircuit() {
  const level = getCurrentLevel();

  level.tries = level.tries + 1;

  const result = checkCircuit(level);

  if (result.correct) {
    showStatus(result.message, "success");

    page.board.classList.add("bulb-on");
    page.board.classList.add("current-on");

    level.circuitPassed = true;

    page.quizButton.disabled = false;

    document.dispatchEvent(new CustomEvent("levelComplete"));
  } else {
    showStatus(result.message, "error");

    const slot = page.slots.querySelector(
      '[data-slot="' + result.slot.id + '"]'
    );

    if (slot) {
      slot.classList.add("fault");
    }
  }

  page.tries.textContent = level.tries;
}

function openLevel(index) {
  currentLevelNumber = index;

  page.labScreen.hidden = false;
  page.quizScreen.hidden = true;
  page.reportScreen.hidden = true;

  showStatus("Place all parts, then test the circuit.");

  drawLevel();
}

function openQuiz() {
  const level = getCurrentLevel();

  if (level.data.id === 2 && !level.switchWasOn) {
    showStatus(
      "Turn the switch on at least once first.",
      "warning"
    );
    return;
  }

  if (
    level.data.testGap &&
    level.testedMaterials.length < level.data.palette.length
  ) {
    showStatus("Test all five materials first.", "warning");
    return;
  }

  page.labScreen.hidden = true;
  page.reportScreen.hidden = true;
  page.quizScreen.hidden = false;

  showQuestion(level.data.question, page, level.data.id);
}

function submitQuiz() {
  const level = getCurrentLevel();

  const inputs =
    page.answerOptions.querySelectorAll("input:checked");

  const selectedAnswers = [];

  inputs.forEach(function (input) {
    selectedAnswers.push(Number(input.value));
  });

  level.passedQuiz = showQuestionResult(
    level.data.question,
    page,
    selectedAnswers
  );

  showLevelButtons();
}

function continueFromQuiz() {
  if (currentLevelNumber < levels.length - 1) {
    openLevel(currentLevelNumber + 1);
  } else {
    page.quizScreen.hidden = true;
    page.reportScreen.hidden = false;

    renderReport(
      levels,
      appData.parts,
      page,
      appData.app.passPercent
    );
  }
}

function resetCurrentLevel() {
  const level = getCurrentLevel();

  level.placedParts.clear();
  level.tries = 0;
  level.passedQuiz = false;
  level.circuitPassed = false;
  level.switchOn = false;
  level.switchWasOn = false;
  level.testedMaterials = [];

  page.board.classList.remove("bulb-on");
  page.board.classList.remove("current-on");

  showStatus("Level reset.");

  drawLevel();
}

function restartLab() {
  levels = appData.levels.map(function (levelData) {
    return new Level(levelData);
  });

  openLevel(0);
}

async function startApp() {
  try {

    appData = await loadLabData();

    levels = appData.levels.map(function (levelData) {
      return new Level(levelData);
    });

    page.helpDialog.showModal();

    getElement("startButton").addEventListener("click", function () {
      page.helpDialog.close();
    });

    getElement("helpButton").addEventListener("click", function () {
      page.helpDialog.showModal();
    });

    page.testButton.addEventListener("click", testCircuit);
    page.quizButton.addEventListener("click", openQuiz);
    page.submitAnswer.addEventListener("click", submitQuiz);
    page.nextButton.addEventListener("click", continueFromQuiz);
    page.resetButton.addEventListener("click", resetCurrentLevel);

    page.reportButton.addEventListener("click", function () {
      page.labScreen.hidden = true;
      page.reportScreen.hidden = false;

      renderReport(
        levels,
        appData.parts,
        page,
        appData.app.passPercent
      );
    });

    getElement("restartButton").addEventListener("click", restartLab);

    document.addEventListener("levelComplete", function () {
      showStatus(
        "Circuit passed. Now answer the question.",
        "success"
      );
    });

    openLevel(0);
  } catch (error) {
    page.errorMessage.hidden = false;
    page.errorMessage.textContent = error.message;
  }
}
startApp();
