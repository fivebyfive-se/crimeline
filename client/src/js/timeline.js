Date.prototype.daysFrom = function (b) {
    const _MS_PER_DAY = 1000 * 60 * 60 * 24;

    const utc1 = Date.UTC(this.getFullYear(), this.getMonth(), this.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
};

registerExtensions(extensionsServices);

orthogonal.onReady(($linear, $dom) => {
    const eventTemplate =`
<header class="event__header">
    <address class="event__location">{{location}}</address>
    <time class="event__date" datetime="{{fullDate}}">{{displayDate}}</time>
    <h1 class="event__title">{{title}}</h1>
</header>
<main>
    <dl class="event__details">
    <dt>vem?</dt>
        <dd class="event__actor">{{actor}}</dd>
    <dt>vad?</dt>
        <dd class="event__action">{{action}}</dd>
        <dd class="event__target">{{target}}</dd>
    </dl>
</main>
`;
    const parseTemplate = (event) => Object.keys(event)
        .reduce((prev, k) => prev.replaceAll(`{{${k}}}`, event[k]), eventTemplate)
        .replace(/\{\{[a-z]+\}\}/gi, '');

    const axisContainer = document.querySelector('.timeline__axis');
    const eventsContainer = document.querySelector('.timeline__events');

    const cosineSmooth = (t) => .5 * (1 + Math.cos((1 - t) * Math.PI));
    
    const events = [
        {
            date: new Date(Date.UTC(1894, 0, 1)),
            displayDate: 'Feb 23 1858',
            title: 'Maurice Soyer föds',
            location: 'City of Westminster',
            className: 'no-details highlight highlight--secondary'
        },

        {
            date: new Date(Date.UTC(1894, 10, 1)),
            displayDate: 'Förra året',
            title: 'MS börjar skriva pjäs',
            action: '&hellip;och efterforska',
            target: 'Cauda Draconis',
        },

        {
            date: new Date(Date.UTC(1895, 1, 1)),
            displayDate: 'Februari',
            title: 'Mrs Lee refuserar pjäs',
            actor: 'Florence Lee',
            action: 'refuserar',
            target: 'Maurice Soyer',
        },

        {
            date: new Date(Date.UTC(1895, 2, 20)),
            displayDate: 'Februari/mars? \'95',
            title: 'Telleson finansierar',
            actor: 'A Telleson',
            action: 'finansierar',
            target: 'Maurice Soyer',
        },

        {
            date: new Date(Date.UTC(1895, 5, 13)),
            displayDate: '14-15 juni 1895',
            title: 'Symbolen på dörren',
            actor: 'Cauda draconis (?)',
            action: 'ristar in symbol hos',
            target: 'Maurice Soyer',
        },

        {
            date: new Date(Date.UTC(1895, 5, 17)),
            location: '19 Havelock st, London',
            title: 'Morddagen',
            className: 'no-details highlight highlight--primary'
        },

        {
            date: new Date(Date.UTC(1895, 5, 17, 8, 0, 0)),
            displayDate: 'Morddagen',
            location: '19 Havelock st',
            title: 'Morgon',
            actor: 'Maurice Soyer',
            action: 'besöker Baker St.',
            className: 'detail'
        },

        {
            date: new Date(Date.UTC(1895, 5, 17, 22, 4, 0)),
            displayDate: 'Morddagen',
            location: '19 Havelock st',
            title: 'kl 10:04 pm',
            actor: 'Watson',
            action: 'anländer Soyers hus',
            className: 'detail'
        },

        {
            date: new Date(Date.UTC(1895, 5, 17, 22, 55, 0)),
            displayDate: 'Morddagen',
            location: '19 Havelock st',
            title: 'strax innan 11',
            actor: 'Soyer',
            action: 'lämnar huset',
            className: 'detail'
        }
    ];

    const eventStats = events.reduce((stats, event, i) => {
        const diff = i > 0 ? Math.floor((event.date - events[i-1].date) / (1000 * 60 * 60)) : 0;
        event.diff = diff;
        return {
            minDiff: !stats.minDiff || diff < stats.minDiff ? diff : stats.minDiff,
            maxDiff: !stats.maxDiff || diff > stats.maxDiff ? diff : stats.maxDiff
        };
    }, { minDiff: null, maxDiff: null });

    const timelineWidth = eventsContainer.getBoundingClientRect().width;
    const eventStep = (1 / events.length) * timelineWidth;
    let currStep = 0;
    events.map((event) => {
        return {
            ...event,
            displayDate: event.displayDate || event.date.toLocaleDateString(),
            fullDate: event.date.toISOString(),
            title: event.title || [event.actor, event.action, event.target].filter((s) => !!s).join(' ')
        };
    }).forEach((event, i) => {
        const tag = document.createElement('article');
        const stepRatio = event.diff / eventStats.maxDiff;
        currStep += .5 * eventStep + eventStep * stepRatio;

        tag.classList.add('event');
        tag.style.left = parseInt(currStep) + 'px';

        if (event.className) {
            tag.classList.add(...event.className.split(' ').map(c => `event--${c}`));
        }
        tag.innerHTML = parseTemplate(event)
        eventsContainer.appendChild(tag);
    });
    let currScroll = 0,
        currScale = 1.0,
        currAxisScale = 1.0,
        currAxisScroll = 0,
        isZooming = false;
    
    const updatePosition = (delta, isZoom) => {
        const deltaScale = delta / 500,
            axisSmoothing = cosineSmooth(deltaScale * 2);
        if (isZoom) {
            currScale += deltaScale;
            currAxisScale += deltaScale * axisSmoothing;
        } else {
            currScroll -= delta;
            currAxisScroll -= delta * axisSmoothing * currScale;
        }
        axisContainer.style.transform = `translateX(${currAxisScroll}px) scale(${currAxisScale})`;
        eventsContainer.style.transform = `translateX(${currScroll}px) scale(${currScale})`;
    }

    document.body.addEventListener('keydown', (ev) => isZooming = ev.shiftKey);
    document.body.addEventListener('keyup', (ev) => isZooming = false);

    window.addEventListener("wheel", event => updatePosition(event.deltaY, isZooming));

    document.querySelector('.button--zoom-out').addEventListener('click', (e) => updatePosition(-50, true));
    document.querySelector('.button--zoom-in').addEventListener('click', (e) => updatePosition(50, true));
    document.querySelector('.button--left').addEventListener('click', (e) => updatePosition(-50, false));
    document.querySelector('.button--right').addEventListener('click', (e) => updatePosition(50, false));
});
