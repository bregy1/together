// SCR-onb-about ("Schritt 2 von 5"): first name, birth date and home municipality.
// States: default (filled in again when the person comes back or resumes), invalid (the
// field errors), region search (matching Swiss municipalities while typing, or no match),
// confirm age, and offline or failed call with a retry (input kept).
// The first name and the municipality are saved as soon as they are entered, so a
// sign-up resumed later has them (ONB-008). The birth date is sent only after the person
// confirmed the age, or at once when the app's own check finds them under 18, so the
// server can delete everything (ONB-010, ONB-011). The server's answer always wins.
// spec: ONB-008, ONB-009, ONB-010, ONB-011, ONB-012, ONB-020
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessibilityInfo, Text, View } from 'react-native';

import {
  searchMunicipalities,
  setSignUpStep,
  updateSignUpAbout,
  type ApiFailure,
  type Municipality,
  type SignUpAboutUpdate,
} from '../../api/signUpApi';
import { useTheme } from '../../theme';
import { Button, Chip, Screen, TextField } from '../../ui';
import { useSession } from '../login/session';
import { Notice } from '../login/Notice';
import { checkBirthDate, checkFirstName, FIRST_NAME_MAX, MINIMUM_AGE, todayInSwitzerland } from './aboutChecks';
import { aboutFieldErrorsFrom, noticeFor, type AboutFieldErrors, type NoticeKey } from './errors';
import { SignUpHeader } from './SignUpHeader';
import { useSignUp, type SignUpDraft } from './signUpState';

const ABOUT_STEP = 2;
/** Pause after the last keystroke before the first name is saved. */
const SAVE_NAME_DELAY_MS = 800;
/** Pause after the last keystroke before the municipalities are searched. */
const SEARCH_DELAY_MS = 300;

const digitsOnly = (text: string, max: number) => text.replace(/\D/g, '').slice(0, max);
/** Name and canton, to tell same-named municipalities apart (data, not translatable text). */
export const municipalityLabel = (m: Municipality) => `${m.name} (${m.canton})`;

type PendingNotice = { key: NoticeKey; retry: () => void };

export function AboutScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { endSession } = useSession();
  const { draft, update } = useSignUp();
  const [errors, setErrors] = useState<AboutFieldErrors>({});
  const [confirm, setConfirm] = useState<{ age: number; iso: string } | null>(null);
  const [notice, setNotice] = useState<PendingNotice | null>(null);
  const [busy, setBusy] = useState(false);
  const busyNow = useRef(false);

  // --- The recorded step: coming back to this step records it again (ONB-008, ONB-020).
  const stepRef = useRef(draft.step);
  stepRef.current = draft.step;
  useFocusEffect(
    useCallback(() => {
      if (stepRef.current === 'about') return;
      void setSignUpStep('about').then((result) => {
        if (result.ok) update({ step: result.data.step });
      });
    }, [update]),
  );

  // --- The first name is saved after a short pause in typing, when it passes the format check.
  const savedName = useRef(draft.firstName);
  useEffect(() => {
    const firstName = draft.firstName;
    if (firstName === savedName.current || checkFirstName(firstName) !== 'ok') return;
    const timer = setTimeout(() => {
      savedName.current = firstName;
      // Best effort: "continue" saves all fields again and reports failures.
      void updateSignUpAbout({ firstName });
    }, SAVE_NAME_DELAY_MS);
    return () => clearTimeout(timer);
  }, [draft.firstName]);

  // --- Municipality search while typing.
  const [results, setResults] = useState<{ query: string; items: Municipality[] } | null>(null);
  const [searchNotice, setSearchNotice] = useState<PendingNotice | null>(null);
  const searchRun = useRef(0);
  const query = draft.regionQuery.trim();

  const search = useCallback(async (q: string) => {
    const run = ++searchRun.current;
    setSearchNotice(null);
    const result = await searchMunicipalities(q);
    if (run !== searchRun.current) return; // a newer search has started
    if (result.ok) setResults({ query: q, items: result.data });
    else setSearchNotice({ key: noticeFor(result), retry: () => void search(q) });
  }, []);

  useEffect(() => {
    searchRun.current += 1;
    setResults(null);
    setSearchNotice(null);
    if (!query) return;
    const timer = setTimeout(() => void search(query), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [query, search]);

  const noMatch = results !== null && results.query === query && results.items.length === 0;
  useEffect(() => {
    if (noMatch) AccessibilityInfo.announceForAccessibility(t('onb.about.regionNoMatch'));
  }, [noMatch, t]);

  const choose = (municipality: Municipality) => {
    update({ municipality, regionQuery: '' });
    setErrors((prev) => ({ ...prev, region: undefined }));
    // Best effort, as with the first name.
    void updateSignUpAbout({ homeMunicipalityId: municipality.id });
  };

  // --- The age confirmation is announced when it appears.
  useEffect(() => {
    if (confirm) AccessibilityInfo.announceForAccessibility(t('onb.about.confirmAge', { age: confirm.age }));
  }, [confirm, t]);

  // --- Saving and moving on.
  const failed = async (result: ApiFailure, retry: () => void) => {
    if (result.kind === 'error' && result.code === 'age_below_minimum') {
      // The server has deleted the sign-up and closed the session (ONB-010).
      await endSession();
      router.replace('/age-stop');
      return;
    }
    if (result.kind === 'error' && result.code === 'unauthenticated') {
      await endSession();
      router.replace('/phone');
      return;
    }
    const fieldErrors = result.kind === 'error' && result.code === 'validation_failed' ? aboutFieldErrorsFrom(result.details) : null;
    if (fieldErrors) {
      setConfirm(null);
      setErrors(fieldErrors);
      return;
    }
    setNotice({ key: noticeFor(result), retry });
  };

  const run = async (work: () => Promise<void>) => {
    if (busyNow.current) return;
    busyNow.current = true;
    setBusy(true);
    setNotice(null);
    try {
      await work();
    } finally {
      busyNow.current = false;
      setBusy(false);
    }
  };

  /** Saves all three fields with the confirmed birth date, records the next step and goes there. */
  const goOn = async (values: SignUpDraft, iso: string) => {
    const retry = () => void saveAndGoOn(values, iso);
    const about: SignUpAboutUpdate = { firstName: values.firstName, birthDate: iso };
    if (values.municipality) about.homeMunicipalityId = values.municipality.id;
    const saved = await updateSignUpAbout(about);
    if (!saved.ok) return failed(saved, retry);
    savedName.current = values.firstName;
    const stepped = await setSignUpStep('interests');
    if (!stepped.ok) return failed(stepped, retry);
    update({ step: stepped.data.step });
    setConfirm(null);
    router.push('/interests');
  };
  const saveAndGoOn = (values: SignUpDraft, iso: string) => run(() => goOn(values, iso));

  /** Under 18 by the app's own check: the birth date goes to the server at once. */
  const sendUnderAge = (values: SignUpDraft, iso: string) =>
    run(async () => {
      const result = await updateSignUpAbout({ birthDate: iso });
      if (!result.ok) return failed(result, () => void sendUnderAge(values, iso));
      // The server counts the person as 18 or older; its answer wins.
      await goOn(values, iso);
    });

  const onContinue = () => {
    if (busyNow.current) return;
    setNotice(null);
    const birth = checkBirthDate(draft.birthDay, draft.birthMonth, draft.birthYear, todayInSwitzerland());
    if (birth.kind === 'ok' && birth.age < MINIMUM_AGE) {
      setErrors({});
      void sendUnderAge(draft, birth.iso);
      return;
    }
    const next: AboutFieldErrors = {};
    const name = checkFirstName(draft.firstName);
    if (name === 'required') next.firstName = 'onb.about.error.firstNameRequired';
    if (name === 'invalid') next.firstName = 'onb.about.error.firstNameInvalid';
    if (birth.kind === 'invalid') next.birthDate = 'onb.about.error.birthDateInvalid';
    if (!draft.municipality) next.region = 'onb.about.error.regionRequired';
    setErrors(next);
    if (Object.keys(next).length > 0 || birth.kind !== 'ok') return;
    setConfirm({ age: birth.age, iso: birth.iso });
  };

  const onConfirm = () => {
    if (confirm) void saveAndGoOn(draft, confirm.iso);
  };
  // Back to the form with the birth date as entered, ready to edit; nothing saved.
  const onChange = () => setConfirm(null);

  // --- Field changes.
  const setBirth = (change: Partial<SignUpDraft>) => {
    update(change);
    setConfirm(null);
    setErrors((prev) => ({ ...prev, birthDate: undefined }));
  };

  const fieldError = (key: AboutFieldErrors[keyof AboutFieldErrors]) =>
    key === 'onb.about.error.firstNameInvalid' ? t(key, { max: FIRST_NAME_MAX }) : key ? t(key) : undefined;

  const footer = confirm ? (
    <View style={{ gap: theme.space[3] }}>
      <Text style={[theme.text.h3,{ color: theme.colors.text }]}>{t('onb.about.confirmAge', { age: confirm.age })}</Text>
      <Button label={t('onb.action.confirm')} onPress={onConfirm} busy={busy} />
      <Button label={t('onb.action.change')} variant="secondary" onPress={onChange} disabled={busy} />
    </View>
  ) : (
    <Button label={t('onb.action.continue')} onPress={onContinue} busy={busy} />
  );

  return (
    <Screen testID="screen-onb-about" footer={footer}>
      <View style={{ gap: theme.space[6] }}>
        <SignUpHeader step={ABOUT_STEP} title={t('onb.about.title')} />

        <TextField
          testID="onb-about-first-name"
          label={t('onb.about.firstName')}
          placeholder={t('onb.about.firstNamePlaceholder')}
          error={fieldError(errors.firstName)}
          value={draft.firstName}
          onChangeText={(firstName) => {
            update({ firstName });
            setErrors((prev) => ({ ...prev, firstName: undefined }));
          }}
          autoComplete="given-name"
          textContentType="givenName"
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="next"
        />

        <View style={{ gap: theme.space[2] }}>
          {/* Read by VoiceOver as text before the fields; on Android the group's label is read instead. */}
          <Text importantForAccessibility="no" style={[theme.text.label, { color: theme.colors.text }]}>
            {t('onb.about.birthDate.label')}
          </Text>
          <View
            role="group"
            accessibilityLabel={t('onb.about.birthDate.label')}
            style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[3] }}>
            <View style={{ flexGrow: 1, flexBasis: theme.size.touchMin * 2 }}>
              <TextField
                testID="onb-about-birth-day"
                label={t('onb.about.birthDate.day')}
                placeholder={t('onb.about.birthDate.dayPlaceholder')}
                value={draft.birthDay}
                onChangeText={(text) => setBirth({ birthDay: digitsOnly(text, 2) })}
                keyboardType="number-pad"
                autoComplete="birthdate-day"
                maxLength={2}
              />
            </View>
            <View style={{ flexGrow: 1, flexBasis: theme.size.touchMin * 2 }}>
              <TextField
                testID="onb-about-birth-month"
                label={t('onb.about.birthDate.month')}
                placeholder={t('onb.about.birthDate.monthPlaceholder')}
                value={draft.birthMonth}
                onChangeText={(text) => setBirth({ birthMonth: digitsOnly(text, 2) })}
                keyboardType="number-pad"
                autoComplete="birthdate-month"
                maxLength={2}
              />
            </View>
            <View style={{ flexGrow: 2, flexBasis: theme.size.touchMin * 2 }}>
              <TextField
                testID="onb-about-birth-year"
                label={t('onb.about.birthDate.year')}
                placeholder={t('onb.about.birthDate.yearPlaceholder')}
                value={draft.birthYear}
                onChangeText={(text) => setBirth({ birthYear: digitsOnly(text, 4) })}
                keyboardType="number-pad"
                autoComplete="birthdate-year"
                maxLength={4}
              />
            </View>
          </View>
          {errors.birthDate ? <Notice message={t(errors.birthDate)} /> : null}
        </View>

        <View style={{ gap: theme.space[3] }}>
          <TextField
            testID="onb-about-region"
            label={t('onb.about.region')}
            placeholder={t('onb.about.regionSearch')}
            error={fieldError(errors.region)}
            value={draft.regionQuery}
            onChangeText={(regionQuery) => update({ regionQuery })}
            autoCorrect={false}
            autoComplete="off"
            returnKeyType="search"
          />
          {draft.municipality && !query ? (
            <View style={{ flexDirection: 'row' }}>
              <Chip
                label={municipalityLabel(draft.municipality)}
                selected
                onPress={() => update({ municipality: null })}
              />
            </View>
          ) : null}
          {results && results.query === query && results.items.length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[2] }}>
              {results.items.map((m) => (
                <Chip
                  key={m.id}
                  label={municipalityLabel(m)}
                  selected={m.id === draft.municipality?.id}
                  onPress={() => choose(m)}
                />
              ))}
            </View>
          ) : null}
          {noMatch ? (
            <Text style={[theme.text.small, { color: theme.colors.text }]}>{t('onb.about.regionNoMatch')}</Text>
          ) : null}
          {searchNotice ? (
            <Notice message={t(searchNotice.key)} retryLabel={t('onb.action.retry')} onRetry={searchNotice.retry} />
          ) : null}
        </View>

        {notice ? <Notice message={t(notice.key)} retryLabel={t('onb.action.retry')} onRetry={notice.retry} /> : null}
      </View>
    </Screen>
  );
}
