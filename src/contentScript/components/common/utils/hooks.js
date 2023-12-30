import { useCallback, useEffect, useState, useRef } from 'react'
import { createPortal, unmountComponentAtNode } from 'react-dom'

export const useExtendedState = (initialState) => {
  const [state, setState] = useState(initialState)
  const getLatestState = () => {
    return new Promise((resolve, reject) => {
      setState((s) => {
        resolve(s)
        return s
      })
    })
  }

  return [state, setState, getLatestState]
}

export const usePortal = (el) => {
  const [portal, setPortal] = useState({
    render: () => null,
    remove: () => null,
  })

  const getPortal = useCallback((el) => {
    //render a portal at the given DOM node:
    const Portal = ({ children }) => createPortal(children, el)
    //delete the portal from memory:
    const remove = () => unmountComponentAtNode(el)
    return { render: Portal, remove }
  }, [])

  useEffect(() => {
    //if there is an existing portal, remove the new instance.
    //is prevents memory leaks
    if (el) portal.remove()
    //otherwise, create a new portal and render it
    const newPortal = getPortal(el)
    setPortal(newPortal)
    //when the user exits the page, delete the portal from memory.
    return () => newPortal.remove(el)
  }, [el])

  return portal.render
}

export const useDidMount = () => {
  const isMountRef = useRef(true)
  useEffect(() => {
    isMountRef.current = false
  }, [])
  return isMountRef.current
}
