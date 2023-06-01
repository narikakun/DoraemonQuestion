$(function () {
    $("#createLessonButton").click(function (event) {
        $("#loading-overlay").fadeIn(300);
        $.ajax({
            type: "POST",
            url: `/api/admin/${classId}/createLesson`,
            data: {
                lessonName: $("#lessonName").val() || null
            },
            dataType: 'json',
            cache: false
        })
            .done(function (data, textStatus, jqXHR) {
                window.location.href = `/admin/${data.data.classId}/lesson`
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                $("#loading-overlay").fadeOut(300);
                $('#errorMsg').text(jqXHR.responseJSON.msg);
            });
    });
    $("#lessonName").keypress(function (e) {
        if (e.which == 13) {
            $("#createLessonButton").click();
        }
    });
});