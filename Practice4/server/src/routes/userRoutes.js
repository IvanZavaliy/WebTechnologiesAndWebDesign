const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// User CRUD routes
router.get('/users', userController.getUsers);
router.get('/users/:id', userController.getUserById);
router.post('/users', userController.createUser);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

// Department routes
router.get('/departments', userController.getDepartments);

module.exports = router;
