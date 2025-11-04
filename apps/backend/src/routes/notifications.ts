import { Router } from 'express'
import { NotificationController, rateLimitMiddleware } from '../controllers/NotificationController'
// Import your existing auth middleware - adjust path as needed
// import { authenticateToken } from '../middlewares/auth'

// Temporary auth middleware placeholder - replace with your actual auth
const authenticateToken = (req: any, res: any, next: any) => {
  // TODO: Replace with your actual authentication middleware
  // For now, assuming user is attached by previous middleware
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' })
  }
  next()
}

const router = Router()

// Apply rate limiting to all notification routes
router.use(rateLimitMiddleware(100, 15 * 60 * 1000)) // 100 requests per 15 minutes

// Health check (no auth required)
router.get('/health', NotificationController.healthCheck)

// All other routes require authentication
router.use(authenticateToken)

// Main notification routes
router.get('/', NotificationController.getNotifications)
router.get('/unread-count', NotificationController.getUnreadCount)
router.post('/:id/read', NotificationController.markAsRead)
router.post('/read-multiple', NotificationController.markMultipleAsRead)
router.delete('/:id', NotificationController.deleteNotification)

// Admin routes (additional auth check in controller)
router.post('/create', NotificationController.createNotification)
router.get('/admin/stats', NotificationController.getAdminStats)

export default router