-- OTEA · Appliquer le style de retouche
-- Reprend les réglages de développement d'une photo de référence (celle que tu
-- as déjà retouchée à la main) ou un preset, et les applique aux photos
-- exploitables : non rejetées, note minimale atteinte, pas de vidéo, pas déjà
-- traitées par le module. Le recadrage, les masques locaux et les corrections
-- de perspective de la référence ne sont jamais copiés.

local LrApplication = import 'LrApplication'
local LrTasks = import 'LrTasks'
local LrDialogs = import 'LrDialogs'
local LrFunctionContext = import 'LrFunctionContext'
local LrProgressScope = import 'LrProgressScope'
local LrView = import 'LrView'
local LrBinding = import 'LrBinding'

local Config = require 'Config'
local Util = require 'Util'

-- Réglages propres à chaque image : jamais copiés depuis la référence
local prefixesExclus = {
  'Crop', 'Orientation', 'HasCrop',
  'RetouchInfo', 'RetouchAreas', 'RedEye',
  'PaintBasedCorrections', 'GradientBasedCorrections',
  'CircularGradientBasedCorrections', 'MaskGroupBasedCorrections',
  'Upright', 'Perspective',
}

-- Réglages d'exposition, conservés photo par photo si l'option est cochée
local clesExposition = {
  Exposure = true, Exposure2012 = true,
  Temperature = true, Tint = true,
  IncrementalTemperature = true, IncrementalTint = true,
  WhiteBalance = true,
}

local function filtrerStyle(reglages, conserverExposition)
  local sortie, nb = {}, 0
  for cle, valeur in pairs(reglages) do
    local garder = true
    for _, prefixe in ipairs(prefixesExclus) do
      if cle:sub(1, #prefixe) == prefixe then garder = false; break end
    end
    if conserverExposition and clesExposition[cle] then garder = false end
    if garder then
      sortie[cle] = valeur
      nb = nb + 1
    end
  end
  return sortie, nb
end

-- Presets de développement disponibles, pour le menu déroulant
local function listePresets()
  local items, parUuid = {}, {}
  for _, dossier in ipairs(LrApplication.developPresetFolders()) do
    for _, preset in ipairs(dossier:getDevelopPresets()) do
      local uuid = preset:getUuid()
      parUuid[uuid] = preset
      table.insert(items, { title = dossier:getName() .. ' / ' .. preset:getName(), value = uuid })
    end
  end
  table.sort(items, function(a, b) return a.title < b.title end)
  return items, parUuid
end

local function dialogue(catalog, reference)
  return LrFunctionContext.callWithContext('OTEARetoucherDialogue', function(context)
    local f = LrView.osFactory()
    local p = LrBinding.makePropertyTable(context)
    local itemsPresets, presetsParUuid = listePresets()
    local nbSelection = #catalog:getTargetPhotos()

    p.mode = reference and 'reference' or 'preset'
    p.presetUuid = itemsPresets[1] and itemsPresets[1].value or nil
    p.portee = nbSelection > 1 and 'selection' or 'hyrox'
    p.noteMin = 0
    p.ignorerRejetees = true
    p.conserverExposition = true
    p.sauterDejaFaites = true

    local nomReference = reference
      and (reference:getFormattedMetadata('fileName') or 'photo active')
      or 'aucune photo active'

    local contenu = f:column {
      bind_to_object = p,
      spacing = f:control_spacing(),
      f:group_box {
        title = 'Style à appliquer',
        f:radio_button {
          title = 'Les réglages de la photo active : ' .. nomReference,
          value = LrView.bind 'mode', checked_value = 'reference',
          enabled = reference ~= nil,
        },
        f:row {
          f:radio_button {
            title = 'Un preset :',
            value = LrView.bind 'mode', checked_value = 'preset',
            enabled = #itemsPresets > 0,
          },
          f:popup_menu {
            items = itemsPresets,
            value = LrView.bind 'presetUuid',
            width_in_chars = 40,
            enabled = #itemsPresets > 0,
          },
        },
        f:checkbox {
          title = 'Garder l\'exposition et la balance des blancs de chaque photo',
          value = LrView.bind 'conserverExposition',
        },
      },
      f:group_box {
        title = 'Photos à retoucher',
        f:radio_button {
          title = string.format('La sélection en cours (%d photos)', nbSelection),
          value = LrView.bind 'portee', checked_value = 'selection',
          enabled = nbSelection > 0,
        },
        f:radio_button {
          title = 'Toutes les collections du jeu « ' .. Config.nomJeuRacine .. ' »',
          value = LrView.bind 'portee', checked_value = 'hyrox',
        },
        f:row {
          f:static_text { title = 'Note minimale :' },
          f:popup_menu {
            items = {
              { title = 'Toutes les photos non rejetées', value = 0 },
              { title = '1 étoile et plus', value = 1 },
              { title = '2 étoiles et plus', value = 2 },
              { title = '3 étoiles et plus', value = 3 },
              { title = '4 étoiles et plus', value = 4 },
              { title = '5 étoiles', value = 5 },
            },
            value = LrView.bind 'noteMin',
          },
        },
        f:checkbox { title = 'Ignorer les photos rejetées (drapeau X)', value = LrView.bind 'ignorerRejetees' },
        f:checkbox {
          title = 'Ne pas repasser sur les photos déjà traitées (mot-clé « ' .. Config.motCleStyle .. ' »)',
          value = LrView.bind 'sauterDejaFaites',
        },
      },
    }

    local resultat = LrDialogs.presentModalDialog {
      title = 'OTEA · Appliquer le style de retouche',
      contents = contenu,
      actionVerb = 'Appliquer',
    }
    if resultat ~= 'ok' then return nil end
    return {
      mode = p.mode,
      preset = p.presetUuid and presetsParUuid[p.presetUuid] or nil,
      portee = p.portee,
      noteMin = p.noteMin,
      ignorerRejetees = p.ignorerRejetees,
      conserverExposition = p.conserverExposition,
      sauterDejaFaites = p.sauterDejaFaites,
    }
  end)
end

LrTasks.startAsyncTask(function()
  LrFunctionContext.callWithContext('OTEARetoucher', function(context)
    local catalog = LrApplication.activeCatalog()
    local reference = catalog:getTargetPhoto()
    local opts = dialogue(catalog, reference)
    if not opts then return end

    if opts.mode == 'preset' and not opts.preset then
      LrDialogs.message('Aucun preset choisi',
        'Choisis un preset dans la liste, ou sélectionne d\'abord la photo déjà retouchée pour copier ses réglages.', 'warning')
      return
    end

    -- Style
    local style, nbReglages
    if opts.mode == 'reference' then
      style, nbReglages = filtrerStyle(reference:getDevelopSettings(), opts.conserverExposition)
      if nbReglages == 0 then
        LrDialogs.message('Rien à copier',
          'La photo active n\'a aucun réglage de développement. Sélectionne une photo que tu as déjà retouchée.', 'warning')
        return
      end
    end

    -- Cibles
    local photos
    if opts.portee == 'selection' then
      photos = catalog:getTargetPhotos()
    else
      local jeu = Util.trouveJeuRacine(catalog, Config.nomJeuRacine)
      if not jeu then
        LrDialogs.message('Jeu de collections introuvable',
          'Lance d\'abord « OTEA · Classer les photos HYROX » pour créer le jeu « '
            .. Config.nomJeuRacine .. ' », ou sélectionne les photos à la main.', 'warning')
        return
      end
      photos = Util.photosDuJeu(jeu)
    end

    local cibles, ignorees = {}, { video = 0, rejetee = 0, note = 0, dejaFaite = 0 }
    local idReference = reference and reference.localIdentifier or nil
    for _, photo in ipairs(photos) do
      if photo.localIdentifier ~= idReference then
        if Util.estVideo(photo) then
          ignorees.video = ignorees.video + 1
        elseif opts.ignorerRejetees and Util.estRejetee(photo) then
          ignorees.rejetee = ignorees.rejetee + 1
        elseif (photo:getRawMetadata('rating') or 0) < opts.noteMin then
          ignorees.note = ignorees.note + 1
        elseif opts.sauterDejaFaites and Util.aMotCle(photo, Config.motCleStyle) then
          ignorees.dejaFaite = ignorees.dejaFaite + 1
        else
          table.insert(cibles, photo)
        end
      end
    end

    if #cibles == 0 then
      LrDialogs.message('Rien à retoucher',
        string.format('Aucune photo ne remplit les critères (vidéos %d, rejetées %d, note trop basse %d, déjà traitées %d).',
          ignorees.video, ignorees.rejetee, ignorees.note, ignorees.dejaFaite), 'info')
      return
    end

    local confirmation = LrDialogs.confirm(
      string.format('Appliquer le style à %d photos ?', #cibles),
      'Chaque photo garde son historique : un retour en arrière reste possible photo par photo, '
        .. 'et le mot-clé « ' .. Config.motCleStyle .. ' » est posé sur chacune.',
      'Appliquer', 'Annuler')
    if confirmation ~= 'ok' then return end

    local progress = LrProgressScope { title = 'OTEA · Style de retouche', functionContext = context }
    progress:setCancelable(true)

    local motCle
    catalog:withWriteAccessDo('OTEA · Mot-clé de suivi', function()
      motCle = catalog:createKeyword(Config.motCleStyle, {}, false, nil, true)
    end, { timeout = 120 })

    local faites = 0
    local taille = 100
    for debut = 1, #cibles, taille do
      if progress:isCanceled() then break end
      local fin = math.min(debut + taille - 1, #cibles)
      catalog:withWriteAccessDo('OTEA · Style de retouche', function()
        for i = debut, fin do
          local photo = cibles[i]
          if opts.mode == 'preset' then
            photo:applyDevelopPreset(opts.preset, _PLUGIN)
          else
            photo:applyDevelopSettings(style, 'OTEA · style de retouche')
          end
          if motCle then photo:addKeyword(motCle) end
          faites = faites + 1
        end
      end, { timeout = 300 })
      progress:setPortionComplete(fin, #cibles)
      progress:setCaption(string.format('Retouche %d / %d', fin, #cibles))
      LrTasks.yield()
    end

    -- Collection de contrôle, pour relire d'un coup ce qui a été traité
    local racine = Util.trouveJeuRacine(catalog, Config.nomJeuRacine)
    if racine and faites > 0 then
      catalog:withWriteAccessDo('OTEA · Collection de contrôle', function()
        local collection = catalog:createCollection('Retouchées (style OTEA)', racine, true)
        collection:addPhotos(cibles)
      end, { timeout = 120 })
    end

    progress:done()
    LrDialogs.message('OTEA · Retouche terminée',
      string.format('%d photos traitées.\nIgnorées : vidéos %d, rejetées %d, note trop basse %d, déjà traitées %d.',
        faites, ignorees.video, ignorees.rejetee, ignorees.note, ignorees.dejaFaite), 'info')
  end)
end)
