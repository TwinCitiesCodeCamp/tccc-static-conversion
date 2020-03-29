const { format, setHours, setMinutes } = require('date-fns');

function removeExtraSpaces(string) {
  return string.replace(/  +/g, ' ');
}

function removeDoubleUnderscores(string) {
  return string.replace(/_+/g, '_');
}

function removeDoubleDashes(string) {
  return string.replace(/-+/g, '-');
}

function removeLineBreaks(string) {
  return string.replace(/\n+/g, '');
}

function cleanseLongText(text) {
  return removeExtraSpaces(
    text
      .trim()
      .split('"')
      .join('&quot;')
  );
}

function getYamlString(att) {
  return !att ? '' : `${att}`;
}

function getTwitterString(t) {
  if (!t) return '';
  if (t.charAt(0) === '@') return getYamlString(t.substring(1));
  return getYamlString(t);
}

function getTime(hour) {
  if (!hour) return '';
  const hourNumber = parseFloat(hour);
  if (hourNumber === 0) return '';
  const minutes = (hourNumber % 1) * 60;
  const now = new Date();
  const newDate = setMinutes(setHours(now, hour), minutes);
  return format(newDate, 'h:mm bbbb');
}

module.exports = {
  getTime,
  getTwitterString,
  getYamlString,
  cleanseLongText,
  removeLineBreaks,
  removeDoubleUnderscores,
  removeExtraSpaces,
  removeDoubleDashes
};
