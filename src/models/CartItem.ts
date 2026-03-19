import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Cart } from "./Cart";
import { Product } from "./Product";

@Entity("cart_items")
export class CartItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "cartId" })
  cart!: Cart;

  @ManyToOne(() => Product, { eager: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "productId" })
  product!: Product;

  @Column()
  productId!: number;

  @Column({ default: 1 })
  quantity!: number;
}
