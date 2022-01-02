import React, { CSSProperties, useEffect, useRef, useState } from 'react';
import { Canvas } from './canvas';
import { CanvasRenderer } from './renderer';

export interface ViewportCanvasProps {
    className?: string;
    renderer?: CanvasRenderer;

    autoScaleRatio?: boolean;
}

export function ViewportCanvas(props: ViewportCanvasProps) {
    const [_, rerender] = useState<void>();
    const { className, renderer, autoScaleRatio } = props;

    const stateRef = useRef<{
        width?: number;
        height?: number;
        renderWidth?: number;
        renderHeight?: number;
    }>({});

    useEffect(() => {
        window.addEventListener('resize', onWindowResized);

        return () => {
            window.removeEventListener('resize', onWindowResized);
        }
    }, []);

    function onWindowResized() {
        const scale = (autoScaleRatio && window.devicePixelRatio) || 1;
        stateRef.current.width = window.innerWidth;
        stateRef.current.height = window.innerHeight;
        stateRef.current.renderWidth = stateRef.current.width * scale;
        stateRef.current.renderHeight = stateRef.current.height * scale;
        rerender();
    }

    const style: CSSProperties = {
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        pointerEvents: 'none'
    };

    return (
        <Canvas className={className}
            renderer={renderer}
            width={stateRef.current.width}
            height={stateRef.current.height}
            renderWidth={stateRef.current.renderWidth}
            renderHeight={stateRef.current.renderHeight}
            style={style}
        />
    );
}
