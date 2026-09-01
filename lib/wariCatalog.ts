// lib/wariCatalog.ts
// Catalogue statique : importé directement depuis /data au build.
// Next.js inline le JSON dans le bundle serveur — aucune requête réseau,
// aucun cache à gérer, disponible instantanément.

import rawLevels from '@/data/wari_levels.json'
import rawGames from '@/data/wari_games.json'
import rawPaths from '@/data/wari_paths.json'

export interface WariLevel {
  id: number
  img: string
  titlePrefix?: string
  niveauText?: string
  prix?: string
  duree?: string
  buttonText?: string
}

export interface WariGame {
  id: number
  img: string
  name: string
  description?: string
  titlePrefix?: string
  demoBtn?: string
  playBtn?: string
}

export interface WariPath {
  id: number
  img: string
  name: string
  description?: string
  titlePrefix?: string
  buttonText?: string
}

interface WariCatalog {
  levels: WariLevel[]
  games: WariGame[]
  paths: WariPath[]
}

// Corrige un chemin d'image du JSON source pour qu'il soit utilisable
// tel quel dans un <img src> : ajoute le "/" initial s'il manque,
// et encode les caractères spéciaux (espaces notamment).
function normalizeImgPath(img: string): string {
  const withLeadingSlash = img.startsWith('/') ? img : `/${img}`
  return encodeURI(withLeadingSlash)
}

export function getWariCatalog(): WariCatalog {
  const levels: WariLevel[] = rawLevels.map((l: any) => ({
    id: l.id,
    img: normalizeImgPath(l.img),
    titlePrefix: l.title_prefix,
    niveauText: l.niveau_text,
    prix: l.prix,
    duree: l.duree,
    buttonText: l.button_text,
  }))

  const games: WariGame[] = rawGames.map((g: any) => ({
    id: g.id,
    img: normalizeImgPath(g.img),
    name: g.name,
    description: g.description,
    titlePrefix: g.title_prefix,
    demoBtn: g.demo_btn,
    playBtn: g.play_btn,
  }))

  const paths: WariPath[] = rawPaths.map((p: any) => ({
    id: p.id,
    img: normalizeImgPath(p.img),
    name: p.name,
    description: p.description,
    titlePrefix: p.title_prefix,
    buttonText: p.button_text,
  }))

  return { levels, games, paths }
}