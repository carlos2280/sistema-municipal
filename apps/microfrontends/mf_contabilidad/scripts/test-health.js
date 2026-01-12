// scripts/test-health.js
import { request } from "node:http";

const port = process.env.PORT || 5011;
const url = `http://localhost:${port}/health`;

console.log(`🔍 Testing health endpoint: ${url}`);

const req = request(url, (res) => {
	let data = "";

	res.on("data", (chunk) => {
		data += chunk;
	});

	res.on("end", () => {
		if (res.statusCode === 200) {
			try {
				const result = JSON.parse(data);
				console.log("✅ Health check passed:", result);
				process.exit(0);
			} catch (_error) {
				console.log("✅ Health check passed (non-JSON response)");
				process.exit(0);
			}
		} else {
			console.error(`❌ Health check failed: HTTP ${res.statusCode}`);
			console.error("Response:", data);
			process.exit(1);
		}
	});
});

req.on("error", (error) => {
	console.error("❌ Health check failed:", error.message);
	console.error("💡 Make sure the server is running with: pnpm start");
	process.exit(1);
});

req.setTimeout(5000, () => {
	console.error("❌ Health check timed out");
	req.destroy();
	process.exit(1);
});

req.end();
