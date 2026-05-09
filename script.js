const CONFIG = {
    serverUrl: 'https://teleradiology.darelashaa.net:443',
    username: 'patient',
    password: '*******'
};

const LANGUAGE = {
    ar: {
        title: 'مجموعة دار الاشعه',
        subtitle: 'للفحوصات الطبيه',
        sectionTitle: 'بوابة فحوصاتي',
        description: 'ادخل كود المريض\nستجده فى صورة الفحص او بأعلى ايصال الاستلام',
        buttonText: '🔍 عرض فحوصاتي',
        loading: 'جاري تحميل الفحوصات...',
        networkOnline: 'متصل بالانترنت 😊',
        networkOffline: 'غير متصل بالانترنت 😔',
        noCodeError: '⚠️ من فضلك أدخل كود المريض',
        retryOffline: 'الوضع غير متصل. حاول مرة أخرى عند الاتصال بالانترنت.',
        successOpen: 'تم فتح الفحوصات بنجاح',
        openError: 'تعذر فتح الفحوصات حالياً. تأكد من الاتصال بالانترنت أو حاول لاحقاً.'
    },
    en: {
        title: 'Radiology Center Group',
        subtitle: 'for Medical Examinations',
        sectionTitle: 'Examinations Portal',
        description: 'Enter your patient code\nYou can find it on the exam image or at the top of the receipt',
        buttonText: '🔍 View My Exams',
        loading: 'Loading examinations...',
        networkOnline: 'Connected 😊',
        networkOffline: 'Offline 😔',
        noCodeError: '⚠️ Please enter your patient code',
        retryOffline: 'Offline mode active. Try again when connected.',
        successOpen: 'Examinations opened successfully',
        openError: 'Unable to open examinations right now. Check your connection and try later.'
    }
};

let currentLang = localStorage.getItem('lang') || 'ar';

window.addEventListener('load', () => {
    document.body.classList.add('lang-' + currentLang);
    setLanguage(currentLang);
    updateConnectionStatus();
    setupNetworkListeners();
    registerServiceWorker();
    document.getElementById('langArabic').addEventListener('click', () => switchLanguage('ar'));
    document.getElementById('langEnglish').addEventListener('click', () => switchLanguage('en'));
    document.getElementById('fetchStudiesBtn').addEventListener('click', fetchStudies);
    document.getElementById('qrBtn').addEventListener('click', openQrScanner);
    document.getElementById('qrCloseBtn').addEventListener('click', closeQrScanner);
});

function switchLanguage(lang) {
    if (lang !== 'ar' && lang !== 'en') return;
    currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
    document.body.classList.toggle('lang-ar', lang === 'ar');
    document.body.classList.toggle('lang-en', lang === 'en');
    setLanguage(lang);

    document.getElementById('langArabic').classList.toggle('active', lang === 'ar');
    document.getElementById('langEnglish').classList.toggle('active', lang === 'en');
}

function setLanguage(lang) {
    const data = LANGUAGE[lang];
    document.querySelectorAll('.title-ar, .title-en').forEach(el => el.style.display = el.classList.contains(`title-${lang}`) ? 'block' : 'none');
    document.querySelectorAll('.subtitle-ar, .subtitle-en').forEach(el => el.style.display = el.classList.contains(`subtitle-${lang}`) ? 'block' : 'none');
    document.querySelectorAll('.section-title-ar, .section-title-en').forEach(el => el.style.display = el.classList.contains(`section-title-${lang}`) ? 'block' : 'none');
    document.querySelectorAll('.description-ar, .description-en').forEach(el => el.style.display = el.classList.contains(`description-${lang}`) ? 'block' : 'none');
    document.querySelectorAll('.btn-text-ar, .btn-text-en').forEach(el => el.style.display = el.classList.contains(`btn-text-${lang}`) ? 'inline' : 'none');
    document.querySelectorAll('.info-title-ar, .info-title-en').forEach(el => el.style.display = el.classList.contains(`info-title-${lang}`) ? 'block' : 'none');
    document.querySelectorAll('.feature-ar, .feature-en').forEach(el => el.style.display = el.classList.contains(`feature-${lang}`) ? 'list-item' : 'none');
    document.querySelectorAll('.loader-ar, .loader-en').forEach(el => el.style.display = el.classList.contains(`loader-${lang}`) ? 'block' : 'none');
    document.querySelectorAll('.status-text-ar, .status-text-en').forEach(el => el.style.display = el.classList.contains(`status-text-${lang}`) ? 'inline' : 'none');
    document.querySelectorAll('.qr-title-ar, .qr-title-en').forEach(el => el.style.display = el.classList.contains(`qr-title-${lang}`) ? 'inline' : 'none');
    document.querySelectorAll('.qr-hint-ar, .qr-hint-en').forEach(el => el.style.display = el.classList.contains(`qr-hint-${lang}`) ? 'inline' : 'none');

    const input = document.getElementById('patientCode');
    const placeholder = lang === 'ar' ? input.getAttribute('placeholder-ar') : input.getAttribute('placeholder-en');
    if (placeholder) input.setAttribute('placeholder', placeholder);
}

function setupNetworkListeners() {
    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);
}

function updateConnectionStatus() {
    const statusDot = document.querySelector('.status-dot');
    const online = navigator.onLine;
    const message = LANGUAGE[currentLang][online ? 'networkOnline' : 'networkOffline'];

    document.querySelectorAll('.status-text-ar').forEach(el => el.textContent = LANGUAGE.ar[online ? 'networkOnline' : 'networkOffline']);
    document.querySelectorAll('.status-text-en').forEach(el => el.textContent = LANGUAGE.en[online ? 'networkOnline' : 'networkOffline']);

    if (online) {
        statusDot.classList.add('online');
        statusDot.classList.remove('offline');
    } else {
        statusDot.classList.add('offline');
        statusDot.classList.remove('online');
    }
}

async function fetchStudies() {
    const patientCode = document.getElementById('patientCode').value.trim();
    if (!patientCode) {
        showError(LANGUAGE[currentLang].noCodeError);
        return;
    }

    if (!navigator.onLine) {
        showError(LANGUAGE[currentLang].retryOffline);
        return;
    }

    showLoading(true);
    hideMessages();

    try {
        const apiUrl = `${CONFIG.serverUrl}/viewer/api/studies?patientid=${encodeURIComponent(patientCode)}`;
        const response = await fetch(apiUrl, {
            headers: {
                Authorization: 'Basic ' + btoa(`${CONFIG.username}:${CONFIG.password}`)
            }
        });

        if (response.ok) {
            const studies = await response.json();
            openViewer(patientCode);
            console.log('Studies:', studies);
            showSuccess(LANGUAGE[currentLang].successOpen);
        } else {
            openViewer(patientCode);
        }
    } catch (error) {
        console.error('Fetch error:', error);
        showError(LANGUAGE[currentLang].openError);
    } finally {
        showLoading(false);
    }
}

function openViewer(patientCode) {
    const viewerUrl = `${CONFIG.serverUrl}/viewer/#/list?id=${encodeURIComponent(CONFIG.username)}&password=${encodeURIComponent(CONFIG.password)}&patientid=${encodeURIComponent(patientCode)}`;
    window.open(viewerUrl, '_blank');
}

function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
}

function hideMessages() {
    document.getElementById('error').style.display = 'none';
    document.getElementById('success').style.display = 'none';
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    errorDiv.style.color = '#D8000C';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    const successDiv = document.getElementById('success');
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    successDiv.style.color = '#006600';
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 5000);
}

let html5QrCode = null;

function openQrScanner() {
    const overlay = document.getElementById('qrScanner');
    overlay.style.display = 'flex';

    html5QrCode = new Html5Qrcode('qrReader');
    html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
            document.getElementById('patientCode').value = decodedText;
            closeQrScanner();
            fetchStudies();
        },
        () => {}
    ).catch(() => {});
}

function closeQrScanner() {
    if (html5QrCode) {
        try { html5QrCode.stop().then(() => html5QrCode.clear()).catch(() => {}); } catch(e) {}
        html5QrCode = null;
    }
    document.getElementById('qrScanner').style.display = 'none';
}

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(reg => console.log('Service Worker registered:', reg.scope))
            .catch(err => console.warn('Service Worker failed:', err));
    }
}