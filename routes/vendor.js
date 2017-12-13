import { Router } from 'express';

import * as vendorController from '../controllers/vendor';

const router = Router();

// get all vendors with jwt
router.get('/vendors', vendorController.allVendors);

export default router;
