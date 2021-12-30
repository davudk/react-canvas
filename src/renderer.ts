
export interface CanvasRenderer {
    render(options: CanvasRendererOptions): void;
    onResized?(size: Size, prevSize: Size): void;
}

export interface CanvasRendererOptions {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    time: {
        prev?: number;
        curr: number;
        delta: number;
    };
}

export interface Size {
    width: number;
    height: number;
}
