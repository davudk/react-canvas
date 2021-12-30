import React, { useEffect, useRef } from 'react';
import { CanvasRenderer, CanvasRendererOptions, Size } from './renderer';

export interface CanvasProps {
    className?: string;
    renderer?: CanvasRenderer;

    width?: number;
    height?: number;
    coverViewport?: boolean;
}

export function Canvas(props: CanvasProps) {

    interface State {
        isMounted: boolean;
        prevCanvasSize?: Size;
        prevTimestamp?: DOMHighResTimeStamp;
    }

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const stateRef = useRef<State>({
        isMounted: false
    });

    useEffect(() => {
        const { coverViewport } = props;
        if (coverViewport) {
            window.addEventListener('resize', adjustCanvasSize);
        }

        stateRef.current.isMounted = true;

        return () => {
            stateRef.current.isMounted = false;

            if (coverViewport) {
                window.removeEventListener('resize', adjustCanvasSize);
            }
        }
    }, []);

    useEffect(() => {
        adjustCanvasSize();
        requestAnimationFrame(onAnimationFrame);
    }, []);

    function adjustCanvasSize() {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const prevSize = stateRef.current.prevCanvasSize ?? {
            width: canvas.width,
            height: canvas.height
        };
        const newSize = {
            width: props.coverViewport ? window.innerWidth : props.width ?? 300,
            height: props.coverViewport ? window.innerHeight : props.height ?? 300,
        };

        if (!stateRef.current.prevCanvasSize || prevSize.width !== newSize.width || prevSize.height !== newSize.height) {
            canvas.width = newSize.width;
            canvas.height = newSize.height;

            stateRef.current.prevCanvasSize = newSize;

            props.renderer?.onResized?.(newSize, prevSize);
        }
    }

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

    return (
        <canvas ref={canvasRef} className={props.className} />
    )
}
