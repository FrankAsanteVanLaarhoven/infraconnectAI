/**
 * InfraConnect - Physical Node Registration
 * Anchors the agent identity cryptographically utilizing hardware markers.
 */
/* eslint-disable @typescript-eslint/no-require-imports */
const os = require("os");
const crypto = require("crypto");

console.log("[REGISTER] Extracting Hardware Fingerprint...");

const hardwareSeed = os.hostname() + os.arch() + os.cpus().length;

const id = crypto
  .createHash("sha256")
  .update(hardwareSeed)
  .digest("hex")
  .slice(0, 16);

console.log(`[REGISTER] Node cryptographically anchored to physical hardware.`);
console.log(`\n============================`);
console.log(`  NODE_ID: ${id}`);
console.log(`============================\n`);
console.log(`Export this to the environment to bind the Edge Agent:`);
console.log(`export NODE_ID=${id}`);
