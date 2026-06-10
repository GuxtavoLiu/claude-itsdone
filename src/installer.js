const fs = require("fs");
const path = require("path");
const os = require("os");

const CLAUDE_SETTINGS_PATH = path.join(os.homedir(), ".claude", "settings.json");
const HOOK_MARKER = "claude-itsdone";
const HOOK_EVENTS = ["Notification", "Stop"];

function getHookCommand() {
  // Absolute paths so the hook works even when the package is not on the
  // PATH of the environment Claude Code spawns hooks from.
  const binPath = path.resolve(__dirname, "..", "bin", "claude-itsdone.js");
  return `"${process.execPath}" "${binPath}" notify`;
}

// Returns {} when the file does not exist; throws when it exists but is not
// valid JSON, so callers never overwrite a settings file they could not read.
function readSettings() {
  let data;
  try {
    data = fs.readFileSync(CLAUDE_SETTINGS_PATH, "utf-8");
  } catch {
    return {};
  }
  return JSON.parse(data);
}

function parseErrorResult() {
  return {
    success: false,
    message:
      `Could not parse ${CLAUDE_SETTINGS_PATH} - it exists but is not valid JSON.\n` +
      `Fix it manually and try again. Nothing was changed.`,
  };
}

function writeSettings(settings) {
  const dir = path.dirname(CLAUDE_SETTINGS_PATH);
  fs.mkdirSync(dir, { recursive: true });
  try {
    fs.copyFileSync(CLAUDE_SETTINGS_PATH, CLAUDE_SETTINGS_PATH + ".bak");
  } catch {
    // No existing file to back up
  }
  fs.writeFileSync(CLAUDE_SETTINGS_PATH, JSON.stringify(settings, null, 2) + "\n");
}

function hasHook(settings, event) {
  const hooks = settings.hooks?.[event];
  if (!Array.isArray(hooks)) return false;
  return hooks.some((entry) =>
    entry.hooks?.some((h) => h.command?.includes(HOOK_MARKER))
  );
}

function installedEvents() {
  let settings;
  try {
    settings = readSettings();
  } catch {
    return [];
  }
  return HOOK_EVENTS.filter((event) => hasHook(settings, event));
}

function isInstalled() {
  return installedEvents().length > 0;
}

function install(options = {}) {
  let settings;
  try {
    settings = readSettings();
  } catch {
    return parseErrorResult();
  }

  const events = options.onStop ? ["Notification", "Stop"] : ["Notification"];
  const added = [];

  if (!settings.hooks) {
    settings.hooks = {};
  }

  for (const event of events) {
    if (hasHook(settings, event)) continue;
    if (!Array.isArray(settings.hooks[event])) {
      settings.hooks[event] = [];
    }
    settings.hooks[event].push({
      matcher: "",
      hooks: [
        {
          type: "command",
          command: getHookCommand(),
        },
      ],
    });
    added.push(event);
  }

  if (added.length === 0) {
    return { success: false, message: "claude-itsdone is already installed." };
  }

  writeSettings(settings);

  return {
    success: true,
    message:
      `claude-itsdone installed successfully (events: ${added.join(", ")}).\n` +
      `Hook added to: ${CLAUDE_SETTINGS_PATH}`,
  };
}

function uninstall() {
  let settings;
  try {
    settings = readSettings();
  } catch {
    return parseErrorResult();
  }

  let removed = false;

  for (const event of HOOK_EVENTS) {
    if (!Array.isArray(settings.hooks?.[event])) continue;
    const before = settings.hooks[event].length;
    settings.hooks[event] = settings.hooks[event].filter(
      (entry) => !entry.hooks?.some((h) => h.command?.includes(HOOK_MARKER))
    );
    if (settings.hooks[event].length !== before) removed = true;
    if (settings.hooks[event].length === 0) {
      delete settings.hooks[event];
    }
  }

  if (settings.hooks && Object.keys(settings.hooks).length === 0) {
    delete settings.hooks;
  }

  if (!removed) {
    return { success: false, message: "claude-itsdone is not installed." };
  }

  writeSettings(settings);

  return {
    success: true,
    message: `claude-itsdone uninstalled successfully.\nHook removed from: ${CLAUDE_SETTINGS_PATH}`,
  };
}

module.exports = {
  install,
  uninstall,
  isInstalled,
  installedEvents,
  CLAUDE_SETTINGS_PATH,
};
