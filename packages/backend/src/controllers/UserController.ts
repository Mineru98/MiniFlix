import { Body, Controller, Post, Response, Route, Tags } from "tsoa";
import {
  LoginResponse,
  UserCreationAttributes,
  UserLoginDTO,
  UserResponse,
} from "../models/User";
import { UserService } from "../services/UserService";
import {
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
} from "../utils/errors";

@Route("users")
@Tags("Users")
export class UserController extends Controller {
  private userService: UserService;

  constructor() {
    super();
    this.userService = new UserService();
  }

  /**
   * 새로운 사용자를 생성합니다.
   */
  @Post()
  @Response(201, "Created")
  @Response(400, "Validation Error")
  @Response(409, "Email Already Exists")
  public async createUser(
    @Body() requestBody: UserCreationAttributes
  ): Promise<UserResponse> {
    try {
      const user = await this.userService.createUser(requestBody);
      this.setStatus(201);
      return user;
    } catch (error) {
      if (error instanceof ValidationError) {
        this.setStatus(400);
        throw error;
      }
      throw error;
    }
  }

  /**
   * 사용자 로그인을 처리합니다.
   */
  @Post("login")
  @Response(200, "Success")
  @Response(401, "Unauthorized")
  @Response(403, "Forbidden")
  public async login(
    @Body() requestBody: UserLoginDTO
  ): Promise<LoginResponse> {
    try {
      const loginResponse = await this.userService.login(requestBody);
      this.setStatus(200);
      return loginResponse;
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        this.setStatus(401);
        throw error;
      }
      if (error instanceof ForbiddenError) {
        this.setStatus(403);
        throw error;
      }
      throw error;
    }
  }
}
