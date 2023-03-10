import { Spin } from 'antd'
import { getAuth } from 'firebase/auth'
import React from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { Navigate, useLocation } from 'react-router-dom'

interface ProtectedRouteProps {
  children: JSX.Element
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const auth = getAuth()
  const [user] = useAuthState(auth)
  const location = useLocation()

  if (!user) {
    return <Navigate to='/' replace state={{ from: location }} />
  }
  return children
}

export default ProtectedRoute
