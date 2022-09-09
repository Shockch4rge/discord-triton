import { ActionRowBuilder, EmbedBuilder, Guild, SelectMenuInteraction } from "discord.js";

import { TritonClient } from "../../TritonClient";
import { AltInteractionReplyOptions, AltInteractionUpdateOptions, Context } from "./Context";

export class SelectMenuContext<C extends TritonClient = TritonClient> extends Context<C> {
    public constructor(
        client: C,
        public readonly interaction: SelectMenuInteraction,
        guild: Guild | null
    ) {
        super(client, guild);
    }

    public get values() {
        return this.interaction.values;
    }

    public get value() {
        return this.interaction.values[0];
    }

    public embed(builder: (embed: EmbedBuilder) => EmbedBuilder) {
        return this.update(builder(new EmbedBuilder()));
    }

    public update(options: AltInteractionUpdateOptions) {
        if (typeof options === "string") {
            return this.interaction.update({
                content: options,
            });
        } else if (options instanceof EmbedBuilder) {
            return this.interaction.update({
                embeds: [options],
            });
        } else {
            return this.interaction.update({
                ...options,
                embeds: options.embeds?.map(builder => {
                    if (typeof builder === "function") {
                        return builder(new EmbedBuilder());
                    }

                    return builder;
                }),
                components: options.components?.map(components =>
                    // leave as any as our API abstracts ActionRow anyway
                    new ActionRowBuilder<any>().addComponents(components)
                ),
            });
        }
    }

    public reply(options: AltInteractionReplyOptions) {
        if (typeof options === "string") {
            return this.interaction.editReply({
                content: options,
            });
        } else if (options instanceof EmbedBuilder) {
            return this.interaction.editReply({
                embeds: [options],
            });
        } else {
            return this.interaction.editReply({
                ...options,
                embeds: options.embeds?.map(builder => {
                    if (typeof builder === "function") {
                        return builder(new EmbedBuilder());
                    }

                    return builder;
                }),
                components: options.components?.map(components =>
                    new ActionRowBuilder<any>().addComponents(components)
                ),
            });
        }
    }
}
