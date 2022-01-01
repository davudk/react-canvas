import React, { CSSProperties, useEffect, useRef } from 'react';
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
        prevRenderSize?: Size;
        prevTimestamp?: DOMHighResTimeStamp;
    }

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const stateRef = useRef<State>({
        isMounted: false
    });

    useEffect(() => {
        stateRef.current.isMounted = true;

        adjustCanvasSize();
        requestAnimationFrame(onAnimationFrame);

        return () => {
            stateRef.current.isMounted = false;
        }
    }, []);

    useEffect(() => {
        if (props.coverViewport) {
            window.addEventListener('resize', adjustCanvasSize);
            return () => {
                window.removeEventListener('resize', adjustCanvasSize);
            }
        }
    }, [props.coverViewport]);

    function adjustCanvasSize() {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const prevSize = stateRef.current.prevRenderSize ?? {
            width: canvas.width,
            height: canvas.height
        };
        const newSize = {
            width: props.coverViewport ? window.innerWidth : props.width ?? 300,
            height: props.coverViewport ? window.innerHeight : props.height ?? 300,
        };

        if (!stateRef.current.prevRenderSize || prevSize.width !== newSize.width || prevSize.height !== newSize.height) {
            canvas.style.width = newSize.width + 'px';
            canvas.style.height = newSize.height + 'px';
            canvas.width = newSize.width * (window.devicePixelRatio ?? 1);
            canvas.height = newSize.height * (window.devicePixelRatio ?? 1);

            stateRef.current.prevRenderSize = newSize;

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

    const coverViewportStyles: CSSProperties = {
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none'
    };

    return (
        <canvas ref={canvasRef}
            className={props.className}
            style={props.coverViewport ? coverViewportStyles : undefined} />
    )
}
