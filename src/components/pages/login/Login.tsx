import { Button } from 'antd'
import { FC } from 'react'
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { setUser } from '../../../store/slices/userSlice'
import { Link, useNavigate } from 'react-router-dom'

export const Login: FC = () => {
  const dispatch = useAppDispatch()
  const auth = getAuth()
  const navigate = useNavigate()
  const onClickLogin = async () => {
    const provider = new GoogleAuthProvider()
    const { user } = await signInWithPopup(auth, provider)
    dispatch(
      setUser({
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      }),
    )
    navigate('/chat')
  }
  return (
    <div style={{ display: 'flex' }}>
      <Button onClick={onClickLogin} style={{ margin: 'auto' }}>
        Login
      </Button>
      <Link to='/chat' style={{ margin: 'auto' }}>
        <Button>CHAT</Button>
      </Link>
    </div>
  )
}
