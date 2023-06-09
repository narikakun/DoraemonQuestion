$(function () {
    $("#createClassButton").click(function (event) {
        $("#loading-overlay").fadeIn(300);
        $.ajax({
            type: "POST",
            url: "/api/class/create",
            data: JSON.stringify({
                classId: $('#classId').val(),
                tPassword: $('#adminPassword').val(),
                className: $('#className').val()
            }),
            contentType: 'application/json',
            dataType: "json"
        })
            .done(function (data, textStatus, jqXHR) {
                window.location.href = `/admin/${data.data.classId}`
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                $("#loading-overlay").fadeOut(300);
                $('#errorMsg').text(jqXHR.responseJSON.msg);
            });
    });
    $("#adminPassword").keypress(function (e) {
        if (e.which == 13) {
            $("#createClassButton").click();
        }
    });
    $("#classId").keypress(function (e) {
        if (e.which == 13) {
            $("#createClassButton").click();
        }
    });
    $("#className").keypress(function (e) {
        if (e.which == 13) {
            $("#createClassButton").click();
        }
    });
});