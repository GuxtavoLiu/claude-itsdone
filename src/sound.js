const { spawn, spawnSync } = require("child_process");
const path = require("path");
const os = require("os");

function sanitizePath(filePath) {
  const resolved = path.resolve(filePath);
  // Quoting below handles everything else; reject only characters that can
  // break across the quoting layers (and are invalid in Windows paths anyway).
  if (/["\r\n\0]/.test(resolved)) {
    return null;
  }
  return resolved;
}

function quoteForPowershell(value) {
  return "'" + value.replace(/'/g, "''") + "'";
}

function quoteForSh(value) {
  return "'" + value.replace(/'/g, "'\\''") + "'";
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
  coin: {
    type: "melody",
    params: {
      notes: [
        { frequency: 988, duration: 80 },
        { frequency: 1319, duration: 120 },
      ],
    },
  },
  levelup: {
    type: "melody",
    params: {
      notes: [
        { frequency: 523, duration: 80 },
        { frequency: 659, duration: 80 },
        { frequency: 784, duration: 80 },
        { frequency: 1047, duration: 80 },
        { frequency: 1319, duration: 150 },
      ],
    },
  },
  doorbell: {
    type: "melody",
    params: {
      notes: [
        { frequency: 659, duration: 250 },
        { frequency: 523, duration: 350 },
      ],
    },
  },
  alert: {
    type: "melody",
    params: {
      notes: [
        { frequency: 1000, duration: 100 },
        { frequency: 0, duration: 60 },
        { frequency: 1000, duration: 100 },
        { frequency: 0, duration: 60 },
        { frequency: 1000, duration: 100 },
      ],
    },
  },
  whistle: {
    type: "melody",
    params: {
      notes: [
        { frequency: 1200, duration: 150 },
        { frequency: 900, duration: 150 },
        { frequency: 600, duration: 200 },
      ],
    },
  },
};

function getPresetNames() {
  return Object.keys(PRESETS);
}

function powershellSpec(script) {
  return {
    cmd: "powershell.exe",
    args: ["-NoProfile", "-NonInteractive", "-Command", script],
  };
}

function shSpec(script) {
  return { cmd: "/bin/sh", args: ["-c", script] };
}

function buildBeepSpec(frequency, duration) {
  const freq = Math.max(37, Math.min(32767, Math.round(Number(frequency) || 800)));
  const dur = Math.max(1, Math.min(10000, Math.round(Number(duration) || 300)));
  const platform = os.platform();

  if (platform === "win32") {
    return powershellSpec(`[Console]::Beep(${freq}, ${dur})`);
  } else if (platform === "darwin") {
    return shSpec(
      `afplay /System/Library/Sounds/Tink.aiff 2>/dev/null || printf '\\a'`
    );
  } else {
    return shSpec(
      `( command -v paplay >/dev/null 2>&1 && paplay /usr/share/sounds/freedesktop/stereo/message.oga 2>/dev/null ) || ( command -v aplay >/dev/null 2>&1 && aplay -q /usr/share/sounds/sound-icons/xylofon.wav 2>/dev/null ) || printf '\\a'`
    );
  }
}

function buildMelodySpec(notes) {
  const platform = os.platform();

  if (platform === "win32") {
    const beeps = notes
      .map((n) => {
        const freq = Math.max(37, Math.min(32767, Math.round(Number(n.frequency) || 0)));
        const dur = Math.max(1, Math.min(10000, Math.round(Number(n.duration) || 100)));
        return freq > 0
          ? `[Console]::Beep(${freq}, ${dur})`
          : `Start-Sleep -Milliseconds ${dur}`;
      })
      .join("; ");
    return powershellSpec(beeps);
  } else if (platform === "darwin") {
    const count = notes.filter((n) => n.frequency > 0).length;
    const cmds = [];
    for (let i = 0; i < count; i++) {
      cmds.push("afplay /System/Library/Sounds/Tink.aiff 2>/dev/null");
    }
    return shSpec(`( ${cmds.join(" && sleep 0.1 && ")} ) || printf '\\a'`);
  } else {
    const count = notes.filter((n) => n.frequency > 0).length;
    const cmds = [];
    for (let i = 0; i < count; i++) {
      cmds.push("paplay /usr/share/sounds/freedesktop/stereo/message.oga 2>/dev/null");
    }
    return shSpec(
      `( command -v paplay >/dev/null 2>&1 && ${cmds.join(" && sleep 0.1 && ")} ) || printf '\\a'`
    );
  }
}

function buildCustomFileSpec(filePath) {
  const platform = os.platform();
  const resolved = sanitizePath(filePath);

  if (!resolved) {
    return buildBeepSpec(800, 300);
  }

  if (platform === "win32") {
    return powershellSpec(
      `(New-Object Media.SoundPlayer ${quoteForPowershell(resolved)}).PlaySync()`
    );
  } else if (platform === "darwin") {
    return shSpec(`afplay ${quoteForSh(resolved)}`);
  } else {
    const quoted = quoteForSh(resolved);
    return shSpec(
      `( command -v paplay >/dev/null 2>&1 && paplay ${quoted} ) || ( command -v aplay >/dev/null 2>&1 && aplay -q ${quoted} ) || printf '\\a'`
    );
  }
}

function getCommandSpec(config) {
  if (config.soundFile) {
    return buildCustomFileSpec(config.soundFile);
  }

  const presetName = config.preset || "default";
  const preset = PRESETS[presetName];

  if (!preset) {
    return buildBeepSpec(800, 300);
  }

  if (preset.type === "beep") {
    return buildBeepSpec(preset.params.frequency, preset.params.duration);
  } else if (preset.type === "melody") {
    return buildMelodySpec(preset.params.notes);
  }

  return buildBeepSpec(800, 300);
}

function play(config = {}) {
  const { cmd, args } = getCommandSpec(config);
  try {
    spawnSync(cmd, args, { stdio: "ignore", windowsHide: true });
  } catch {
    // Silently fail - a missing sound should never break the workflow
  }
}

function playDetached(config = {}) {
  const { cmd, args } = getCommandSpec(config);
  try {
    const child = spawn(cmd, args, {
      detached: true,
      stdio: "ignore",
      windowsHide: true,
    });
    child.unref();
  } catch {
    // Silently fail
  }
}

module.exports = {
  play,
  playDetached,
  playAsync: playDetached,
  getCommandSpec,
  getPresetNames,
  PRESETS,
  sanitizePath,
};
