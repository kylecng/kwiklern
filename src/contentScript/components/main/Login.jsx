import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { devLog } from '../../../utils'
import { sendMessageToBackground } from '../../utils'

const Login = () => {
  const [session, setSession] = useState(null)


  if (session) {
    return <Navigate to="/" replace={true} />
  }

  return <div>LOGIN</div>
}

export default Login
