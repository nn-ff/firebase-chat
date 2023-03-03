import { Avatar, Button, Input } from 'antd'
import { getAuth, signOut } from 'firebase/auth'
import React, { FC, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { removeUser } from '../../store/slices/userSlice'
import { UserOutlined } from '@ant-design/icons'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import { addDoc, collection, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import dayjs from 'dayjs'

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

  const onSubmitMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (value.trim().length === 0) {
      return
    }
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
    chatRef?.current?.scrollIntoView()
  }, [])

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
          const messageTime = dayjs(obj?.timestamp?.toDate() || new Date()).format('hh:mm')
          return (
            <div key={obj.timestamp} className='chat-window__msg'>
              <Avatar size={30} src={obj.photoURL} icon={<UserOutlined />} />
              <div>
                {obj.displayName}
                <span style={{ color: 'gray' }}>{messageTime}</span>: {obj.text}
              </div>
            </div>
          )
        })}
        <div ref={chatRef}></div>
      </div>
      <div className='chat-window__submit'>
        <form style={{ display: 'flex' }} onSubmit={onSubmitMessage}>
          <Input onChange={onChangeHandler} type='text' value={value} />
          <Button htmlType='submit'>send</Button>
        </form>
      </div>
    </div>
  )
}
