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
import TextArea from 'antd/es/input/TextArea'

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
  const formRef = useRef<HTMLFormElement>(null)
  const onChangeHandler = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
  }

  const onClickLogout = () => {
    signOut(auth)
    dispatch(removeUser())
    navigate('/')
  }

  const EnterSubmitHandler = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmitMessage(e)
    }
  }

  const onSubmitMessage = async (
    e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
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
  }, [messages])
  return (
    <div className='chat-window'>
      <Button onClick={onClickLogout} style={{ position: 'absolute', right: 0 }}>
        выйти
      </Button>
      <div className='chat-window__wrapper'>
        <div style={{ marginTop: 'auto' }}></div>
        {messages?.map((obj, index) => {
          const messageTime = dayjs(obj?.timestamp?.toDate() || new Date()).format('hh:mm')
          console.log(dayjs(new Date()).format('hh:mm'))
          const indexconverter = messages[index - 1]?.uid ? messages[index - 1].uid : 'false'
          return (
            <div key={obj.timestamp} style={{ display: 'flex' }} className='chat-window__msg'>
              {indexconverter === messages[index].uid ? null : (
                <div className='chat-msg__info'>
                  <Avatar
                    style={{ marginTop: 5 }}
                    size={33}
                    src={obj.photoURL}
                    icon={<UserOutlined />}
                  />
                  <div style={{ whiteSpace: 'pre-line' }}>
                    <div style={{ padding: 2 }}>{obj.displayName}</div>
                    <span style={{ color: 'gray', padding: 2 }}>{messageTime}</span>
                  </div>
                </div>
              )}
              <div style={{ marginTop: 5 }}>{obj.text}</div>
            </div>
          )
        })}
        <div ref={chatRef}></div>
      </div>
      <div className='chat-window__submit'>
        <form
          ref={formRef}
          style={{ display: 'flex', position: 'relative' }}
          onSubmit={onSubmitMessage}
        >
          <TextArea
            style={{ paddingRight: 20, color: 'white' }}
            value={value}
            onChange={onChangeHandler}
            placeholder='Написать в чат...'
            autoSize={{ minRows: 1, maxRows: 5 }}
            onResize={() => chatRef?.current?.scrollIntoView()}
            onKeyDown={EnterSubmitHandler}
          />
          <button type='submit' className='chat-form__icon'>
            <img
              style={{ width: 20, height: 20 }}
              src='https://cdn-icons-png.flaticon.com/512/2343/2343641.png'
              alt=''
            />
          </button>
        </form>
      </div>
    </div>
  )
}
