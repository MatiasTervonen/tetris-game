function displayLeaderboard() {
  const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

  const leaderboardList = document.getElementById("leaderboard-list");

  leaderboardList.innerHTML = "";

  if (!leaderboardList) {
    console.error("Leaderboard list element not found on this page!");
    return;
  }

  if (leaderboard.length === 0) {
    leaderboardList.innerHTML = "<li>No scores available</li>";
  } else {
    // add every score to list
    leaderboard.forEach((entry, index) => {
      const { score, level, linesCleared } = entry;
      const li = document.createElement("li");
      li.innerHTML = `${
        index + 1
      }: Score: ${score}, Level: ${level}, <br class="block sm:hidden"> Lines: ${linesCleared}`;
      leaderboardList.appendChild(li);
    });
  }
}

document.addEventListener("DOMContentLoaded", displayLeaderboard);

function clearLeaderboard() {
  localStorage.removeItem("leaderboard");
  displayLeaderboard();
}

document.getElementById("clearLeaderboard").addEventListener("click", () => {
  if (confirm("Are you sure you want to reset the leaderboard?")) {
    clearLeaderboard();
  }
});

// ToggleSwitch for performanceStats

const ToggleSwitch = document.getElementById("toggleSwitch");

const savedToggle = localStorage.getItem("showPerformanceStats");
if (savedToggle === "true") {
  ToggleSwitch.checked = true;
}

ToggleSwitch.addEventListener("change", function () {
  const isCheked = ToggleSwitch.checked;
  localStorage.setItem("showPerformanceStats", isCheked);
});
