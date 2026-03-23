const fs = require("fs");
const path = require("path");
const os = require("os");

const CLAUDE_SETTINGS_PATH = path.join(os.homedir(), ".claude", "settings.json");
const HOOK_MARKER = "claude-bell";

function getHookCommand() {
  return `claude-bell notify`;
}

function readSettings() {
  try {
    const data = fs.readFileSync(CLAUDE_SETTINGS_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

function writeSettings(settings) {
  const dir = path.dirname(CLAUDE_SETTINGS_PATH);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(CLAUDE_SETTINGS_PATH, JSON.stringify(settings, null, 2) + "\n");
}

function isInstalled() {
  const settings = readSettings();
  const hooks = settings.hooks?.Notification;
  if (!Array.isArray(hooks)) return false;

  return hooks.some((entry) =>
    entry.hooks?.some((h) => h.command?.includes(HOOK_MARKER))
  );
}

function install() {
  if (isInstalled()) {
    return { success: false, message: "claude-bell is already installed." };
  }

  const settings = readSettings();

  if (!settings.hooks) {
    settings.hooks = {};
  }

  if (!Array.isArray(settings.hooks.Notification)) {
    settings.hooks.Notification = [];
  }

  settings.hooks.Notification.push({
    matcher: "",
    hooks: [
      {
        type: "command",
        command: getHookCommand(),
      },
    ],
  });

  writeSettings(settings);

  return {
    success: true,
    message: `claude-bell installed successfully.\nHook added to: ${CLAUDE_SETTINGS_PATH}`,
  };
}

function uninstall() {
  if (!isInstalled()) {
    return { success: false, message: "claude-bell is not installed." };
  }

  const settings = readSettings();

  if (Array.isArray(settings.hooks?.Notification)) {
    settings.hooks.Notification = settings.hooks.Notification.filter(
      (entry) => !entry.hooks?.some((h) => h.command?.includes(HOOK_MARKER))
    );

    if (settings.hooks.Notification.length === 0) {
      delete settings.hooks.Notification;
    }

    if (Object.keys(settings.hooks).length === 0) {
      delete settings.hooks;
    }
  }

  writeSettings(settings);

  return {
    success: true,
    message: `claude-bell uninstalled successfully.\nHook removed from: ${CLAUDE_SETTINGS_PATH}`,
  };
}

module.exports = { install, uninstall, isInstalled, CLAUDE_SETTINGS_PATH };
