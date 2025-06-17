import { UserDto } from "./user.dto";

export class RequestDto extends Request {
  user?: UserDto;
  branchId?: string;
  token?: string;
}
