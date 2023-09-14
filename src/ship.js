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

function ship({ id, name, x, y, xv, yv, a, av }) {
    let first = true;
    const state = { ...arguments[0], t: 0, tv: 0, physform: true };

    state.pro_grade_hold = false;
    state.retro_grade_hold = false;
    state.mainThrustEngaged = false;
    state.rcsThrustAngle = 0;
    state.rcsThrustEngaged = false;
    state.normalHold = false;
    state.antiNormalHold = false;

    let dbg = false;

    const compute_avec = () => {
        const xdelta = state.x - settings.star.xpos;
        const ydelta = state.y - settings.star.ypos;
        return (Math.atan2(ydelta, xdelta)) / core.dtor;
    }

    const step = (game) => {
        //if (dbg) debugger;
        state.a += state.av;
        state.t += state.tv;
        if (state.t > settings.ship.thrust) {
            state.t = settings.ship.thrust;
            state.tv = 0;
        }
        state.xv += Math.sin(state.a * core.dtor) * state.t * .5;
        state.yv -= Math.cos(state.a * core.dtor) * state.t * .5;

        if (state.pro_grade_hold || state.retro_grade_hold) {
            const angle = compute_avec();
            const Ax = settings.star.xpos;
            const Ay = settings.star.ypos;
            const Bx = state.x;
            const By = state.y;
            const Cx = state.x + state.xv;
            const Cy = state.y + state.yv;
            const dotProduct = (Bx - Ax) * (Cy - Ay) - (By - Ay) * (Cx - Ax);
            let direction = Math.sign(dotProduct);
            state.rcsThrustAngle = angle;
            if (state.pro_grade_hold) {
                direction *= -1.0;
            }

            state.a = (direction > 0) ? angle : angle + 180.0;

            if (state.rcsThrustEngaged) {
                const avec_thrust = settings.ship.thrust / 5.0 * direction;
                state.avx = Math.sin(angle * core.dtor) * avec_thrust;
                state.avy = -Math.cos(angle * core.dtor) * avec_thrust;
                state.xv += state.avx;
                state.yv += state.avy;
            }

        } else if (state.normalHold || state.antiNormalHold) {
            const deltax = settings.star.xpos - state.x;
            const deltay = settings.star.ypos - state.y;
            const angle_rad = Math.atan2(deltay, deltax);
            state.a = (angle_rad / core.dtor) + (state.antiNormalHold ? -90.0 : 90.0);
            if (state.rcsThrustAngle) {

            }
        }

        state.x += state.xv;
        state.y += state.yv;

    }

    const getRenderRoot = (id) => {
        const RenderRoot = () => {
            //console.log(game.actors);
            //console.log(ship);
            return (
                <g id="shipContainer">
                    <g id="shipGroup">
                        <polygon id={id}
                            points={`0,-${size} ${-size / 2},${size / 2} ${size / 2},${size / 2}`}
                            stroke="white" strokeWidth="2">
                        </polygon>
                    </g>
                    <g id="flameGroup" />
                </g>
            )
        }
        return ReactDOMServer.renderToString(<RenderRoot />);
    }

    const render = (draw) => {
        //shipContainer || initialRender(draw);
        if (!shipContainer) {
            shipContainer = document.getElementById('shipContainer');
            shipGroup = document.getElementById('shipGroup');
            flameGroup = document.getElementById('flameGroup');
        }

        if (!shipGroup) window.stopme = true;

        shipGroup.setAttribute('transform', `translate(${state.x},${state.y}) rotate(${state.a})`);
        const jiggle = () => Math.random() * 5.0 - 2.5;

        //draw.deleteGroup(flameGroup);
        // let nextone = document.getElementById('flameGroup');
        // if(nextone) {
        //     draw.deleteGroup(nextone);
        // }
        //flameGroup = draw.addChildGroup(shipContainer, 'flameGroup');
        draw.clearGroup(flameGroup);
        if ((state.rcsThrustEngaged && (state.pro_grade_hold || state.retro_grade_hold))) {
            const leftThruster = draw.createLine(flameGroup, 0, 0, 0, -size / 2.0, 3, '#d04005');
            leftThruster.setAttribute('transform', `translate(${state.x},${state.y}) rotate(${state.a + 180.0 + jiggle()}) translate(${-size / 2},${-size / 2})`);
            const rightThruster = draw.createLine(flameGroup, 0, 0, 0, -size / 2, 3, '#d04005');
            rightThruster.setAttribute('transform', `translate(${state.x},${state.y}) rotate(${state.a + 180.0 + jiggle()}) translate(${size / 2},${-size / 2})`);
        } else if (state.mainThrustEngaged) {
            const mainThruster = draw.createLine(flameGroup, 0, 0, 0, -state.t * 1500.0, 3, 'orange');
            mainThruster.setAttribute('transform', `translate(${state.x},${state.y}) rotate(${state.a + 180.0 + jiggle()}) translate(0,${-size / 2})`);
        }

        return
    }
    const commandMatrix = {
        'KeyA_down': () => { state.av = -settings.ship.angularDelta; },
        'KeyD_down': () => { state.av = settings.ship.angularDelta; },
        'KeyW_down': () => {
            state.mainThrustEngaged = true;
            state.tv = settings.ship.thrust / 15.0;
        },
        'KeyS_down': () => { state.t = 0;/*most games you have only forward thrust*/ },
        'KeyA_up': () => { state.av = 0; },
        'KeyD_up': () => { state.av = 0; },
        'KeyW_up': () => {
            state.mainThrustEngaged = false;
            state.tv = 0;
            state.t = 0;
        },
        'KeyS_up': () => { state.t = 0; },
        'KeyI_down': () => { console.log('##########', JSON.stringify(state)); },
        'KeyI_down': () => {
            state.pro_grade_hold = true;
            state.retro_grade_hold = false;
        },
        'KeyI_up': () => {
            state.pro_grade_hold = false;
            state.retro_grade_hold = false;
        },
        'KeyK_down': () => {
            state.pro_grade_hold = false;
            state.retro_grade_hold = true;
        },
        'KeyK_up': () => {
            state.pro_grade_hold = false;
            state.retro_grade_hold = false;
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
            state.rcsThrustEngaged = true;
        },
        'Space_up': () => {
            state.rcsThrustEngaged = false;
        }
    }
    return {
        state: state,
        handleKeyEvents: (keyEvents) => {
            for (let i = 0; i < keyEvents.length; i++) {
                let cmd = commandMatrix[keyEvents[i].meta()];
                if (cmd) cmd();
            }
        },
        render: render,
        step: step,
        getRenderRoot: getRenderRoot
    }
}

export default ship;