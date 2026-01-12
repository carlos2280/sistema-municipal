// scripts/test-remote.js
import { request } from "node:http";

const port = process.env.PORT || 5011;
const url = `http://localhost:${port}/assets/remoteEntry.js`;

console.log(`🔍 Testing remoteEntry.js: ${url}`);

const req = request(url, (res) => {
	let data = "";

	res.on("data", (chunk) => {
		data += chunk;
	});

	res.on("end", () => {
		if (res.statusCode === 200) {
			const size = Buffer.byteLength(data, "utf8");
			const isValidJS =
				data.includes("__webpack_require__") ||
				data.includes("System.register") ||
				data.includes("webpackJsonp");

			if (isValidJS && size > 100) {
				console.log(`✅ RemoteEntry.js is valid (${size} bytes)`);
				console.log("📦 Content preview:", `${data.substring(0, 100)}...`);
				process.exit(0);
			} else {
				console.error("❌ RemoteEntry.js seems invalid or too small");
				console.error(`Size: ${size} bytes`);
				console.error("Content preview:", data.substring(0, 200));
				process.exit(1);
			}
		} else {
			console.error(`❌ RemoteEntry.js not found: HTTP ${res.statusCode}`);
			if (res.statusCode === 404) {
				console.error("💡 Make sure to build first with: pnpm build");
			}
			process.exit(1);
		}
	});
});

req.on("error", (error) => {
	console.error("❌ RemoteEntry.js test failed:", error.message);
	console.error("💡 Make sure the server is running with: pnpm start");
	process.exit(1);
});

req.setTimeout(5000, () => {
	console.error("❌ RemoteEntry.js test timed out");
	req.destroy();
	process.exit(1);
});

req.end();
