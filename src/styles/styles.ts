import {hex2rgb} from "../util/ColorConverters";

export let colors : any = {
  darkBackground: {hex:'#4f6b84'},
  csBlue: {hex:'#003E52'},
  csOrange: {hex:'#ff8400'},
  menuBackground: {hex:'#00263e'},
  menuBackgroundDarker: {hex:'#00172d'},
  menuText: {hex:'#fff'},
  menuTextSelected: {hex:'#2daeff'},
  white: {hex:'#fff'},
  black: {hex:'#000'},
  gray: {hex:'#ccc'},
  notConnected: {hex:'#64897f'},
  darkGray: {hex:'#555'},
  darkGray2: {hex:'#888'},
  lightGray2: {hex:'#dedede'},
  lightGray: {hex:'#eee'},
  purple: {hex:'#8a01ff'},
  darkPurple: {hex:'#5801a9'},
  blue: {hex:'#0075c9'},
  blue2: {hex:'#2698e9'},
  green: {hex:'#a0eb58'},
  darkGreen: {hex:'#1f4c43'},
  green2: {hex:'#4cd864'},
  orange: {hex:'#ff953a'},
  red: {hex:'#ff3c00'},
  darkRed: {hex:'#cc0900'},
  menuRed: {hex:'#e00'},
  iosBlue: {hex:'#007aff'},
  lightBlue: {hex:'#a9d0f1'},
  lightBlue2: {hex:'#77c2f7'},
  blinkColor1: {hex:'#2daeff'},
  blinkColor2: {hex:'#a5dcff'},
};

for (let color in colors) {
  if (colors.hasOwnProperty(color)) {
    colors[color].rgb = hex2rgb(colors[color].hex);
    colors[color].rgba = (opacity) => { opacity = Math.min(1,opacity); return 'rgba(' + colors[color].rgb.r + ',' + colors[color].rgb.g + ',' + colors[color].rgb.b + ',' + opacity + ')'};
    // colors[color].hsv = rgb2hsv(colors[color].rgb.r,colors[color].rgb.g,colors[color].rgb.b);
    // colors[color].hsl = rgb2hsl(colors[color].rgb.r,colors[color].rgb.g,colors[color].rgb.b);
    // colors[color].hcl = rgb2hcl(colors[color].rgb.r,colors[color].rgb.g,colors[color].rgb.b);
  }
}
export const styles = {
  menuItem: {
    margin:0,
    fontSize:13
  }
};