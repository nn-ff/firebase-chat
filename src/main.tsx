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
import { ErrorBoundary } from 'react-error-boundary'
import Asd from './components/Asd'
import { ConfigProvider } from 'antd'

const store = setupStore()
const persistor = persistStore(store)
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <PersistGate persistor={persistor}>
      <Provider store={store}>
        <BrowserRouter>
          <ErrorBoundary FallbackComponent={Asd}>
            <ConfigProvider
              theme={{
                token: {
                  colorPrimary: '#595959',
                  colorBgBase: '#383a40',
                  colorTextBase: 'white',
                  lineWidth: 0,
                },
              }}
            >
              <App />
            </ConfigProvider>
          </ErrorBoundary>
        </BrowserRouter>
      </Provider>
    </PersistGate>
  </React.StrictMode>,
)
