export interface RequestProcessor {
    process(payload: string): string;
}

export class TextRequestProcessor implements RequestProcessor {
    process(payload: string): string {
        return payload.trim();
    }
}

export class UppercaseRequestProcessor implements RequestProcessor {
    process(payload: string): string {
        return payload.toUpperCase();
    }
}

export class ReverseTextRequestProcessor implements RequestProcessor {
    process(payload: string): string {
        return Array.from(payload).reverse().join("");
    }
}
