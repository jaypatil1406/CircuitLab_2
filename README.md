# CircuitLab

A beginner-friendly circuit learning project built with HTML, CSS, JavaScript, JSON and SVG assets.

## Run the project
1. Open this folder in VS Code.
2. Install the Live Server extension if needed.
3. Right-click `index.html` and choose **Open with Live Server**.

The JSON file is loaded using `fetch`, so opening `index.html` directly as a file may not work.

## Folder guide
- `index.html`: page structure
- `css/base.css`: page layout and common styles
- `css/board.css`: circuit board and part styles
- `data/levels.json`: parts, levels, positions and quiz questions
- `js/main.js`: connects the page and runs the game
- `js/board.js`: displays parts and slots
- `js/dataLoader.js`: loads JSON data
- `js/simulation.js`: checks circuits and materials
- `js/quiz.js`: displays questions and checks answers
- `js/report.js`: displays final results
- `assets/`: simple SVG images used by the project
