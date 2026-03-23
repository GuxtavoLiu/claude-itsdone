#!/usr/bin/env node

const { play, getPresetNames } = require("../src/sound");
const config = require("../src/config");
const installer = require("../src/installer");

const args = process.argv.slice(2);
const command = args[0];

function printHelp() {
  console.log(`
  claude-bell - Sound notifications for Claude Code

  Usage:
    claude-bell <command> [options]

  Commands:
    install       Add notification hook to Claude Code settings
    uninstall     Remove notification hook from Claude Code settings
    test          Play a test sound with current settings
    notify        Play the notification (used internally by the hook)
    status        Show current installation and config status
    preset <name> Set the sound preset
    sound <path>  Set a custom sound file (.wav)
    reset         Reset configuration to defaults

  Presets:
    ${getPresetNames().join(", ")}

  Examples:
    claude-bell install          # Set up the hook
    claude-bell preset chime     # Use the chime preset
    claude-bell sound ~/ding.wav # Use a custom sound file
    claude-bell test             # Preview the sound
`);
}

function cmdInstall() {
  const result = installer.install();
  console.log(result.message);
  if (result.success) {
    console.log('\nRun "claude-bell test" to preview the notification sound.');
  }
  process.exit(result.success ? 0 : 1);
}

function cmdUninstall() {
  const result = installer.uninstall();
  console.log(result.message);
  process.exit(result.success ? 0 : 1);
}

function cmdTest() {
  const cfg = config.load();
  const presetName = cfg.soundFile ? "custom file" : cfg.preset || "default";
  console.log(`Playing notification sound (${presetName})...`);
  play(cfg);
  console.log("Done.");
}

function cmdNotify() {
  const cfg = config.load();
  play(cfg);
}

function cmdStatus() {
  const installed = installer.isInstalled();
  const cfg = config.load();

  console.log(`\n  claude-bell status\n`);
  console.log(`  Installed:    ${installed ? "yes" : "no"}`);
  console.log(`  Preset:       ${cfg.preset || "default"}`);
  console.log(`  Custom file:  ${cfg.soundFile || "(none)"}`);
  console.log(`  Config path:  ${config.getConfigPath()}`);
  console.log(`  Hook target:  ${installer.CLAUDE_SETTINGS_PATH}\n`);
}

function cmdPreset() {
  const name = args[1];
  const presets = getPresetNames();

  if (!name) {
    console.log(`Available presets: ${presets.join(", ")}`);
    const cfg = config.load();
    console.log(`Current preset: ${cfg.preset || "default"}`);
    return;
  }

  if (!presets.includes(name)) {
    console.error(`Unknown preset: "${name}"`);
    console.error(`Available presets: ${presets.join(", ")}`);
    process.exit(1);
  }

  const cfg = config.load();
  cfg.preset = name;
  cfg.soundFile = null;
  config.save(cfg);
  console.log(`Preset set to "${name}".`);
  console.log('Run "claude-bell test" to preview.');
}

function cmdSound() {
  const filePath = args[1];

  if (!filePath) {
    console.error("Please provide a path to a sound file.");
    console.error('Example: claude-bell sound ~/ding.wav');
    process.exit(1);
  }

  const fs = require("fs");
  const path = require("path");
  const resolved = path.resolve(filePath);

  if (!fs.existsSync(resolved)) {
    console.error(`File not found: ${resolved}`);
    process.exit(1);
  }

  const cfg = config.load();
  cfg.soundFile = resolved;
  config.save(cfg);
  console.log(`Custom sound set to: ${resolved}`);
  console.log('Run "claude-bell test" to preview.');
}

function cmdReset() {
  config.save({ ...config.DEFAULT_CONFIG });
  console.log("Configuration reset to defaults.");
}

switch (command) {
  case "install":
    cmdInstall();
    break;
  case "uninstall":
    cmdUninstall();
    break;
  case "test":
    cmdTest();
    break;
  case "notify":
    cmdNotify();
    break;
  case "status":
    cmdStatus();
    break;
  case "preset":
    cmdPreset();
    break;
  case "sound":
    cmdSound();
    break;
  case "reset":
    cmdReset();
    break;
  case "help":
  case "--help":
  case "-h":
    printHelp();
    break;
  default:
    printHelp();
    break;
}
