"use client"

import { useState, useEffect, useRef } from "react"

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  const isFirstRender = useRef(true)

  useEffect(() => {
    if (!isFirstRender.current) {
      return 
    }

    try {
      const item = window.localStorage.getItem(key)

      if (item) {
        const parsedItem = JSON.parse(item, (key, value) => {
          if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*Z$/.test(value)) {
            return new Date(value)
          }
          return value
        })

        setStoredValue(parsedItem)
      }

      isFirstRender.current = false
    } catch (error) {
      console.error(error)
    }
  }, [key, initialValue])
  const setValue = (value: T) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value

      setStoredValue(valueToStore)

      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue]
}

