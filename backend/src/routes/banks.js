const { Router } = require('express');
const auth = require('../middleware/authMiddleware');
const ctrl = require('../controllers/bankController');

const router = Router();

router.get('/',              auth, ctrl.getConnections);
router.get('/auth-url',      auth, ctrl.getAuthUrl);
router.get('/callback',           ctrl.handleCallback);   // public — TrueLayer browser redirect
router.delete('/:id',        auth, ctrl.deleteConnection);
router.post('/:id/sync',     auth, ctrl.syncTransactions);

module.exports = router;
