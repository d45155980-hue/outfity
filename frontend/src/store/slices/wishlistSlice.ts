import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WishlistItem {
  product: string;
  name: string;
  image: string;
  price: number;
  salePrice?: number;
}

interface WishlistState {
  wishlistItems: WishlistItem[];
}

const loadWishlistFromStorage = (): WishlistItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('wishlistItems');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const initialState: WishlistState = {
  wishlistItems: loadWishlistFromStorage(),
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist: (state, action: PayloadAction<WishlistItem>) => {
      const exists = state.wishlistItems.find(
        (item) => item.product === action.payload.product
      );
      if (!exists) {
        state.wishlistItems.push(action.payload);
      }
      localStorage.setItem('wishlistItems', JSON.stringify(state.wishlistItems));
    },

    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.wishlistItems = state.wishlistItems.filter(
        (item) => item.product !== action.payload
      );
      localStorage.setItem('wishlistItems', JSON.stringify(state.wishlistItems));
    },

    clearWishlist: (state) => {
      state.wishlistItems = [];
      localStorage.removeItem('wishlistItems');
    },
  },
});

export const { addToWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
