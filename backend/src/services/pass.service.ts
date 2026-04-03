import { Pass } from "../models/Pass";
import { NotFound } from "../utils/httpException";

export class PassService {
  async createPass(userId: string, data: any) {
    return Pass.create({
      ...data,
      createdBy: userId,
    });
  }

  async getAllPasses() {
    return Pass.find().sort({ createdAt: -1 });
  }

  async getPassById(passId: string) {
    const pass = await Pass.findById(passId);
    if (!pass) throw new NotFound("Pass not found");
    return pass;
  }
}

export const passService = new PassService();
