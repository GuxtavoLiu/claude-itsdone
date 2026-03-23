const { execSync, exec } = require("child_process");
const path = require("path");
const os = require("os");

function sanitizePath(filePath) {
  const resolved = path.resolve(filePath);
  if (/[`$\\!";&|<>(){}\r\n]/.test(resolved) && os.platform() !== "win32") {
    return null;
  }
  if (/[`$";&|<>(){}\r\n]/.test(resolved) && os.platform() === "win32") {
    return null;
  }
  return resolved;
}

const PRESETS = {
  default: { type: "beep", params: { frequency: 800, duration: 300 } },
  gentle: { type: "beep", params: { frequency: 600, duration: 200 } },
  urgent: {
    type: "melody",
    params: {
      notes: [
        { frequency: 800, duration: 150 },
        { frequency: 1000, duration: 150 },
        { frequency: 1200, duration: 200 },
      ],
    },
  },
  chime: {
    type: "melody",
    params: {
      notes: [
        { frequency: 523, duration: 150 },
        { frequency: 659, duration: 150 },
        { frequency: 784, duration: 250 },
      ],
    },
  },
  pulse: {
    type: "melody",
    params: {
      notes: [
        { frequency: 700, duration: 100 },
        { frequency: 0, duration: 80 },
        { frequency: 700, duration: 100 },
      ],
    },
  },
};

function getPresetNames() {
  return Object.keys(PRESETS);
}

function buildBeepCommand(frequency, duration) {
  const platform = os.platform();

  if (platform === "win32") {
    return `powershell -NoProfile -c "[Console]::Beep(${frequency}, ${duration})"`;
  } else if (platform === "darwin") {
    return `osascript -e 'do shell script "afplay /System/Library/Sounds/Tink.aiff 2>/dev/null"' 2>/dev/null || printf '\\a'`;
  } else {
    return `( command -v paplay >/dev/null 2>&1 && paplay /usr/share/sounds/freedesktop/stereo/message.oga 2>/dev/null ) || ( command -v aplay >/dev/null 2>&1 && aplay -q /usr/share/sounds/sound-icons/xylofon.wav 2>/dev/null ) || printf '\\a'`;
  }
}

function buildMelodyCommand(notes) {
  const platform = os.platform();

  if (platform === "win32") {
    const beeps = notes
      .map((n) =>
        n.frequency > 0
          ? `[Console]::Beep(${n.frequency}, ${n.duration})`
          : `Start-Sleep -Milliseconds ${n.duration}`
      )
      .join("; ");
    return `powershell -NoProfile -c "${beeps}"`;
  } else if (platform === "darwin") {
    const count = notes.filter((n) => n.frequency > 0).length;
    const cmds = [];
    for (let i = 0; i < count; i++) {
      cmds.push("afplay /System/Library/Sounds/Tink.aiff 2>/dev/null");
    }
    return `osascript -e 'do shell script "${cmds.join(" && sleep 0.1 && ")}"' 2>/dev/null || printf '\\a'`;
  } else {
    const count = notes.filter((n) => n.frequency > 0).length;
    const cmds = [];
    for (let i = 0; i < count; i++) {
      cmds.push("paplay /usr/share/sounds/freedesktop/stereo/message.oga 2>/dev/null");
    }
    return `( command -v paplay >/dev/null 2>&1 && ${cmds.join(" && sleep 0.1 && ")} ) || printf '\\a'`;
  }
}

function buildCustomFileCommand(filePath) {
  const platform = os.platform();
  const resolved = sanitizePath(filePath);

  if (!resolved) {
    return platform === "win32"
      ? `powershell -NoProfile -c "[Console]::Beep(800, 300)"`
      : `printf '\\a'`;
  }

  if (platform === "win32") {
    return `powershell -NoProfile -c "(New-Object Media.SoundPlayer '${resolved}').PlaySync()"`;
  } else if (platform === "darwin") {
    return `afplay '${resolved}'`;
  } else {
    return `( command -v paplay >/dev/null 2>&1 && paplay '${resolved}' ) || ( command -v aplay >/dev/null 2>&1 && aplay -q '${resolved}' ) || printf '\\a'`;
  }
}

function getCommand(config) {
  if (config.soundFile) {
    return buildCustomFileCommand(config.soundFile);
  }

  const presetName = config.preset || "default";
  const preset = PRESETS[presetName];

  if (!preset) {
    console.error(`Unknown preset: "${presetName}". Using "default".`);
    return buildBeepCommand(800, 300);
  }

  if (preset.type === "beep") {
    return buildBeepCommand(preset.params.frequency, preset.params.duration);
  } else if (preset.type === "melody") {
    return buildMelodyCommand(preset.params.notes);
  }
}

function play(config = {}) {
  const command = getCommand(config);
  try {
    execSync(command, { stdio: "ignore", windowsHide: true });
  } catch {
    // Silently fail — a missing sound should never break the workflow
  }
}

function playAsync(config = {}) {
  const command = getCommand(config);
  try {
    exec(command, { windowsHide: true });
  } catch {
    // Silently fail
  }
}

module.exports = { play, playAsync, getCommand, getPresetNames, PRESETS };
