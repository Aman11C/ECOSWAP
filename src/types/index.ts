export interface User {
  id: string
  name: string
  email: string
  profile_image: string | null
  location: string | null
  bio: string | null
  credits: number
  created_at: string
}

export interface Item {
  id: string
  user_id: string
  title: string
  description: string
  image_url: string
  category: string
  condition: string
  credits: number
  location: string | null
  status: string
  created_at: string
  user?: User
  latitude?: number | null
  longitude?: number | null
}

export interface Exchange {
  id: string
  item_id: string
  sender_id: string
  receiver_id: string
  status: string
  created_at: string
  item?: Item
  sender?: User
  receiver?: User
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  exchange_id: string | null
  message: string
  created_at: string
  sender?: User
}

export interface Review {
  id: string
  reviewer_id: string
  user_id: string
  exchange_id: string | null
  rating: number
  comment: string | null
  created_at: string
  reviewer?: User
}

export type Category = "Books" | "Electronics" | "Clothes" | "Furniture" | "Sports" | "Others"
