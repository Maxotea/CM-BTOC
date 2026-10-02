-- OTEA · Classer les photos HYROX
-- Rattache chaque photo à une course (ville + date) par géolocalisation, ou par
-- date de prise de vue quand le GPS manque, puis la range par athlète. Deux
-- athlètes reconnus sur la même photo donnent une collection « Doubles ».

local LrApplication = import 'LrApplication'
local LrTasks = import 'LrTasks'
local LrDialogs = import 'LrDialogs'
local LrFunctionContext = import 'LrFunctionContext'
local LrProgressScope = import 'LrProgressScope'
local LrView = import 'LrView'
local LrBinding = import 'LrBinding'
local LrPathUtils = import 'LrPathUtils'
local LrDate = import 'LrDate'

local Config = require 'Config'
local Util = require 'Util'

-- Boîte de dialogue : portée et options
local function dialogue(catalog)
  return LrFunctionContext.callWithContext('OTEAClasserDialogue', function(context)
    local f = LrView.osFactory()
    local p = LrBinding.makePropertyTable(context)
    local nbSelection = #catalog:getTargetPhotos()
    p.portee = nbSelection > 0 and 'selection' or 'catalogue'
    p.ignorerRejetees = true
    p.classerAutres = false
    p.rapport = true

    local contenu = f:column {
      bind_to_object = p,
      spacing = f:control_spacing(),
      f:static_text {
        title = 'Classe les photos en collections : une par course (ville + date), '
          .. 'puis une par athlète, avec une collection Doubles quand deux athlètes '
          .. 'sont sur la même photo.',
        width_in_chars = 72,
        height_in_lines = 3,
      },
      f:group_box {
        title = 'Photos à classer',
        f:radio_button {
          title = string.format('La sélection en cours (%d photos)', nbSelection),
          value = LrView.bind 'portee', checked_value = 'selection',
          enabled = nbSelection > 0,
        },
        f:radio_button {
          title = 'Tout le catalogue',
          value = LrView.bind 'portee', checked_value = 'catalogue',
        },
      },
      f:checkbox { title = 'Ignorer les photos rejetées (drapeau X)', value = LrView.bind 'ignorerRejetees' },
      f:checkbox { title = 'Classer aussi les photos hors HYROX, par journée de prise de vue', value = LrView.bind 'classerAutres' },
      f:checkbox { title = 'Écrire un rapport CSV sur le Bureau', value = LrView.bind 'rapport' },
    }

    local resultat = LrDialogs.presentModalDialog {
      title = 'OTEA · Classer les photos HYROX',
      contents = contenu,
      actionVerb = 'Classer',
    }
    if resultat ~= 'ok' then return nil end
    return {
      portee = p.portee,
      ignorerRejetees = p.ignorerRejetees,
      classerAutres = p.classerAutres,
      rapport = p.rapport,
    }
  end)
end

-- Lecture des métadonnées : une fiche par photo retenue
local function analyser(photos, opts, progress)
  local fiches = {}
  local total = #photos
  for i, photo in ipairs(photos) do
    if progress:isCanceled() then return nil end
    if i % 50 == 0 then
      progress:setPortionComplete(i, total)
      progress:setCaption(string.format('Analyse %d / %d', i, total))
      LrTasks.yield()
    end
    local retenue = not Util.estVideo(photo)
      and not (opts.ignorerRejetees and Util.estRejetee(photo))
    if retenue then
      local t = Util.datePhoto(photo)
      local gps = photo:getRawMetadata('gps')
      local ville, source
      if gps and gps.latitude and gps.longitude then
        ville = Util.villeDepuisGps(Config, gps.latitude, gps.longitude)
        if ville then source = 'gps' end
      end
      if not ville and t then
        ville = Util.villeDepuisDate(Config, t)
        if ville then source = 'date' end
      end
      local athletes = Util.athletesDePhoto(Config, photo)
      local motCleHyrox = Util.aMotCle(photo, Config.motCleHyrox)
      table.insert(fiches, {
        photo = photo,
        t = t,
        gps = gps,
        ville = ville,
        source = source,
        athletes = athletes,
        hyrox = (ville ~= nil) or motCleHyrox or (#athletes > 0),
      })
    end
  end
  return fiches
end

-- Nomme la course de chaque fiche : « Ville AAAA-MM-JJ », la date étant celle
-- du premier jour. Deux séries dans la même ville séparées de plus de
-- Config.ecartJoursMemeCourse jours sont deux courses distinctes.
local function nommerCourses(fiches)
  local parVille = {}
  for _, f in ipairs(fiches) do
    if f.hyrox and f.ville then
      parVille[f.ville] = parVille[f.ville] or {}
      table.insert(parVille[f.ville], f)
    end
  end
  local ecart = Config.ecartJoursMemeCourse * 86400
  for ville, liste in pairs(parVille) do
    table.sort(liste, function(a, b) return (a.t or 0) < (b.t or 0) end)
    local debut, precedent
    for _, f in ipairs(liste) do
      local t = f.t or 0
      if not debut or (t - precedent) > ecart then debut = t end
      precedent = t
      if debut > 0 then
        f.course = ville .. ' ' .. Util.jour(debut)
      else
        f.course = ville .. ' (date inconnue)'
      end
    end
  end
end

local function sousGroupe(f)
  if #f.athletes == 0 then return 'À identifier' end
  if #f.athletes == 1 then return f.athletes[1] end
  return 'Doubles · ' .. table.concat(f.athletes, ' + ')
end

-- Création des collections
local function ecrire(catalog, fiches, opts)
  local plan, ordreCourses = {}, {}
  local aSituer, autres = {}, {}

  for _, f in ipairs(fiches) do
    if f.hyrox then
      if f.course then
        if not plan[f.course] then
          plan[f.course] = { Toutes = {} }
          table.insert(ordreCourses, f.course)
        end
        local sg = sousGroupe(f)
        plan[f.course][sg] = plan[f.course][sg] or {}
        table.insert(plan[f.course][sg], f.photo)
        table.insert(plan[f.course].Toutes, f.photo)
      else
        table.insert(aSituer, f.photo)
      end
    elseif opts.classerAutres and f.t then
      local j = Util.jour(f.t)
      autres[j] = autres[j] or {}
      table.insert(autres[j], f.photo)
    end
  end
  table.sort(ordreCourses)

  local resume = {}
  catalog:withWriteAccessDo('OTEA · Classer les photos HYROX', function()
    local racine = catalog:createCollectionSet(Config.nomJeuRacine, nil, true)

    for _, course in ipairs(ordreCourses) do
      local jeu = catalog:createCollectionSet(course, racine, true)
      local noms = {}
      for sg in pairs(plan[course]) do table.insert(noms, sg) end
      table.sort(noms)
      local detail = {}
      for _, sg in ipairs(noms) do
        local collection = catalog:createCollection(sg, jeu, true)
        collection:addPhotos(plan[course][sg])
        if sg ~= 'Toutes' then
          table.insert(detail, string.format('%s %d', sg, #plan[course][sg]))
        end
      end
      table.insert(resume, string.format('%s : %d photos (%s)',
        course, #plan[course].Toutes, table.concat(detail, ', ')))
    end

    if #aSituer > 0 then
      local collection = catalog:createCollection('À situer (ni GPS ni date de course)', racine, true)
      collection:addPhotos(aSituer)
      table.insert(resume, string.format('À situer : %d photos', #aSituer))
    end

    if opts.classerAutres then
      local jeuAutres = catalog:createCollectionSet(Config.nomCollectionAutres, nil, true)
      local jours = {}
      for j in pairs(autres) do table.insert(jours, j) end
      table.sort(jours)
      for _, j in ipairs(jours) do
        catalog:createCollection(j, jeuAutres, true):addPhotos(autres[j])
      end
      table.insert(resume, string.format('%s : %d journées', Config.nomCollectionAutres, #jours))
    end
  end, { timeout = 600 })

  return resume
end

-- Rapport CSV sur le Bureau
local function ecrireRapport(fiches)
  local nom = 'otea-hyrox-classement-'
    .. LrDate.timeToUserFormat(LrDate.currentTime(), '%Y-%m-%d-%H%M') .. '.csv'
  local chemin = LrPathUtils.child(LrPathUtils.getStandardFilePath('desktop'), nom)
  local fh = io.open(chemin, 'w')
  if not fh then return nil end
  fh:write('fichier,date,latitude,longitude,ville,source,course,athletes,sous_groupe,hyrox,drapeau,note\n')
  for _, f in ipairs(fiches) do
    local photo = f.photo
    local ligne = {
      photo:getFormattedMetadata('fileName') or '',
      f.t and Util.jour(f.t) or '',
      (f.gps and f.gps.latitude) or '',
      (f.gps and f.gps.longitude) or '',
      f.ville or '',
      f.source or '',
      f.course or '',
      table.concat(f.athletes, ' + '),
      f.hyrox and sousGroupe(f) or '',
      f.hyrox and 'oui' or 'non',
      photo:getRawMetadata('pickStatus') or 0,
      photo:getRawMetadata('rating') or 0,
    }
    for i, v in ipairs(ligne) do ligne[i] = Util.csvCellule(v) end
    fh:write(table.concat(ligne, ',') .. '\n')
  end
  fh:close()
  return chemin
end

LrTasks.startAsyncTask(function()
  LrFunctionContext.callWithContext('OTEAClasser', function(context)
    local catalog = LrApplication.activeCatalog()
    local opts = dialogue(catalog)
    if not opts then return end

    local photos = Util.photosCibles(catalog, opts.portee == 'catalogue')
    local progress = LrProgressScope { title = 'OTEA · Classement HYROX', functionContext = context }
    progress:setCancelable(true)

    local fiches = analyser(photos, opts, progress)
    if not fiches then
      progress:done()
      return
    end
    nommerCourses(fiches)

    progress:setCaption('Création des collections')
    local resume = ecrire(catalog, fiches, opts)
    local chemin = opts.rapport and ecrireRapport(fiches) or nil
    progress:done()

    local message
    if #resume == 0 then
      message = 'Aucune photo HYROX reconnue. Vérifie que les photos ont un GPS, '
        .. 'ou ajoute la course dans Config.lua (datesCourses), ou pose le mot-clé HYROX.'
    else
      message = table.concat(resume, '\n')
    end
    if chemin then message = message .. '\n\nRapport : ' .. chemin end
    LrDialogs.message('OTEA · Classement terminé', message, 'info')
  end)
end)
