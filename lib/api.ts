export async function safeJsonFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options)
  
  const contentType = response.headers.get('content-type')
  const isJson = contentType && contentType.includes('application/json')
  
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`
    if (isJson) {
      try {
        const errorData = await response.json()
        errorMessage = errorData.details || errorData.error || errorMessage
        if (errorData.stack) {
          console.error('Server error stack:', errorData.stack)
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    } else {
      const text = await response.text()
      console.error('Non-JSON error response:', text.substring(0, 500))
      errorMessage = `${errorMessage}. Response: ${text.substring(0, 100)}`
    }
    throw new Error(errorMessage)
  }
  
  if (!isJson) {
    const text = await response.text()
    console.error('Expected JSON but got:', text.substring(0, 200))
    throw new Error('Response is not JSON')
  }
  
  return response.json()
}

