type ProductMeta = {
  createdAt: string
  updatedAt: string
  barcode: string
  qrCode: string
}

export interface Product {
  id: number
  title: string
  description: string
  price: number
  rating: number
  stock: number
  category: string
  brand?: string
  thumbnail: string
  images: string[]
  meta?: ProductMeta
  // Extended fields for rig marketplace
  lbsPullback?: number
  manufacturer?: string
  model?: string
  hasVideo?: boolean
  hasPictures?: boolean
  qualifiesForEquipmentAssurance?: boolean
}

