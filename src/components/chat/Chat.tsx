import { Avatar, Button } from 'antd'
import { getAuth, signOut } from 'firebase/auth'
import React, { FC, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { removeUser } from '../../store/slices/userSlice'
import { UserOutlined } from '@ant-design/icons'
import { useAuthState } from 'react-firebase-hooks/auth'
import _, { divide } from 'lodash'
import {
  addDoc,
  collection,
  DocumentData,
  getDocs,
  limit,
  limitToLast,
  onSnapshot,
  orderBy,
  query,
  QueryDocumentSnapshot,
  serverTimestamp,
  startAfter,
} from 'firebase/firestore'
import { db } from '../../firebase'
import dayjs from 'dayjs'
import TextArea from 'antd/es/input/TextArea'
import { useInView } from 'react-intersection-observer'

export const Chat: FC = () => {
  const [value, setValue] = useState<string>('')
  const auth = getAuth()
  const [items, setItems] = useState<DocumentData[]>([])
  const [user] = useAuthState(auth)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const chatRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { ref, inView, entry } = useInView({
    threshold: 0.5,
  })
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
      await addDoc(collection(db, 'messages'), {
        text: value,
        uid: user?.uid,
        photoURL: user?.photoURL,
        displayName: user?.displayName,
        timestamp: serverTimestamp(),
      })
    } catch (e) {
      console.error('Error adding document: ', e)
    }
    chatRef?.current?.scrollIntoView()
  }
  const [latest, setLatest] = useState<QueryDocumentSnapshot<DocumentData>>()
  const onClickLoadMore = async () => {
    const q = query(
      collection(db, 'messages'),
      orderBy('timestamp', 'desc'),
      startAfter(latest),
      limit(20),
    )
    const NewItems = await getDocs(q)
    const dataitem: DocumentData[] = []
    if (!NewItems.empty) {
      NewItems.forEach((doc) => {
        dataitem.push(doc.data())
      })
      setItems(_.unionBy([...dataitem].reverse(), [...items], 'timestamp.seconds'))

      setLatest(NewItems.docs[NewItems.docs.length - 1])
    } else {
      alert('нет данных')
    }
  }
  useEffect(() => {
    if (inView && latest) {
      onClickLoadMore()
    }
  }, [inView])
  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('timestamp', 'desc'), limit(5))
    const unsub = onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot.metadata.hasPendingWrites) {
        const dataitem: DocumentData[] = []
        querySnapshot.forEach((doc) => {
          dataitem.push(doc.data())
        })
        setLatest(querySnapshot.docs[querySnapshot.docs.length - 1])
        setItems((prevState) => {
          return _.unionBy([...prevState], [...dataitem].reverse(), 'timestamp.seconds')
        })
      } else {
        setLatest(querySnapshot.docs[querySnapshot.docs.length - 1])
      }
    })
    return () => unsub()
  }, [])
  useLayoutEffect(() => {
    if (inView) {
      scrollRef?.current?.scrollIntoView()
    } else {
      chatRef?.current?.scrollIntoView()
    }
  }, [items])
  return (
    <div className='chat-window'>
      <Button onClick={onClickLogout} style={{ position: 'absolute', right: 0 }}>
        выйти
      </Button>

      <div className='chat-window__wrapper'>
        <div style={{ marginTop: 'auto' }}></div>
        <Button ref={ref} onClick={onClickLoadMore}>
          Load more
        </Button>
        {items?.map((obj, index) => {
          const messageTime = dayjs(obj?.timestamp?.toDate() || new Date()).format('HH:mm')
          const indexconverter = items[index - 1]?.uid ? items[index - 1].uid : 'false'
          return (
            <div key={obj.timestamp} style={{ display: 'flex' }} className='chat-window__msg'>
              {index === 20 ? <div ref={scrollRef}></div> : null}
              {indexconverter === items[index].uid ? null : (
                <div className='chat-msg__info'>
                  <Avatar
                    style={{ marginTop: 5 }}
                    size={33}
                    src={obj.photoURL}
                    icon={<UserOutlined />}
                  />
                  <div>
                    <div style={{ padding: 2, marginLeft: 10 }}>{obj.displayName}</div>
                    <span style={{ color: 'gray', padding: 2, marginLeft: 10 }}>{messageTime}</span>
                  </div>
                </div>
              )}
              <div style={{ marginTop: 5, whiteSpace: 'pre-line' }}>{obj.text}</div>
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
