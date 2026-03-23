const fs = require("fs");
const path = require("path");
const os = require("os");

const CONFIG_DIR = path.join(os.homedir(), ".claude-bell");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

const DEFAULT_CONFIG = {
  preset: "default",
  soundFile: null,
};

function load() {
  try {
    const data = fs.readFileSync(CONFIG_FILE, "utf-8");
    return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

function save(config) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + "\n");
}

function getConfigPath() {
  return CONFIG_FILE;
}

module.exports = { load, save, getConfigPath, DEFAULT_CONFIG };
