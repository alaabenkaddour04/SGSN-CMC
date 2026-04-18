const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/absencesController');
const auth = require('../middlewares/auth');

router.get('/etudiant/:id', auth, ctrl.getByEtudiant);

module.exports = router;
