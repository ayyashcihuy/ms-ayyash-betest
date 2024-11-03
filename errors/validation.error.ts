export type Issue = {
    field: string;
    reason: string;
}

export class ValidationError extends Error {
    constructor(public readonly issues: Issue[]) {
        super(`ValidationError: ${issues.map((i) => `on ${i.field} (${i.reason})`).join(", ")}`);
        this.name = "ValidationError";
    }
}