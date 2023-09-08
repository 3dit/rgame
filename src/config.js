const width = window.innerWidth ;
const height = window.innerWidth * (10.0/16.0);
const settings = { 
    display: {
      width: width,
      height: height,
      ratio: () => {
        console.log(this);
        return (
          parseFloat(settings.display.width) / parseFloat(settings.display.height)
        );
      }
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
        angularDelta: 1.9456,
        thrust: .01
    },
    physics: {
      gravMinDistance: 50.0,
      gravMaxForce: .0025,
      gravDistanceCoef: 5.0
    },
    drawLib: () => { console.log('GENERIC DRAWLIB CALLED')},
    
  };
  const libs = {
    getDrawLib: () => settings.drawLib
  }
  
  export { settings, libs };
  