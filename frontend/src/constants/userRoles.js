// Roles a platform admin can hand out from the Users tab (must match ASSIGNABLE_ROLES in backend/utils/accounts.js).
// Unit owners and staff normally get their role from the CRM unit hierarchy screens.
export const USER_ROLE_OPTIONS = [
  ['member', '👤 member (सामान्य सदस्य)'],
  ['chapter_president', '💼 chapter_president (चॅप्टर अध्यक्ष)'],
  ['seva_helpdesk', '🩺 seva_helpdesk (मदत कक्ष)'],
  ['finance_officer', '💰 finance_officer (वित्त अधिकारी)'],
  ['state_admin', '🏛️ state_admin (राज्य प्रमुख)'],
  ['branch_admin', '🏢 branch_admin (शाखा प्रमुख)'],
  ['division_admin', '🗺️ division_admin (विभाग प्रमुख)'],
  ['district_admin', '📍 district_admin (जिल्हा प्रमुख)'],
  ['taluka_admin', '🏘️ taluka_admin (तालुका प्रमुख)'],
  ['center_manager', '🧑‍💼 center_manager (केंद्र व्यवस्थापक)'],
  ['center_staff', '🧾 center_staff (केंद्र कर्मचारी)'],
  ['admin', '🏛️ admin (Connect Maratha व्यवस्थापक)'],
  ['ceo', '🦅 ceo (मुख्य कार्यकारी अधिकारी)'],
  ['superadmin', '👑 superadmin (सर्वोच्च प्रशासक)']
];
