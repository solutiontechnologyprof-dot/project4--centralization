// إعدادات الاتصال بـ SonicPACS - عدل القيم دي حسب إعداداتك
const CONFIG = {
    // عنوان السيرفر - لو على نفس الجهاز استخدم localhost
    serverUrl: 'https://teleradiology.darelashaa.net:443',  // غير ده حسب اعدادات SonicPACS عندك
    
    // بيانات الدخول للنظام
    username: 'patient',     // غيرها حسب اليوزر بتاعك
    password: '*******'   // غيرها حسب الباسورد بتاعك
    
    // ملاحظة مهمة: للاستخدام الحقيقي، استخدم طريقة OTP من Integration Guide
    // عشان متحطش الباسورد في الـ URL
};

async function fetchStudies() {
    const patientCode = document.getElementById('patientCode').value.trim();
    
    if (!patientCode) {
        showError('من فضلك أدخل رقم الهاتف أو كود المريض');
        return;
    }
    
    showLoading(true);
    hideError();
    
    try {
        // ==============================================
        // الطريقة الأولى: لو عندك API في SonicPACS تجيب الفحوصات
        // ==============================================
        
        // محاولة جلب الفحوصات من الـ API (حسب ما هو موضح في Integration Guide)
        const apiUrl = `${CONFIG.serverUrl}/viewer/api/studies?patientid=${encodeURIComponent(patientCode)}`;
        
        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': 'Basic ' + btoa(`${CONFIG.username}:${CONFIG.password}`)
            }
        });
        
        if (response.ok) {
            const studies = await response.json();
            displayStudiesList(studies);
        } else {
            // ==============================================
            // الطريقة الثانية: لو الـ API مش متاح استخدم الرابط المباشر
            // ==============================================
            
            // بناء رابط الويب فيوزر (web viewer) مباشرة
            // الصيغة دي حسب Integration Guide من SonicDICOM
            const viewerUrl = `${CONFIG.serverUrl}/viewer/#/list?id=${CONFIG.username}&password=${CONFIG.password}&patientid=${encodeURIComponent(patientCode)}`;
            
            // افتح الفيوزر في نافذة جديدة
            window.open(viewerUrl, '_blank');
            
            // أو ممكن تفتحه في نفس النافذة:
            // window.location.href = viewerUrl;
            
            showSuccess('تم فتح الفحوصات بنجاح');
        }
        
    } catch (error) {
        // ==============================================
        // الطريقة الثالثة: لو فشل الجلب، استخدم الرابط المباشر
        // ==============================================
        
        console.error('Error:', error);
        
        const viewerUrl = `${CONFIG.serverUrl}/viewer/#/list?id=${CONFIG.username}&password=${CONFIG.password}&patientid=${encodeURIComponent(patientCode)}`;
        window.open(viewerUrl, '_blank');
        
        // أو رسالة للمستخدم
        showError('تم فتح الفحوصات. تأكد من تسجيل الدخول إذا طُلب منك.');
    }
    
    showLoading(false);
}

function displayStudiesList(studies) {
    // لو عايز تعرض قائمة الفحوصات بشكل مخصص بدل الفيوزر
    // دي وظيفة متقدمة، بس الأسهل تستخدم الفيوزر الجاهز من SonicPACS
    const viewerUrl = `${CONFIG.serverUrl}/viewer/#/list?id=${CONFIG.username}&password=${CONFIG.password}`;
    window.open(viewerUrl, '_blank');
}

function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    // ممكن تعمل رسالة نجاح لو حابب
    console.log(message);
}

function hideError() {
    document.getElementById('error').style.display = 'none';
}