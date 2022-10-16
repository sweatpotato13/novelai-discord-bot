import type { CommandInteraction } from "discord.js";
import {
    Discord,
    Slash,
    SlashOption,
} from "discordx";
import { NovelAi } from "novelai";

import { postgresConfig } from "../config/typeorm";
import { User } from "../entities";
@Discord()
export class Login {
    @Slash("login", { description: "login to your Riot account." })
    slashLogin(
        @SlashOption("email", { description: "novelai.net email" })
        email: string,
        @SlashOption("password", { description: "novelai.net password" })
        password: string,
        command: CommandInteraction
    ): void {
        command.deferReply({ ephemeral: true });
        this.login(email, password, command);
    }

    async login(email: string, password: string, command: CommandInteraction): Promise<any> {
        try {
            const nyaAi = new NovelAi();
            const accessToken = await (await nyaAi.login(email, password)).accessToken;

            const userRepo = await postgresConfig.getRepository(User);
            const user = await userRepo.find({
                where: {
                    userId: command.user.id
                }
            });

            if (user.length === 0) {
                const newUser = new User();
                newUser.accessToken = accessToken;
                newUser.userId = command.user.id;
                await userRepo.save(newUser);
            }
            else {
                const existUser = user[0];
                existUser.accessToken = accessToken;
                await userRepo.save(existUser);
            }

            await command.editReply(`Login Done`);
        } catch (error: any) {
            console.error(error);
            await command.editReply(`There was an error while executing this command!, Please try again later`);
        }
    }
}