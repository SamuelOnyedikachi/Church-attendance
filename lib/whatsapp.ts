const DEFAULT_COUNTRY_CODE = '234';
const MIN_PHONE_LENGTH = 8;
const MAX_PHONE_LENGTH = 15;
const DEFAULT_CHURCH_NAME = 'Rhythmn 5 Fellowship';

type TemplateTokenMap = {
  birthdayDate: string;
  churchName: string;
  firstName: string;
  name: string;
  phone: string;
  serviceDate: string;
  serviceTitle: string;
};

export type WhatsAppTemplateContext = {
  attendeeName?: string | null;
  churchName?: string | null;
  dob?: string | null;
  phone?: string | null;
  serviceDate?: string | null;
  serviceTitle?: string | null;
};

function formatDateLabel(value?: string | null) {
  if (!value) return '';

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return parsedDate.toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getFirstName(name?: string | null) {
  const trimmedName = name?.trim() ?? '';
  if (!trimmedName) {
    return 'Friend';
  }

  return trimmedName.split(/\s+/)[0] ?? 'Friend';
}

export function normalizeWhatsAppPhone(
  phone?: string | null,
  defaultCountryCode = DEFAULT_COUNTRY_CODE
) {
  const trimmedPhone = phone?.trim() ?? '';

  if (!trimmedPhone) {
    return null;
  }

  let digitsOnly = trimmedPhone.replace(/\D/g, '');

  if (!digitsOnly) {
    return null;
  }

  if (digitsOnly.startsWith('00')) {
    digitsOnly = digitsOnly.slice(2);
  }

  if (digitsOnly.startsWith(`${defaultCountryCode}0`)) {
    digitsOnly =
      defaultCountryCode + digitsOnly.slice(defaultCountryCode.length + 1);
  }

  if (digitsOnly.startsWith('0')) {
    digitsOnly = `${defaultCountryCode}${digitsOnly.slice(1)}`;
  } else if (
    !digitsOnly.startsWith(defaultCountryCode) &&
    digitsOnly.length === 10
  ) {
    digitsOnly = `${defaultCountryCode}${digitsOnly}`;
  }

  if (
    digitsOnly.length < MIN_PHONE_LENGTH ||
    digitsOnly.length > MAX_PHONE_LENGTH
  ) {
    return null;
  }

  return digitsOnly;
}

export function buildWhatsAppHref(phone?: string | null, message?: string) {
  const normalizedPhone = normalizeWhatsAppPhone(phone);

  if (!normalizedPhone) {
    return null;
  }

  const baseHref = `https://wa.me/${normalizedPhone}`;

  if (!message) {
    return baseHref;
  }

  return `${baseHref}?${new URLSearchParams({ text: message }).toString()}`;
}

export function resolveWhatsAppTemplate(
  template: string,
  context: WhatsAppTemplateContext
) {
  const tokens: TemplateTokenMap = {
    birthdayDate: formatDateLabel(context.dob) || 'your special day',
    churchName: context.churchName?.trim() || DEFAULT_CHURCH_NAME,
    firstName: getFirstName(context.attendeeName),
    name: context.attendeeName?.trim() || 'Friend',
    phone: context.phone?.trim() || '',
    serviceDate: formatDateLabel(context.serviceDate) || 'today',
    serviceTitle: context.serviceTitle?.trim() || 'our service',
  };

  return template.replace(
    /\{\{\s*(birthdayDate|churchName|firstName|name|phone|serviceDate|serviceTitle)\s*\}\}/g,
    (_, token: keyof TemplateTokenMap) => tokens[token]
  );
}
