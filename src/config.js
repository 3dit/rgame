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
        angularDelta: 1.9456,
        thrust: .01
    },
    physics: {
      gravMinDistance: 50.0,
      gravMaxForce: .0025,
      gravDistanceCoef: 5.0
    },
    shells: {
      maxShellCnt: 20,
      maxShellAge: 500,
      velocity: 2.2,
    },
    drawLib: () => { console.log('GENERIC DRAWLIB CALLED')},
    
  };
  const libs = {
    getDrawLib: () => settings.drawLib
  }
  
  export { settings, libs };
  