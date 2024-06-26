import { useState } from 'react'
import { sendMessageToBackground } from '../../utils'

export default function Popup() {
  const link = 'https://github.com/guocaoyi/create-chrome-ext'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    // const response =
    await sendMessageToBackground({
      action: 'signUp',
      type: 'DATABASE',
      data: [email, password],
    })
  }

  return (
    <main>
      <h3>Popup Page</h3>
      <div className='calc'>
        <form onSubmit={handleSubmit}>
          <label>
            Email:
            <input type='text' value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            Password:
            <input
              type='password'
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <input type='submit' value='Submit' />
        </form>
      </div>
      <a href={link} target='_blank' rel='noreferrer'>
        generated by create-chrome-ext
      </a>
    </main>
  )
}
