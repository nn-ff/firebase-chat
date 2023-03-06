import { Avatar } from 'antd'
import React, { FC } from 'react'
import { UserOutlined } from '@ant-design/icons'
import { DocumentData } from 'firebase/firestore'

interface MessageProps {
  Time: string
  indexUser: string
  index: number
  items: DocumentData[]
  obj: DocumentData
  scrollRef: React.ForwardedRef<HTMLDivElement>
}

const Message: FC<MessageProps> = ({ indexUser, Time, index, items, obj, scrollRef }) => {
  return (
    <div style={{ display: 'flex' }} className='chat-window__msg'>
      {index === 20 ? <div ref={scrollRef}></div> : null}
      {indexUser === items[index].uid ? null : (
        <div className='chat-msg__info'>
          <Avatar style={{ marginTop: 5 }} size={33} src={obj.photoURL} icon={<UserOutlined />} />
          <div>
            <div style={{ padding: 2, marginLeft: 10 }}>{obj.displayName}</div>
            <span style={{ color: 'gray', padding: 2, marginLeft: 10 }}>{Time}</span>
          </div>
        </div>
      )}
      <div style={{ marginTop: 5, whiteSpace: 'pre-line' }}>{obj.text}</div>
    </div>
  )
}

export default Message
