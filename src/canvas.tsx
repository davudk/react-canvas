import React, { CSSProperties, useEffect, useRef } from 'react';
import { CanvasRenderer, CanvasRendererOptions, Size } from './renderer';

export interface CanvasProps {
    className?: string;
    renderer?: CanvasRenderer;
    style?: CSSProperties;

    width?: number;
    height?: number;
    renderWidth?: number;
    renderHeight?: number;
}

export function Canvas(props: CanvasProps) {

    interface State {
        isMounted: boolean;
        prevRenderSize?: Size;
        prevTimestamp?: DOMHighResTimeStamp;
    }

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const stateRef = useRef<State>({
        isMounted: false
    });

    useEffect(() => {
        stateRef.current.isMounted = true;

        requestAnimationFrame(onAnimationFrame);

        return () => {
            stateRef.current.isMounted = false;
        }
    }, []);

    function onAnimationFrame(ts: DOMHighResTimeStamp) {
        if (!props.renderer) return;

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const prevTs = stateRef.current.prevTimestamp;
        stateRef.current.prevTimestamp = ts;

        const prev = prevTs ? prevTs / 1000 : undefined;
        const curr = ts / 1000;
        const delta = prev ? curr - prev : 0;

        const options: CanvasRendererOptions = {
            canvas,
            ctx,
            time: { prev, curr, delta }
        };

        props.renderer?.render(options);

        if (stateRef.current.isMounted) {
            requestAnimationFrame(onAnimationFrame);
        }
    }

    const elementSize: Size = {
        width: props.width ?? 300,
        height: props.height ?? 150
    }

    const renderSize: Size = {
        width: props.renderWidth ?? elementSize.width,
        height: props.renderHeight ?? elementSize.height
    }

    const { prevRenderSize } = stateRef.current;

    if (prevRenderSize && (renderSize.width !== prevRenderSize.width || renderSize.height !== prevRenderSize.height)) {
        props.renderer?.onResized?.(renderSize, prevRenderSize);
    }

    stateRef.current.prevRenderSize = renderSize;

    const style: CSSProperties = {
        ...props.style,
        width: elementSize.width + 'px',
        height: elementSize.height + 'px'
    }

    return (
        <canvas ref={canvasRef}
            className={props.className}
            width={renderSize.width}
            height={renderSize.height}
            style={style} />
    );
}
