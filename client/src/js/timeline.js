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
    const axisContainer = document.querySelector('.timeline__axis');
    const eventsContainer = document.querySelector('.timeline__events');

    const cosineSmooth = (t) => .5 * (1 + Math.cos((1 - t) * Math.PI));

    const cipher_input = document.getElementById('cipher-input');
    const cipher_output = document.getElementById('cipher-output');
    const cipher_output_rot = document.getElementById('cipher-output-rot');
    const settings_columns = document.getElementById('cipher-settings-columns');
    const settings_button  = document.getElementById('cipher-settings-apply-button');
    const randomize_button  = document.getElementById('cipher-settings-randomize-button');
    const reset_button  = document.getElementById('cipher-settings-reset-button');
    const default_columns  = '0123456789AB'.split('');

    const cipher_text = cipher_input.textContent;
    const cipher_lines = cipher_text.split("\n");

    settings_columns.value = default_columns.join('');

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
        cipher_input.textContent = default_columns.join('') + "\n" + cipher_text;
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

    let currScroll = 0,
        currScale = 1.0,
        currAxisScale = 1.0,
        currAxisScroll = 0,
        isZooming = false;
    
    const updatePosition = (delta, isZoom) => {
        const deltaScale = delta / 500,
            axisSmoothing = cosineSmooth(deltaScale * 4);
        if (isZoom) {
            currScale += deltaScale;
            currAxisScale += deltaScale * axisSmoothing;
        } else {
            currScroll -= delta * 2;
            currAxisScroll -= delta * 1.9;
        }
        axisContainer.style.transform = `translateX(${currAxisScroll}px) scale(${currAxisScale})`;
        eventsContainer.style.transform = `translateX(${currScroll}px) scale(${currScale})`;
    }

    document.body.addEventListener('keydown', (ev) => isZooming = ev.shiftKey);
    document.body.addEventListener('keyup', (ev) => isZooming = false);

    window.addEventListener("wheel", event => updatePosition(event.deltaY, isZooming));

    document.querySelector('.button--zoom-out').addEventListener('click', (e) => updatePosition(-50, true));
    document.querySelector('.button--zoom-in').addEventListener('click', (e) => updatePosition(50, true));
    document.querySelector('.button--left').addEventListener('click', (e) => updatePosition(-150, false));
    document.querySelector('.button--right').addEventListener('click', (e) => updatePosition(150, false));

    document.querySelector('.button--cipher').addEventListener('click', (e) => document.querySelector('.timeline').classList.toggle('cipher__active'));
});
