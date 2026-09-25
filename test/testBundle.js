// eslint-disable-next-line no-undef
const allTests = require.context('./spec', true, SPEC_PATTERN);

allTests.keys().forEach(allTests);
