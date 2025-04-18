import dotenv from "dotenv";
import { DataSource } from "typeorm";
import { Content } from "../models/Content";
import { ContentGenre } from "../models/ContentGenre";
import { Genre } from "../models/Genre";
import { User } from "../models/User";
import { ViewingHistory } from "../models/ViewingHistory";
import { Wishlist } from "../models/Wishlist";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "miniflix",
  synchronize: process.env.NODE_ENV !== "production",
  logging: process.env.NODE_ENV !== "production",
  entities: [User, Content, Genre, ContentGenre, Wishlist, ViewingHistory],
  migrations: [],
  subscribers: [],
});
