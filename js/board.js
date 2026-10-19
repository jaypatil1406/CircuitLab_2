
export class Level {
  constructor(levelData) {
    this.data = levelData;
    this.placedParts = new Map();
    this.tries = 0;
    this.passedQuiz = false;
    this.circuitPassed = false;
    this.switchOn = false;
    this.switchWasOn = false;
    this.testedMaterials = [];
  }

  get isComplete() {
    return this.data.slots.every((slot) => this.placedParts.has(slot.id));
  }
}

function makePart(part) {
  const image = document.createElement("img");
  image.src = part.icon;
  image.alt = "";
  image.className = "part-icon";

  const label = document.createElement("span");
  label.textContent = part.label;

  const box = document.createElement("span");
  box.append(image, label);
  return box;
}

export function drawPalette(level, parts, elements, startDrag) {
  elements.palette.innerHTML = "";

  level.data.palette.forEach(function (partName) {
    const part = parts[partName];
    const button = document.createElement("button");

    button.type = "button";
    button.className = "part-card";
    button.append(makePart(part));

    button.addEventListener("mousedown", function (event) {
      startDrag(event, partName, button);
    });

    elements.palette.append(button);
  });
}

export function drawSlots(level, parts, elements, removePart) {
  elements.slots.innerHTML = "";

  level.data.slots.forEach(function (slot) {
    const box = document.createElement("div");
    box.className = "slot";
    box.dataset.slot = slot.id;
    box.style.left = slot.x + "%";
    box.style.top = slot.y + "%";

    const partName = level.placedParts.get(slot.id);

    if (partName) {
      const part = parts[partName];
      box.append(makePart(part));

      if (!level.data.testGap) {
        const removeButton = document.createElement("button");
        removeButton.textContent = "×";
        removeButton.className = "remove-part";
        removeButton.setAttribute("aria-label", "Remove " + part.label);

        removeButton.addEventListener("click", function () {
          removePart(slot.id);
        });

        box.append(removeButton);
      }
    } else {
      box.textContent = slot.label;
    }

    elements.slots.append(box);
  });
}


  
   
        
