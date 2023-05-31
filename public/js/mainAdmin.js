$(function () {
    $('#anonymousSettingCheck').change(function(){
        let anonymousCheck = $("#anonymousSettingCheck").prop("checked");
        if (anonymousCheck) {
            $('#anonymousStatus').text("有効");
        } else {
            $('#anonymousStatus').text("無効");
        }
        console.log(anonymousCheck);
        $.ajax({
            type: "POST",
            url: `/api/admin/${classId}/anonymousSettings`,
            data: {
                anonymousSettings: anonymousCheck || null
            },
            dataType: 'json',
            cache: false
        })
            .done(function (data, textStatus, jqXHR) {
                bootstrap.showToast({body: data.msg, toastClass: "text-bg-info"});
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                $("#loading-overlay").fadeOut(300);
                $('#errorMsg').text(jqXHR.responseJSON.msg);
            });
    });
    $.ajax({
        type: "GET",
        url: "/api/class/get/" + classId,
        contentType: 'application/json',
        dataType: "json"
    })
        .done(function (data, textStatus, jqXHR) {
            if (data.trueAnonymous) {
                $(`#anonymousSettingCheck`).prop('checked',true);
                $('#anonymousStatus').text("有効");
            }
        });
});