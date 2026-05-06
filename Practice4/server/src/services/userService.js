const prisma = require('../config/database');

class UserService {
  /**
   * Get paginated list of users with search and sorting.
   * @param {object} params - Query parameters
   * @returns {Promise<{data: Array, meta: object}>}
   */
  async getUsers({ search, sortBy, sortOrder, page, limit }) {
    const where = search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { department: true },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single user by ID.
   * @param {number} id
   * @returns {Promise<object|null>}
   */
  async getUserById(id) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { department: true },
    });

    if (!user) {
      const error = new Error(`User with id ${id} not found`);
      error.statusCode = 404;
      throw error;
    }

    return user;
  }

  /**
   * Create a new user.
   * @param {object} data
   * @returns {Promise<object>}
   */
  async createUser(data) {
    // Check department exists
    const department = await prisma.department.findUnique({
      where: { id: data.departmentId },
    });
    if (!department) {
      const error = new Error(`Department with id ${data.departmentId} not found`);
      error.statusCode = 400;
      throw error;
    }

    // Check email uniqueness
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      const error = new Error(`User with email ${data.email} already exists`);
      error.statusCode = 409;
      throw error;
    }

    return prisma.user.create({
      data,
      include: { department: true },
    });
  }

  /**
   * Update an existing user.
   * @param {number} id
   * @param {object} data
   * @returns {Promise<object>}
   */
  async updateUser(id, data) {
    // Ensure user exists
    await this.getUserById(id);

    // If changing department, check it exists
    if (data.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: data.departmentId },
      });
      if (!department) {
        const error = new Error(`Department with id ${data.departmentId} not found`);
        error.statusCode = 400;
        throw error;
      }
    }

    // If changing email, check uniqueness
    if (data.email) {
      const existing = await prisma.user.findFirst({
        where: { email: data.email, NOT: { id } },
      });
      if (existing) {
        const error = new Error(`User with email ${data.email} already exists`);
        error.statusCode = 409;
        throw error;
      }
    }

    return prisma.user.update({
      where: { id },
      data,
      include: { department: true },
    });
  }

  /**
   * Delete a user by ID.
   * @param {number} id
   * @returns {Promise<object>}
   */
  async deleteUser(id) {
    await this.getUserById(id);
    return prisma.user.delete({ where: { id } });
  }

  /**
   * Get all departments.
   * @returns {Promise<Array>}
   */
  async getDepartments() {
    return prisma.department.findMany({ orderBy: { name: 'asc' } });
  }
}

module.exports = new UserService();
