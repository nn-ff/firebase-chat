import { Button, Input } from 'antd'
import { getAuth, signOut } from 'firebase/auth'
import React, { FC, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { removeUser } from '../../store/slices/userSlice'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import { addDoc, collection, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'

export const Chat: FC = () => {
  const [value, setValue] = useState<string>('')
  const auth = getAuth()
  const [messages, loading, error] = useCollectionData(
    query(collection(db, 'messages'), orderBy('timestamp', 'asc')),
  )
  const [user] = useAuthState(auth)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const chatRef = useRef<HTMLDivElement>(null)
  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  const onClickLogout = () => {
    signOut(auth)
    dispatch(removeUser())
    navigate('/')
  }

  const sendMessage = async () => {
    try {
      setValue('')
      const docRef = await addDoc(collection(db, 'messages'), {
        text: value,
        uid: user?.uid,
        photoURL: user?.photoURL,
        displayName: user?.displayName,
        timestamp: serverTimestamp(),
      })
    } catch (e) {
      console.error('Error adding document: ', e)
    }
  }
  const onSubmitHandlerMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setValue('')
      const docRef = await addDoc(collection(db, 'messages'), {
        text: value,
        uid: user?.uid,
        photoURL: user?.photoURL,
        displayName: user?.displayName,
        timestamp: serverTimestamp(),
      })
    } catch (e) {
      console.error('Error adding document: ', e)
    }
  }

  useEffect(() => {
    chatRef?.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  return (
    <div className='chat-window'>
      <Button onClick={onClickLogout} style={{ position: 'absolute', right: 0 }}>
        выйти
      </Button>
      <div className='chat-window__wrapper'>
        <div style={{ marginTop: 'auto' }}></div>
        {messages?.map((obj) => {
          return (
            <div key={obj.timestamp} className='chat-window__msg'>
              <img
                style={{ height: 35, width: 35 }}
                src={
                  obj.photoURL
                    ? obj.photoURL
                    : 'https://cdn-icons-png.flaticon.com/512/25/25333.png'
                }
                alt=''
              />
              <div>
                {obj.displayName}: {obj.text}
              </div>
            </div>
          )
        })}
        <div ref={chatRef}></div>
      </div>
      <div className='chat-window__submit'>
        <form onSubmit={onSubmitHandlerMessage}>
          <Input onChange={onChangeHandler} type='text' value={value} />
          <Button onClick={sendMessage}>send</Button>
        </form>
      </div>
    </div>
  )
}
