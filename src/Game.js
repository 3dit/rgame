import { useEffect, useState, useCallback, useRef } from "react";
import Interface from "./Interface"
import Viewport from "./Viewport"
import { settings } from "./config";
import ship from "./ship";
import star from "./star";
import planet from "./planet";
import shell from "./shell";
import drawLib from "./drawLib";
import { core } from './core';
import asteroid from './Asteroid';
import textlog from "./textlog";

const Game = () => {

    let stepCnt = 10;

    let canvas;
    let ctx;
    let svg;
    let draw;

    let frameCountFPS = 0;
    let totalFrameCount = 0;
    let currentFrameRate = 0;

    let tlog = null;

    //interval to update text 'log' feedback
    setInterval(() => {
        currentFrameRate = frameCountFPS;
        frameCountFPS = 0;
        tlog = tlog ?? document.getElementById('textlog');
        const text = `FPS ${currentFrameRate * 4}  TFC ${totalFrameCount}`;
        tlog && (tlog.textContent = text);
        settings.global.averageFrameRate = currentFrameRate;
    }, 1000);

    let rootElement;

    const key_down = 1;
    const key_up = -1;

    let initialActors = [];
    let displayWidth = settings.display.width;
    let displayHeight = settings.display.height;
    const initialShipX = settings.star.xpos;
    const initialShipY = settings.star.ypos - 50.0;

    let actorCnt = 0;

    let flagDebugger = false;

    let initialState = {
        initialized: false,
        keyCodeTracker: {},
        keyEvents: [],
        actors: initialActors,
        width: settings.display.width,
        height: settings.display.height
    }
    const shells = [];

    let [game, setGameState] = useState(initialState);

    const addActor = (newActor) => {
        const nextId = actorCnt++;
        //console.log(`NEW ID GENERATED ${nextId} for ${newActor.state.name}`);
        newActor.state.id = nextId;
        game.actors.push(newActor);
        let theSvg = document.getElementById('theSvg');
        let markup = newActor.getRootTemplate(nextId);
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

        let initialShip, theStar, theTextlog;

        if (!game.initialized) {
            //console.log('settings ', settings);
            for (let i = 0; i < settings.shells.maxShellCnt; i++) {
                const newShell = new shell({ name: `shell${i + 1}`, index: i, preventGravity: false, effectedImune: true });
                shells.push(newShell);
                addActor(newShell);
            }
            initialShip = addActor(new ship({ ...defaultShipConfig, name: 'ship', x: initialShipX, y: initialShipY, xv: .26, yv: 0, shells: shells }));
            //const initialPlanet = addActor(new planet({ ...defaultShipConfig, name: 'planet', x: displayWidth / 4.0, y: displayHeight / 2.0, xv: 0, yv: -.4 }));
            //const newPlanet = addActor(new planet({ ...defaultShipConfig, name: 'planet2', x: displayWidth - (displayWidth / 4.0), y: displayHeight / 2.0, xv: 0, yv: .4 }));
            //const theAsteroid = addActor(new asteroid({...defaultShipConfig, name:'asteroid', x: initialShipX + 50.0, y: initialShipY - 50.0, xv: .26, yv:0, av:0.4 }));
            theStar = addActor(new star({ id: 1, name: 'star', x: settings.star.xpos, y: settings.star.ypos }));

            theTextlog = addActor(new textlog({ name: 'text', x: 50.0, y: 50.0, text: '00000' }));


            canvas = document.getElementById('theCanvas');
            canvas.setAttribute('width', displayWidth);
            canvas.setAttribute('height', displayHeight);

        }
        game.initialized = true;

        //draw stars
        const density = 2.7;
        const hcnt = displayWidth * density;
        ctx = canvas.getContext('2d');
        for (let i = 0; i < hcnt; i++) {
            ctx.beginPath();
            const xloc = Math.random() * displayWidth;
            const yloc = Math.random() * displayHeight;
            let size = Math.pow(Math.random() * 1.2, 2);
            const id = parseInt((Math.random() * 5) + 8).toString(16);//base 16/hex from decimal 8 to 13
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

        const isCtrlZero = (e) => e?.ctrlKey && e?.key === '0';

        const handleKeyDown = (event) => {
            if (event.key === 'Control' || event.key === 'Alt') return;
            if (event.code !== "F12" && event.code !== "F11") event.preventDefault();
            const code = event.code;
            if (!game.keyCodeTracker[code]) {
                let newKeyEvent = {
                    action: key_down,
                    key: code,
                    meta: () => `${code}_down`, //does this need to be a function?
                    metaCode: `${code}_down`, //wouldn't metaCode serve same function as the 'meta' lambda?
                    time: event.timeStamp,
                    totalFrameCount: totalFrameCount
                };
                game.keyEvents.push(newKeyEvent);
                game.keyCodeTracker[code] = {
                    timeStamp: event.timeStamp,
                    totalFrameCount: totalFrameCount
                }
            }
        };

        const handleKeyUp = (event) => {
            if (event.key === 'Control' || event.key === 'Alt') return;
            event.preventDefault();
            const code = event.code;
            if (game.keyCodeTracker[code]) {
                let newKeyEvent = {
                    action: key_up,
                    key: code,
                    time: event.timeStamp,
                    meta: () => `${code}_up`,
                    metaCode: `${code}_up`,
                    delta: event.timeStamp - game.keyCodeTracker[code].timeStamp,
                    totalFrameCount: totalFrameCount,
                    totalFrameDelta: totalFrameCount - game.keyCodeTracker[code].totalFrameCount
                };
                game.keyEvents.push(newKeyEvent);
            }
            delete game.keyCodeTracker[code];
        };

        const wrapToVisibleFrame = (actor) => {
            if (actor.state.noWrap) return;
            if (actor.state.x > game.width) actor.state.x -= game.width;
            if (actor.state.x < 0) actor.state.x += game.width;
            if (actor.state.y > game.height) actor.state.y -= game.height;
            if (actor.state.y < 0) actor.state.y += game.height;
        }

        console.log('Adding event listeners');
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);

        const updateFrame = () => {
            frameCountFPS++;
            totalFrameCount++;

            if (window.stopme) {
                requestAnimationFrame(updateFrame);
                return;
            }

            game.actors.forEach((effector) => {
                game.actors.forEach((effected) => {
                    if (effected.state.id !== effector.state.id) {
                        effector.effectOther && !effected.effectedImune && effector.effectOther
                            /*==>*/ && effector.effectOther(effected);
                    }
                });
            });

            game.actors.forEach((o, i, a) => {
                //these should probably be broken out such that all keys handled, then all steps, & possibly only then all render
                if (game.keyEvents.length) o.handleKeyEvents(game.keyEvents);
            });

            game.actors.forEach((o, i, a) => {
                if (o.enabled === undefined || o.enabled) {
                    o.step(game);
                    wrapToVisibleFrame(o);
                    o.render(draw);
                }
            });

            game.actors.forEach((effector) => {
                if (effector.enabled == undefined || effector.enabled) {
                    game.actors.forEach((effected) => {
                        if (effected.enabled === undefined || effected.eanbled) {
                            if (effected.state.id != effector.state.id) {
                                effector.PosteffectOtherActor && !effected.effectedImune && effector.PosteffectOtherActor
                                    && effector.PosteffectOtherActor(effected);
                            }
                        }
                    });
                }
            });

            if (flagDebugger) debugger;

            let markedForDelete = game.actors.filter(n => n.state?.markForDelete === true);
            let deleteIds = [];
            if (markedForDelete.length) {
                markedForDelete.forEach((o) => deleteIds.push(o.state.id));
                // if(!window.apo) { 
                //     console.log(deleteIds);
                //     window.apo = true;
                // }
            }
            deleteIds.forEach((idToDelete) => {
                let itemIndex = game.actors.findIndex((o) => o.state?.id === idToDelete);
                if (game.actors[itemIndex].removeSelf) game.actors[itemIndex].removeSelf();
                if (itemIndex !== -1) game.actors.splice(itemIndex, 1);
            });


            game.keyEvents.splice(0, game.keyEvents.length);

            //window.rects = rects;
            window.svg = svg;

            requestAnimationFrame(updateFrame);
        };


        //updateFrame();
        requestAnimationFrame(updateFrame);

        //cleanup
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("keyup", handleKeyUp);
        };
    }

    useEffect(gameSetup, []);

    const addPlanet = (event) => {
        //console.log(event);
        //const nextId = game.actors.length + 1;
        const newPlanet = addActor(new planet({ ...defaultShipConfig, name: 'planet', x: displayWidth / 4.0, y: displayHeight / 2.0, xv: 0, yv: -.4 }));
        newPlanet.name = `${newPlanet.name}${newPlanet.state.id}`;
        //console.log(`added new planet ${newPlanet.state.id} ${newPlanet.state.name}`);
    }

    const handleSplitAsteroid = (sourceAsteroid, point, velocity) => {
        console.log(`SPLIT`, sourceAsteroid);
        let newSize = sourceAsteroid.size / 2.0;
        if (newSize < settings.asteroids.minimumSize) return;

        let massDampening = .1;

        let newXv1 = (sourceAsteroid.xv * massDampening) + (velocity.x * massDampening) + (Math.random() / 2.0 + .5);
        let newYv1 = (sourceAsteroid.yv * massDampening) + (velocity.y * massDampening) + (Math.random() / 2.0 + .5);
        newXv1 = Math.random() - 0.5;
        newYv1 = Math.random() - 0.5;
        let newAv1 = sourceAsteroid.av * (Math.random() - 0.5);
        const split1 = addActor(new asteroid({ ...defaultShipConfig, name: 'asteroid', x: point.x, y: point.y, xv: newXv1, yv: newYv1, av: newAv1, size: newSize }, handleSplitAsteroid));
        let newXv2 = (sourceAsteroid.xv * massDampening) /*+ velocity.x*/ + (Math.random() / 2.0 + .5);
        let newYv2 = (sourceAsteroid.yv * massDampening) /*+ velocity.y*/ + (Math.random() / 2.0 + .5);
        newXv2 = Math.random() - 0.5;
        newYv2 = Math.random() - 0.5;
        let newAv2 = sourceAsteroid.av * (Math.random() - 0.5);
        const split2 = addActor(new asteroid({ ...defaultShipConfig, name: 'asteroid', x: point.x, y: point.y, xv: newXv2, yv: newYv2, av: newAv2, size: newSize }, handleSplitAsteroid));

        //flagDebugger = true;
    }

    const addAsteroid = (event) => {
        //const newAsteroid = addActor(new asteroid({ ...defaultShipConfig, name: 'asteroid', x: initialShipX + 50.0, y: initialShipY - 50.0, xv: (Math.random() - 0.5), yv: (Math.random() - 0.5), av: 0.4 }));
        const newAsteroid = addActor(new asteroid({ ...defaultShipConfig, name: 'asteroid', x: initialShipX + 50.0, y: initialShipY - 50.0, xv: (Math.random() - 0.5), yv: (Math.random() - 0.5), av: 0.4, size: settings.asteroids.initialSize }, handleSplitAsteroid));
        //newAsteroid.state.xv = 0;
        //newAsteroid.state.yv =0;
        //newAsteroid.state.av = 0;
        //console.log(`added new asteroid ${newAsteroid.state.id} ${newAsteroid.state.name}`);
    };
    const toggleStar = (event) => {
        //console.log(game.actors);
        let theStar = game.actors.find(o => o.state?.name === 'star');
        theStar.state.enabled = !theStar.state.enabled;
    }
    const toggleStop = (event) => {
        window.stopme = window.stopme ? false : true;
    }

    return (
        <div id="gameDiv">
            <Viewport game={game} />
            <Interface addPlanetHandler={addPlanet} addAsteroidHandler={addAsteroid} starToggleHandler={toggleStar} stopToggleHandler={toggleStop} />
        </div>
    )
}

export default Game;