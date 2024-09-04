import { NEUTRAL_MINDSET_COLOUR } from '@/lib/definitions';

export const recolorSVG = (
    svgElement: SVGElement, 
    targetColor: string, 
    oldColor?: string 
) => {
    const svgElements = svgElement.querySelectorAll('*') as NodeListOf<SVGElement>; 

    svgElements.forEach((element) => {
    if (oldColor && element.style.fill === oldColor) {
        element.style.fill = targetColor;
    } else if (!oldColor) {
        element.style.fill = targetColor;
    }
    
    // You could add similar logic for stroke color:
    // if (oldColor && element.style.stroke === oldColor) { ... } 
    });

    return svgElement;
}

export const recolorSVGRef = (
    svgRef: React.RefObject<SVGElement>,
    targetColor: string, 
    oldColor?: string 
) => {
    const svgElement = svgRef.current;

    if ( svgElement ) {
        const svgElements = svgElement.querySelectorAll('*') as NodeListOf<SVGElement>; 
    
        svgElements.forEach((element) => {
            if (oldColor && element.style.fill === oldColor) {
                element.style.fill = targetColor;
            } else if (!oldColor) {
                element.style.fill = targetColor;
            }
        });
    }
}



export const colourLuminance = (hex: string, lum: number) => {

	// validate hex string
	hex = String(hex).replace(/[^0-9a-f]/gi, '');
	if (hex.length < 6) {
		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	}
	lum = lum || 0;

	// convert to decimal and change luminosity
	var rgb = "#", c, i;
	for (i = 0; i < 3; i++) {
		c = parseInt(hex.substring(i*2, i*2 + 2), 16);
		c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
		rgb += ("00"+c).substring(c.length);
	}

	return rgb;
}

export const adjustLightness = (hexCode: string, tone: number) => {
    // Remove the "#" symbol from the hex code
    let color = typeof hexCode === 'string' ? hexCode.replace('#', '') : NEUTRAL_MINDSET_COLOUR;
  
    // Convert each of the RGB components from hex to integer (0-255)
    let r = parseInt(color.substring(0, 2), 16);
    let g = parseInt(color.substring(2, 4), 16);
    let b = parseInt(color.substring(4), 16);
  
    // Convert the adjusted RGB components back to hex format (0-F)
    let adjustedHex = '#';
    [r, g, b].forEach(c => {
        // Adjust each RGB component based on tone
        let adjC = Math.round(Math.max(0, Math.min(255, c + (255 - c) * tone)));
        adjustedHex += adjC.toString(16).padStart(2, '0');
    })
    return adjustedHex;
  }

/**
 *      x + y * 1 = 255 => 
 *      x + y * z = (0 , 255) => y = (255 - x) / z
 *      x + y * -1 = 0
 */