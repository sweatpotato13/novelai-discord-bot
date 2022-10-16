import { AttachmentBuilder, CommandInteraction } from "discord.js";
import {
    Discord,
    Slash,
    SlashOption,
} from "discordx";
import { NovelAi } from "novelai";

import { postgresConfig } from "../config/typeorm";
import { User } from "../entities";
@Discord()
export class Generate {
    @Slash("generate", { description: "Generate AI image" })
    slashLikeIt(
        @SlashOption("tag", { description: "tag" })
        tag: string,
        interaction: CommandInteraction): void {
        interaction.deferReply();
        this.generate(tag, interaction);
    }

    async generate(tag: string, interaction: CommandInteraction): Promise<void> {
        try {
            const userRepo = await postgresConfig.getRepository(User);
            const user = await userRepo.find({
                where: {
                    userId: interaction.user.id
                }
            });

            if (user.length === 0) {
                await interaction.editReply(`You need to login first!`);
                return;
            }
            const existUser = user[0];
            if (existUser.accessToken === undefined) {
                await interaction.editReply(`You need to login first!`);
            }

            const nyaai = new NovelAi();
            const image = await (await nyaai.generateImage(tag, existUser.accessToken as string)).imageBase64;
            const imageBuffer = Buffer.from(image, "base64");
            const attachment = new AttachmentBuilder(imageBuffer, { name: 'image.png' })

            await interaction.editReply({ content: `tag: ${tag}`, files: [attachment] });
        }
        catch (error: any) {
            console.log(error.message);
            await interaction.editReply(`There was an error while executing this command!, Please try again later`);
        }
    }
}