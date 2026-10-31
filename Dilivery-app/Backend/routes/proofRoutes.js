const express = require('express');
const router = express.Router();
const { createProof, getProofs, getProofById, updateProofStatus, deleteProof, updateProof } = require('../controllers/proofController');
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

// API Routes - Protected
router.post('/', protect, upload.single('photo'), createProof);
router.get('/', protect, getProofs);
router.get('/:id', protect, getProofById);
router.put('/:id', protect, updateProof);
router.delete('/:id', protect, deleteProof);
router.patch('/:id/status', protect, updateProofStatus);

module.exports = router;
