import { hash as bcryptHash, compare as bcryptCompare } from "bcrypt";

const saltRounds = 10;

export const hashPassword = async (password: string): Promise<string> => {
  return await bcryptHash(password, saltRounds);
}

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  try {
    return await bcryptCompare(password, hash);
  } catch (error) {
    return false;
  }
};