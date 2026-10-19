
export async function loadLabData() {
  try {
    const response = await fetch("data/levels.json");

    if (!response.ok) {
      throw new Error("JSON file was not found.");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error("Could not load levels.json. Please use Live Server.");
  }
}
