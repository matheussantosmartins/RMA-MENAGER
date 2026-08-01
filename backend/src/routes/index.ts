import { Router } from 'express';
import { authRouter } from '../modules/auth/auth.routes';
import { userRouter } from '../modules/users/user.routes';
import { customerRouter } from '../modules/customers/customer.routes';
import { productRouter } from '../modules/products/product.routes';
import { rmaRouter } from '../modules/rmas/rma.routes';
import { dashboardRouter } from '../modules/dashboard/dashboard.routes';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/customers', customerRouter);
apiRouter.use('/products', productRouter);
apiRouter.use('/rmas', rmaRouter);
apiRouter.use('/dashboard', dashboardRouter);
