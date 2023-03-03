import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { setupStore } from './store'
import { Provider } from 'react-redux'
import App from './App'
import './index.css'
import './firebase'
import { persistStore } from 'redux-persist'
import { PersistGate } from 'redux-persist/integration/react'

const store = setupStore()
const persistor = persistStore(store)

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <PersistGate persistor={persistor}>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </PersistGate>
  </React.StrictMode>,
)
