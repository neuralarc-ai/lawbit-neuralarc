if (typeof DOMMatrix === 'undefined') {
    class DOMMatrix {
        constructor(init?: string | number[]) {
            if (typeof init === 'string') {
                // Parse transform string
                const values = init.match(/-?\d*\.?\d+/g)?.map(Number) || [1, 0, 0, 1, 0, 0];
                this.a = values[0] || 1;
                this.b = values[1] || 0;
                this.c = values[2] || 0;
                this.d = values[3] || 1;
                this.e = values[4] || 0;
                this.f = values[5] || 0;
            } else if (Array.isArray(init)) {
                this.a = init[0] || 1;
                this.b = init[1] || 0;
                this.c = init[2] || 0;
                this.d = init[3] || 1;
                this.e = init[4] || 0;
                this.f = init[5] || 0;
            } else {
                this.a = 1;
                this.b = 0;
                this.c = 0;
                this.d = 1;
                this.e = 0;
                this.f = 0;
            }
        }

        a: number;
        b: number;
        c: number;
        d: number;
        e: number;
        f: number;

        toString(): string {
            return `matrix(${this.a}, ${this.b}, ${this.c}, ${this.d}, ${this.e}, ${this.f})`;
        }
    }

    (global as any).DOMMatrix = DOMMatrix;
} 