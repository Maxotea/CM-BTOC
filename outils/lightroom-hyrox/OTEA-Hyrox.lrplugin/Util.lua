-- Fonctions partagées du module OTEA · HYROX

local LrDate = import 'LrDate'

local Util = {}

local function rad(x) return x * math.pi / 180 end

-- Distance à vol d'oiseau entre deux points GPS, en km
function Util.distanceKm(lat1, lon1, lat2, lon2)
  local R = 6371
  local dLat = rad(lat2 - lat1)
  local dLon = rad(lon2 - lon1)
  local a = math.sin(dLat / 2) ^ 2
    + math.cos(rad(lat1)) * math.cos(rad(lat2)) * math.sin(dLon / 2) ^ 2
  return 2 * R * math.asin(math.min(1, math.sqrt(a)))
end

-- Nom de la ville HYROX la plus proche d'un point GPS, ou nil
function Util.villeDepuisGps(config, lat, lon)
  local meilleure, meilleureDistance
  for _, v in ipairs(config.villes) do
    local d = Util.distanceKm(lat, lon, v.lat, v.lon)
    if d <= config.rayonKm and (not meilleureDistance or d < meilleureDistance) then
      meilleure, meilleureDistance = v.nom, d
    end
  end
  return meilleure, meilleureDistance
end

-- Date de prise de vue (secondes Lightroom) ou nil
function Util.datePhoto(photo)
  return photo:getRawMetadata('dateTimeOriginal')
    or photo:getRawMetadata('dateTimeDigitized')
    or photo:getRawMetadata('dateTime')
end

-- "AAAA-MM-JJ"
function Util.jour(t)
  return LrDate.timeToUserFormat(t, '%Y-%m-%d')
end

-- "AAAA-MM-JJ" vers secondes Lightroom (minuit, heure locale)
function Util.tempsDepuisIso(s)
  local y, m, d = tostring(s):match('^(%d+)%-(%d+)%-(%d+)$')
  if not y then return nil end
  return LrDate.timeFromComponents(tonumber(y), tonumber(m), tonumber(d), 0, 0, 0, 'local')
end

-- Nom de la ville dont la fenêtre de course contient la date t, ou nil
function Util.villeDepuisDate(config, t)
  local marge = (config.margeJours or 0) * 86400
  for _, c in ipairs(config.datesCourses) do
    local a = Util.tempsDepuisIso(c.debut)
    local b = Util.tempsDepuisIso(c.fin)
    if a and b and t >= a - marge and t < b + 86400 + marge then
      return c.ville
    end
  end
  return nil
end

function Util.minuscules(s)
  return string.lower(tostring(s or ''))
end

-- Noms des athlètes reconnus dans les mots-clés d'une photo, dans l'ordre
-- de Config.athletes (le premier de la liste s'écrit en premier dans « Doubles »)
function Util.athletesDePhoto(config, photo)
  local motsCles = {}
  for _, kw in ipairs(photo:getRawMetadata('keywords') or {}) do
    motsCles[Util.minuscules(kw:getName())] = true
  end
  local trouves = {}
  for _, a in ipairs(config.athletes) do
    for _, alias in ipairs(a.motsCles) do
      if motsCles[Util.minuscules(alias)] then
        table.insert(trouves, a.nom)
        break
      end
    end
  end
  return trouves
end

function Util.aMotCle(photo, nomCherche)
  nomCherche = Util.minuscules(nomCherche)
  for _, kw in ipairs(photo:getRawMetadata('keywords') or {}) do
    if Util.minuscules(kw:getName()) == nomCherche then return true end
  end
  return false
end

-- Photos ciblées : la sélection en cours, sinon tout le catalogue
function Util.photosCibles(catalog, toutLeCatalogue)
  if toutLeCatalogue then return catalog:getAllPhotos() end
  local selection = catalog:getTargetPhotos()
  if #selection == 0 then return catalog:getAllPhotos() end
  return selection
end

function Util.estVideo(photo)
  return photo:getRawMetadata('fileFormat') == 'VIDEO'
end

function Util.estRejetee(photo)
  return photo:getRawMetadata('pickStatus') == -1
end

-- Toutes les photos d'un jeu de collections, sous-jeux compris, sans doublon
function Util.photosDuJeu(jeu)
  local sortie, vus = {}, {}
  local function ajoute(collection)
    for _, p in ipairs(collection:getPhotos()) do
      local id = p.localIdentifier
      if not vus[id] then
        vus[id] = true
        table.insert(sortie, p)
      end
    end
  end
  local function parcours(s)
    for _, c in ipairs(s:getChildCollections()) do ajoute(c) end
    for _, ss in ipairs(s:getChildCollectionSets()) do parcours(ss) end
  end
  parcours(jeu)
  return sortie
end

-- Jeu de collections à la racine du catalogue portant ce nom, ou nil
function Util.trouveJeuRacine(catalog, nom)
  for _, s in ipairs(catalog:getChildCollectionSets()) do
    if s:getName() == nom then return s end
  end
  return nil
end

-- Cellule CSV protégée
function Util.csvCellule(v)
  if v == nil then v = '' end
  v = tostring(v)
  if v:find('[",\n]') then
    v = '"' .. v:gsub('"', '""') .. '"'
  end
  return v
end

return Util
