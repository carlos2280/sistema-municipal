// scripts/setup-check.js
import { existsSync } from "node:fs";

const requiredFiles = [
	".env.development",
	"vite.config.ts",
	"server.js",
];

console.log("🔍 Checking project setup...");

let allGood = true;

requiredFiles.forEach((file) => {
	if (existsSync(file)) {
		console.log(`✅ ${file}`);
	} else {
		console.error(`❌ Missing: ${file}`);
		allGood = false;
	}
});

// Check for important directories
const requiredDirs = ["src", "src/theme"];

requiredDirs.forEach((dir) => {
	if (existsSync(dir)) {
		console.log(`✅ Directory: ${dir}/`);
	} else {
		console.error(`❌ Missing directory: ${dir}/`);
		allGood = false;
	}
});

if (allGood) {
	console.log("🎉 Project setup looks good!");
} else {
	console.error("⚠️  Some files or directories are missing");
	console.log("\n💡 Tips:");
	console.log("- Make sure you have .env.development file");
	console.log("- Check that all configuration files are present");
}

// Check environment variables
if (process.env.NODE_ENV !== "production") {
	const envFile = ".env.development";
	if (existsSync(envFile)) {
		console.log(`✅ Environment file: ${envFile}`);
	} else {
		console.log(`⚠️  Consider creating ${envFile} for development`);
	}
}
