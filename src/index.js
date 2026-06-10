const { play, playDetached, playAsync, getPresetNames, PRESETS } = require("./sound");
const { load, save, getConfigPath, DEFAULT_CONFIG } = require("./config");
const { install, uninstall, isInstalled, installedEvents } = require("./installer");

module.exports = {
  play,
  playDetached,
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
  installedEvents,
};
