import { useEffect, useState, useCallback, useRef } from "react";
import Interface from "./Interface"
import Viewport from "./Viewport"
import { settings } from "./config";
import ship from "./ship";
import star from "./star";
import planet from "./planet";
import drawLib from "./drawLib";
import { core } from './core';
import asteroid from './Asteroid';

const Game = () => {

    let stepCnt = 10;

    let canvas;
    let ctx;
    let svg;
    let draw;

    let rootElement;

    const key_down = 1;
    const key_up = -1;

    let initialActors = [];
    let displayWidth = settings.display.width;
    let displayHeight = settings.display.height;
    const initialShipX = settings.star.xpos;
    const initialShipY = settings.star.ypos - 50.0;

    let initialState = {
        initialized: false,
        keyCodes: {},
        keyEvents: [],
        actors: initialActors,
        width: settings.display.width,
        height: settings.display.height
    }

    let [game, setGameState] = useState(initialState);

    const addActor = (newActor) => {
        let maxId = 0;
        game.actors.forEach(o => { maxId = o.state.id > maxId ? o.state.id : maxId });
        const nextId = maxId + 1;
        console.log(`NEW ID GENERATED ${nextId} for ${newActor.state.name}`);
        newActor.state.id = nextId;
        game.actors.push(newActor);
        let theSvg = document.getElementById('theSvg');
        let markup = newActor.getRenderRoot(nextId);
        theSvg.insertAdjacentHTML('beforeend', markup);
        return newActor;
    }

    const shipGrav = core.gravityVector({ x: initialShipX, y: initialShipY }, { x: settings.star.xpos, y: settings.star.ypos }, settings.star.grav);

    const defaultShipConfig = { name: 'default', x: 50, y: 50, xv: shipGrav.y, yv: 0, a: 0, av: 0 };


    const gameSetup = () => {

        //if (game.initialized) return;
        //this is getting called twice, each time it adds an SVG element
        //TODO - elminate d3 completely
        // window.d3 = d3;
        // rects = d3
        //     .select('.main')
        //     .append('svg')
        //     .attr('id', 'theSvg')
        //     .attr('width', displayWidth)
        //     .attr('height', displayHeight);
        // console.log(`rects .main set to ${displayWidth}px, ${displayHeight}px`);

        let initialShip, theStar;

        if (!game.initialized) {
            initialShip = addActor(new ship({ ...defaultShipConfig, name: 'ship', x: initialShipX, y: initialShipY, xv: .26, yv: 0 }));
            //const initialPlanet = addActor(new planet({ ...defaultShipConfig, name: 'planet', x: displayWidth / 4.0, y: displayHeight / 2.0, xv: 0, yv: -.4 }));
            //const newPlanet = addActor(new planet({ ...defaultShipConfig, name: 'planet2', x: displayWidth - (displayWidth / 4.0), y: displayHeight / 2.0, xv: 0, yv: .4 }));
            //const theAsteroid = addActor(new asteroid({...defaultShipConfig, name:'asteroid', x: initialShipX + 50.0, y: initialShipY - 50.0, xv: .26, yv:0, av:0.4 }));
            theStar = addActor(new star({ id: 1, name: 'star', x: settings.star.xpos, y: settings.star.ypos }));

            canvas = document.getElementById('theCanvas');
            canvas.setAttribute('width', displayWidth);
            canvas.setAttribute('height', displayHeight);

        }
        game.initialized = true;

        //TODO - eliminate or use canvas

        //draw stars
        const density = 2.7;
        const hcnt = displayWidth / (1.0 / density);
        ctx = canvas.getContext('2d');
        for (let i = 0; i < hcnt; i++) {
            ctx.beginPath();
            const xloc = Math.random() * displayWidth;
            const yloc = Math.random() * displayHeight;
            let size = Math.pow(Math.random() * 1.2, 2);
            const id = parseInt((Math.random() * 8) + 8).toString(16);
            let clr = `#${id}${id}${id}${id}`;
            ctx.arc(xloc, yloc, size, 0, 2 * Math.PI);
            ctx.fillStyle = clr;
            ctx.fill();
            ctx.stroke();
            ctx.closePath();
        }

        const svgRoot = document.getElementById('theSvg');
        //console.log('SETTING: ', displayWidth, displayHeight);
        svgRoot.setAttribute('width', displayWidth);
        svgRoot.setAttribute('height', displayHeight);
        //console.log('svgRoot: ', svgRoot);


        //clean-up 
        //const svgs = document.querySelectorAll('svg');
        //svgs.forEach(element => { element.remove() });

        // const addActor = (newActor) => {
        //     const newGameState = { ...game, actors:[... game.actors, newActor]};
        //     setGameState(newGameState);
        // }
        draw = drawLib(null, svg, svgRoot);

        const handleKeyDown = (event) => {
            if (event.code !== "F12" && event.code !== "F11") event.preventDefault();
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

            game.actors.forEach((effector) => {
                game.actors.forEach((effected) => {
                    if (effected.state.id !== effector.state.id) {
                        effector.effectOther && effector.effectOther(effected);
                    }
                });
            });

            game.actors.forEach((o, i, a) => {
                if (game.keyEvents.length) o.handleKeyEvents(game.keyEvents);
                o.step(game);
                wrapToVisibleFrame(o);
                o.render(draw);
            });

            game.actors.forEach((effector) => {
                game.actors.forEach((effected) => {
                    if (effected.state.id != effector.state.id) {
                        effector.PosteffectOtherActor && effector.PosteffectOtherActor(effected);
                    }
                });
            });

            game.keyEvents.splice(0, game.keyEvents.length);

            //window.rects = rects;
            window.svg = svg;

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

    const addPlanet = (event) => {
        console.log(event);
        //const nextId = game.actors.length + 1;
        const newPlanet = addActor(new planet({ ...defaultShipConfig, name: 'planet', x: displayWidth / 4.0, y: displayHeight / 2.0, xv: 0, yv: -.4 }));
        newPlanet.name = `${newPlanet.name}${newPlanet.state.id}`;
        console.log(`added new planet ${newPlanet.state.id} ${newPlanet.state.name}`);
    }

    const addAsteroid = (event) => {
        const newAsteroid = addActor(new asteroid({...defaultShipConfig, name:'asteroid', x: initialShipX + 50.0, y: initialShipY - 50.0, xv: .26, yv:0, av:0.4 }));
        console.log(`added new asteroid ${newAsteroid.state.id} ${newAsteroid.state.name}`);
    };

    return (
        <div id="gameDiv">
            <Viewport game={game} />
            <Interface addPlanetHandler={addPlanet} addAsteroidHandler={addAsteroid}/>
        </div>
    )
}

export default Game;