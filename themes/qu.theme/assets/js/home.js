document.addEventListener('DOMContentLoaded', function () {
    var counterSection = document.querySelector('.visitor-counter-section');
    if (!counterSection) return;

    function animateCounter(elementId, target, duration) {
        duration = duration || 2000;
        var element = document.getElementById(elementId);
        if (!element) return;
        var start = 0;
        var increment = target / (duration / 16);
        var current = start;

        function updateCounter() {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current).toLocaleString();
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target.toLocaleString();
            }
        }

        updateCounter();
    }

    var endpoint = counterSection.dataset.endpoint;
    if (!endpoint) {
        counterSection.hidden = true;
        return;
    }

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                observer.unobserve(entry.target);
                fetch(endpoint, { credentials: 'omit' })
                    .then(function (r) {
                        if (!r.ok) throw new Error('HTTP ' + r.status);
                        return r.json();
                    })
                    .then(function (data) {
                        animateCounter('today-visitors', data.today || 0);
                        animateCounter('total-visitors', data.total || 0);
                        animateCounter('online-visitors', data.online || 0);
                    })
                    .catch(function () { counterSection.hidden = true; });
            }
        });
    }, { threshold: 0.5 });

    observer.observe(counterSection);
});
