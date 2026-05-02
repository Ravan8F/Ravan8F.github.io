(function () {
	"use strict";

	var SIZE = 4;
	var grid;
	var score;
	var wonAlready;
	var boardEl;
	var scoreEl;
	var bestEl;
	var overlayEl;
	var overlayTitleEl;
	var toastEl;

	function loadBest() {
		try {
			var v = localStorage.getItem("g2048-best");
			return v ? parseInt(v, 10) : 0;
		} catch (e) {
			return 0;
		}
	}

	function saveBestIfNeeded() {
		try {
			var b = loadBest();
			if (score > b) localStorage.setItem("g2048-best", String(score));
		} catch (e) {}
	}

	function displayBest() {
		bestEl.textContent = String(Math.max(loadBest(), score));
	}

	function transpose(g) {
		return g[0].map(function (_, c) {
			return g.map(function (row) {
				return row[c];
			});
		});
	}

	function compressAndMerge(line) {
		var arr = line.filter(function (x) {
			return x !== 0;
		});
		var result = [];
		var i = 0;
		while (i < arr.length) {
			if (i < arr.length - 1 && arr[i] === arr[i + 1]) {
				var merged = arr[i] * 2;
				result.push(merged);
				score += merged;
				i += 2;
			} else {
				result.push(arr[i]);
				i += 1;
			}
		}
		while (result.length < SIZE) result.push(0);
		return result;
	}

	function attemptMove(direction) {
		var prev = JSON.stringify(grid);
		if (direction === "left") {
			grid = grid.map(function (row) {
				return compressAndMerge(row);
			});
		} else if (direction === "right") {
			grid = grid.map(function (row) {
				return compressAndMerge(row.slice().reverse()).reverse();
			});
		} else if (direction === "up") {
			grid = transpose(grid);
			grid = grid.map(function (row) {
				return compressAndMerge(row);
			});
			grid = transpose(grid);
		} else if (direction === "down") {
			grid = transpose(grid);
			grid = grid.map(function (row) {
				return compressAndMerge(row.slice().reverse()).reverse();
			});
			grid = transpose(grid);
		}
		return prev !== JSON.stringify(grid);
	}

	function addRandomTile() {
		var empty = [];
		for (var r = 0; r < SIZE; r++) {
			for (var c = 0; c < SIZE; c++) {
				if (grid[r][c] === 0) empty.push([r, c]);
			}
		}
		if (!empty.length) return;
		var pick = empty[Math.floor(Math.random() * empty.length)];
		grid[pick[0]][pick[1]] = Math.random() < 0.9 ? 2 : 4;
	}

	function has2048() {
		for (var r = 0; r < SIZE; r++) {
			for (var c = 0; c < SIZE; c++) {
				if (grid[r][c] === 2048) return true;
			}
		}
		return false;
	}

	function canMove() {
		for (var r = 0; r < SIZE; r++) {
			for (var c = 0; c < SIZE; c++) {
				if (grid[r][c] === 0) return true;
				var v = grid[r][c];
				if (c < SIZE - 1 && grid[r][c + 1] === v) return true;
				if (r < SIZE - 1 && grid[r + 1][c] === v) return true;
			}
		}
		return false;
	}

	function render() {
		var cells = boardEl.querySelectorAll(".g2048-cell");
		var i = 0;
		for (var r = 0; r < SIZE; r++) {
			for (var c = 0; c < SIZE; c++) {
				var v = grid[r][c];
				var el = cells[i++];
				el.textContent = v || "";
				el.setAttribute("data-value", v ? String(v) : "0");
			}
		}
		scoreEl.textContent = String(score);
		displayBest();
	}

	function showOverlay(title) {
		overlayTitleEl.textContent = title;
		overlayEl.classList.add("is-visible");
	}

	function hideOverlay() {
		overlayEl.classList.remove("is-visible");
	}

	function showToast(msg) {
		toastEl.textContent = msg;
		toastEl.classList.add("is-visible");
		setTimeout(function () {
			toastEl.classList.remove("is-visible");
		}, 2500);
	}

	function afterMove(changed) {
		if (!changed) return;
		addRandomTile();
		render();
		saveBestIfNeeded();
		if (window.G2048Hooks && typeof window.G2048Hooks.onScoreChange === "function") {
			window.G2048Hooks.onScoreChange(score);
		}
		if (!wonAlready && has2048()) {
			wonAlready = true;
			showToast("You reached 2048!");
		}
		if (!canMove()) {
			showOverlay("Game over");
			if (window.G2048Hooks && typeof window.G2048Hooks.onGameOver === "function") {
				window.G2048Hooks.onGameOver(score);
			}
		}
	}

	function newGame() {
		grid = [];
		for (var r = 0; r < SIZE; r++) {
			grid[r] = [];
			for (var c = 0; c < SIZE; c++) grid[r][c] = 0;
		}
		score = 0;
		wonAlready = false;
		hideOverlay();
		addRandomTile();
		addRandomTile();
		render();
	}

	function onKey(e) {
		var key = e.key;
		var dir = null;
		if (key === "ArrowLeft") dir = "left";
		else if (key === "ArrowRight") dir = "right";
		else if (key === "ArrowUp") dir = "up";
		else if (key === "ArrowDown") dir = "down";
		if (!dir) return;
		e.preventDefault();
		if (overlayEl.classList.contains("is-visible")) return;
		afterMove(attemptMove(dir));
	}

	function touchSetup() {
		var startX = null;
		var startY = null;
		var minSwipe = 30;
		boardEl.addEventListener(
			"touchstart",
			function (e) {
				if (e.touches.length !== 1) return;
				startX = e.touches[0].clientX;
				startY = e.touches[0].clientY;
			},
			{ passive: true }
		);
		boardEl.addEventListener(
			"touchend",
			function (e) {
				if (startX === null || startY === null) return;
				var t = e.changedTouches[0];
				var dx = t.clientX - startX;
				var dy = t.clientY - startY;
				startX = null;
				startY = null;
				if (overlayEl.classList.contains("is-visible")) return;
				if (Math.abs(dx) < minSwipe && Math.abs(dy) < minSwipe) return;
				var dir = null;
				if (Math.abs(dx) > Math.abs(dy)) {
					dir = dx > 0 ? "right" : "left";
				} else {
					dir = dy > 0 ? "down" : "up";
				}
				e.preventDefault();
				afterMove(attemptMove(dir));
			},
			{ passive: false }
		);
	}

	function init() {
		boardEl = document.getElementById("g2048-board");
		scoreEl = document.getElementById("g2048-score");
		bestEl = document.getElementById("g2048-best");
		overlayEl = document.getElementById("g2048-overlay");
		overlayTitleEl = document.getElementById("g2048-overlay-title");
		toastEl = document.getElementById("g2048-toast");
		if (!boardEl) return;

		for (var n = 0; n < SIZE * SIZE; n++) {
			var cell = document.createElement("div");
			cell.className = "g2048-cell";
			cell.setAttribute("data-value", "0");
			boardEl.appendChild(cell);
		}

		document.getElementById("g2048-new").addEventListener("click", newGame);
		document.getElementById("g2048-try-again").addEventListener("click", function () {
			newGame();
		});
		document.addEventListener("keydown", onKey);
		touchSetup();
		newGame();
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
