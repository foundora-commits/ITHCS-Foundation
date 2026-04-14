import { db, collection, addDoc, serverTimestamp } from './firebase.js';

/* ── Modal HTML ──────────────────────────────────────────────────────────── */
const MODAL_HTML = `
<div id="ithcs-modal-overlay"
     style="display:none;position:fixed;inset:0;z-index:9999;background:rgba(0,27,63,0.55);backdrop-filter:blur(2px);overflow-y:auto;padding:2rem 1rem;">
  <div id="ithcs-modal-box"
       style="background:#fff;border-radius:1rem;max-width:560px;margin:0 auto;box-shadow:0 20px 60px rgba(0,52,111,0.22);position:relative;">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#00346f 0%,#004a99 100%);border-radius:1rem 1rem 0 0;padding:1.75rem 2rem 1.5rem;">
      <button id="ithcs-modal-close"
              style="position:absolute;top:1rem;right:1rem;background:rgba(255,255,255,0.15);border:none;color:#fff;border-radius:50%;width:2rem;height:2rem;font-size:1.2rem;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1;">&#x2715;</button>
      <h3 id="ithcs-modal-title" style="margin:0;font-size:1.4rem;font-weight:800;color:#fff;font-family:Inter,sans-serif;"></h3>
    </div>
    <!-- Body -->
    <div style="padding:2rem;">
      <form id="ithcs-modal-form" novalidate>
        <div id="ithcs-form-fields"></div>
        <!-- Success message -->
        <div id="ithcs-success-msg"
             style="display:none;text-align:center;padding:2rem 1rem;">
          <div style="font-size:2.5rem;margin-bottom:0.75rem;">✅</div>
          <p style="font-size:1rem;font-weight:600;color:#00346f;font-family:Inter,sans-serif;">
            submitted successfully will notify you the decision...
          </p>
        </div>
        <!-- Submit -->
        <button id="ithcs-submit-btn" type="submit"
                style="width:100%;margin-top:1.25rem;background:linear-gradient(135deg,#00346f 0%,#004a99 100%);color:#fff;border:none;border-radius:0.5rem;padding:0.9rem 1.5rem;font-size:1rem;font-weight:700;cursor:pointer;font-family:Inter,sans-serif;transition:opacity 0.2s;">
          Submit
        </button>
        <p id="ithcs-form-error" style="display:none;color:#b7102a;font-size:0.875rem;margin-top:0.75rem;text-align:center;font-family:Inter,sans-serif;"></p>
      </form>
    </div>
  </div>
</div>`;

/* ── Field templates ─────────────────────────────────────────────────────── */
const FIELD = {
  text: (id, label, required = true) => `
    <div style="margin-bottom:1rem;">
      <label for="${id}" style="display:block;font-size:0.875rem;font-weight:600;color:#191c1e;margin-bottom:0.35rem;font-family:Inter,sans-serif;">${label}${required ? ' <span style="color:#b7102a">*</span>' : ''}</label>
      <input id="${id}" name="${id}" type="text" ${required ? 'required' : ''}
             style="width:100%;border:1.5px solid #c2c6d3;border-radius:0.5rem;padding:0.65rem 0.85rem;font-size:0.95rem;font-family:Inter,sans-serif;color:#191c1e;box-sizing:border-box;outline:none;transition:border-color 0.2s;"
             onfocus="this.style.borderColor='#00346f'" onblur="this.style.borderColor='#c2c6d3'"/>
    </div>`,
  email: (id, label) => `
    <div style="margin-bottom:1rem;">
      <label for="${id}" style="display:block;font-size:0.875rem;font-weight:600;color:#191c1e;margin-bottom:0.35rem;font-family:Inter,sans-serif;">${label} <span style="color:#b7102a">*</span></label>
      <input id="${id}" name="${id}" type="email" required
             style="width:100%;border:1.5px solid #c2c6d3;border-radius:0.5rem;padding:0.65rem 0.85rem;font-size:0.95rem;font-family:Inter,sans-serif;color:#191c1e;box-sizing:border-box;outline:none;transition:border-color 0.2s;"
             onfocus="this.style.borderColor='#00346f'" onblur="this.style.borderColor='#c2c6d3'"/>
    </div>`,
  phone: (id, label) => `
    <div style="margin-bottom:1rem;">
      <label for="${id}" style="display:block;font-size:0.875rem;font-weight:600;color:#191c1e;margin-bottom:0.35rem;font-family:Inter,sans-serif;">${label} <span style="color:#b7102a">*</span></label>
      <input id="${id}" name="${id}" type="tel" required
             style="width:100%;border:1.5px solid #c2c6d3;border-radius:0.5rem;padding:0.65rem 0.85rem;font-size:0.95rem;font-family:Inter,sans-serif;color:#191c1e;box-sizing:border-box;outline:none;transition:border-color 0.2s;"
             onfocus="this.style.borderColor='#00346f'" onblur="this.style.borderColor='#c2c6d3'"/>
    </div>`,
  select: (id, label, options, required = true) => `
    <div style="margin-bottom:1rem;">
      <label for="${id}" style="display:block;font-size:0.875rem;font-weight:600;color:#191c1e;margin-bottom:0.35rem;font-family:Inter,sans-serif;">${label}${required ? ' <span style="color:#b7102a">*</span>' : ''}</label>
      <select id="${id}" name="${id}" ${required ? 'required' : ''}
              style="width:100%;border:1.5px solid #c2c6d3;border-radius:0.5rem;padding:0.65rem 0.85rem;font-size:0.95rem;font-family:Inter,sans-serif;color:#191c1e;box-sizing:border-box;outline:none;background:#fff;transition:border-color 0.2s;"
              onfocus="this.style.borderColor='#00346f'" onblur="this.style.borderColor='#c2c6d3'">
        <option value="">-- Select --</option>
        ${options.map(o => `<option value="${o}">${o}</option>`).join('')}
      </select>
    </div>`,
  textarea: (id, label, required = false) => `
    <div style="margin-bottom:1rem;">
      <label for="${id}" style="display:block;font-size:0.875rem;font-weight:600;color:#191c1e;margin-bottom:0.35rem;font-family:Inter,sans-serif;">${label}${required ? ' <span style="color:#b7102a">*</span>' : ''}</label>
      <textarea id="${id}" name="${id}" rows="3" ${required ? 'required' : ''}
                style="width:100%;border:1.5px solid #c2c6d3;border-radius:0.5rem;padding:0.65rem 0.85rem;font-size:0.95rem;font-family:Inter,sans-serif;color:#191c1e;box-sizing:border-box;outline:none;resize:vertical;transition:border-color 0.2s;"
                onfocus="this.style.borderColor='#00346f'" onblur="this.style.borderColor='#c2c6d3'"></textarea>
    </div>`,
};

/* ── Form definitions ────────────────────────────────────────────────────── */
const FORMS = {
  'Partner With Us': () => `
    ${FIELD.text('org_name', 'Organization Name')}
    ${FIELD.text('contact_name', 'Contact Person Name')}
    ${FIELD.email('email', 'Email Address')}
    ${FIELD.phone('phone', 'Phone Number')}
    ${FIELD.select('partner_type', 'Type of Organization', ['NGO', 'Civil Society', 'Trust / Foundation', 'Other'])}
    ${FIELD.select('partnership_area', 'Area of Partnership', ['Implementation & Outreach', 'Community Mobilization', 'Awareness Campaigns', 'Capacity Building', 'Research & Advocacy', 'Other'])}
    ${FIELD.textarea('details', 'Additional Details')}`,

  'Collaborate With Us': () => `
    ${FIELD.text('org_name', 'Organization / Institution Name')}
    ${FIELD.text('contact_name', 'Contact Person Name')}
    ${FIELD.email('email', 'Email Address')}
    ${FIELD.phone('phone', 'Phone Number')}
    ${FIELD.select('institution_type', 'Type of Institution', ['Medical College', 'Hospital', 'Research Institute', 'University', 'Other'])}
    ${FIELD.select('collaboration_area', 'Collaboration Area', ['Training Programs', 'Research & Studies', 'System Strengthening', 'Clinical Expertise', 'Other'])}
    ${FIELD.textarea('details', 'Additional Details')}`,

  'Share Expertise': () => `
    ${FIELD.text('name', 'Full Name')}
    ${FIELD.text('org_name', 'Organization / Institution')}
    ${FIELD.email('email', 'Email Address')}
    ${FIELD.phone('phone', 'Phone Number')}
    ${FIELD.select('expertise_area', 'Area of Expertise', ['Public Health', 'Clinical Medicine', 'Health Policy', 'Emergency Medicine', 'Research & Analytics', 'Legal & Governance', 'Other'])}
    ${FIELD.select('contribution_type', 'Mode of Contribution', ['Advisory Support', 'Policy Input', 'Technical Review', 'Training & Capacity Building', 'Research Collaboration', 'Other'])}
    ${FIELD.textarea('details', 'Additional Details')}`,

  'Become a Member': () => `
    ${FIELD.text('name', 'Full Name')}
    ${FIELD.text('org_name', 'Organization / Affiliation (if any)', false)}
    ${FIELD.email('email', 'Email Address')}
    ${FIELD.phone('phone', 'Phone Number')}
    ${FIELD.select('profession', 'Profession', ['Healthcare Professional', 'Public Health Expert', 'Policy Maker', 'Researcher / Academic', 'Student', 'Citizen / Activist', 'Other'])}
    ${FIELD.select('membership_interest', 'Why do you want to join?', ['Support the mission', 'Contribute expertise', 'Network & collaborate', 'Stay informed', 'Other'])}
    ${FIELD.textarea('details', 'Additional Details')}`,

  'Join as Volunteer': () => `
    ${FIELD.text('name', 'Full Name')}
    ${FIELD.text('org_name', 'Organization / Institution (if any)', false)}
    ${FIELD.email('email', 'Email Address')}
    ${FIELD.phone('phone', 'Phone Number')}
    ${FIELD.select('volunteer_role', 'Preferred Volunteer Role', ['Field Volunteer', 'Event Support', 'Research & Documentation', 'Digital & Communications', 'Training & Awareness', 'Other'])}
    ${FIELD.select('availability', 'Availability', ['Weekends only', 'Weekdays only', 'Both weekdays & weekends', 'Remote / Online only', 'Flexible'])}
    ${FIELD.textarea('details', 'Additional Details')}`,
};

/* ── State ───────────────────────────────────────────────────────────────── */
let currentFormType = null;

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function getOverlay() { return document.getElementById('ithcs-modal-overlay'); }
function getForm()    { return document.getElementById('ithcs-modal-form'); }

function collectFormData() {
  const form = getForm();
  const inputs = form.querySelectorAll('input, select, textarea');
  const data = {};
  inputs.forEach(el => { if (el.name) data[el.name] = el.value.trim(); });
  return data;
}

/* ── Open modal ──────────────────────────────────────────────────────────── */
export function openModal(type) {
  currentFormType = type;
  const overlay = getOverlay();
  document.getElementById('ithcs-modal-title').textContent = type;
  document.getElementById('ithcs-form-fields').innerHTML = (FORMS[type] || FORMS['Partner With Us'])();
  document.getElementById('ithcs-success-msg').style.display = 'none';
  document.getElementById('ithcs-submit-btn').style.display = 'block';
  document.getElementById('ithcs-form-error').style.display = 'none';
  overlay.style.display = 'block';
  document.body.style.overflow = 'hidden';
}

/* ── Close modal ─────────────────────────────────────────────────────────── */
function closeModal() {
  getOverlay().style.display = 'none';
  document.body.style.overflow = '';
  getForm().reset();
  currentFormType = null;
}

/* ── Submit handler ──────────────────────────────────────────────────────── */
async function handleSubmit(e) {
  e.preventDefault();
  const form = getForm();
  const errorEl = document.getElementById('ithcs-form-error');
  const submitBtn = document.getElementById('ithcs-submit-btn');

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting…';
  errorEl.style.display = 'none';

  try {
    await addDoc(collection(db, 'requests'), {
      type: currentFormType,
      data: collectFormData(),
      status: 'pending',
      createdAt: serverTimestamp(),
    });

    document.getElementById('ithcs-form-fields').style.display = 'none';
    submitBtn.style.display = 'none';
    document.getElementById('ithcs-success-msg').style.display = 'block';
  } catch (err) {
    console.error('Firestore error:', err);
    errorEl.textContent = 'Something went wrong. Please try again.';
    errorEl.style.display = 'block';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit';
  }
}

/* ── Init (inject modal + wire events) ──────────────────────────────────── */
export function initForms() {
  // Inject modal
  document.body.insertAdjacentHTML('beforeend', MODAL_HTML);

  // Close handlers
  document.getElementById('ithcs-modal-close').addEventListener('click', closeModal);
  document.getElementById('ithcs-modal-overlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('ithcs-modal-overlay')) closeModal();
  });

  // Submit handler
  document.getElementById('ithcs-modal-form').addEventListener('submit', handleSubmit);

  // ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}