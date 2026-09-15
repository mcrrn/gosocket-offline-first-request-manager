import type { RequestProcessor } from "./requestProcessor";

export class RequestProcessorRegistry {
    private readonly processors: Record<string, RequestProcessor>;

    constructor(processors: Record<string, RequestProcessor>) {
        this.processors = processors;
    }

    get(type: string): RequestProcessor {
        const processor = this.processors[type];

        if (!processor) {
            throw new Error(`No processor registered for type '${type}'`);
        }

        return processor;
    }
}