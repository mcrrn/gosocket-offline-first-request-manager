import { describe, expect, it } from "vitest";
import { ReverseTextRequestProcessor, TextRequestProcessor } from "../requestProcessor";

describe("TextRequestProcessor", () => {
    it("trims the payload", () => {
        const processor = new TextRequestProcessor();

        const result = processor.process("   hello world   ");

        expect(result).toBe("hello world");
    });
});

describe("ReverseTextRequestProcessor", () => {
    it("reverses the payload", () => {
        const processor = new ReverseTextRequestProcessor();

        const result = processor.process("hello world");

        expect(result).toBe("dlrow olleh");
    });
});
