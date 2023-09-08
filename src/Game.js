import { useEffect, useState, useCallback, useRef } from "react";
import { settings } from "./config";
import * as d3 from 'd3';
import ship from "./ship";
import star from "./star";
import planet from "./planet";
import drawLib from "./drawLib";

const Game = () => {
    console.log("GAME COMPONENT INITIALIZING");
    window.__cnt = 0;

    const containerRef = useRef(null);

    const key_down = 1;
    const key_up = -1;

    let initialActors = [];
    const defaultShipConfig = { id: 0, name: 'ship', x: 50, y: 50, xv: 0, yv: 0, a: 0, av: 0 };
    const initialShip = new ship({...defaultShipConfig, x:614.516, y:64.3536930, xv: 0.1522378, yv:0});
    const initialPlanet = new planet({...defaultShipConfig, name:'planet', id:3, x:557.1742200063561, y:482.2409534385308, xv: 0.4654933919818754, yv:-0.06634999424554278 })
    initialActors.push(
        initialShip,
        initialPlanet,
        new star({ id: 1, name: 'star', x: settings.star.xpos, y: settings.star.ypos })
        );
        
    let initialState = {
        initialized: false,
        keyCodes: {},
        keyEvents: [],
        actors: initialActors,
        width: settings.display.width,
        height: settings.display.height,
    }
    let [game, setGameState] = useState(initialState);

    const screenBounds = containerRef?.current?.getBoundingClientRect() ?? { width: settings.display.width, height: settings.display.height };
    console.log('BOUNDS', screenBounds);
    console.log('BOUNDING ', containerRef?.current?.getBoundingClientRect())

    //game.actors.push(ship({ id: 0, name: 'ship', x: 50, y: 50, xv: 0, yv: 0, a: 0, av: 0 }));
    let lastKeyDown = null;

    const gameSetup = () => {
        //clean-up 
        const svgs = document.querySelectorAll('svg');
        svgs.forEach(element => { element.remove() });

        let rects = d3
            .select('.main')
            .append('svg')
            .attr('id', 'theSvg')
            .attr('width', settings.display.width)
            .attr('height', settings.display.height);
        let canvas = document.getElementById('theCanvas');
        console.log('canvas', canvas);
        //let ctx = canvas.getContext('2d');
        const svg = d3.select("#theSvg");

        // const addActor = (newActor) => {
        //     const newGameState = { ...game, actors:[... game.actors, newActor]};
        //     setGameState(newGameState);
        // }
        const draw = drawLib(rects, svg);

        game.initialized = true;

        const handleKeyDown = (event) => {
            if(event.code !== "F12" && event.code !== "F11") event.preventDefault();
            const code = event.code;
            if (!game.keyCodes[code]) {
                game.keyEvents.push({ action: key_down, key: code, meta: () => `${code}_down`, time: event.timeStamp });
                game.keyCodes[code] = event.timeStamp;
            }
        };

        const handleKeyUp = (event) => {
            event.preventDefault();
            const code = event.code;
            if (game.keyCodes[code]) {
                game.keyEvents.push({ action: key_up, key: code, time: event.d, meta: () => `${code}_up`, delta: event.timeStamp - game.keyCodes[code] });
            }
            delete game.keyCodes[code];
        };

        const wrapToVisibleFrame = (actor) => {
            if (actor.state.x > game.width) actor.state.x -= game.width;
            if (actor.state.x < 0) actor.state.x += game.width;
            if (actor.state.y > game.height) actor.state.y -= game.height;
            if (actor.state.y < 0) actor.state.y += game.height;
        }

        console.log('Adding event listeners');
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);

        const updateFrame = () => {

            game.actors.forEach((o, i, a) => {
                if(game.keyEvents.length) o.handleKeyEvents(game.keyEvents);
                o.step(game);
                wrapToVisibleFrame(o);
                o.render(draw);
            });

            game.keyEvents.splice(0, game.keyEvents.length);

            if (!window.stopme) requestAnimationFrame(updateFrame);
        };

        updateFrame();
        //if (!window.stopme) requestAnimationFrame(updateFrame);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("keyup", handleKeyUp);
        };
    }

    useEffect(gameSetup, []);

    const s = "";

    return (
        <div className="Game" style={{ width: `${settings.display.width}px`, height: `${settings.display.height}px` }}>
            <canvas id="theCanvas" width="500" height="500"></canvas>
            <div ref={containerRef} className="container" style={{ width: `${settings.display.width}px`, height: `${settings.display.height}px` }}>
                <div className="main">

                </div>
            </div>
        </div>
    )
};

export default Game;
