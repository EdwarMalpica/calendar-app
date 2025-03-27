"use client"

import { useState, useEffect, useRef } from "react"

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  // Use a ref to track if this is the first render
  const isFirstRender = useRef(true)

  // Initialize the state only once on first render
  useEffect(() => {
    if (!isFirstRender.current) {
      return // Skip after first render
    }

    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key)

      // Parse stored json or if none return initialValue
      if (item) {
        const parsedItem = JSON.parse(item, (key, value) => {
          // Convert ISO date strings back to Date objects
          if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*Z$/.test(value)) {
            return new Date(value)
          }
          return value
        })

        setStoredValue(parsedItem)
      }

      // Mark first render as complete
      isFirstRender.current = false
    } catch (error) {
      console.error(error)
      // If error also return initialValue
    }
  }, [key, initialValue])

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage.
  const setValue = (value: T) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value

      // Save state
      setStoredValue(valueToStore)

      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.error(error)
    }
  }

  return [storedValue, setValue]
}

