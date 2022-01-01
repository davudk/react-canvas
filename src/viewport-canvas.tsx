import React, { CSSProperties, useEffect, useState } from 'react';
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

    useEffect(() => {
        window.addEventListener('resize', onWindowResized);

        return () => {
            window.removeEventListener('resize', onWindowResized);
        }
    }, []);

    function onWindowResized() {
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

    const scale = (autoScaleRatio && window.devicePixelRatio) || 1;

    return (
        <Canvas className={className}
            renderer={renderer}
            width={window.innerWidth}
            height={window.innerHeight}
            renderWidth={window.innerWidth * scale}
            renderHeight={window.innerHeight * scale}
            style={style}
        />
    );
}
