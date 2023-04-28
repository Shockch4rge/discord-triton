import { Registry } from "./Registry";
import type { Button, HyperionClient } from "../structs/";
import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import ora from "ora";
import assert from "node:assert/strict";
import { color } from "../utils";
import { ButtonStyle, ComponentType } from "discord.js";
import { tri } from "try-v2";

export class ButtonRegistry extends Registry<string, Button> {
    private readonly progress = ora({
        text: color(c => c.cyanBright`Registering buttons...`),
    });

    public constructor(client: HyperionClient) {
        super(client, `interactions/buttons`);
    }

    public async register() {
        this.progress.start();

        const [dirNotFoundError, buttonDir] = await tri(fs.readdir(this.path, { withFileTypes: true }));

        if (dirNotFoundError) {
            this.progress.fail(`Could not find ${this.path}`);
            return;
        }

        for (const buttonFile of buttonDir) {
            if (!this.isJsFile(buttonFile)) continue;

            const button = await this.import<Button>(path.join(this.path, buttonFile.name));
            const buttonId = button.id ?? buttonFile.name;

            // only link buttons don't have custom ids
            if (button.builder.data.style !== ButtonStyle.Link) {
                button.builder.setCustomId(buttonId);
            }

            for (const guard of button.guards ?? []) {
                assert(
                    guard.buttonRun,
                    color(
                        c => c.redBright`Guard`,
                        c => c.cyanBright`[${guard.name}]`,
                        c => c.redBright`must have a`,
                        c => c.cyanBright`[buttonRun]`,
                        c => c.redBright`method for button`,
                        c => c.cyanBright`[${buttonId}]`,
                        c => c.redBright`.`
                    )
                );
            }

            this.set(buttonId, button);
        }

        this.progress.succeed(
            color(
                c => c.green`Registered`,
                c => c.greenBright.bold(this.size),
                c => c.green`buttons!`
            )
        );
    }
}