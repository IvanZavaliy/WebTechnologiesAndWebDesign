const userService = require('../services/userService');
const { createUserSchema, updateUserSchema, queryParamsSchema } = require('../schemas/userSchemas');

class UserController {
  /** GET /api/users */
  async getUsers(req, res, next) {
    try {
      const params = queryParamsSchema.parse(req.query);
      const result = await userService.getUsers(params);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  /** GET /api/users/:id */
  async getUserById(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      const user = await userService.getUserById(id);
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  /** POST /api/users */
  async createUser(req, res, next) {
    try {
      const data = createUserSchema.parse(req.body);
      const user = await userService.createUser(data);
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  }

  /** PUT /api/users/:id */
  async updateUser(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      const data = updateUserSchema.parse(req.body);
      const user = await userService.updateUser(id, data);
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  /** DELETE /api/users/:id */
  async deleteUser(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      await userService.deleteUser(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  /** GET /api/departments */
  async getDepartments(req, res, next) {
    try {
      const departments = await userService.getDepartments();
      res.json(departments);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UserController();
