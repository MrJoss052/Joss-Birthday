(function () {
    const form = document.getElementById('birthdayForm');
    const nameIn = document.getElementById('nameInput');
    const msgIn = document.getElementById('messageInput');
    const btn = document.getElementById('submitBtn');
    const okMsg = document.getElementById('successMessage');
    const errMsg = document.getElementById('errorMessage');
    const modal = document.getElementById('confirmModal');
    const modalYes = document.getElementById('modalYes');
    const modalNo = document.getElementById('modalNo');

    const URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdaocdngExwe9XwYjveLdlfCi1XIN5eUqHL6eW-XCNwZKVcSg/formResponse';
    const ENTRY_NAME = 'entry.1307904677';
    const ENTRY_MSG = 'entry.2080567318';

    const cdDays = document.getElementById('cd-days');
    const cdHours = document.getElementById('cd-hours');
    const cdMins = document.getElementById('cd-mins');
    const cdSecs = document.getElementById('cd-secs');

    const target = new Date('2026-06-28T00:00:00-04:00');

    function pad(n) { return String(n).padStart(2, '0'); }

    function updateCountdown() {
        const now = new Date();
        const diff = target - now;
        if (diff <= 0) {
            cdDays.textContent = '00';
            cdHours.textContent = '00';
            cdMins.textContent = '00';
            cdSecs.textContent = '00';
            return;
        }
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        cdDays.textContent = pad(d);
        cdHours.textContent = pad(h);
        cdMins.textContent = pad(m);
        cdSecs.textContent = pad(s);
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);

    function resetMsgs() {
        okMsg.style.display = 'none';
        errMsg.style.display = 'none';
    }

    function showOk() {
        okMsg.style.display = 'block';
        errMsg.style.display = 'none';
    }

    function showErr(msg) {
        errMsg.textContent = msg || 'No se pudo enviar. Intenta de nuevo.';
        errMsg.style.display = 'block';
        okMsg.style.display = 'none';
    }

    function doSubmit() {
        const name = nameIn.value.trim() || 'Anónimo';
        const msg = msgIn.value.trim();

        if (!msg) {
            showErr('Escribe un mensaje antes de enviar.');
            return;
        }

        btn.disabled = true;
        btn.innerHTML = 'Enviando...';
        resetMsgs();

        const data = new FormData();
        data.append(ENTRY_NAME, name);
        data.append(ENTRY_MSG, msg);

        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 5000);

        fetch(URL, {
            method: 'POST',
            mode: 'no-cors',
            body: data,
            signal: ctrl.signal,
            headers: { 'Accept': 'application/json' }
        })
            .then(() => {
                clearTimeout(timer);
                showOk();
                form.reset();
                btn.innerHTML = 'Enviar otro mensaje';
                btn.disabled = false;
                modal.style.display = 'none';
            })
            .catch((err) => {
                clearTimeout(timer);
                if (err.name === 'AbortError') {
                    showErr('Tiempo de espera agotado. Revisa tu conexión.');
                } else {
                    showErr('Error de conexión. Revisa tu internet.');
                }
                btn.innerHTML = 'Reintentar';
                btn.disabled = false;
                modal.style.display = 'none';
            });
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        resetMsgs();

        const msg = msgIn.value.trim();
        if (!msg) {
            showErr('Escribe un mensaje antes de enviar.');
            return;
        }

        modal.style.display = 'flex';
    });

    modalYes.addEventListener('click', doSubmit);

    modalNo.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    modal.addEventListener('click', function (e) {
        if (e.target === this) {
            modal.style.display = 'none';
        }
    });

    nameIn.addEventListener('input', resetMsgs);
    msgIn.addEventListener('input', resetMsgs);

    errMsg.addEventListener('click', function () { this.style.display = 'none'; });
    okMsg.addEventListener('click', function () { this.style.display = 'none'; });

    nameIn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            msgIn.focus();
        }
    });

})();
