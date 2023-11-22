import { utcMillisecond } from "d3";
import { settings } from "./config";
import { core } from "./core";
import ReactDOMServer from 'react-dom/server';

const size = 15;
// const lineData = [
//     { x1: 0, y1: -size, x2: -size / 2, y2: size / 2 },
//     { x1: -size / 2, y1: size / 2, x2: size / 2, y2: size / 2 },
//     { x1: size / 2, y1: size / 2, x2: 0, y2: -size }
// ];

let shipGroup = null;
let flameGroup = null;
let shipContainer = null;

function ship({ id, name, x, y, xv, yv, a, av, shells }) {
    let first = true;
    const state = { ...arguments[0], t: 0, tv: 0, physform: true, avr: 0 };

    state.proGradeHold = false;
    state.retroGradeHold = false;
    state.thrustersEngaged = false;
    state.rcsThrustAngle = 0;
    state.canonEngaged = false;
    state.normalHold = false;
    state.antiNormalHold = false;
    state.trueProGradeHold = false;
    state.trueRetroGradeHold = false;


    const canonFireRate = 200.0;//fire every 'x' millseconds
    let lastCannonFired = null;

    let dbg = false;

    const compute_avec = () => {
        const xdelta = state.x - settings.star.xpos;
        const ydelta = state.y - settings.star.ypos;
        return (Math.atan2(ydelta, xdelta)) / core.dtor;
    }

    const step = (game) => {
        let direction = null;
        let angle = 0;

        //if (dbg) debugger;
        state.a += state.av + state.avr;//angular velocity remnant avr represents additional fractional velocity resulting from partial key down time between frames
        state.avr = 0;//avr set by keyup, reset every frame step

        state.t += state.tv;

        if (state.t > settings.ship.thrust) {
            state.t = settings.ship.thrust;
            state.tv = 0;
        }
        state.xv += Math.sin(state.a * core.dtor) * state.t * .5;
        state.yv -= Math.cos(state.a * core.dtor) * state.t * .5;

        if (state.trueProGradeHold || state.trueRetroGradeHold) {
            const xdelta = state.xv;
            const ydelta = state.yv;
            const a = (Math.atan2(ydelta, xdelta) / core.dtor) + (state.trueProGradeHold ? + 90.0 : -90.0);
            state.a = a;
        } else if (state.proGradeHold || state.retroGradeHold) {
            angle = compute_avec();
            // const Ax = settings.star.xpos;
            // const Ay = settings.star.ypos;
            // const Bx = state.x;
            // const By = state.y;
            // const Cx = state.x + state.xv;
            // const Cy = state.y + state.yv;
            //const dotProduct = (Bx - Ax) * (Cy - Ay) - (By - Ay) * (Cx - Ax);
            const dotProduct = core.dotProductPlaner(settings.star.xpos, settings.star.ypos, state.x, state.y, state.x + state.xv, state.y + state.yv);
            direction = Math.sign(dotProduct);
            state.rcsThrustAngle = angle;
            if (state.proGradeHold) {
                direction *= -1.0;
            }

            state.a = (direction > 0) ? angle : angle + 180.0;
        } else if (state.normalHold || state.antiNormalHold) {
            const deltax = settings.star.xpos - state.x;
            const deltay = settings.star.ypos - state.y;
            const angle_rad = Math.atan2(deltay, deltax);
            state.a = (angle_rad / core.dtor) + (state.antiNormalHold ? -90.0 : 90.0);
        }
        if (state.thrustersEngaged) {
            //rcsThrusters
            const avec_thrust = settings.ship.thrust / 5.0 * direction;
            state.avx = Math.sin(angle * core.dtor) * avec_thrust;
            state.avy = -Math.cos(angle * core.dtor) * avec_thrust;
            state.xv += state.avx;
            state.yv += state.avy;
        }

        if (state.canonEngaged) {

        }

        state.x += state.xv;
        state.y += state.yv;

        if (state.canonEngaged) {
            let delta = 0;
            if (lastCannonFired === null) {
                delta = canonFireRate;
            }
            else {
                delta = (new Date()) - lastCannonFired;
            }

            if (delta >= canonFireRate) {
                lastCannonFired = new Date();
                let nextShell = shells.find(o => o?.state.enabled === false);
                if (nextShell) {
                    console.log(nextShell);
                    nextShell.state.age = 0;
                    nextShell.state.enabled = true;
                    let xvec = Math.sin(state.a * core.dtor);
                    let yvec = -Math.cos(state.a * core.dtor);
                    nextShell.state.x = state.x + (xvec * size);
                    nextShell.state.y = state.y + (yvec * size);
                    nextShell.state.xv = state.xv + (xvec * settings.shells.velocity);
                    nextShell.state.yv = state.yv + (yvec * settings.shells.velocity);
                } else {
                    //ran out of shells
                }
            }
        }


    }

    const RootTemplate = ({ id }) => {
        //console.log(game.actors);
        //console.log(ship);
        return (
            <g id="shipContainer">
                <g id="shipGroup">
                    <polygon id={`shipPolygon${id}`}
                        points={`0,-${size} ${-size / 2},${size / 2} ${size / 2},${size / 2}`}
                        stroke="white" strokeWidth="2">
                    </polygon>
                </g>
                <g id="flameGroup" />
            </g>
        )
    }

    const getRootTemplate = (id) => {
        return ReactDOMServer.renderToString(<RootTemplate id={id} />);
    }

    const render = (draw) => {
        //shipContainer || initialRender(draw);
        if (!shipContainer) {
            shipContainer = document.getElementById('shipContainer');
            shipGroup = document.getElementById('shipGroup');
            flameGroup = document.getElementById('flameGroup');
        }

        if (!shipGroup) window.stopme = true;

        const rcsThrusters =
            state.thrustersEngaged &&
            (state.retroGradeHold
                || state.proGradeHold
                || state.normalHold
                || state.antiNormalHold
                || state.trueProGradeHold
                || state.trueRetroGradeHold
            );

        shipGroup.setAttribute('transform', `translate(${state.x},${state.y}) rotate(${state.a})`);
        const jiggle = () => Math.random() * 5.0 - 2.5;

        //draw.deleteGroup(flameGroup);
        // let nextone = document.getElementById('flameGroup');
        // if(nextone) {
        //     draw.deleteGroup(nextone);
        // }
        //flameGroup = draw.addChildGroup(shipContainer, 'flameGroup');
        draw.clearGroup(flameGroup);
        if ((rcsThrusters /*&& (state.proGradeHold || state.retroGradeHold) */)) {
            const leftThruster = draw.createLine(flameGroup, 0, 0, 0, -size / 2.0, 3, '#d04005');
            leftThruster.setAttribute('transform', `translate(${state.x},${state.y}) rotate(${state.a + 180.0 + jiggle()}) translate(${-size / 2},${-size / 2})`);
            const rightThruster = draw.createLine(flameGroup, 0, 0, 0, -size / 2, 3, '#d04005');
            rightThruster.setAttribute('transform', `translate(${state.x},${state.y}) rotate(${state.a + 180.0 + jiggle()}) translate(${size / 2},${-size / 2})`);
        } else if (state.thrustersEngaged) {
            const mainThruster = draw.createLine(flameGroup, 0, 0, 0, -state.t * 1500.0 * settings.ship.thrustPlumeRatio, 3, 'orange');
            mainThruster.setAttribute('transform', `translate(${state.x},${state.y}) rotate(${state.a + 180.0 + jiggle()}) translate(0,${-size / 2})`);
        }
    }
    const commandMatrix = {
        'KeyA_down': (e) => { 
            state.av = -settings.ship.angularDelta;
         },
        'KeyD_down': () => { 
            state.av = settings.ship.angularDelta;
         },
        'KeyW_down': () => {
            state.thrustersEngaged = true;
            state.tv = settings.ship.thrust / 15.0;
        },
        'KeyS_down': () => { state.t = 0;/*most games you have only forward thrust*/ },
        'KeyA_up': (e) => { 
            let totalMillesecondsForAllPreviousFrames = e.totalFrameDelta / settings.global.averageFrameRate * 1000;//total milleseconds used for all previously run frames at average frames/ms
            let deltaMs = e.delta - totalMillesecondsForAllPreviousFrames;
            state.avr = state.av * (deltaMs / 120.0);
            
            state.av = 0;
        },
        'KeyD_up': (e) => { 
            let totalMillesecondsForAllPreviousFrames = e.totalFrameDelta / 120.0 * 1000;//total milleseconds used for all previously run frames at 120 frames/ms
            let deltaMs = e.delta - totalMillesecondsForAllPreviousFrames;
            state.avr = state.av * (deltaMs / 120.0);
            state.av = 0;
         },
        'KeyW_up': () => {
            state.thrustersEngaged = false;
            state.tv = 0;
            state.t = 0;
        },
        'KeyS_up': () => { state.t = 0; },
        'KeyI_down': () => { console.log('##########', JSON.stringify(state)); },
        'KeyI_down': () => {
            state.trueProGradeHold = true;
            state.trueRetroGradeHold = false;
        },
        'KeyI_up': () => {
            state.trueProGradeHold = state.trueRetroGradeHold = false;
        },
        'KeyK_down': () => {
            state.trueRetroGradeHold = true;
            state.trueProGradeHold = false;
        },
        'KeyK_up': () => {
            state.trueProGradeHold = state.trueRetroGradeHold = false

        },
        'KeyJ_down': () => {
            state.normalHold = true;
            state.antiNormalHold = false;
        },
        'KeyJ_up': () => {
            state.normalHold = false;
            state.antiNormalHold = false;
        },
        'KeyL_down': () => {
            state.antiNormalHold = true;
            state.normalHold = false;
        },
        'KeyL_up': () => {
            state.antiNormalHold = false;
            state.normalHold = false;
        },
        'Space_down': () => {
            state.canonEngaged = true;
        },
        'Space_up': () => {
            state.canonEngaged = false;
            lastCannonFired = null;
        },
        'Comma_down': () => {
            state.proGradeHold = false;
            state.retroGradeHold = true;
        },
        'Comma_up': () => {
            state.proGradeHold = false;
            state.retroGradeHold = false;
        },
        'Period_down': () => {
            state.proGradeHold = true;
            state.retroGradeHold = false;
        },
        'Period_up': () => {
            state.proGradeHold = false;
            state.retroGradeHold = false;
        }
    }
    return {
        state,
        handleKeyEvents: (keyEvents) => {
            for (let i = 0; i < keyEvents.length; i++) {
                let event = keyEvents[i];
                //let cmd = commandMatrix[event.meta()];
                let cmd = commandMatrix[event.metaCode];
                if (cmd) cmd(event);
            }
        },
        render,
        step,
        getRootTemplate,
    }
}

export default ship;