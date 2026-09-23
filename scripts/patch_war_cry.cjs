const fs = require('fs');

let content = fs.readFileSync('src/pages/home/HomePage.jsx', 'utf8');

const target1 = '<div className="war-cry-strip" style={{"position":"relative","overflow":"hidden","height":"96px","minHeight":"96px","maxHeight":"96px","display":"flex","justifyContent":"center","alignItems":"center","background":"linear-gradient(90deg,#F4511E,#E65100)","color":"#FFFFFF"}}>';
const repl1 = '<div className="war-cry-strip" style={{"position":"relative","overflow":"hidden","minHeight":"76px","display":"flex","justifyContent":"center","alignItems":"center","background":"linear-gradient(90deg,#F4511E,#E65100)","color":"#FFFFFF"}}>';

const target2 = '<video className="war-cry-video" style={{"position":"absolute","inset":0,"width":"100%","height":"100%","objectFit":"cover","zIndex":0,"filter":"saturate(1.25) brightness(.92)"}}';
const repl2 = '<video className="war-cry-video" style={{"position":"absolute","top":0,"left":0,"width":"100%","height":"100%","objectFit":"cover","zIndex":0,"pointerEvents":"none","filter":"saturate(1.25) brightness(.92)"}}';

if (content.includes(target1)) {
  content = content.replace(target1, repl1);
  console.log('Replaced target 1');
} else {
  console.log('Target 1 not found');
}

if (content.includes(target2)) {
  content = content.replace(target2, repl2);
  console.log('Replaced target 2');
} else {
  console.log('Target 2 not found');
}

fs.writeFileSync('src/pages/home/HomePage.jsx', content, 'utf8');
console.log('Done.');
