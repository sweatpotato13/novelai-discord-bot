import { ApplicationCommandOptionType, AttachmentBuilder, CommandInteraction } from "discord.js";
import {
    Discord,
    Slash,
    SlashOption,
} from "discordx";
import { NovelAi } from "novelai";

import { postgresConfig } from "../config/typeorm";
import { User } from "../entities";

const modelMap = {
    safe: 'safe-diffusion',
    nai: 'nai-diffusion',
    furry: 'nai-diffusion-furry',
};
const resolutionMap = {
    landscape: { height: 512, width: 768 },
    portrait: { height: 768, width: 512 },
    square: { height: 640, width: 640 },
};
const samplingMap = {
    k_euler_ancestral: "k_euler_ancestral",
    k_euler: "k_euler",
    k_lms: "k_lms",
    plms: "plms",
    ddim: "ddim"
};

declare type Model = keyof typeof modelMap;
declare type Resolution = keyof typeof resolutionMap;
declare type Sampling = keyof typeof samplingMap;

@Discord()
export class Generate {
    @Slash("generate", { description: "Generate AI image" })
    slashLikeIt(
        @SlashOption("tag", { description: "tag" })
        tag: string,
        @SlashOption("model", { description: "model (safe(default), nai, furry)", required: false })
        model: Model,
        @SlashOption("resolution", { description: "resolution (landscape(default), portrait, square)", required: false })
        resolution: Resolution,
        @SlashOption("sampling", { description: "sampling (k_euler_ancestral(default), k_euler, k_lms, plms, ddim)", required: false })
        sampling: Sampling,
        @SlashOption("seed", { description: "seed", required: false, type: ApplicationCommandOptionType.Number })
        seed: number,
        interaction: CommandInteraction): void {
        interaction.deferReply();
        this.generate(tag, interaction, model, resolution, sampling, seed);
    }

    async generate(input: string, interaction: CommandInteraction, model?: Model, resolution?: Resolution, sampling?: Sampling, seed?: number,): Promise<void> {
        try {
            const params = {
                input, model, resolution, sampling, seed
            }
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
            const image = await (await nyaai.generateImage(existUser.accessToken as string, params)).imageBase64;
            const imageBuffer = Buffer.from(image, "base64");
            const attachment = new AttachmentBuilder(imageBuffer, { name: 'image.png' })

            await interaction.editReply({ content: `tag: ${input}`, files: [attachment] });
        }
        catch (error: any) {
            console.log(error.message);
            await interaction.editReply(`There was an error while executing this command!, Please try again later`);
        }
    }
}