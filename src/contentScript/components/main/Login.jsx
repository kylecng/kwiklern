import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { devLog } from '../../../utils'
import { sendMessageToBackground } from '../../utils'

const Login = () => {
  const [session, setSession] = useState(null)

  useEffect(() => {
    sendMessageToBackground({
      action: 'getSession',
      type: 'DATABASE',
    }).then(({ user, session, error }) => {
      setSession(session)
    })
  }, [])

  if (session) {
    return <Navigate to="/" replace={true} />
  }

  return <div>LOGIN</div>
}

export default Login
