// Maps the outcome of a login call to what the screen shows: a message at the field
// (about the number or the code) or a notice below it, with or without a retry.
// Codes the app does not know show the general error (api/openapi.yaml → ErrorCode).
// spec: ONB-002, ONB-003, ONB-004, NFR-SEC-002
import type { ApiFailure } from './loginApi';

export type FieldProblem =
  | { key: 'onb.phone.error.invalid' }
  | { key: 'onb.phone.error.notSwiss' }
  | { key: 'onb.code.error.wrong'; count: number }
  | { key: 'onb.code.error.expired' };

export type NoticeKey =
  | 'onb.phone.error.sendFailed'
  | 'onb.phone.error.tooMany'
  | 'onb.phone.error.unavailable'
  | 'onb.error.offline'
  | 'onb.error.generic';

export type Problem = { at: 'field'; field: FieldProblem } | { at: 'notice'; key: NoticeKey; retry: boolean };

/** Problems that can follow a code request (send or resend). */
export function problemFromCodeRequest(failure: ApiFailure): Problem {
  if (failure.kind === 'offline') return { at: 'notice', key: 'onb.error.offline', retry: true };
  switch (failure.code) {
    case 'phone_invalid':
      return { at: 'field', field: { key: 'onb.phone.error.invalid' } };
    case 'phone_not_swiss':
      return { at: 'field', field: { key: 'onb.phone.error.notSwiss' } };
    case 'sms_send_failed':
      return { at: 'notice', key: 'onb.phone.error.sendFailed', retry: true };
    // The limits are not lifted by retrying now, so no retry is offered.
    case 'login_code_rate_limited':
      return { at: 'notice', key: 'onb.phone.error.tooMany', retry: false };
    case 'sms_unavailable':
      return { at: 'notice', key: 'onb.phone.error.unavailable', retry: false };
    default:
      return { at: 'notice', key: 'onb.error.generic', retry: true };
  }
}

/** Problems that can follow a code check. */
export function problemFromCodeCheck(failure: ApiFailure): Problem {
  if (failure.kind === 'offline') return { at: 'notice', key: 'onb.error.offline', retry: true };
  switch (failure.code) {
    case 'login_code_wrong':
      return { at: 'field', field: { key: 'onb.code.error.wrong', count: failure.details?.attemptsLeft ?? 0 } };
    case 'login_code_expired':
      return { at: 'field', field: { key: 'onb.code.error.expired' } };
    default:
      return { at: 'notice', key: 'onb.error.generic', retry: true };
  }
}
