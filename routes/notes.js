const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/notesController');
const auth = require('../middlewares/auth');

router.get('/etudiant/:id', auth, ctrl.getByEtudiant);
router.get('/classe/:id', auth, ctrl.getByClasse);

module.exports = router;
