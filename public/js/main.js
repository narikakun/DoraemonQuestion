function escapeHTML(string) {
    return String(string).replace(/&/g, '&lt;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, "&#x27;");
}

function truncateString(str, maxLength) {
    if (!str) return null;
    str = str.replace(/\r?\n/g, '');
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
}

function isAdmin(classId) {
    if ($.cookie(`adminSession_${classId}`)) {
        $("#navL").html($("#navL").html() + `<li class="nav-item"><a class="nav-link" aria-current="page" href="/admin/${classId}">管理パネル</a></li>`);
        $("#nav-teacher").html(` <span class="badge bg-secondary">教員モード</span>`);
    }
}

window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
        window.location.reload();
    }
});