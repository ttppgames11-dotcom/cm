// Connect Maratha ES Module Bridge to CMDB
import '../../assets/js/cm-data.js';

const CMDB = typeof window !== 'undefined' && window.CMDB ? window.CMDB : {};

export default CMDB;
export { CMDB };
