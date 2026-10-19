
export function checkCircuit(level) {
  for (const slot of level.data.slots) {
    const partName = level.placedParts.get(slot.id);

    if (partName !== slot.accepts) {
      return {
        correct: false,
        slot: slot,
        message: slot.errorMsg
      };
    }
  }

  return {
    correct: true,
    message: level.data.successMsg
  };
}
export function classifyMaterial(partName, parts) {
  return parts[partName].conductor;
}
