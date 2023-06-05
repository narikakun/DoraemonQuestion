$(function () {
    $("#createBoardButton").click(function (event) {
        $("#loading-overlay").fadeIn(300);
        let fd = new FormData();
        for (let i = 1; i <= 3; i++) {
            let file = $("#inputFile0" + i).prop('files')[0];
            if (file) {
                fd.append("files", file, encodeURIComponent(`${file.name}`));
            }
        }
        let content = $("#contentInput").val();
        if (content) {
            fd.append("content", content);
        }
        let anonymousCheck = $("#anonymousCheck").prop("checked");
        if (anonymousCheck) {
            fd.append("anonymous", "true");
        }
        let lesson = $("#lessonSelect").val();
        if (lesson) {
            fd.append("lesson", lesson);
        }
        $.ajax({
            type: "POST",
            url: `/api/board/${classId}/create`,
            data: fd,
            dataType: "json",
            cache: false,
            processData: false,
            contentType: false,
        })
            .done(function (data, textStatus, jqXHR) {
                window.location.href = `/class/${data.data.classId}/board/${data.data._id}`
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                $("#loading-overlay").fadeOut(300);
                $('#errorMsg').text(jqXHR.responseJSON.msg);
            });
    });

    $("#removeInput01").click(function (e) {
        $("#inputFile01").val("");
    });
    $("#removeInput02").click(function (e) {
        $("#inputFile02").val("");
    })
    $("#removeInput03").click(function (e) {
        $("#inputFile03").val("");
    })
});
function getClass (classId) {
    $.ajax({
        type: "GET",
        url: "/api/class/get/" + classId,
        contentType: 'application/json',
        dataType: "json"
    })
        .done(function (data, textStatus, jqXHR) {
            if (data.trueAnonymous) {
                $(`#anonymousDiv`).attr("style", "display: block;");
            }
            if (data.lessonList[0]) {
                $(`#lessonDiv`).attr("style", "display: block;");
                $(`#lessonSelect`).html("");
                for (const lessonKey in data.lessonList) {
                    $(`#lessonSelect`).html($(`#lessonSelect`).html() + `<option value="${data.lessonList[lessonKey]._id}"${lessonKey==0?" selected":""}>${data.lessonList[lessonKey].name}</option>`);
                }
            }
        })
}