import { Router } from 'express';
import authRoutes from './auth.routes.js';
import chatRoutes from './chat.routes.js';
import standardsRoutes from './standards.routes.js';
import productsRoutes from './products.routes.js';
import schemesRoutes from './schemes.routes.js';
import grievanceRoutes from './grievance.routes.js';
import adminRoutes from './admin.routes.js';
import feedbackRoutes from './feedback.routes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/chat', chatRoutes);
apiRouter.use('/standards', standardsRoutes);
apiRouter.use('/products', productsRoutes);
apiRouter.use('/schemes', schemesRoutes);
apiRouter.use('/grievance', grievanceRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/feedback', feedbackRoutes);

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Bureau of Indian Standards AI Knowledge Engine',
    version: '1.0.0'
  });
});

export default apiRouter;
