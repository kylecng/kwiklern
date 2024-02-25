import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { sendMessageToBackground } from '../../utils'

export default function Login() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    sendMessageToBackground({
      action: 'getSession',
      type: 'DATABASE',
    }).then(({ session }) => {
      setSession(session)
    })
  }, [])

  if (session) {
    return <Navigate to='/' replace={true} />
  }

  return <div>LOGIN</div>
}
