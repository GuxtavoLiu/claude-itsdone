const { play, playAsync, getPresetNames, PRESETS } = require("./sound");
const { load, save, getConfigPath, DEFAULT_CONFIG } = require("./config");
const { install, uninstall, isInstalled } = require("./installer");

module.exports = {
  play,
  playAsync,
  getPresetNames,
  PRESETS,
  loadConfig: load,
  saveConfig: save,
  getConfigPath,
  DEFAULT_CONFIG,
  install,
  uninstall,
  isInstalled,
};
