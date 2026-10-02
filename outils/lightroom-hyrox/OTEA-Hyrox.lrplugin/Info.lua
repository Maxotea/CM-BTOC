-- Module externe Lightroom Classic : OTEA · HYROX
-- Classe les photos de course par ville, par athlète et par doubles,
-- puis applique un style de retouche de référence aux photos exploitables.

return {
  LrSdkVersion = 6.0,
  LrSdkMinimumVersion = 6.0,
  LrToolkitIdentifier = 'com.oteaproduction.lightroom.hyrox',
  LrPluginName = 'OTEA · HYROX',
  LrPluginInfoUrl = 'https://github.com/Maxotea/CM-BTOC',

  LrLibraryMenuItems = {
    { title = 'OTEA · Classer les photos HYROX', file = 'Classer.lua' },
    { title = 'OTEA · Appliquer le style de retouche', file = 'Retoucher.lua' },
  },
  LrExportMenuItems = {
    { title = 'OTEA · Classer les photos HYROX', file = 'Classer.lua' },
    { title = 'OTEA · Appliquer le style de retouche', file = 'Retoucher.lua' },
  },

  VERSION = { major = 1, minor = 0, revision = 0, build = 1 },
}
