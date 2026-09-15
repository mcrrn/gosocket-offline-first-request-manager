import { describe, expect, it } from "vitest";
import {
    TextRequestProcessor,
    UppercaseRequestProcessor,
} from "../requestProcessor";
import { RequestProcessorRegistry } from "../requestProcessorRegistry";

describe("RequestProcessorRegistry", () => {
    it("returns the processor registered for a type", () => {
        const textProcessor = new TextRequestProcessor();
        const uppercaseProcessor = new UppercaseRequestProcessor();

        const registry = new RequestProcessorRegistry({
            text: textProcessor,
            uppercase: uppercaseProcessor,
        });

        expect(registry.get("text")).toBe(textProcessor);
        expect(registry.get("uppercase")).toBe(uppercaseProcessor);
    });
});