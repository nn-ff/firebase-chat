import { Button } from 'antd'
import { getAuth, signOut } from 'firebase/auth'
import React, { FC, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { removeUser } from '../../store/slices/userSlice'
import { useAuthState } from 'react-firebase-hooks/auth'
import _ from 'lodash'
import {
  addDoc,
  collection,
  DocumentData,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  QueryDocumentSnapshot,
  serverTimestamp,
  startAfter,
  startAt,
} from 'firebase/firestore'

import { db } from '../../firebase'
import dayjs from 'dayjs'
import TextArea from 'antd/es/input/TextArea'
import { useInView } from 'react-intersection-observer'
import Message from './Message'
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react'

export const Chat: FC = () => {
  const [value, setValue] = useState<string>('')
  const auth = getAuth()
  const [items, setItems] = useState<DocumentData[]>([])
  const [user] = useAuthState(auth)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [visible, setVisible] = useState<boolean>(false)
  const chatRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLButtonElement>(null)
  const { ref, inView } = useInView({
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
        setLatest((prevstate) =>
          prevstate ? prevstate : querySnapshot.docs[querySnapshot.docs.length - 1],
        )
        setItems((prevState) => {
          return _.unionBy([...prevState], [...dataitem].reverse(), 'timestamp.seconds')
        })
      } else {
        setLatest((prevstate) =>
          prevstate ? prevstate : querySnapshot.docs[querySnapshot.docs.length - 1],
        )
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
  const onEmojiClick = (emojiData: EmojiClickData) => {
    console.log(emojiData.emoji)
    setValue((prevstate) => prevstate + emojiData.emoji)
    setVisible(false)
    inputRef?.current?.focus()
  }

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
        {items?.map((obj, index, arr) => {
          const messageTime = dayjs(obj?.timestamp?.toDate() || new Date()).format('HH:mm')
          const indexUser = items[index - 1]?.uid ? items[index - 1].uid : 'false'
          return (
            <Message
              key={obj.timestamp}
              Time={messageTime}
              indexUser={indexUser}
              index={index}
              items={arr}
              obj={obj}
              scrollRef={scrollRef}
            />
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
            ref={inputRef}
          />
          <img
            src='https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Twemoji_1f600.svg/1200px-Twemoji_1f600.svg.png'
            onClick={() => setVisible(!visible)}
            style={{ position: 'absolute', right: '10px', top: '5px', width: 23, height: 23 }}
          ></img>
          {visible && (
            <EmojiPicker
              emojiVersion='2.0'
              skinTonesDisabled={true}
              onEmojiClick={onEmojiClick}
              lazyLoadEmojis={true}
              theme={Theme.DARK}
              height={400}
              width='50%'
            />
          )}
        </form>
      </div>
    </div>
  )
}
