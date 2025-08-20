// Gameboard

applySettings();

const grid = document.querySelector(".grid");

// Intitialize gameboard

const gameContainer = document.getElementById("gameBoard");

for (let i = 0; i < 210; i++) {
  const newDiv = document.createElement("div");

  if (i >= 200) {
    newDiv.classList.add("taken");
  }

  gameContainer.appendChild(newDiv);
}

// Array of all divs/squares inside gameboard

let squares = Array.from(document.querySelectorAll(".grid div"));

// array of all divs/squares indsise displayShape

let displaySquares = Array.from(document.querySelectorAll(".mini-grid div"));

// Score, Level and Time displays. Start/Pause buttons

const levelDisplay = document.querySelectorAll("#level, #level2");

const scoreDisplay = document.querySelectorAll("#score, #score2");

const startBtn = document.querySelectorAll("#start, #start2");

const linesDisplay = document.querySelectorAll("#lines2");

//  Game performance

const fpsCounter = document.getElementById("fpsCounter");

const frameTimeCounter = document.getElementById("frameTime");

const memoryCounter = document.getElementById("memory");

const logicCounter = document.getElementById("logic");

// Tetromino Colors

const colors = ["orange", "red", "purple", "green", "blue"];

// Music

const backgroundMusic = document.getElementById("backgroundMusic");

const hit = document.getElementById("hit");

const levelChange = document.getElementById("levelChange");

const volumeControl = document.getElementById("volumeControl");

const gameEndMusic = document.getElementById("gameEndMusic");

const tetris = document.getElementById("tetris");

let savedVolume = localStorage.getItem("volume") || volumeControl.value;

// pause, gameover

let isPaused;
let isGameOver;
let isStartGame;
let isAnimating = false;

// async function. When you add "await spleep(ms)" in function it stops at the given time and continues after that. This is used with animations.

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

//The Tetrominoes and rotations. One array is rotation

const width = 10; // width of the gameboard. 10 squares/div elements

// each number represents index in gameboard and shape is drawn to these. from the start of the gameboard.

const lTetromino = [
  [1, width + 1, width * 2 + 1, 2],
  [width, width + 1, width + 2, width * 2 + 2],
  [1, width + 1, width * 2 + 1, width * 2],
  [width, width * 2, width * 2 + 1, width * 2 + 2],
];

const zTetromino = [
  [0, width, width + 1, width * 2 + 1],
  [width + 1, width + 2, width * 2, width * 2 + 1],
  [0, width, width + 1, width * 2 + 1],
  [width + 1, width + 2, width * 2, width * 2 + 1],
];

const tTetromino = [
  [1, width, width + 1, width + 2],
  [1, width + 1, width + 2, width * 2 + 1],
  [width, width + 1, width + 2, width * 2 + 1],
  [1, width, width + 1, width * 2 + 1],
];

const oTetromino = [
  [0, 1, width, width + 1],
  [0, 1, width, width + 1],
  [0, 1, width, width + 1],
  [0, 1, width, width + 1],
];

const iTetromino = [
  [1, width + 1, width * 2 + 1, width * 3 + 1],
  [width, width + 1, width + 2, width + 3],
  [1, width + 1, width * 2 + 1, width * 3 + 1],
  [width, width + 1, width + 2, width + 3],
];

const theTetrominoes = [
  lTetromino,
  zTetromino,
  tTetromino,
  oTetromino,
  iTetromino,
];

// draw random tetromino variables

let currentPosition = 4;
let currentRotation = 0;
let nextRandom = 0;

let random = Math.floor(Math.random() * theTetrominoes.length); // pick one random numeber and max is tetromino rotations length

let current = theTetrominoes[random][currentRotation]; // Pick one random tetromino and its first rotation

// Game loop. requesAnimationFrame variables

let lastTime = 0; // Pervious time when update happenend
let dropInterval = 1000; // Drop happens every 1000 ms
let dropCounter = 0; // Keeps track of how much time has passed since the last drop.
let animationId; // This stores the id that requestAnimationFrame returns
let moveLeftCounter;
let moveRightCounter;
let moveDownCounter;
const initialDealy = 120;
const moveRepeatInterval = 30;

let timeStart = performance.now();
let frameCount = 0;
let fps = 0;
let frameTimes = [];

// Game loop. requesAnimationFrame

function update(time = 0) {
  const deltaTime = time - lastTime; // how much time passed since last update
  lastTime = time; // update last time to the current time for next round
  dropCounter += deltaTime; // adding up all times till it reaches 1000 ms

  performanceMeasurements(time, deltaTime);
  handleInput(deltaTime);

  if (dropCounter > dropInterval) {
    // when enough time passes 1000ms it will move down
    moveDown();
    dropCounter = 0; // reset the counter and start counting again
  }

  draw();

  animationId = requestAnimationFrame(update);
}

function handleInput(deltaTime) {
  if (keys.left) {
    moveLeftCounter += deltaTime;
    if (moveLeftCounter > initialDealy) {
      moveLeft();
      moveLeftCounter = initialDealy - moveRepeatInterval;
    }
  } else {
    moveLeftCounter = 0;
  }

  if (keys.right) {
    moveRightCounter += deltaTime;
    if (moveRightCounter > initialDealy) {
      moveRight();
      moveRightCounter = initialDealy - moveRepeatInterval;
    }
  } else {
    moveRightCounter = 0;
  }

  if (keys.down) {
    moveDownCounter += deltaTime;
    if (moveDownCounter > initialDealy) {
      moveDown();
      moveDownCounter = initialDealy - moveRepeatInterval;
    }
  } else {
    moveDownCounter = 0;
  }
}

// Performance measurements

function performanceMeasurements(time, deltaTime) {
  const logicStart = performance.now();

  frameTimes.push(deltaTime);
  if (frameTimes.length > 60) {
    frameTimes.shift();
  }

  const averageFrameTime = (
    frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length
  ).toFixed(1);

  frameCount++;
  if (time - timeStart >= 1000) {
    fps = frameCount;
    frameCount = 0;
    timeStart = time;

    if (performance.memory) {
      const usedMB = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
      memory.innerHTML = usedMB;
    }
  }

  fpsCounter.innerHTML = fps;
  frameTimeCounter.innerHTML = averageFrameTime;
  const logicEnd = performance.now();

  const logicTime = (logicEnd - logicStart).toFixed(2);
  logicCounter.innerHTML = logicTime;
}

// draw random tetromino and its firts rotation

function draw() {
  if (isAnimating) return; // If animation is happening return

  ghostDraw(); // Draw ghost tetromino

  //  Add tetromino class to all squares/divs where the tetromino should be drawn, with random background color

  current.forEach((index) => {
    squares[currentPosition + index].classList.add("tetromino");
    squares[currentPosition + index].style.backgroundColor = colors[random];
  });
}

//undraw the Tetromino

function undraw() {
  undrawGhost(); // undraw ghost tetromino
  // Removwe tetromino class from all squares/divs, and clear background color.

  current.forEach((index) => {
    squares[currentPosition + index].classList.remove("tetromino");
    squares[currentPosition + index].style.backgroundColor = "";
  });
}

// Draw ghost tetromino where tetromino is going to land

function ghostDraw() {
  let ghostPosition = currentPosition; // Ghost position is same where the tetromino starts

  // Loop through as long as some part of the current tetromino is not touching taken square/div.

  while (
    !current.some((index) =>
      squares[ghostPosition + index + width].classList.contains("taken")
    )
  ) {
    ghostPosition += width; // then add 10 index to next ghost position
  }

  // Add ghost-tetromino class to all squares/divs where the ghost tetromino should be drawn.

  current.forEach((index) => {
    squares[ghostPosition + index].classList.add("ghost-tetromino");
  });
}

// undraw ghost tetromino

function undrawGhost() {
  let ghostPosition = currentPosition;
  while (
    !current.some((index) =>
      squares[ghostPosition + index + width].classList.contains("taken")
    )
  ) {
    ghostPosition += width;
  }
  current.forEach((index) => {
    squares[ghostPosition + index].classList.remove("ghost-tetromino");
  });
}

function undrawAll() {
  undraw();
  undrawGhost();
}

//freeze function. Freezes the tetromino in its place.

async function freeze() {
  if (isAnimating) return;
  isAnimating = true;

  current.forEach((index) => {
    let currentSquare = squares[currentPosition + index];
    currentSquare.classList.add("taken");
    currentSquare.classList.add("hit");
  });

  hit.volume = savedVolume * 0.3;
  hit.play();
  undrawGhost();
  await sleep(200);

  current.forEach((index) => {
    squares[currentPosition + index].classList.remove("hit");
  });

  random = nextRandom;
  nextRandom = Math.floor(Math.random() * theTetrominoes.length);
  current = theTetrominoes[random][currentRotation];
  currentPosition = 4;

  isAnimating = false;

  addScore();
  draw();
  displayShape();
  gameOver();
  updateGlowColor();
}

//add score if you get a full row and score depending how many full rows you get.

let score = 0;
let linesCleared = 0;
let linesToNextLevel = 10;

async function addScore() {
  let rowsCleared = 0;

  for (let i = 0; i < 199; i += width) {
    const row = [
      i,
      i + 1,
      i + 2,
      i + 3,
      i + 4,
      i + 5,
      i + 6,
      i + 7,
      i + 8,
      i + 9,
    ];

    if (row.every((index) => squares[index].classList.contains("taken"))) {
      rowsCleared++;
      linesCleared++;

      hit.volume = 0;
      full.currentTime = 0;
      full.play();
      isAnimating = true;

      row.forEach((index) => {
        squares[index].classList.add("full-row");
      });

      await sleep(500);

      isAnimating = false;

      row.forEach((index) => {
        squares[index].classList.remove("taken", "tetromino", "full-row");
        squares[index].style.backgroundColor = "";
      });
      const squaresRemoved = squares.splice(i, width);
      squares = squaresRemoved.concat(squares);
      squares.forEach((cell) => grid.appendChild(cell));
    }
  }
  if (rowsCleared == 4) {
    tetris.play();
    score += 1200;
  } else if (rowsCleared == 3) {
    score += 300;
  } else if (rowsCleared == 2) {
    score += 100;
  } else if (rowsCleared == 1) {
    score += 40;
  }
  scoreDisplay.forEach((display) => (display.innerHTML = score));
  linesDisplay.forEach((display) => (display.innerHTML = linesCleared));

  if (linesCleared >= level * linesToNextLevel) {
    await addLevel();
  }
}

//Game Movement

//mmove down function

function moveDown() {
  if (isPaused || isGameOver || !isStartGame || isAnimating) return;

  if (
    current.some((index) =>
      squares[currentPosition + index + width].classList.contains("taken")
    )
  ) {
    freeze();
    return;
  }

  undrawAll();
  currentPosition += width;
  draw();
}

// move the tetromino left, unless it is at the edge or there is blockage

function moveLeft() {
  if (isPaused || isGameOver || !isStartGame || isAnimating) return;

  undrawAll();
  const isAtLeftEdge = current.some(
    (index) => (currentPosition + index) % width === 0
  );

  if (!isAtLeftEdge) currentPosition -= 1;

  if (
    current.some((index) =>
      squares[currentPosition + index].classList.contains("taken")
    )
  ) {
    currentPosition += 1;
  }

  draw();
}

// Move the tetromino right, unless is at the edge or there is blockage

function moveRight() {
  if (isPaused || isGameOver || !isStartGame || isAnimating) return;

  undrawAll();

  const isAtRightEdge = current.some(
    (index) => (currentPosition + index) % width === 9
  );

  if (!isAtRightEdge) currentPosition += 1;

  if (
    current.some((index) =>
      squares[currentPosition + index].classList.contains("taken")
    )
  ) {
    currentPosition -= 1;
  }

  draw();
}

// rotate the tetromino

function rotate() {
  if (isPaused || isGameOver || !isStartGame || isAnimating) return;

  undrawAll();

  let nextRotation = (currentRotation + 1) % current.length; // Determine the next rotation index
  let nextTetromino = theTetrominoes[random][nextRotation]; // Get the next rotation shape

  // Check if the rotation is valid

  const isValid = nextTetromino.some((index) => {
    const newPosition = currentPosition + index;
    const position = newPosition % width;
    const isAtLeftEdge = position === 0;
    const isAtRightEdge = position === width - 1;

    if (isAtLeftEdge && index % width > 0) {
      // Checks if it's on the left edge and the part of the tetromino is not the first block
      return true;
    }
    if (isAtRightEdge) {
      // Checks if any part of the tetromino after rotation will exceed the right edge
      return nextTetromino.some(
        (index) => (currentPosition + index) % width === 0
      );
    }

    if (squares[newPosition]?.classList.contains("taken")) {
      return true;
    }

    return false;
  });

  // Apply the rotation if it's valid
  if (!isValid) {
    currentRotation = nextRotation;
    current = nextTetromino;
  }

  draw(); //
}

// Move Fast Down functio and leave animation behind when falling.

async function moveDownFast() {
  if (isPaused || isGameOver || !isStartGame || isAnimating) return;

  undrawAll();

  let newPosition = currentPosition;
  while (
    !current.some((index) =>
      squares[newPosition + index + width].classList.contains("taken")
    )
  ) {
    newPosition += width;
  }

  let position = currentPosition;
  while (position < newPosition) {
    current.forEach((index) => {
      const trailSquare = squares[position + index];
      const trailDiv = document.createElement("div");
      trailDiv.style.backgroundColor = colors[random];
      trailDiv.className = "tetromino-trail";
      trailSquare.appendChild(trailDiv);
    });
    position += width;
  }

  currentPosition = newPosition;
  current.forEach((index) => {
    squares[currentPosition + index].classList.add("tetromino");
    squares[currentPosition + index].style.backgroundColor = colors[random];
  });

  await freeze();

  squares.forEach((square) => {
    while (square.firstChild) {
      square.removeChild(square.firstChild);
    }
  });
}

// Functions for tetrominoes move continiously when key is pushed down

const keys = {
  left: false,
  right: false,
  down: false,
  rotate: false,
  moveDownFast: false,
};

document.addEventListener("keydown", (e) => {
  if (isPaused || isAnimating) return;
  if (e.keyCode === 40 && !keys.down) {
    keys.down = true;
    moveDown();
  } else if (e.keyCode === 39 && !keys.right) {
    moveRight();
    keys.right = true;
  } else if (e.keyCode === 37 && !keys.left) {
    moveLeft();
    keys.left = true;
  } else if (e.keyCode === 16) {
    moveDownFast();
    keys.moveDownFast = true;
  } else if (e.keyCode === 38 && !keys.rotate) {
    keys.rotate = true;
    rotate();
  }
});

document.addEventListener("keyup", (e) => {
  if (e.keyCode === 40) {
    keys.down = false;
  } else if (e.keyCode === 39) {
    keys.right = false;
  } else if (e.keyCode === 37) {
    keys.left = false;
  } else if (e.keyCode === 16) {
    keys.moveDownFast = false;
  } else if (e.keyCode === 38) {
    keys.rotate = false;
  }
});

// Movement for mobile by touching

let startX = 0;
let startY = 0;

let touchStartTime = 0;
let touchStartX = 0;
let touchStartY = 0;

// Save coordinates when touch starts
document.addEventListener(
  "touchstart",
  (e) => {
    if (!isInteractiveElement(e.target)) {
      e.preventDefault(); // Prevent the default movements like scrolling, page reload etc.. While moving
    }
    if (isPaused) return;
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    touchStartTime = new Date().getTime();
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  },
  { passive: false }
);

// Follow the movement of finger
document.addEventListener(
  "touchmove",
  (e) => {
    if (!isInteractiveElement(e.target)) {
      e.preventDefault();
    }
    if (isPaused) return;

    const touch = e.touches[0];
    const currentX = touch.clientX;
    const currentY = touch.clientY;

    // Count the direction of move
    const diffX = currentX - startX;
    const diffY = currentY - startY;

    // Movement direction
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 30) {
        moveRight();
        startX = currentX;
      } else if (diffX < -30) {
        moveLeft();
        startX = currentX;
      }
    } else {
      if (diffY > 30) {
        moveDown();
        startY = currentY;
      }
    }
  },
  { passive: false }
);

// When you tap screen it rotates Tetromnino
document.addEventListener("touchend", (e) => {
  if (isInteractiveElement(e.target)) return;
  if (isPaused) return;
  const touchEndTime = new Date().getTime();
  const touchDuration = touchEndTime - touchStartTime;

  const touch = e.changedTouches[0];
  const touchEndX = touch.clientX;
  const touchEndY = touch.clientY;

  const diffX = Math.abs(touchEndX - touchStartX);
  const diffY = Math.abs(touchEndY - touchStartY);

  // Move down fast if swipe is fast down

  if (diffY > 50 && Math.abs(diffX) < 30 && touchDuration < 300) {
    moveDownFast();
  }
  // If touch is small and short it is counted as rotate
  else if (
    touchDuration < 200 &&
    Math.abs(diffX) < 10 &&
    Math.abs(diffY) < 10
  ) {
    rotate();
  }
});

//show up next tetromino in mini grid

const displayWidth = 4;
let displayIndex = 0;

// The tetrominoes without rotations

const upNextTetrominoes = [
  [1, displayWidth + 1, displayWidth * 2 + 1, 2], //lTetromino
  [0, displayWidth, displayWidth + 1, displayWidth * 2 + 1], //zTetromino
  [1, displayWidth, displayWidth + 1, displayWidth + 2], //tTetromino
  [0, 1, displayWidth, displayWidth + 1], //oTetromino
  [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1], //iTetromino
];

// Display the shape in the mini-grid display

function displayShape() {
  displaySquares.forEach((square) => {
    square.classList.remove("tetromino");
    square.style.backgroundColor = "";
  });

  const miniGrids = document.querySelectorAll(".mini-grid");

  miniGrids.forEach((grid) => {
    const gridSquares = Array.from(grid.querySelectorAll("div"));

    upNextTetrominoes[nextRandom].forEach((index) => {
      if (gridSquares[displayIndex + index]) {
        gridSquares[displayIndex + index].classList.add("tetromino");
        gridSquares[displayIndex + index].style.backgroundColor =
          colors[nextRandom];
      }
    });
  });
}

//Add start and pause for the game

startBtn.forEach((startBtn) => {
  startBtn.addEventListener("click", () => {
    if (isAnimating) return;
    if (animationId) {
      pauseGame();
    } else {
      startGame();
    }
  });
});

// Game Over

const menu2 = document.querySelector(".menu2");
const gameEnd = document.querySelector(".gameEnd");

function gameOver() {
  if (
    current.some((index) =>
      squares[currentPosition + index].classList.contains("taken")
    )
  ) {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    isPaused = true;
    isGameOver = true;

    pauseGame();

    gameVoice.play();
    gameEnd.classList.remove("hidden");
    gameEnd.classList.add("flex");

    menu2.classList.remove("hidden");
    menu2.classList.add("flex");
    gameEndMusic.play();

    startBtn.forEach((btn) => {
      btn.classList.add("button-disabled");
      btn.disabled = true;
    });
    updateLeaderboard(score, level, linesCleared);
  }
}

// Reset gameboard. Remove all tetromoinos from gameboard, mini display and assigned animations from them.

// function resetGame() {
//   squares.forEach((square, i) => {
//     square.classList.remove(
//       "tetromino",
//       "levelCompleted",
//       "hit",
//       "ghost-tetromino"
//     );
//     square.style.backgroundColor = "";
//     if (!square.classList.contains("taken2")) {
//       square.classList.remove("taken");
//     }

//     if (i >= 200) {
//       square.classList.add("taken");
//     }
//   });

//   displaySquares.forEach((square) => {
//     square.classList.remove("tetromino");
//     square.style.backgroundColor = "";
//   });
// }

// Start Game. Function that start the tetromino drop

function startGame() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  draw();
  if (!nextRandom) {
    nextRandom = Math.floor(Math.random() * theTetrominoes.length);
  }
  updateGlowColor();
  requestAnimationFrame(update);
  displayShape();
  backgroundMusic.play();
  isStartGame = true;
  isPaused = false;
  isGameOver = false;
}

//  Pause Game

function pauseGame() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  backgroundMusic.pause();
  isPaused = true;
}

// Make the speed of tetromino and music faster when level changes

let currentPlaybackRate = 1.0;

function updateSpeedAndMusic() {
  dropInterval = Math.max(dropInterval * 0.85, 50); // Limit to a minimum of 50ms

  currentPlaybackRate = Math.min(currentPlaybackRate * 1.1, 3.5);

  backgroundMusic.playbackRate = currentPlaybackRate;
}

// Inceare Level points by 1 every 1000 Score

const levelText = document.querySelector(".levelText");

let level = 1;

async function addLevel() {
  level++;
  levelDisplay.forEach((display) => (display.innerHTML = level));
  updateSpeedAndMusic();
  full.pause();
  hit.pause();
  backgroundMusic.pause();
  isAnimating = true;
  await levelCompletedAnimation();
  isAnimating = false;
  backgroundMusic.play();
}

// Animation for level completed

async function levelCompletedAnimation() {
  levelText.classList.remove("hidden");
  levelText.classList.add("flex");
  levelChange.play();
  await sleep(2000);
  levelText.classList.add("hidden");
}

// Get Leaderboard list from logalStorage

function getLeaderboard() {
  const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
  return leaderboard;
}

// Update Leaderboard with new scores
function updateLeaderboard(score, level, linesCleared) {
  let leaderboard = getLeaderboard();

  // Update current game scores to list
  leaderboard.push({ score, level, linesCleared });

  // sort levels by highest level to down
  leaderboard.sort((a, b) => {
    if (b.level !== a.level) {
      return b.level - a.level;
    } else if (b.score !== a.score) {
      return b.score - a.score; // Higher scores first
    } else {
      return b.linesCleared - a.linesCleared;
    }
  });

  // Show only top 10
  leaderboard = leaderboard.slice(0, 10);

  // save the updated list to logal storage
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
}

// Stop the default page scroll when keys are pushed

document.addEventListener("keydown", function (event) {
  if (
    event.key === "ArrowDown" ||
    event.key === "ArrowUp" ||
    event.key === "ArrowLeft" ||
    event.key === "ArrowRight"
  ) {
    event.preventDefault();
  }
});

// function to check UI elements that should not have preventDefault

function isInteractiveElement(target) {
  return target.closest("button");
}

//Audio for game in array. This is for volume control in PC.

const audio = [
  document.getElementById("backgroundMusic"),
  document.getElementById("full"),
  document.getElementById("gameVoice"),
  document.getElementById("hit"),
  document.getElementById("levelChange"),
  document.getElementById("gameEndMusic"),
  document.getElementById("tetris"),
];

// Volume control for all game voices

audio.forEach((audio) => {
  audio.volume = savedVolume;
});
volumeControl.value = savedVolume;

volumeControl.addEventListener("input", (event) => {
  savedVolume = event.target.value;
  localStorage.setItem("volume", savedVolume);
  audio.forEach((audio) => {
    audio.volume = savedVolume;
  });
});

// Show the glow of the color that is coming next

function updateGlowColor() {
  const nextColor = colors[nextRandom];
  grid.style.boxShadow = `0 0 5px 4px ${nextColor}, 0 0 5px 4px ${nextColor}`;
}

function showStats() {
  const performance = document.getElementById("performance");
  performance.classList.remove("hidden");
}

function hideStats() {
  const performance = document.getElementById("performance");
  performance.classList.add("hidden");
}

function applySettings() {
  const savedToggle = localStorage.getItem("showPerformanceStats");
  if (savedToggle === "true") {
    showStats();
  } else {
    hideStats();
  }
}

// // Progresbar that fills when get lines

// const canvas = document.getElementById("progresBar");
// const ctx = canvas.getContext("2d");

// let currentFillPercentage = 0;
// let targetFillPercentage = 0;
// let animationSpeed = 0.005;

// function fillProgresBar() {
//   // Calculate how many lines have been cleared in the current level cycle
//   const totalLinesNeeded = level * linesToNextLevel;

//   // If we've just completed a level exactly
//   if (linesCleared === totalLinesNeeded) {
//     targetFillPercentage = 1.0; // Set to full
//   } else if (linesCleared > totalLinesNeeded) {
//     // We've cleared more lines than needed for the current level
//     // Calculate how many lines into the next level we are
//     const extraLines = linesCleared - totalLinesNeeded;
//     targetFillPercentage = extraLines / linesToNextLevel;
//   } else {
//     // Normal case - we're still working on the current level
//     const linesInCurrentLevel = linesCleared % linesToNextLevel;
//     targetFillPercentage = linesInCurrentLevel / linesToNextLevel;
//   }

//   animateProgressBar();
// }

// //  animation that slowly fills the progresbar
// function animateProgressBar() {
//   if (currentFillPercentage < targetFillPercentage) {
//     currentFillPercentage += animationSpeed;

//     if (currentFillPercentage > targetFillPercentage) {
//       currentFillPercentage = targetFillPercentage;
//     }

//     drawProgressBar();
//     requestAnimationFrame(animateProgressBar);
//   }
// }

// // Draw progresBar
// function drawProgressBar() {
//   ctx.clearRect(0, 0, canvas.width, canvas.height); // Tyhjennä vanha

//   const fillHeight = canvas.height * currentFillPercentage;
//   const y = canvas.height - fillHeight;

//   const gradient = ctx.createLinearGradient(0, y, 0, canvas.height);

//   gradient.addColorStop(0, "#1E90FF"); // Start color
//   gradient.addColorStop(1, "#00BFFF");

//   ctx.fillStyle = gradient;
//   ctx.fillRect(0, y, canvas.width, fillHeight);
// }
