import { FileView } from "obsidian";
import type QuietOutline from "@/plugin";
import { store, type Heading } from "@/store";
import { Nav } from "./base";
import { calcModifies } from "@/utils/diff";

export interface AmbossHeading extends Heading {
    headingKey: string;
}

export class AmbossNav extends Nav {
    declare view: FileView;
    private cachedHeaders: AmbossHeading[] = [];

    constructor(plugin: QuietOutline, view: FileView) {
        super(plugin, view);
    }

    getId(): string {
        return "amboss-view";
    }

    async getHeaders(): Promise<AmbossHeading[]> {
        // if (this.cachedHeaders.length > 0) {
        //     return this.cachedHeaders;
        // }

        const ambossView = this.view as { getHeadings?: () => AmbossHeading[] };
        if (ambossView.getHeadings) {
            const headings = ambossView.getHeadings();
            if (headings) {
                this.cachedHeaders = headings;
                return headings;
            }
        }else {
            return this.cachedHeaders;
        }

        return [];
    }

    async setHeaders(): Promise<void> {
        const headings = await this.getHeaders();
        store.headers = headings;
    }

    async updateHeaders(): Promise<void> {
        const headings = await this.getHeaders();
        store.modifyKeys = calcModifies(store.headers, headings);
        store.headers = headings;
    }

    async jump(index: number): Promise<void> {
        const header = store.headers[index] as AmbossHeading;
        if (!header) { return; }

        void this.plugin.startJumping();
        this.plugin.outlineView?.vueInstance.onLeafChange();

        activeWindow.setTimeout(() => {
            const el = this.view.contentEl.querySelector(`[data-heading-key="${header.headingKey}"]`);
            if (el) {
                (el as HTMLElement).scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    }

    async jumpWithoutFocus(index: number): Promise<void> {
        const header = store.headers[index] as AmbossHeading;
        if (!header) { return; }

        void this.plugin.startJumping();
        this.plugin.outlineView?.vueInstance.onLeafChange();

        activeWindow.setTimeout(() => {
            const el = this.view.contentEl.querySelector(`[data-heading-key="${header.headingKey}"]`);
            if (el) {
                (el as HTMLElement).scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    }
}