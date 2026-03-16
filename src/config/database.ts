import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../models/User";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "ecommerce.sqlite",
  synchronize: true,
  logging: false,
  entities: [User],
});
