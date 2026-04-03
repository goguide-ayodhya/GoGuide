import { User } from "../models/User";
import { NotFound, BadRequest } from "../utils/httpException";

export class UserService {
  async getAllUsers() {
    return User.find({ isDeleted: false });
  }

  async blockUser(userId: string, reason?: string) {
    const user = await User.findById(userId);
    if (!user) throw new NotFound("User not found");

    user.status = "BLOCKED";

    user.blockReason = reason || "Violation";
    user.blockedAt = new Date();

    await user.save();

    return user;
  }

  async activateUser(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new NotFound("User not found");

    user.status = "ACTIVE";
    await user.save();

    return user;
  }

  async softDeleteUser(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new NotFound("User not found");

    user.status = "DELETED";
    user.isDeleted = true;

    await user.save();

    return { message: "User deleted" };
  }

  async suspendUser(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new NotFound("User not found");

    user.status = "SUSPENDED";
    await user.save();

    return user;
  }
}

export const userService = new UserService();
