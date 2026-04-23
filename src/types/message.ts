export type MessageRole = 'user' | 'assistant'

export type MessageImage = {
  dataUrl: string
  mimeType: string
  name?: string
}

export type Message = {
  id: string
  role: MessageRole
  content: string
  timestamp: string
  image?: MessageImage
}
