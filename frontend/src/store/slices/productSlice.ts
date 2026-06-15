import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/lib/api';
import { Product } from '@/types';

interface ProductState {
  products: Product[];
  product: Product | null;
  loading: boolean;
  error: string | null;
  productsCount: number;
  filteredProductsCount: number;
  resultPerPage: number;
}

const initialState: ProductState = {
  products: [],
  product: null,
  loading: false,
  error: null,
  productsCount: 0,
  filteredProductsCount: 0,
  resultPerPage: 12,
};

export const getProducts = createAsyncThunk(
  'products/getProducts',
  async (params: Record<string, any> | undefined, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/products', { params });
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getProductDetails = createAsyncThunk(
  'products/getProductDetails',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/products/${id}`);
      return data.product;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getAdminProducts = createAsyncThunk(
  'products/getAdminProducts',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/products');
      return data.products;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.productsCount = action.payload.productsCount;
        state.filteredProductsCount = action.payload.filteredProductsCount;
        state.resultPerPage = action.payload.resultPerPage;
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getProductDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(getProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getAdminProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdminProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(getAdminProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearErrors } = productSlice.actions;
export default productSlice.reducer;
