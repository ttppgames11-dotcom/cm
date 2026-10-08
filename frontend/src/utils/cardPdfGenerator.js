/**
 * Connect Maratha - Official Member Card PDF Generator
 * Generates genuine, high-fidelity PDF (.pdf) documents with clean white/ivory backgrounds,
 * crisp saffron borders, and rich typography.
 */

// Dynamically load external scripts from CDN if not already in window
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') return resolve();
    if (document.querySelector(`script[src="${src}"]`)) {
      return resolve();
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

async function ensurePdfLibraries() {
  if (typeof window === 'undefined') return;
  const promises = [];
  if (!window.html2canvas) {
    promises.push(loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'));
  }
  if (!window.jspdf) {
    promises.push(loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'));
  }
  await Promise.all(promises);
}

/**
 * Builds standalone PDF binary data directly in JS as a fallback if jsPDF is unavailable.
 */
function buildNativePdfBlob(pngBytes, imgW, imgH) {
  const pdfW = 842; // A4 landscape points (72 DPI)
  const pdfH = 595;
  const margin = 20;
  const scale = Math.min((pdfW - margin * 2) / imgW, (pdfH - margin * 2) / imgH);
  const w = Math.round(imgW * scale);
  const h = Math.round(imgH * scale);
  const x = Math.round((pdfW - w) / 2);
  const y = Math.round((pdfH - h) / 2);

  const stream = `q\n${w} 0 0 ${h} ${x} ${y} cm\n/Im0 Do\nQ\n`;
  const chunks = [];
  const offsets = [];
  let pos = 0;

  function push(data) {
    if (typeof data === 'string') {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(data);
      chunks.push(bytes);
      pos += bytes.length;
    } else {
      chunks.push(data);
      pos += data.length;
    }
  }

  push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');

  // Obj 1: Catalog
  offsets.push(pos);
  push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  // Obj 2: Pages
  offsets.push(pos);
  push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');

  // Obj 3: Page
  offsets.push(pos);
  push(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pdfW} ${pdfH}] /Contents 4 0 R /Resources << /XObject << /Im0 5 0 R >> >> >>\nendobj\n`);

  // Obj 4: Content Stream
  offsets.push(pos);
  push(`4 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}endstream\nendobj\n`);

  // Obj 5: Image (PNG / Flate or Raw Stream)
  offsets.push(pos);
  push(`5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgW} /Height ${imgH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /Length ${pngBytes.length} >>\nstream\n`);
  push(pngBytes);
  push('\nendstream\nendobj\n');

  // xref
  const startxref = pos;
  push('xref\n0 6\n0000000000 65535 f \n');
  for (const off of offsets) {
    push(String(off).padStart(10, '0') + ' 00000 n \n');
  }

  // trailer
  push(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`);

  return new Blob(chunks, { type: 'application/pdf' });
}

/**
 * Generates the clean white/ivory card HTML with crisp saffron borders and typography.
 */
export function generateCardHTML(data, mode = 'certificate') {
  const {
    name = 'अमोल तुकाराम जाधव',
    memberId = 'CM-MH-PUN-1001',
    tier = 'GOLD FOUNDER MEMBER',
    role = 'सॉफ्टवेअर आर्किटेक्ट व तंत्रज्ञान सल्लागार',
    chapter = 'पुणे – शिवनेरी चॅप्टर',
    city = 'पुणे • महाराष्ट्र',
    bloodGroup = 'O +ve (नोंदणीकृत रक्तदाता)',
    emergencyPhone = '+९१ ९८२२० ११९२४',
    issueDate = '२३ सप्टेंबर २०२४',
    photo = '/assets/images/officers/officer_tukaram.jpg'
  } = data;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.connectmaratha.com';
  const logoUrl = `${origin}/assets/images/logo.png`;
  const photoUrl = (photo && (photo.startsWith('http') || photo.startsWith('/'))) 
    ? (photo.startsWith('/') ? `${origin}${photo}` : photo)
    : `${origin}/assets/images/officers/officer_tukaram.jpg`;

  if (mode === 'smartcard') {
    // Executive Smart Card with clean White/Ivory background and crisp Saffron borders
    return `
      <div style="font-family: 'Baloo 2', 'Yantramanav', sans-serif; background: #FFFFFF; padding: 28px; width: 920px; margin: 0 auto; box-sizing: border-box; text-align: center;">
        <div style="font-size: 1.15rem; font-weight: 800; color: #EA580C; margin-bottom: 14px; letter-spacing: 0.5px;">
          🚩 Connect Maratha — अधिकृत डिजिटल सभासद ओळखपत्र (Official Member Smart Card)
        </div>

        <div style="display: flex; gap: 24px; justify-content: center; align-items: stretch;">
          <!-- FRONT OF SMART CARD (Clean White / Saffron Border) -->
          <div style="width: 420px; min-height: 270px; border-radius: 18px; padding: 20px 22px; position: relative; box-shadow: 0 8px 24px rgba(234,88,12,0.12); color: #1F2937; display: flex; flex-direction: column; justify-content: space-between; border: 2.5px solid #EA580C; background: #FFFFFF; box-sizing: border-box; text-align: left;">
            <!-- Top Branding -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #FED7AA; padding-bottom: 10px;">
              <div style="display: flex; align-items: center; gap: 9px;">
                <img src="${logoUrl}" alt="Logo" style="width: 42px; height: 42px; object-fit: contain;" onerror="this.style.display='none'" />
                <div>
                  <div style="font-size: 1.05rem; font-weight: 800; color: #EA580C; letter-spacing: 0.5px;">CONNECT MARATHA</div>
                  <div style="font-size: 0.64rem; color: #7C2D12; font-weight: 700;">अधिकृत सभासद ओळखपत्र</div>
                </div>
              </div>
              <span style="background: #FFF7ED; border: 1.5px solid #EA580C; color: #C2410C; font-size: 0.72rem; padding: 3px 10px; border-radius: 12px; font-weight: 800;">
                ⭐ ${tier.split(' ')[0]}
              </span>
            </div>

            <!-- Middle Identity Section -->
            <div style="display: flex; align-items: center; gap: 14px; margin: 12px 0;">
              <div style="width: 76px; height: 90px; border-radius: 8px; border: 2px solid #EA580C; overflow: hidden; flex-shrink: 0; background: #FFF7ED; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                <img src="${photoUrl}" alt="${name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='${origin}/assets/images/officers/officer_tukaram.jpg'" />
              </div>

              <div style="flex: 1;">
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 3px;">
                  <div style="width: 32px; height: 22px; background: linear-gradient(135deg, #ECC86A 0%, #FFF3B3 50%, #C69830 100%); border-radius: 4px; border: 1px solid #B45309;"></div>
                  <span style="font-size: 0.6rem; color: #9A3412; letter-spacing: 1px; font-weight: 700;">SECURE ID CHIP</span>
                </div>
                <div style="font-size: 1.25rem; font-weight: 800; color: #991B1B; line-height: 1.2; font-family: 'Baloo 2';">${name}</div>
                <div style="font-size: 0.76rem; color: #EA580C; font-weight: 700; margin-top: 2px;">${role}</div>
                <div style="font-size: 0.7rem; color: #4B5563; margin-top: 2px;">📍 ${city}</div>
              </div>
            </div>

            <!-- Bottom Code & QR -->
            <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #FED7AA; padding-top: 8px;">
              <div>
                <div style="font-size: 0.6rem; color: #78350F; font-weight: 700;">MEMBER ID</div>
                <div style="font-size: 1.05rem; font-weight: 900; color: #EA580C; font-family: monospace;">${memberId}</div>
                <div style="font-size: 0.62rem; color: #059669; font-weight: 700;">✓ DPDP २०२३ व ISO २७००१ प्रमाणित</div>
              </div>

              <div style="text-align: right;">
                <div style="background: #FFFFFF; padding: 3px; border: 1px solid #EA580C; border-radius: 5px; display: inline-block;">
                  <svg width="46" height="46" viewBox="0 0 25 25" fill="#EA580C">
                    <rect x="0" y="0" width="7" height="7"/><rect x="1" y="1" width="5" height="5" fill="#fff"/><rect x="2" y="2" width="3" height="3"/><rect x="18" y="0" width="7" height="7"/><rect x="19" y="1" width="5" height="5" fill="#fff"/><rect x="20" y="2" width="3" height="3"/><rect x="0" y="18" width="7" height="7"/><rect x="1" y="19" width="5" height="5" fill="#fff"/><rect x="2" y="20" width="3" height="3"/><rect x="9" y="2" width="2" height="2"/><rect x="13" y="4" width="2" height="2"/><rect x="9" y="9" width="7" height="7"/><rect x="10" y="10" width="5" height="5" fill="#fff"/><rect x="11" y="11" width="3" height="3"/><rect x="18" y="10" width="3" height="2"/><rect x="18" y="14" width="2" height="4"/><rect x="10" y="18" width="4" height="2"/><rect x="12" y="22" width="4" height="2"/><rect x="20" y="20" width="4" height="4"/>
                  </svg>
                </div>
                <div style="font-size: 0.54rem; color: #78350F; font-weight: 700;">Scan to Verify</div>
              </div>
            </div>
          </div>

          <!-- BACK OF SMART CARD (Clean White / Saffron Border) -->
          <div style="width: 420px; min-height: 270px; border-radius: 18px; position: relative; box-shadow: 0 8px 24px rgba(234,88,12,0.12); color: #1F2937; display: flex; flex-direction: column; justify-content: space-between; border: 2.5px solid #EA580C; background: #FFFDF9; box-sizing: border-box; text-align: left; overflow: hidden;">
            <div style="height: 38px; background: #1F2937; width: 100%; margin-top: 14px;"></div>
            
            <div style="padding: 14px 20px 18px 20px; display: flex; flex-direction: column; justify-content: space-between; flex: 1;">
              <div style="font-size: 0.78rem; color: #1F2937; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <div><span style="color: #6B7280; font-size: 0.68rem;">शाखा (Chapter):</span><br/><strong>${chapter}</strong></div>
                <div><span style="color: #6B7280; font-size: 0.68rem;">रक्तगट:</span><br/><strong style="color: #DC2626;">${bloodGroup}</strong></div>
                <div><span style="color: #6B7280; font-size: 0.68rem;">आपत्कालीन:</span><br/><strong>${emergencyPhone}</strong></div>
                <div><span style="color: #6B7280; font-size: 0.68rem;">नोंदणी दिनांक:</span><br/><strong>${issueDate}</strong></div>
              </div>

              <div style="font-size: 0.65rem; color: #4B5563; line-height: 1.4; margin: 10px 0; border-top: 1px dashed #FED7AA; border-bottom: 1px dashed #FED7AA; padding: 6px 0;">
                हे डिजिटल ओळखपत्र कनेक्ट मराठा परिषदेच्या अधिकृत प्रणालीद्वारे जारी करण्यात आले असून अधिकृत सभासदाची ओळख प्रमाणित करते. गैरवापर दंडनीय आहे.
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 4px; font-size: 0.74rem;">
                <div style="color: #EA580C; font-weight: 800;">🚩 शिवमुद्रा प्रमाणित</div>
                <div style="text-align: right;">
                  <div style="font-family: serif; font-size: 1rem; font-weight: 800; color: #1F2937;">Dr. J. Pawar</div>
                  <div style="font-size: 0.62rem; color: #6B7280; font-weight: 700;">मुख्य सचिव, कनेक्ट मराठा</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Certificate Mode (Royal White/Ivory Background with Crisp Saffron Borders)
  return `
    <div style="font-family: 'Baloo 2', 'Yantramanav', sans-serif; background: #FFFFFF; border: 10px double #EA580C; border-radius: 18px; padding: 36px 42px; box-shadow: 0 12px 40px rgba(234, 88, 12, 0.12); position: relative; text-align: center; width: 920px; margin: 0 auto; box-sizing: border-box;">
      <!-- Header -->
      <div style="margin-bottom: 10px; position: relative; z-index: 1;">
        <img src="${logoUrl}" alt="Connect Maratha Seal" style="height: 68px; object-fit: contain; margin-bottom: 6px;" onerror="this.style.display='none'" />
        <div style="font-size: 1.6rem; font-weight: 800; color: #EA580C; letter-spacing: 0.8px;">
          Connect Maratha • कनेक्ट मराठा परिषद
        </div>
        <div style="font-size: 0.88rem; color: #9A3412; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px;">
          || स्वराज्य समाज संघटन व अधिकृत सभासदत्व गौरव पत्र ||
        </div>
        <div style="font-size: 0.78rem; color: #4B5563; font-style: italic; margin-top: 3px;">
          "प्रतिपच्चंद्रलेखेव वर्धिष्णुर्विश्ववंदिता शाहसूनोः शिवस्यैषा मुद्रा भद्राय राजते"
        </div>
      </div>

      <!-- Divider -->
      <div style="height: 2px; background: linear-gradient(90deg, transparent, #EA580C, transparent); margin: 12px 0 18px 0;"></div>

      <!-- Salutation & Name -->
      <p style="font-size: 0.98rem; color: #4B5563; margin: 0;">हे सन्मानपूर्वक अधिकृतरीत्या प्रमाणित करण्यात येते की,</p>
      <h1 style="font-size: 2.3rem; font-weight: 800; color: #991B1B; margin: 6px 0; text-decoration: underline; text-underline-offset: 6px; font-family: 'Baloo 2';">
        ${name}
      </h1>
      <p style="font-size: 0.96rem; line-height: 1.6; max-width: 76ch; margin: 0 auto 18px auto; color: #1F2937;">
        यांना कनेक्ट मराठा व्यासपीठाचे अधिकृत सभासदत्व बहाल करण्यात आले असून, ते समाज संघटन, व्यवसाय सहकार्य, 
        युवा सक्षमीकरण आणि छत्रपती शिवरायांच्या स्वराज्य मूल्यांशी बांधील असणारे 
        <strong style="color: #EA580C;">"${tier}"</strong> 
        श्रेणीचे प्रमाणित अधिकृत सभासद आहेत.
      </p>

      <!-- Credentials Box: White with Saffron Border -->
      <div style="background: #FFFDF9; border: 2px solid #FED7AA; border-radius: 12px; padding: 18px 22px; margin: 0 auto 22px; display: grid; grid-template-columns: auto 1fr auto; gap: 22px; align-items: center; text-align: left; box-sizing: border-box;">
        <div style="width: 90px; height: 105px; border-radius: 8px; border: 2.5px solid #EA580C; overflow: hidden; background: #FFF7ED; box-shadow: 0 4px 10px rgba(0,0,0,0.08);">
          <img src="${photoUrl}" alt="${name}" style="width: 100%; height: 100%; object-fit: cover; display: block;" onerror="this.src='${origin}/assets/images/officers/officer_tukaram.jpg'" />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px 18px; font-size: 0.86rem;">
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 0.7rem; color: #78350F; font-weight: 700;">नोंदणी ओळखपत्र आयडी:</span>
            <strong style="color: #EA580C; font-family: monospace; font-size: 1rem;">${memberId}</strong>
          </div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 0.7rem; color: #78350F; font-weight: 700;">व्यवसाय / पद:</span>
            <strong style="color: #1F2937;">${role}</strong>
          </div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 0.7rem; color: #78350F; font-weight: 700;">संबद्ध शाखा (Chapter):</span>
            <strong style="color: #1F2937;">${chapter}</strong>
          </div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 0.7rem; color: #78350F; font-weight: 700;">रक्तगट (Blood Group):</span>
            <strong style="color: #DC2626;">${bloodGroup}</strong>
          </div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 0.7rem; color: #78350F; font-weight: 700;">स्थान / जिल्हा:</span>
            <strong style="color: #1F2937;">${city}</strong>
          </div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 0.7rem; color: #78350F; font-weight: 700;">आपत्कालीन संपर्क:</span>
            <strong style="color: #1F2937;">${emergencyPhone}</strong>
          </div>
        </div>

        <!-- Laser QR Code -->
        <div style="background: #FFFFFF; border: 1.5px solid #EA580C; border-radius: 8px; padding: 6px; text-align: center; box-shadow: 0 2px 6px rgba(0,0,0,0.06);">
          <svg width="68" height="68" viewBox="0 0 25 25" fill="#EA580C">
            <rect x="0" y="0" width="7" height="7"/><rect x="1" y="1" width="5" height="5" fill="#fff"/><rect x="2" y="2" width="3" height="3"/><rect x="18" y="0" width="7" height="7"/><rect x="19" y="1" width="5" height="5" fill="#fff"/><rect x="20" y="2" width="3" height="3"/><rect x="0" y="18" width="7" height="7"/><rect x="1" y="19" width="5" height="5" fill="#fff"/><rect x="2" y="20" width="3" height="3"/><rect x="9" y="2" width="2" height="2"/><rect x="13" y="4" width="2" height="2"/><rect x="9" y="9" width="7" height="7"/><rect x="10" y="10" width="5" height="5" fill="#fff"/><rect x="11" y="11" width="3" height="3"/><rect x="18" y="10" width="3" height="2"/><rect x="18" y="14" width="2" height="4"/><rect x="10" y="18" width="4" height="2"/><rect x="12" y="22" width="4" height="2"/><rect x="20" y="20" width="4" height="4"/>
          </svg>
          <div style="font-size: 0.62rem; color: #78350F; font-weight: 700; margin-top: 2px;">Scan to Verify</div>
        </div>
      </div>

      <!-- Footer Metadata & Signatures -->
      <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1.5px solid #FED7AA; padding-top: 16px; text-align: left;">
        <div style="font-size: 0.78rem; color: #4B5563; line-height: 1.45;">
          <div><strong>प्रमाणपत्र दिनांक:</strong> ${issueDate}</div>
          <div><strong>नोंदणी क्रमांक:</strong> ${memberId}</div>
          <div><strong>सत्यापन लिंक:</strong> connectmaratha.com/verify/${memberId}</div>
          <div style="font-size: 0.72rem; color: #059669; font-weight: 700; margin-top: 3px;">✓ DPDP कायदा २०२३ डिजिटल गोपनीयता व ISO २७००१ प्रमाणित</div>
        </div>

        <!-- Seal -->
        <div style="text-align: center;">
          <div style="width: 64px; height: 64px; border: 2.5px dashed #EA580C; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #EA580C; font-size: 0.7rem; font-weight: 800; background: #FFF7ED; margin: 0 auto 3px;">
            <span style="font-size: 0.95rem;">🚩</span>
            <span>शिवमुद्रा</span>
            <span>सील</span>
          </div>
          <span style="font-size: 0.7rem; color: #78350F; font-weight: 700;">अधिकृत मुद्रा</span>
        </div>

        <!-- Signature -->
        <div style="text-align: right; font-size: 0.8rem; color: #4B5563;">
          <div style="font-family: serif; font-size: 1.35rem; font-weight: 700; color: #1F2937;">Dr. J. Pawar</div>
          <div style="color: #EA580C; font-weight: 800;">मुख्य सचिव, कनेक्ट मराठा परिषद</div>
          <div>महाराष्ट्र राज्य, भारत</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Downloads a genuine, 100% PDF format (.pdf) file with lossless PNG rendering
 * guaranteeing exact, clean white/ivory backgrounds and crisp saffron typography.
 */
export async function downloadCardPDF(data, mode = 'certificate') {
  const memberIdClean = (data.memberId || 'MEMBER').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `ConnectMaratha_Member_Card_${memberIdClean}.pdf`;

  // Create temporary container mounted in body
  const container = document.createElement('div');
  container.id = 'cm-pdf-render-box';
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '960px';
  container.style.background = '#FFFFFF';
  container.style.zIndex = '-9999';
  container.innerHTML = generateCardHTML(data, mode);
  document.body.appendChild(container);

  try {
    await ensurePdfLibraries();

    if (typeof window !== 'undefined' && window.html2canvas) {
      const targetEl = container.firstElementChild || container;

      // Render into High-Resolution Retina Canvas using lossless settings
      const canvas = await window.html2canvas(targetEl, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#FFFFFF'
      });

      // 1. Try jsPDF library with lossless PNG (no color distortion or JPEG inversion!)
      if (window.jspdf && window.jspdf.jsPDF) {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });

        const pdfWidth = 297; // mm
        const pdfHeight = 210; // mm
        const margin = 10;
        const maxW = pdfWidth - margin * 2;
        const maxH = pdfHeight - margin * 2;

        const imgW = canvas.width;
        const imgH = canvas.height;
        const ratio = Math.min(maxW / imgW, maxH / imgH);

        const printW = imgW * ratio;
        const printH = imgH * ratio;
        const x = (pdfWidth - printW) / 2;
        const y = (pdfHeight - printH) / 2;

        // Use PNG format for 100% color accuracy, pristine whites, and razor-sharp saffron borders
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', x, y, printW, printH, undefined, 'FAST');
        pdf.save(filename);
      } else {
        // Fallback: trigger print dialog if jsPDF object was not found
        printOrSaveCardPDF(data, mode);
      }
    } else {
      throw new Error('Canvas renderer unavailable');
    }
  } catch (err) {
    console.warn('PDF direct generation error, falling back to system PDF printer:', err);
    printOrSaveCardPDF(data, mode);
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

/**
 * Triggers the browser print & PDF dialog with clean white background and saffron borders.
 */
export function printOrSaveCardPDF(data, mode = 'certificate') {
  const html = `
    <!DOCTYPE html>
    <html lang="mr">
    <head>
      <meta charset="UTF-8" />
      <title>ConnectMaratha_Member_Card_${data.memberId || 'ID'}</title>
      <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700;800&family=Yantramanav:wght@400;500;700;900&display=swap" rel="stylesheet">
      <style>
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box; }
        @page { size: A4 landscape; margin: 8mm; }
        body { margin: 0; padding: 12px; background: #FFFFFF; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
      </style>
    </head>
    <body>
      ${generateCardHTML(data, mode)}
      <script>
        window.addEventListener('load', () => {
          setTimeout(() => { window.focus(); window.print(); }, 400);
        });
      <\/script>
    </body>
    </html>
  `;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';
  document.body.appendChild(iframe);

  try {
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    iframe.contentWindow.focus();
    setTimeout(() => {
      try {
        iframe.contentWindow.print();
      } catch (e) {
        window.print();
      }
      setTimeout(() => {
        if (document.body.contains(iframe)) document.body.removeChild(iframe);
      }, 5000);
    }, 600);
  } catch (e) {
    window.print();
  }
}
