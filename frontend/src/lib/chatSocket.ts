import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs'
import type { ChatMessage, ReactionSummary } from '../types'

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected'

export interface TypingEvent {
  senderEmail: string
  senderName: string
}

/**
 * One STOMP client shared by the whole app (chat is the only WS consumer
 * today). Connects lazily on first subscribe, disconnects when the last
 * subscriber leaves — a component mounting/unmounting ChatPage repeatedly
 * should not leak sockets.
 */
class ChatSocket {
  private client: Client | null = null
  private roomSubs = new Map<string, StompSubscription>()
  private typingSubs = new Map<string, StompSubscription>()
  private reactionSubs = new Map<string, StompSubscription>()
  private statusListeners = new Set<(status: ConnectionStatus) => void>()
  private status: ConnectionStatus = 'disconnected'

  private setStatus(status: ConnectionStatus) {
    this.status = status
    this.statusListeners.forEach((fn) => fn(status))
  }

  onStatusChange(fn: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.add(fn)
    fn(this.status)
    return () => this.statusListeners.delete(fn)
  }

  private ensureConnected(token: string) {
    if (this.client) return
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    this.setStatus('connecting')
    this.client = new Client({
      brokerURL: `${proto}//${window.location.host}/ws`,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 3000,
      onConnect: () => this.setStatus('connected'),
      onWebSocketClose: () => this.setStatus('disconnected'),
      onStompError: () => this.setStatus('disconnected'),
    })
    this.client.activate()
  }

  private teardownIfIdle() {
    if (this.roomSubs.size === 0 && this.typingSubs.size === 0 && this.reactionSubs.size === 0 && this.client) {
      this.client.deactivate()
      this.client = null
      this.setStatus('disconnected')
    }
  }

  subscribeToRoom(roomId: string, token: string, onMessage: (msg: ChatMessage) => void): () => void {
    this.ensureConnected(token)
    const client = this.client!
    const subscribe = () => {
      const sub = client.subscribe(`/topic/rooms/${roomId}`, (frame: IMessage) => {
        onMessage(JSON.parse(frame.body) as ChatMessage)
      })
      this.roomSubs.set(roomId, sub)
    }
    if (client.connected) subscribe()
    else client.onConnect = () => { this.setStatus('connected'); subscribe() }

    return () => {
      this.roomSubs.get(roomId)?.unsubscribe()
      this.roomSubs.delete(roomId)
      this.teardownIfIdle()
    }
  }

  subscribeToTyping(roomId: string, token: string, onTyping: (evt: TypingEvent) => void): () => void {
    this.ensureConnected(token)
    const client = this.client!
    const subscribe = () => {
      const sub = client.subscribe(`/topic/rooms/${roomId}/typing`, (frame: IMessage) => {
        onTyping(JSON.parse(frame.body) as TypingEvent)
      })
      this.typingSubs.set(roomId, sub)
    }
    if (client.connected) subscribe()
    else client.onConnect = () => { this.setStatus('connected'); subscribe() }

    return () => {
      this.typingSubs.get(roomId)?.unsubscribe()
      this.typingSubs.delete(roomId)
      this.teardownIfIdle()
    }
  }

  subscribeToReactions(roomId: string, token: string, onReaction: (summary: ReactionSummary) => void): () => void {
    this.ensureConnected(token)
    const client = this.client!
    const subscribe = () => {
      const sub = client.subscribe(`/topic/rooms/${roomId}/reactions`, (frame: IMessage) => {
        onReaction(JSON.parse(frame.body) as ReactionSummary)
      })
      this.reactionSubs.set(roomId, sub)
    }
    if (client.connected) subscribe()
    else client.onConnect = () => { this.setStatus('connected'); subscribe() }

    return () => {
      this.reactionSubs.get(roomId)?.unsubscribe()
      this.reactionSubs.delete(roomId)
      this.teardownIfIdle()
    }
  }

  send(roomId: string, senderName: string, content: string, extra?: {
    parentMessageId?: string
    attachmentMediaId?: string
    attachmentType?: string
  }) {
    this.client?.publish({
      destination: `/app/rooms/${roomId}/send`,
      body: JSON.stringify({ senderName, content, ...extra }),
    })
  }

  sendTyping(roomId: string, senderName: string) {
    this.client?.publish({
      destination: `/app/rooms/${roomId}/typing`,
      body: JSON.stringify({ senderName }),
    })
  }
}

export const chatSocket = new ChatSocket()
