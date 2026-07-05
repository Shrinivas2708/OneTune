import { ERROR_CODES } from "@vibevault/config";
import { AppError } from "../lib/errors";
import * as adminRepository from "../repositories/admin-repository";

export async function getOverview() {
  return adminRepository.getAdminOverview();
}

export async function listUsers() {
  return adminRepository.listAdminUserSummaries();
}

export async function getUserDetail(userId: string) {
  const detail = await adminRepository.getAdminUserDetail(userId);
  if (!detail) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "User not found", 404);
  }
  return detail;
}
