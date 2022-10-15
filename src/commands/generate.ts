import axios from "axios";
import { CommandInteraction, EmbedBuilder } from "discord.js";
import {
    Discord,
    Slash,
    SlashOption,
} from "discordx";

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
            await interaction.reply(`Not implemented`);
        }
        catch (error: any) {
            console.log(error.message);
            await interaction.editReply(`There was an error while executing this command!, Please try again later`);
        }
    }
}