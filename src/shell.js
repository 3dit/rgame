import { settings } from "./config";
import { core } from "./core";
import ReactDOMServer from 'react-dom/server';

function shell({ id, name, x, y, xv, yv }) {
    const state = { ...arguments[0], t: 0, physform: true };
    state.enabled = false;
    //state.noWrap = true;
    state.anyIntersection = false;

    console.log(state);
    state.enabled = false;
    let age = 0;
    state.age = 0;

    const maxAge = 500;

    let starContainer = null;

    const effectOther = (effected) => {
        if (!state.enabled) return;

        //really the asteroid should be in charge of this, no?
        if (effected?.state?.type === 'asteroid') {
            if (window.cnt_limit === undefined || true) {
                window.cnt_limit = 100;
                //window.onetime = true;
                //console.log('changing to true');
                //console.log(effected);
                //console.log('POINTS', effected.type);
                //console.log('ast', effected);
                let asteroidVerticies = effected.state.points;
                if (asteroidVerticies) {

                    function isPointInsidePolygon(point, polygon) {
                        const x = point.x;
                        const y = point.y;

                        let isInside = false;

                        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
                            const xi = polygon[i].x + effected.state.x;
                            const yi = polygon[i].y + effected.state.y;
                            const xj = polygon[j].x + effected.state.x;
                            const yj = polygon[j].y + effected.state.y;

                            const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

                            if (intersect) {
                                isInside = !isInside;
                            }
                        }

                        return isInside;
                    }
                    let deltaF = Math.sqrt(Math.pow(state.xv, 2) + Math.pow(state.yv, 2)) * 2.0;
                    let delta = parseInt(deltaF);
                    delta = delta < 1 ? 1 : deltaF;
                    let points = [];
                    let s = '';
                    for (let i = 0; i < delta; i++) {
                        let newPoint = ({
                            x: state.x + state.xv * (parseFloat(i) / parseFloat(delta)),
                            y: state.y + (state.yv * parseFloat(i) / parseFloat(delta))
                        });
                        //console.log(i, newPoint, delta);
                        points.push(newPoint);

                    }
                    let pointIntersectionFound = false;
                    let contactPoint = null;
                    for (let j = 0; j < points.length; j++) {
                        let intersection = isPointInsidePolygon(points[j], asteroidVerticies);
                        if (intersection) {
                            pointIntersectionFound = true;
                            contactPoint = points[j];
                            break;
                        }
                    }

                    let results = pointIntersectionFound;

                    if (pointIntersectionFound && contactPoint) {
                        effected.shellStrike(contactPoint, { x: state.xv, y: state.yv });
                        state.enabled = false;
                    }

                    // let results = isPointInsidePolygon({ x: state.x, y: state.y }, { x: state.x + state.xv, y: state.y + state.yv }, points);
                    // if (results) state.anyIntersection = true;

                    //document.getElementById('textlog').textContent = `${state.id} ${results}`;

                }
            }

        }
    }

    const step = (game) => {
        //star grav effects
        state.x += state.xv;
        state.y += state.yv;
        state.age++;
        if (state.age > settings.shells.maxShellAge) {
            state.age = 0;
            state.enabled = false;
        }
    }

    const getRootTemplate = (index) => {
        const RenderRoot = () => {
            return (
                <g id={`shell${index}`} style={{ 'display': 'none' }}>
                    <circle
                        cx={0}
                        cy={0}
                        r="1.5" fill="white">
                    </circle>
                </g>
            )
        }
        return ReactDOMServer.renderToString(<RenderRoot />);
    }

    const render = (draw) => {

        if (window.breakme) debugger;

        let shellElement = document.getElementById(`shell${state.index + 1}`);

        if (state.enabled) {
            shellElement?.setAttribute('style', 'display:block');
            shellElement.setAttribute('transform', `translate(${state.x},${state.y})`);
        } else {
            shellElement?.setAttribute('style', 'display:none');
        }


        // for (let i = 0; i < rayCnt; i++) {
        //     let a = Math.random() / draw.dtor;
        //     let corona = Math.random() * size / 8;
        //     let red = (parseInt(Math.random() * 40 + 200)).toString(16);
        //     let green = (parseInt(Math.random() * 40)).toString(16);
        //     let blue = (parseInt(Math.random() * 20)).toString(16);
        //     let color = `#${red}${green}${blue}`;
        //     color = '#fff';
        //     const newLine = draw.createLine(starContainer, 0, 0, Math.sin(a) * (size + corona), Math.cos(a) * (size + corona), 3, color);
        //     newLine.setAttribute('transform',`translate(${settings.star.xpos},${settings.star.ypos})`);
        // }
    }
    return {
        state,
        handleKeyEvents: (keyEvents) => { },
        render,
        step,
        getRootTemplate,
        effectOther
    }
}

export default shell;