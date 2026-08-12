# Minesweeper Game

A modern, web-based implementation of the classic Minesweeper game built with HTML, CSS, and vanilla JavaScript.

## Features

- **3 Difficulty Levels**: Easy (9x9), Medium (16x16), and Hard (30x16).
- **First-Click Safety**: Your first click will never be a mine.
- **Theme Toggle**: Switch between Dark Mode and Light Mode.
- **Bilingual (i18n)**: Fully supports both English and Persian (RTL/LTR) languages.
- **Responsive Design**: Playable on both desktop and mobile devices.
- **Persistent Settings**: Your theme and language preferences are saved in your browser's local storage.

## How to Play

1. **Left-Click (or tap)** an empty square to reveal it. 
2. **Right-Click (or long-press)** on a square to place a flag where you think a mine is located.
3. The number on a revealed square shows how many mines are adjacent to it (in all 8 directions).
4. Use logic to figure out where all the mines are.
5. You win the game when you have successfully revealed all squares that do not contain a mine.
6. If you click on a mine, you lose!

## How to Download and Run

**Online play:** you can play the game online on this page: https://amirmoyousefvand.github.io/MineSweeper/

**Offline play:** No installation, build steps, or servers are required to run this game!

1. Clone or download this repository to your local machine:
   ```bash
   git clone https://github.com/AmirMoYousefVand/minesweeper.git
   ```
2. Navigate to the downloaded folder.
3. Simply double-click the `index.html` file to open it in your default web browser (Chrome, Firefox, Safari, Edge, etc.).
4. Enjoy the game!

## Technologies Used

- HTML5
- CSS3 (CSS Variables, Flexbox, CSS Grid)
- Vanilla JavaScript
- FontAwesome (for icons)
- Vazirmatn Font (for Persian typography)