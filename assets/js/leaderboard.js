(function () {
	"use strict";

	var LS_NAME = "g2048-username";
	var modal;
	var input;
	var statusEl;
	var tbody;
	var dbRef;
	var enabled = false;
	var pushTimer = null;

	function hasRealConfig() {
		var c = window.G2048_FIREBASE;
		if (!c || !c.apiKey || !c.databaseURL) return false;
		if (c.apiKey.indexOf("YOUR_") === 0) return false;
		return true;
	}

	function getUsername() {
		try {
			return localStorage.getItem(LS_NAME) || "";
		} catch (e) {
			return "";
		}
	}

	function setUsername(name) {
		try {
			localStorage.setItem(LS_NAME, name.trim());
		} catch (e) {}
	}

	function firebaseKey(name) {
		var t = name.trim().slice(0, 40);
		if (!t) return "u0";
		var h = 2166136261;
		for (var i = 0; i < t.length; i++) {
			h ^= t.charCodeAt(i);
			h = Math.imul(h, 16777619);
		}
		return "u" + (h >>> 0).toString(16);
	}

	function initFirebase() {
		if (typeof firebase === "undefined") {
			return false;
		}
		if (!hasRealConfig()) {
			return false;
		}
		try {
			if (!firebase.apps || firebase.apps.length === 0) {
				firebase.initializeApp(window.G2048_FIREBASE);
			}
			dbRef = firebase.database().ref("leaderboard");
			return true;
		} catch (e) {
			console.warn("Firebase init failed:", e);
			return false;
		}
	}

	function renderRows(rows) {
		if (!tbody) return;
		tbody.innerHTML = "";
		rows.forEach(function (r, i) {
			var tr = document.createElement("tr");
			tr.innerHTML =
				"<td>" +
				(i + 1) +
				"</td><td>" +
				escapeHtml(r.displayName) +
				"</td><td>" +
				r.score +
				"</td>";
			tbody.appendChild(tr);
		});
		if (rows.length === 0) {
			var tr = document.createElement("tr");
			tr.innerHTML = '<td colspan="3">No scores yet. Be the first!</td>';
			tbody.appendChild(tr);
		}
	}

	function escapeHtml(s) {
		var d = document.createElement("div");
		d.textContent = s;
		return d.innerHTML;
	}

	function listenLeaderboard() {
		if (!enabled || !dbRef) return;
		dbRef.on(
			"value",
			function (snap) {
				var list = [];
				snap.forEach(function (child) {
					var v = child.val();
					if (v && typeof v.displayName === "string" && typeof v.score === "number") {
						list.push({
							displayName: v.displayName,
							score: v.score,
							updatedAt: v.updatedAt || 0,
						});
					}
				});
				list.sort(function (a, b) {
					return b.score - a.score || b.updatedAt - a.updatedAt;
				});
				renderRows(list);
				if (statusEl) {
					statusEl.textContent = "Live · updated automatically";
					statusEl.classList.remove("is-offline");
				}
			},
			function () {
				if (statusEl) {
					statusEl.textContent = "Could not load leaderboard (check Firebase rules / network).";
					statusEl.classList.add("is-offline");
				}
			}
		);
	}

	function submitScore(finalScore) {
		if (!enabled || !dbRef) return;
		var name = getUsername();
		if (!name) return;
		if (typeof finalScore !== "number" || finalScore < 0) return;

		var key = firebaseKey(name);
		var payload = {
			displayName: name.trim().slice(0, 32),
			score: finalScore,
			updatedAt: Date.now(),
		};

		dbRef.child(key).transaction(
			function (current) {
				if (current === null || typeof current.score !== "number" || finalScore > current.score) {
					return payload;
				}
				return current;
			},
			function (error) {
				if (error) console.warn("Leaderboard save:", error);
			}
		);
	}

	function showModal() {
		if (modal) modal.classList.add("is-visible");
	}

	function hideModal() {
		if (modal) modal.classList.remove("is-visible");
	}

	function bindUsernameUi() {
		modal = document.getElementById("g2048-name-modal");
		input = document.getElementById("g2048-username-input");
		var saveBtn = document.getElementById("g2048-username-save");
		var changeBtn = document.getElementById("g2048-change-name");
		statusEl = document.getElementById("g2048-lb-status");
		tbody = document.getElementById("g2048-lb-tbody");

		if (changeBtn) {
			changeBtn.addEventListener("click", function () {
				showModal();
				if (input) {
					input.value = getUsername();
					input.focus();
				}
			});
		}

		function saveUsernameFromModal() {
			if (!input) return;
			var v = input.value.trim();
			if (v.length < 1) {
				input.focus();
				return;
			}
			setUsername(v);
			hideModal();
			var el = document.getElementById("g2048-playing-as");
			if (el) el.textContent = v;
		}

		if (saveBtn && input) {
			saveBtn.addEventListener("click", saveUsernameFromModal);
			input.addEventListener("keydown", function (e) {
				if (e.key === "Enter") {
					e.preventDefault();
					saveUsernameFromModal();
				}
			});
		}

		if (!getUsername()) {
			showModal();
		} else {
			var el = document.getElementById("g2048-playing-as");
			if (el) el.textContent = getUsername();
		}
	}

	function init() {
		bindUsernameUi();
		enabled = initFirebase();

		if (!enabled) {
			if (statusEl) {
				statusEl.textContent =
					"Offline mode: add your Firebase keys in assets/js/firebase-config.js for a live global leaderboard.";
				statusEl.classList.add("is-offline");
			}
			renderRows([]);
			return;
		}

		listenLeaderboard();

		window.G2048Hooks = window.G2048Hooks || {};
		window.G2048Hooks.onGameOver = function (finalScore) {
			submitScore(finalScore);
		};
		window.G2048Hooks.onScoreChange = function (liveScore) {
			if (!getUsername()) return;
			clearTimeout(pushTimer);
			pushTimer = setTimeout(function () {
				submitScore(liveScore);
			}, 1500);
		};

		var pushBtn = document.getElementById("g2048-save-leaderboard");
		if (pushBtn) {
			pushBtn.addEventListener("click", function () {
				if (!getUsername()) {
					showModal();
					return;
				}
				var el = document.getElementById("g2048-score");
				var s = el ? parseInt(el.textContent, 10) : 0;
				submitScore(isNaN(s) ? 0 : s);
			});
		}

		window.g2048SubmitLeaderboard = function () {
			var el = document.getElementById("g2048-score");
			var s = el ? parseInt(el.textContent, 10) : 0;
			if (!getUsername()) {
				showModal();
				return;
			}
			submitScore(isNaN(s) ? 0 : s);
		};
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
