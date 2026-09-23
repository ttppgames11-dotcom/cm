const fs = require('fs');

let content = fs.readFileSync('src/pages/home/HomePage.jsx', 'utf8');
const isCRLF = content.includes('\r\n');
let normalized = content.replace(/\r\n/g, '\n');

const target = `        <Link to={activeHero.link} className="btn btn-primary" id="heroCardLink" style={{ marginTop: '8px', fontSize: '.8rem' }}>
          सविस्तर चरित्र वाचा →
        </Link>
      </div>
    </div>
  </div>
</section>`;

const replacement = `        <Link to={activeHero.link} className="btn btn-primary" id="heroCardLink" style={{ marginTop: '8px', fontSize: '.8rem' }}>
          सविस्तर चरित्र वाचा →
        </Link>
      </div>
    </div>
  </div>

  {/* Active Slide Badge & Controller Navigation */}
  <div 
    style={{
      position: 'absolute',
      bottom: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 3,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      background: 'rgba(20,5,5,0.78)',
      backdropFilter: 'blur(8px)',
      padding: '7px 18px',
      borderRadius: '30px',
      border: '1px solid rgba(255,204,128,0.4)',
      color: '#FFFFFF',
      fontSize: '0.80rem',
      boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      whiteSpace: 'nowrap'
    }}>
    <button 
      type="button" 
      onClick={() => setBgIndex((prev) => (prev - 1 + heroBgSlides.length) % heroBgSlides.length)}
      style={{ background: 'none', border: 'none', color: '#FFE082', cursor: 'pointer', fontSize: '1rem', fontWeight: '800', padding: '0 4px' }}
      title="मागील पार्श्वभूमी छायाचित्र">
      ◀
    </button>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span style={{ color: '#FFE082', fontWeight: '800' }}>📷 {heroBgSlides[bgIndex].title}</span>
      <span style={{ opacity: 0.6 }}>•</span>
      <span style={{ opacity: 0.9 }}>{bgIndex + 1}/{heroBgSlides.length}</span>
    </div>
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      {heroBgSlides.map((_, i) => (
        <span
          key={i}
          onClick={() => setBgIndex(i)}
          style={{
            width: i === bgIndex ? '16px' : '6px',
            height: '6px',
            borderRadius: '4px',
            background: i === bgIndex ? '#FF5500' : 'rgba(255,255,255,0.4)',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          title={heroBgSlides[i].title}
        />
      ))}
    </div>
    <button 
      type="button" 
      onClick={() => setBgIndex((prev) => (prev + 1) % heroBgSlides.length)}
      style={{ background: 'none', border: 'none', color: '#FFE082', cursor: 'pointer', fontSize: '1rem', fontWeight: '800', padding: '0 4px' }}
      title="पुढील पार्श्वभूमी छायाचित्र">
      ▶
    </button>
  </div>
</section>`;

if (normalized.includes(target)) {
  normalized = normalized.replace(target, replacement);
  const finalContent = isCRLF ? normalized.replace(/\n/g, '\r\n') : normalized;
  fs.writeFileSync('src/pages/home/HomePage.jsx', finalContent, 'utf8');
  console.log('SUCCESS: Inserted slide indicator & navigation controller in hero section!');
} else {
  console.log('Target not found for hero controller');
}
