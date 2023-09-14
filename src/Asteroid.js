import { settings } from "./config";
import { core } from "./core";


const size = 20.0;


function asteroid({ id, name, x, y, xv, yv, a, av }) {
    const state = { ...arguments[0], t: 0, tv: 0, physform: true };
    let asteroidContainer = null;
    let points = [];
    let pntCnt = parseInt(Math.random()) * 6.0 + 7.0;
    let wedgeArcSize = Math.PI * 2.0 / pntCnt;
    console.log('WAS', wedgeArcSize);

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
            console.log(vt[1].l);
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

    vticks = smooth(vticks, 5);
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
    }

    //called by game engine to allow this actor to influence other actors before physics 'step' to next frame
    const effectOther = (actor) => {
        if(true || actor.state.name === "ship") {
           let gvec = core.gravityVector( { x: state.x, y: state.y}, { x:actor.state.x, y:actor.state.y }, settings.planet.grav);
           actor.state.xv += gvec.x;
           actor.state.yv += gvec.y;
        }
    }

    const getRenderRoot = () => {
        const RenderRoot = () => {
            <g id="asteroidContainer">
                <polygon points={points} stroke="white" strokeWidth="2" fill="black"/>
            </g>
        }
    }

    const render = ( {svgRoot, addChildGroup, createPolygon}) => {
        if (!asteroidContainer) {
            asteroidContainer = addChildGroup(svgRoot, 'asteroidContainer');
            let asteroid = createPolygon(asteroidContainer, 'a1', points, 2, 'white', 'black');
        }
        asteroidContainer.setAttribute('transform', `translate(${state.x},${state.y}) rotate(${state.a})`);
    }
    return {
        state: state,
        handleKeyEvents: (keyEvents) => {
        },
        render: render,
        step: step,
        effectOther: effectOther,
        getRenderRoot: getRenderRoot
    }
}

export default asteroid;