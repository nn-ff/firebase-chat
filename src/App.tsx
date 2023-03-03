import { Spin } from 'antd'
import { getAuth } from 'firebase/auth'
import React from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { Route, Routes } from 'react-router-dom'
import { Chat } from './components/chat'
import { Login } from './components/pages'
import ProtectedRoute from './components/ProtectedRoute'

const App = () => {
  const auth = getAuth()
  const [user, load] = useAuthState(auth)

  return (
    <div className='wrapper'>
      <div className='chat-wrapper'>
        {load ? (
          <Spin style={{ display: 'flex', alignSelf: 'center' }} />
        ) : (
          <Routes>
            <Route path='/' element={user ? <Chat /> : <Login />} />
            <Route
              path='/chat'
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
          </Routes>
        )}
      </div>
    </div>
  )
}

export default App
