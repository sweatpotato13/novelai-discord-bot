import { AttachmentBuilder, CommandInteraction } from "discord.js";
import {
    Discord,
    Slash,
    SlashOption,
} from "discordx";
import { Nyaai } from "nyaai";

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
            const nyaai = new Nyaai();
            const accessToken = await (await nyaai.login()).accessToken;
            const image = await (await nyaai.generateImage(tag, accessToken)).imageBase64;
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