import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface IuserSlice {
  user: {
    email: string | null
    displayName: string | null
    photoURL: string | null
  }
}

interface IuserAction {
  email: string | null
  displayName: string | null
  photoURL: string | null
}

const initialState: IuserSlice = {
  user: {
    email: null,
    displayName: null,
    photoURL: null,
  },
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<IuserAction>) {
      state.user = { ...action.payload }
    },
    removeUser(state) {
      state.user = {
        email: null,
        displayName: null,
        photoURL: null,
      }
    },
  },
})

export const { setUser, removeUser } = userSlice.actions
export default userSlice.reducer
