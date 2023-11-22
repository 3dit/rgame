const width = window.innerWidth ;
const height = window.innerHeight - 60;
const settings = { 
    display: {
      width: width,
      height: height,
    },
    asteroids: {
      initialSize: 60,
      minimumSize: 10
    },
    star: {
        xpos: width/2,
        ypos: height/2,
        grav: 1000,
        size: 5,
        rays: 20
    },
    planet: {
      grav: 250
    },
    ship: {
        angularAcceleration: .3,
        angularDelta: 2.3,
        thrust: .015,
        thrustPlumeRatio: .75
    },
    physics: {
      gravMinDistance: 50.0,
      gravMaxForce: .0025,
      gravDistanceCoef: 5.0
    },
    shells: {
      maxShellCnt: 20,
      maxShellAge: 500,
      velocity: 2.9,
    },
    drawLib: () => { console.log('GENERIC DRAWLIB CALLED')},
    global: {
      averageFrameRate: 120.0
    }
  };
  const libs = {
    getDrawLib: () => settings.drawLib
  }
  
  export { settings, libs };
  