// components/store/StorePageClient.tsx
'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchWithAllTokens, initAll } from '@/lib/api'
import { useAuth } from '@/lib/useAuth'
import { 
  StoreIcon, 
  GamepadIcon, 
  SearchIcon,
  CloseIcon
} from '@/components/icons'
import Loading from '@/components/loading'
import ProductCard, { type Product } from './ProductCard'

// =====================================================
// DYNAMIC IMPORT DE LA MODAL
// =====================================================
const ProductModal = dynamic(
  () => import('@/components/store/ProductModal'),
  {
    ssr: false,
    loading: () => null,
  }
)

// =====================================================
// TYPES
// =====================================================
interface CategoryGroup {
  categoryName: string
  products: Product[]
}

// =====================================================
// HELPER - normalisation pour recherche insensible aux accents/casse
// =====================================================
function normalizeForSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // retire les accents
    .trim()
}

// =====================================================
// COMPOSANT PRINCIPAL
// =====================================================
export default function StorePageClient() {
  useAuth()
  const router = useRouter()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductModal, setShowProductModal] = useState(false)
  const [showLoading, setShowLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('Chargement en cours...')
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([])
  const [dataLoaded, setDataLoaded] = useState(false)

  // =====================================================
  // CHARGEMENT DES PRODUITS
  // =====================================================
  useEffect(() => {
    let cancelled = false
    
    async function loadProducts() {
      setShowLoading(true)
      setLoadingText('Chargement des produits...')
      try {
        await initAll()
        const res = await fetchWithAllTokens('/api/products')
        if (!res.ok) throw new Error('Erreur chargement')
        const products: Product[] = await res.json()
        if (!cancelled && products && Array.isArray(products)) {
          const productsByCategory: Record<string, Product[]> = {}
          products.forEach(product => {
            const catName = product.category_name || 'Autres'
            if (!productsByCategory[catName]) productsByCategory[catName] = []
            productsByCategory[catName].push(product)
          })
          setCategoryGroups(Object.entries(productsByCategory).map(([categoryName, products]) => ({ categoryName, products })))
          setDataLoaded(true)
        }
      } catch (error) {
        console.error('Erreur chargement produits:', error)
      } finally {
        if (!cancelled) setShowLoading(false)
      }
    }
    
    loadProducts()
    return () => { cancelled = true }
  }, [])

  // =====================================================
  // CALLBACK STABLE POUR LA SÉLECTION DE PRODUIT
  // =====================================================
  const handleSelectProduct = useCallback((product: Product) => {
    setSelectedProduct(product)
    setShowProductModal(true)
  }, [])

  // =====================================================
  // FILTRAGE DES PRODUITS - MEMOISÉ
  // Recherche sur titre, description et categorie, insensible aux accents/casse
  // =====================================================
  const filteredGroups = useMemo(() => {
    const query = normalizeForSearch(searchQuery)
    if (!query) return categoryGroups

    return categoryGroups
      .map(g => ({
        ...g,
        products: g.products.filter(p => {
          const haystack = normalizeForSearch(
            `${p.title} ${p.description || ''} ${g.categoryName}`
          )
          return haystack.includes(query)
        })
      }))
      .filter(g => g.products.length > 0)
  }, [categoryGroups, searchQuery])

  // =====================================================
  // FONCTIONS DE PAIEMENT
  // =====================================================
  const handleBuyFromModal = useCallback((product: Product) => {
    setShowProductModal(false)
    const isLevel = product.is_level || product.category_name?.toLowerCase().includes('niveau') || product.type === 'level'
    setShowLoading(true)
    setLoadingText('Redirection vers le paiement...')
    setTimeout(() => {
      setShowLoading(false)
      router.push(isLevel ? `/achat?niveau=${encodeURIComponent(product.id)}` : `/achat?produit=${encodeURIComponent(product.title)}`)
    }, 500)
  }, [router])

  // =====================================================
  // RENDU
  // =====================================================
  return (
    <>
      {/* ============================================ */}
      {/* LOADING - Composant partagé */}
      {/* ============================================ */}
      <Loading show={showLoading} text={loadingText} />

      {/* ============================================ */}
      {/* STORE HEADER */}
      {/* ============================================ */}
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center justify-center gap-2.5 mb-2">
          <span className="text-emerald-400"><StoreIcon /></span> WariStore
        </h1>
        <p className="text-white/50 text-sm">Boostez votre experience de jeu</p>
      </div>

      {/* ============================================ */}
      {/* SEARCH */}
      {/* ============================================ */}
      <div className="flex items-center gap-3 bg-white/[0.04] border border-emerald-400/10 rounded-2xl px-4 mb-6 transition-all focus-within:border-emerald-400/40 focus-within:shadow-[0_0_0_3px_rgba(0,200,150,0.1)]">
        <span className="text-emerald-400 flex-shrink-0"><SearchIcon /></span>
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 py-3.5 bg-transparent border-none text-white text-sm outline-none placeholder:text-white/40"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            aria-label="Effacer la recherche"
            className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all flex items-center justify-center"
          >
            <CloseIcon />
          </button>
        )}
      </div>

      {/* ============================================ */}
      {/* CATEGORIES WITH PRODUCTS */}
      {/* Pleine largeur, aucune limite - la grille s'etend avec l'ecran */}
      {/* ============================================ */}
      <div className="w-full">
        {dataLoaded && filteredGroups.map((group) => (
          <div key={group.categoryName} className="mb-8">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-emerald-400/10">
              <span className="text-emerald-400"><GamepadIcon /></span>
              <h2 className="text-lg font-semibold text-white">{group.categoryName}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
              {group.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={handleSelectProduct}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {dataLoaded && filteredGroups.length === 0 && searchQuery && (
        <div className="text-center py-12 text-white/50">
          Aucun produit trouve pour &quot;{searchQuery}&quot;
        </div>
      )}

      {/* ============================================ */}
      {/* PRODUCT MODAL - CHARGÉ DYNAMIQUEMENT */}
      {/* ============================================ */}
      <AnimatePresence>
        {showProductModal && selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => setShowProductModal(false)}
            onBuy={handleBuyFromModal}
          />
        )}
      </AnimatePresence>
    </>
  )
}