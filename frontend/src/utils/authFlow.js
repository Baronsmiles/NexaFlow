const AUTH_FLOW_KEY = 'nexaflow_auth_flow';
const RESET_EMAIL_KEY = 'nexaflow_reset_email';
const SUCCESS_PENDING_KEY = 'nexaflow_success_pending';


export function setAuthFlow(step) {
  sessionStorage.setItem(AUTH_FLOW_KEY, step);
}


export function getAuthFlow() {
  return sessionStorage.getItem(AUTH_FLOW_KEY);
}


export function clearAuthFlow() {
  sessionStorage.removeItem(AUTH_FLOW_KEY);
  sessionStorage.removeItem(RESET_EMAIL_KEY);
}


// ----------------------------------------
// RESET EMAIL
// ----------------------------------------

export function setResetEmail(email) {
  sessionStorage.setItem(RESET_EMAIL_KEY, email);
}


export function getResetEmail() {
  return sessionStorage.getItem(RESET_EMAIL_KEY);
}


export function clearResetEmail() {
  sessionStorage.removeItem(RESET_EMAIL_KEY);
}


// ----------------------------------------
// SUCCESS FLOW
// ----------------------------------------

export function startSuccessFlow() {
  sessionStorage.setItem(
    SUCCESS_PENDING_KEY,
    'true'
  );
}


export function getSuccessFlow() {
  return sessionStorage.getItem(
    SUCCESS_PENDING_KEY
  );
}


export function clearSuccessFlow() {
  sessionStorage.removeItem(
    SUCCESS_PENDING_KEY
  );
}