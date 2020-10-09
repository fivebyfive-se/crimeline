(() => {
    const eventTemplate =`
<header class="event__header">
    <address class="event__location">{{location}}</address>
    <time class="event__date" datetime="{{fullDate}}">{{displayDate}}</time>
    <h1 class="event__title">{{title}}</h1>
</header>
<main>
    <dl class="event__details">
        <dt class="event__actor">{{actor}}</dt>
        <dd class="event__description">{{action}}</dd>
        <dt class="event__target">{{target}}</dt>
    </dl>
</main>
`;
    const parseTemplate = (event) => Object.keys(event)
        .reduce((prev, k) => prev.replaceAll(`{{${k}}}`, event[k]), eventTemplate)
        .replace(/\{\{[a-z]+\}\}/gi, '');

    const timelineContainer = document.querySelector('.timeline');
    const eventsContainer = document.querySelector('.timeline__events');

    const events = [
        {
            date: new Date(Date.UTC(1858, 1, 23)),
            title: 'Maurice Soyer föds',
            location: 'City of Westminster',
            className: 'no-details'
        },

        {
            date: new Date(1894, 0, 1),
            displayDate: 'Förra året',
            title: 'MS börjar skriva pjäs',
            action: '&hellip;och efterforska',
            target: 'Cauda Draconis',
        },

        {
            date: new Date(1895, 1, 1),
            displayDate: 'Februari \'95',
            title: 'Mrs Lee refuserar pjäs',
            actor: 'Florence Lee',
            action: 'refuserar',
            target: 'Maurice Soyer',
        },

        {
            date: new Date(1895, 5, 17),
            location: '19 Havelock st, London',
            title: 'M Soyer dör',
            className: 'no-details'
        }
    ];

    events.map((event) => {
        return {
            ...event,
            displayDate: event.displayDate || event.date.toLocaleDateString(),
            fullDate: event.date.toISOString(),
            title: event.title || [event.actor, event.action, event.target].filter((s) => !!s).join(' ')
        };
    }).forEach((event) => {
        const tag = document.createElement('article');
        tag.classList.add('event');
        if (event.className) {
            tag.classList.add(`event--${event.className}`);
        }
        tag.innerHTML = parseTemplate(event)
        eventsContainer.appendChild(tag);
    });
})();
