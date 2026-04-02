import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const onlineUsers = new Map() // userId → socketId

export function setupSocket(io) {
  // Auth middleware for Socket.io
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token
    if (!token) return next(new Error('Authentication required'))
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET)
      socket.user = payload
      next()
    } catch {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket) => {
    const userId = socket.user.id
    console.log(`[socket] user connected: ${userId}`)

    // Track online status
    onlineUsers.set(userId, socket.id)
    io.emit('user:online', { userId })

    // Join all conversation rooms
    socket.on('join:conversations', async () => {
      try {
        const role = socket.user.role
        const where = role === 'CUSTOMER'
          ? { customerId: userId }
          : { designerId: userId }
        const convs = await prisma.conversation.findMany({ where, select: { id: true } })
        convs.forEach(c => socket.join(`conv:${c.id}`))
      } catch {}
    })

    // Send a message
    socket.on('message:send', async ({ conversationId, content }) => {
      if (!content?.trim() || content.length > 2000) return

      try {
        const conv = await prisma.conversation.findUnique({ where: { id: conversationId } })
        if (!conv) return
        const isParticipant = conv.customerId === userId || conv.designerId === userId
        if (!isParticipant) return

        // Check premium
        const [cu, de] = await Promise.all([
          prisma.user.findUnique({ where: { id: conv.customerId }, select: { isPremium: true } }),
          prisma.user.findUnique({ where: { id: conv.designerId }, select: { isPremium: true } }),
        ])
        if (!cu?.isPremium || !de?.isPremium) {
          socket.emit('error', { message: 'Premium required to send messages' })
          return
        }

        const message = await prisma.message.create({
          data: {
            conversationId,
            senderId: userId,
            senderRole: socket.user.role,
            content: content.trim(),
          },
        })

        const isCustomer = userId === conv.customerId
        await prisma.conversation.update({
          where: { id: conversationId },
          data: {
            lastMessageAt: new Date(),
            ...(isCustomer
              ? { designerUnreadCount: { increment: 1 } }
              : { customerUnreadCount: { increment: 1 } }),
          },
        })

        // Broadcast to room
        io.to(`conv:${conversationId}`).emit('message:new', message)
      } catch (err) {
        console.error('[socket message]', err)
      }
    })

    // Typing indicator
    socket.on('typing:start', ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit('typing:start', { userId, conversationId })
    })
    socket.on('typing:stop', ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit('typing:stop', { userId, conversationId })
    })

    // Read receipts
    socket.on('messages:read', async ({ conversationId }) => {
      await prisma.message.updateMany({
        where: { conversationId, senderId: { not: userId }, isRead: false },
        data: { isRead: true },
      })
      socket.to(`conv:${conversationId}`).emit('messages:read', { conversationId, readBy: userId })
    })

    socket.on('disconnect', () => {
      onlineUsers.delete(userId)
      io.emit('user:offline', { userId })
      console.log(`[socket] user disconnected: ${userId}`)
    })
  })
}

export function isUserOnline(userId) {
  return onlineUsers.has(userId)
}
