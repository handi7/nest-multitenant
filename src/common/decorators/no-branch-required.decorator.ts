import { SetMetadata } from "@nestjs/common";

export const NO_BRANCH_REQUIRED_KEY = "NO_BRANCH_REQUIRED";
export const NoBranchRequired = () => SetMetadata(NO_BRANCH_REQUIRED_KEY, true);
