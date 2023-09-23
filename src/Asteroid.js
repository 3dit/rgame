import { settings } from "./config";
import { core } from "./core";


function asteroid({ id, name, x, y, xv, yv, a, av, size }, handleSplitAsteroid) {
    const state = { ...arguments[0], t: 0, tv: 0, physform: true };
    let asteroidContainer = null;
    let points = [];
    let pntCnt = parseInt(Math.random()) * 8.0 + 5.0;
    let wedgeArcSize = Math.PI * 2.0 / pntCnt;
    //console.log('WAS', wedgeArcSize);
    state.type = 'asteroid';
    state.enabled = true;
    state.zeroGravity = true;

    let vticks = [];
    for (let i = 0; i < pntCnt; i++) {
        let da = i * wedgeArcSize * .5;
        let rval = Math.random() - 0.5;
        let wp = da + wedgeArcSize * rval;
        let elev = size / 2.0 + Math.random() * size * 0.5;
        vticks.push({ a: (da + wp), l: elev })
        //let wao = Math.random() * wedgeArcSize;
        //let sp_x = Math.sin(da + wp) * elev;
        //let sp_y = Math.cos(da + wp) * elev;
        //points.push({x:parseInt(sp_x), y:parseInt(sp_y)});
    }

    const smooth = (vt, cnt) => {
        while (cnt-- > 0) {
            //console.log(vt[1].l);
            let nextIteration = [];
            vt.forEach((o, i, a) => {
                let prevLevel = i === 0 ? (a[a.length - 1].l) : a[i - 1].l;
                let nextLevel = i === (a.length - 1) ? a[0].l : a[i + 1].l;
                let averagedLevel = (o.l + prevLevel + nextLevel) / 3.0;
                nextIteration.push({ a: a[i].a, l: averagedLevel });
            });
            vt = nextIteration;
        }
        return vt;
    }

    vticks = smooth(vticks, 1);
    vticks.forEach((o) => {
        points.push({ x: parseInt(Math.sin(o.a) * o.l), y: parseInt(Math.cos(o.a) * o.l) });
    })

    // for(let i=0;i<points.length;i++) {
    //     points[i].x += 100;
    //     points[i].y += 100;
    // }
    // console.log('POINTS', points);

    const step = (game) => {

        state.a += state.av;
        state.t += state.tv;
        if (state.t > settings.ship.thrust) {
            state.t = settings.ship.thrust;
            state.tv = 0;
        }
        state.xv += Math.sin(state.a * core.dtor) * state.t;
        state.yv -= Math.cos(state.a * core.dtor) * state.t;
        state.x += state.xv;
        state.y += state.yv;

        state.points = points;
    }

    //called by game engine to allow this actor to influence other actors before physics 'step' to next frame
    const effectOther = (actor) => {
        if (true || actor.state.name === "ship") {
            if (!state.zeroGravity) {
                let gvec = core.gravityVector({ x: state.x, y: state.y }, { x: actor.state.x, y: actor.state.y }, settings.planet.grav);
                actor.state.xv += gvec.x * 0.2;
                actor.state.yv += gvec.y * 0.2;
            }
        }
    }

    const getRenderRoot = (id) => {
        console.log('get render root ', id);
        const RenderRoot = (id) => {
            let rid = `asteroidContainer${id}`;
            console.log('get render root ', rid);
            return (
                <g id={`asteroidContainer${rid}`}>
                    <polygon points={points} stroke="white" strokeWidth="2" fill="black" />
                </g>
            )
        }
    }

    const shellStrike = (point, velocity) => {
        console.log(`SHELL STRIKE id: ${state.id} point: (${point.x}, ${point.y})  & (${velocity.x}, ${velocity.y})`);
        state.enabled = false;
        state.markForDelete = true;
        handleSplitAsteroid(state, point, velocity);
    }

    const render = ({ svgRoot, addChildGroup, createPolygon }) => {
        if (!asteroidContainer) {
            asteroidContainer = addChildGroup(svgRoot, `asteroidContainer${state.id}`);
            let asteroid = createPolygon(asteroidContainer, 'a1', points, 2, 'white', 'black');
        }
        asteroidContainer.setAttribute('transform', `translate(${state.x},${state.y}) rotate(${state.a})`);
    }

    const removeSelf = () => {
        const removeId = `asteroidContainer${state.id}`;
        console.log('REMOVE ', removeId);
        const removeElement = document.getElementById(removeId);
        removeElement.remove();
    }

    return {
        state: state,
        handleKeyEvents: (keyEvents) => {
        },
        render: render,
        step: step,
        effectOther: effectOther,
        getRenderRoot: getRenderRoot,
        shellStrike,
        removeSelf
    }
}

export default asteroid;