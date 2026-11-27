import { useCallback, useEffect, useState } from 'react'

export async function readJson(response, fallbackMessage) {
  const payload = await response.json()
  if (!response.ok) throw new Error(payload.error || fallbackMessage)
  return payload
}

// Loads the signed-in user, their saved reading-list issues, and Comic Vine
// details (cover, name, issue count) for every saved series.
export function useReadingList() {
  const [user, setUser] = useState(null)
  const [items, setItems] = useState([])
  const [volumeDetails, setVolumeDetails] = useState({})
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [detailsError, setDetailsError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadList() {
      try {
        const userResponse = await fetch('/api/v1/auth/me', {
          credentials: 'include',
          signal: controller.signal,
        })
        const currentUser = await readJson(userResponse, 'Unable to load your account')
        setUser(currentUser)
        const listResponse = await fetch(
          `/api/v1/users/${currentUser.id}/reading-list`,
          { credentials: 'include', signal: controller.signal },
        )
        const list = await readJson(listResponse, 'Unable to load your reading list')
        const volumeIds = [...new Set(
          list
            .map((item) => item.comic_vine_volume_id)
            .filter((id) => id != null)
            .map(String),
        )]
        const detailsResults = await Promise.allSettled(volumeIds.map(async (id) => {
          const response = await fetch(`/api/v1/comics/volumes/${id}`, {
            signal: controller.signal,
            cache: 'no-store',
          })
          return readJson(response, 'Unable to load series details')
        }))
        if (controller.signal.aborted) return

        const details = {}
        let failedDetails = false
        detailsResults.forEach((result, index) => {
          if (result.status === 'fulfilled') details[volumeIds[index]] = result.value
          else if (result.reason?.name !== 'AbortError') failedDetails = true
        })

        setItems(list)
        setVolumeDetails(details)
        setDetailsError(failedDetails ? 'Some series artwork or details could not be loaded.' : '')
        setStatus('ready')
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError(requestError.message)
          setStatus('error')
        }
      }
    }

    loadList()
    return () => controller.abort()
  }, [])

  const replaceItem = useCallback((updatedItem) => {
    setItems((current) => current.map((item) => (
      item.id === updatedItem.id ? updatedItem : item
    )))
  }, [])

  return { user, items, volumeDetails, status, error, detailsError, replaceItem }
}
