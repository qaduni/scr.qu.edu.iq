(function () {
    var blob = document.getElementById('theme-languages');
    if (!blob) return;

    var languages;
    try {
        languages = JSON.parse(blob.textContent);
    } catch (e) { return; }
    if (!Array.isArray(languages) || languages.length < 2) return;

    var prefix = document.documentElement.getAttribute('data-storage-prefix') || 'theme';
    var STORAGE_KEY = prefix + '_lang_preference';

    document.addEventListener('click', function (event) {
        var link = event.target.closest && event.target.closest('a[data-lang-switch]');
        if (!link) return;
        try {
            localStorage.setItem(STORAGE_KEY, link.dataset.langSwitch);
        } catch (e) {}
    }, true);
})();
