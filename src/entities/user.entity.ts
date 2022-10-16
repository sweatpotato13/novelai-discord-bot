import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("user")
export class User {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id!: number;

    @Column("text", { name: "user_id", unique: true })
    userId!: string;

    @Column("text", { name: "access_token", nullable: true })
    accessToken?: string;
}
