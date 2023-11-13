// utils/security.js
function escapeScriptTag(input) {
    return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

module.exports = {
    escapeScriptTag,
};