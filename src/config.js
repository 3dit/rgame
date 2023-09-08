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
        grav: .001,
        size: 5,
        rays: 20
    },
    ship: {
        angularDelta: 1.9456,
        thrust: .01
    },
    drawLib: () => { console.log('GENERIC DRAWLIB CALLED')},
    
  };
  const libs = {
    getDrawLib: () => settings.drawLib
  }
  
  export { settings, libs };
  