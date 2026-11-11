// Maps the outcome of a sign-up call to what the screen shows: errors at the fields of
// SCR-onb-about (from `validation_failed` / `details.fields`), or a notice with a retry.
// Codes the app does not know show the general error (api/openapi.yaml → ErrorCode).
// spec: ONB-009, ONB-010, ONB-012
import type { ApiFailure, ErrorDetails } from '../../api/signUpApi';

export type NoticeKey = 'onb.error.offline' | 'onb.error.generic';

export type AboutFieldErrors = {
  firstName?: 'onb.about.error.firstNameRequired' | 'onb.about.error.firstNameInvalid';
  birthDate?: 'onb.about.error.birthDateInvalid';
  region?: 'onb.about.error.regionRequired';
};

export function noticeFor(failure: ApiFailure): NoticeKey {
  return failure.kind === 'offline' ? 'onb.error.offline' : 'onb.error.generic';
}

/** The field errors of a refused about update; null when the answer names no known field. */
export function aboutFieldErrorsFrom(details: ErrorDetails | undefined): AboutFieldErrors | null {
  const errors: AboutFieldErrors = {};
  for (const { field, problem } of details?.fields ?? []) {
    if (field === 'firstName') {
      errors.firstName = problem === 'required' ? 'onb.about.error.firstNameRequired' : 'onb.about.error.firstNameInvalid';
    } else if (field === 'birthDate') {
      errors.birthDate = 'onb.about.error.birthDateInvalid';
    } else if (field === 'homeMunicipalityId') {
      errors.region = 'onb.about.error.regionRequired';
    }
  }
  return Object.keys(errors).length > 0 ? errors : null;
}
