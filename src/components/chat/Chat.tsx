import { Button, Input } from 'antd'
import React, { FC, useState } from 'react'

interface Imsg {
  value: string
  id: number
}

export const Chat: FC = () => {
  const [value, setValue] = useState<string>('')
  const [msg, setMsg] = useState<Imsg[]>([])
  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  const onClickButton = () => {
    setMsg([...msg, { value: value, id: Date.now() }])
    setValue('')
  }

  return (
    <div className='chat-window'>
      <div className='chat-window__wrapper'>
        <div style={{ marginTop: 'auto' }}></div>
        {msg.map((obj) => {
          return (
            <div key={obj.id} className='chat-window__msg'>
              <img
                style={{ height: 35, width: 35 }}
                src='https://blog.cdn.own3d.tv/resize=fit:crop,height:400,width:600/BoYRMteyQBOo9hgM2TO0'
                alt=''
              />
              <div>{obj.value}</div>
            </div>
          )
        })}
      </div>
      <div className='chat-window__submit'>
        <Input onChange={onChangeHandler} type='text' value={value} />
        <Button onClick={onClickButton}>send</Button>
      </div>
    </div>
  )
}
