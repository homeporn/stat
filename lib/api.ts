export async function safeJsonFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options)
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  const contentType = response.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text()
    console.error('Expected JSON but got:', text.substring(0, 200))
    throw new Error('Response is not JSON')
  }
  
  return response.json()
}

