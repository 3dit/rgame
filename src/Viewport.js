import { useEffect, useState, useCallback, useRef } from "react";
import { settings } from "./config";



const Viewport = ({ game, setReference }) => {
    console.log("GAME COMPONENT INITIALIZING");
    window.__cnt = 0;

    let displayWidth = settings.display.width;
    let displayHeight = settings.display.height;

    //const screenBounds = containerRef?.current?.getBoundingClientRect() ?? { width: settings.display.width, height: settings.display.height };
    //console.log('BOUNDS', screenBounds);
    //console.log('BOUNDING ', containerRef?.current?.getBoundingClientRect())

    //game.actors.push(ship({ id: 0, name: 'ship', x: 50, y: 50, xv: 0, yv: 0, a: 0, av: 0 }));
    let lastKeyDown = null;



    return (
        <div className="container" width={displayWidth} height={displayHeight}>
            <svg id="theSvg" xmlns="http://www.w3.org/2000/svg" ></svg>
            <canvas id="theCanvas" width={displayWidth} height={displayHeight}></canvas>
        </div>
    )
};

export default Viewport;
