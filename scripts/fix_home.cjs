const fs = require('fs');

let code = fs.readFileSync('src/pages/home/HomePage.jsx', 'utf8');

// 1. Fix all url('assets/ to url('/assets/
code = code.replace(/url\('assets\//g, "url('/assets/");
code = code.replace(/url\("assets\//g, 'url("/assets/');

// 2. Add failsafe inline styles to war-cry-strip
code = code.replace(
  /<div className="war-cry-strip">/,
  '<div className="war-cry-strip" style={{"position":"relative","overflow":"hidden","height":"96px","minHeight":"96px","maxHeight":"96px","display":"flex","justifyContent":"center","alignItems":"center","background":"linear-gradient(90deg,#F4511E,#E65100)","color":"#FFFFFF"}}>'
);

// 3. Add failsafe inline styles to war-cry-video
code = code.replace(
  /<video className="war-cry-video"/,
  '<video className="war-cry-video" style={{"position":"absolute","inset":0,"width":"100%","height":"100%","objectFit":"cover","zIndex":0,"filter":"saturate(1.25) brightness(.92)"}}'
);

// 4. Add failsafe inline styles to war-cry-overlay
code = code.replace(
  /<div className="war-cry-overlay"><\/div>/,
  '<div className="war-cry-overlay" style={{"position":"absolute","inset":0,"zIndex":1,"background":"linear-gradient(90deg,rgba(199,56,0,.88) 0%,rgba(230,81,0,.58) 50%,rgba(199,56,0,.88) 100%)"}}></div>'
);

// 5. Add failsafe inline styles to living-flag-card
code = code.replace(
  /<div className="living-flag-card" data-reveal="zoom">/,
  '<div className="living-flag-card" data-reveal="zoom" style={{"position":"relative","borderRadius":"24px","overflow":"hidden","minHeight":"380px","display":"flex","alignItems":"center","border":"2px solid #FFFFFF","boxShadow":"0 12px 32px rgba(244,81,30,.2)"}}>'
);

// 6. Add failsafe inline styles to living-flag-video
code = code.replace(
  /<video className="living-flag-video"/,
  '<video className="living-flag-video" style={{"position":"absolute","inset":0,"width":"100%","height":"100%","objectFit":"cover","zIndex":0}}'
);

fs.writeFileSync('src/pages/home/HomePage.jsx', code);
console.log('Fixed all image paths and inline failsafes in HomePage.jsx');
