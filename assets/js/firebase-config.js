/**
 * Firebase Realtime Database — enables LIVE leaderboard for 2048.
 *
 * Setup (free Spark plan):
 * 1. https://console.firebase.google.com → Add project → enable "Realtime Database"
 * 2. Database → Create database → Start in test mode (or use rules below)
 * 3. Project settings → Your apps → Web → copy config values into this object
 * 4. Replace the placeholder values below and deploy.
 *
 * Suggested security rules (Realtime Database → Rules):
 * {
 *   "rules": {
 *     "leaderboard": {
 *       ".read": true,
 *       "$key": {
 *         ".write": true,
 *         ".validate": "newData.hasChildren(['displayName','score','updatedAt']) && newData.child('displayName').isString() && newData.child('displayName').val().length <= 32 && newData.child('score').isNumber() && newData.child('score').val() >= 0 && newData.child('score').val() <= 10000000 && newData.child('updatedAt').isNumber()"
 *       }
 *     }
 *   }
 * }
 *
 * "Test mode" expires after 30 days — switch to rules like above for class demos.
 */
window.G2048_FIREBASE = {
	apiKey: "YOUR_API_KEY",
	authDomain: "YOUR_PROJECT.firebaseapp.com",
	databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
	projectId: "YOUR_PROJECT",
};
