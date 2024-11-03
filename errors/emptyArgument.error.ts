export class EmptyArgumentError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "EmptyArgumentError";
    }
}