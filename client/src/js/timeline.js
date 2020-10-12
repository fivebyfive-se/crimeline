Date.prototype.daysFrom = function (b) {
    const _MS_PER_DAY = 1000 * 60 * 60 * 24;

    const utc1 = Date.UTC(this.getFullYear(), this.getMonth(), this.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
};

Array.prototype.shuffle = function shuffle_array() {
    const result = [...this];
    let currentIndex = result.length;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      const randomIndex = Math.floor(Math.random() * currentIndex);
      const temporaryValue = result[--currentIndex];
  
      // And swap it with the current element.
      result[currentIndex] = result[randomIndex];
      result[randomIndex] = temporaryValue;
    }
  
    return result;
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
    <p class="event__details">
        <span class="event__actor">{{actor}}</span>
        <span class="event__action">{{action}}</span>
        <span class="event__target">{{target}}</span>
    </p>
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

    const cipher_text = `E.TSAURTEP E
,DDOA ,RNI.W
DR SEXDK YUR
ELVAF. RVECT
BSLIRG.AEM.,
XLILGAMASM ,
GDNRIANTOETL
O NAERN ETGB
R.,SEUMGEA.M
,SXIDOERYFCL
AA RLEETD TY
AOMA KC IRDE`;
    const cipher_lines = cipher_text.split("\n");
    const cipher_input = document.getElementById('cipher-input');
    const cipher_output = document.getElementById('cipher-output');
    const cipher_output_rot = document.getElementById('cipher-output-rot');
    const settings_columns = document.getElementById('cipher-settings-columns');
    const settings_button  = document.getElementById('cipher-settings-apply-button');
    const randomize_button  = document.getElementById('cipher-settings-randomize-button');
    const reset_button  = document.getElementById('cipher-settings-reset-button');
    const default_columns  = '0123456789AB'.split('');
    settings_columns.value = default_columns.join('');
    cipher_input.textContent = default_columns.join('') + "\n" + cipher_text;

    const rot_letters = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase().split('');
    const settings_rot = document.getElementById('cipher-settings-rot');
    const settings_apply_rot_button  = document.getElementById('cipher-settings-rot-apply-button');
    const randomize_rot_button  = document.getElementById('cipher-settings-rot-randomize-button');
    const reset_rot_button  = document.getElementById('cipher-settings-rot-reset-button');


    const update_cipher_result = () => {
        const columns = settings_columns.value.split('').map((c) => parseInt(c, 16));
        const cipher_result_lines = cipher_lines.map((l) => {
            return columns.map((c) => l[c]).join('');
        });
        cipher_output.textContent = columns.map(c => c.toString(16).toUpperCase()).join('') + "\n" + cipher_result_lines.join("\n");
        update_cipher_rot_result();
    };
    const randomize_columns = () => {
        settings_columns.value = settings_columns.value.split('').shuffle().join('');
        update_cipher_result();
    };
    const reset_columns = () => {
        settings_columns.value = default_columns.join('');
        update_cipher_result();
    };

    const update_cipher_rot_result = () => {
        const rot = parseInt(settings_rot.value);
        const cipher_result_lines = cipher_output.textContent.split("\n").slice(1).join("\n");
        cipher_output_rot.textContent = `ROT:${rot}\n` + cipher_result_lines.split('').map((c) => {
            if (rot_letters.includes(c)) {
                return rot_letters[(rot_letters.indexOf(c) + rot) % rot_letters.length];
            }
            return c;
        }).join('');
        update_stats();
    };
    const randomize_rot = () => {
        settings_rot.value = Math.floor(25 * Math.random());
        update_cipher_rot_result();
    };
    const reset_rot = () => {
        settings_rot.value = 0;
        update_cipher_rot_result();
    };

    randomize_button.addEventListener('click', () => randomize_columns());
    settings_button.addEventListener('click', () => update_cipher_result());
    reset_button.addEventListener('click', () => reset_columns());

    randomize_rot_button.addEventListener('click', () => randomize_rot());
    reset_rot_button.addEventListener('click', () => reset_rot());
    settings_apply_rot_button.addEventListener('click', () => update_cipher_rot_result());

    settings_rot.addEventListener('change', () => update_cipher_rot_result());

    const cipher_stats_output = document.getElementById('cipher-stats');
    const cipher_stats_rot_output = document.getElementById('cipher-stats-rot');

    const update_stats = () => {
        const cipher_stats = {};
        const cipher_stats_rot = {};
        cipher_text.split('').forEach((c) => {
            if (rot_letters.includes(c)) {
                cipher_stats[c] = (cipher_stats[c] || 0) + 1;
            }
        });
        cipher_output_rot.textContent.split('').forEach((c) => {
            if (rot_letters.includes(c)) {
                cipher_stats_rot[c] = (cipher_stats_rot[c] || 0) + 1;
            }
        });
        cipher_stats_output.innerHTML = '<ol>' + Object.keys(cipher_stats).sort((a, b) => cipher_stats[b] - cipher_stats[a]).map((c) => {
            console.log(c);
            return `<li>${c}: ${cipher_stats[c]}</li>` 
        }).join('') + '</ol>';
        cipher_stats_rot_output.innerHTML = '<ol>' + Object.keys(cipher_stats_rot).sort((a, b) => cipher_stats_rot[b] - cipher_stats_rot[a]).map((c) => {
            console.log(c);
            return `<li>${c}: ${cipher_stats_rot[c]}</li>` 
        }).join('') + '</ol>';
    }

    reset_columns();



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

    document.querySelector('.button--cipher').addEventListener('click', (e) => document.querySelector('.timeline').classList.toggle('cipher__active'));
});
