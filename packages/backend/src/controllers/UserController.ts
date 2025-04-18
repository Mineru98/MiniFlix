import { Request, Response, Router } from "express";
import passport from "passport";
import { WishlistResponse } from "../models/Content";
import { UserService } from "../services/UserService";
import {
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
} from "../utils/errors";

export class UserController {
  private userService: UserService;
  public router: Router;

  constructor() {
    this.userService = new UserService();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/", this.createUser.bind(this));
    this.router.post("/login", this.login.bind(this));
    this.router.get(
      "/wishlist",
      passport.authenticate("jwt", { session: false }),
      this.getWishlist.bind(this)
    );
  }

  /**
   * @swagger
   * /api/users:
   *   post:
   *     summary: 새로운 사용자를 생성합니다.
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UserCreationAttributes'
   *     responses:
   *       201:
   *         description: Created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserResponse'
   *       400:
   *         description: Validation Error
   *       409:
   *         description: Email Already Exists
   */
  public async createUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.userService.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
        return;
      }
      throw error;
    }
  }

  /**
   * @swagger
   * /api/users/login:
   *   post:
   *     summary: 사용자 로그인을 처리합니다.
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UserLoginDTO'
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/LoginResponse'
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   */
  public async login(req: Request, res: Response): Promise<void> {
    try {
      const loginResponse = await this.userService.login(req.body);
      res.status(200).json(loginResponse);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        res.status(401).json({ message: error.message });
        return;
      }
      if (error instanceof ForbiddenError) {
        res.status(403).json({ message: error.message });
        return;
      }
      throw error;
    }
  }

  /**
   * @swagger
   * /api/users/wishlist:
   *   get:
   *     summary: 사용자의 찜 목록을 조회합니다.
   *     description: 로그인한 사용자의 찜한 콘텐츠 목록을 조회합니다.
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: 찜 목록 조회 성공
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/WishlistResponse'
   *       401:
   *         description: 인증 토큰이 만료되었거나 유효하지 않음
   *       500:
   *         description: 서버 에러
   */
  public async getWishlist(req: Request, res: Response): Promise<void> {
    try {
      // JWT 인증 미들웨어를 통과한 경우 req.user에 사용자 정보가 있음
      const userId = (req.user as any).id;

      const wishlists = await this.userService.fetchWishlist(userId);

      const response: WishlistResponse = {
        wishlists,
      };

      res.status(200).json(response);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        res.status(401).json({ message: error.message });
        return;
      }

      console.error("찜 목록 조회 실패:", error);
      res.status(500).json({ message: "서버 에러가 발생했습니다." });
    }
  }
}
