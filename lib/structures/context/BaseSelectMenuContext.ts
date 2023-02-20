import {
    ActionRowBuilder, channelMention, Colors, EmbedBuilder, SelectMenuInteraction
} from "discord.js";

import { HyperionClient } from "../../HyperionClient";
import { resolveEmbed } from "../../util/resolvers";
import {
    AltInteractionReplyOptions, AltInteractionUpdateOptions, BaseContext
} from "./BaseContext";

export class BaseSelectMenuContext<C extends HyperionClient = HyperionClient> extends BaseContext<C> {
    public constructor(
        client: C,
        public readonly interaction: SelectMenuInteraction,
    ) {
        super(client, interaction.guild);
    }

    public get values() {
        return this.interaction.values;
    }

    public get value() {
        return this.interaction.values[0];
    }

    public async update(options: AltInteractionUpdateOptions) {
        if (this.interaction.replied) {
            this.client.logger.error("Interaction already replied to.");
        }

        if (typeof options === "string") {
            return this.interaction.update({
                content: options,
            });
        }

        if (this.isEmbedBuildable(options)) {
            const embed = resolveEmbed(options);

            return this.interaction.update({
                embeds: [embed],
            });
        }

        return this.interaction.update({
            ...options,
            embeds: options.embeds?.map(resolveEmbed),
            components: options.components?.map(components =>
                new ActionRowBuilder<any>().addComponents(components)
            ),
        });
    }

    public async reply(options: AltInteractionReplyOptions) {
        if (typeof options === "string") {
            return this.interaction.editReply({
                content: options,
            });
        }

        if (this.isEmbedBuildable(options)) {
            const embed = resolveEmbed(options);

            return this.interaction.editReply({
                embeds: [embed],
            });
        }

        return this.interaction.editReply({
            ...options,
            embeds: options.embeds?.map(resolveEmbed),
            components: options.components?.map(components =>
                new ActionRowBuilder<any>().addComponents(components)
            ),
        });
    }

    public buildLogEmbed() {
        return new EmbedBuilder()
            .setAuthor({
                name: `${this.interaction.user.tag} used [${this.interaction.customId}]: (SELECT_MENU)`,
                iconURL: this.interaction.user.avatarURL() ?? undefined,
            })
            .setFields([
                {
                    name: "User",
                    value: `ID: \`${this.interaction.user.id}\` | Tag: \`${this.interaction.user.tag}\``,
                },
                {
                    name: "Guild",
                    value: `ID: \`${this.interaction.guildId ?? "DM"}\``,
                },
                {
                    name: "Channel",
                    value: `ID: ${channelMention(this.interaction.channelId)}`,
                },
                {
                    name: "Interaction",
                    value: `ID: \`${this.interaction.message.id}\` | Type: SELECT_MENU`,
                }
            ])
            .setFooter({
                text: `Timestamp: ${this.interaction.createdAt.toISOString()}`,
                iconURL: this.guild?.iconURL() ?? undefined,
            })
            .setColor("Blurple");
    }
}
