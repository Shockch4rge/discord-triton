import { Registry } from "./Registry";
import type { Event, HyperionClient } from "../structs";
import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import ora from "ora";
import { color } from "../utils";
import assert from "node:assert/strict";
import type { ClientEvents } from "discord.js";

export class EventRegistry extends Registry<keyof ClientEvents, Event> {
    public constructor(client: HyperionClient) {
        super(client, `events`);
    }

    public async register() {
        const spinner = ora({
            text: chalk.cyanBright`Registering events...`,
        }).start();

        const eventDir = await fs.readdir(this.path, { withFileTypes: true });

        for (const eventFile of eventDir) {
            if (!this.isJsFile(eventFile)) continue;

            const event = await this.import<Event>(path.join(this.path, eventFile.name), this.client);

            assert(
                !this.has(event.name),
                chalk.redBright`Event ${event.name} already registered. Please specify a different name property.`
            );

            if (event.once) {
                this.client.once(event.name, event.run);
            }
            else {
                this.client.on(event.name, event.run);
            }

            this.set(event.name ?? eventFile.name, event);
        }

        spinner.succeed(
            color(
                c => c.greenBright`Registered`,
                c => c.greenBright.bold(this.size),
                c => c.greenBright`events!`
            )
        );
    }

    public removeEvent(name: keyof ClientEvents) {
        const event = this.get(name);
        if (!event) return false;

        this.client.off(event.name, event.run);
        return this.delete(name);
    }
}