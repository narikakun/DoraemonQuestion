$(function () {
    let cookieUsername = $.cookie("username");
    if (cookieUsername) {
        $("#username").val(cookieUsername);
    }
    let cookieClassList = $.cookie("classList");
    if (cookieClassList) {
        let classListArray = cookieClassList.split(",");
        classListArray.reverse();
        if (classListArray.length < 1) {
            $("#cookieClassDiv").hide();
        }
        for (const classListArrayElement of classListArray) {
            $("#cookieClassList").html($("#cookieClassList").html() + `<div class="d-flex text-muted pt-3" id="listElm_${classListArrayElement}"><span class="flex-shrink-0 me-2"></span>
                <div class="pb-3 mb-0 small lh-sm border-bottom w-100">
                    <div class="d-flex flex-column flex-md-row align-items-center">
                        <div class="col-lg-auto justify-content-center">
                            <strong class="text-gray-dark" id="listName_${classListArrayElement}">${classListArrayElement}</strong>
                            <span class="d-block" id="listId_${classListArrayElement}"></span>
                        </div>
                        <div class="mt-md-0 ms-md-auto">
                            <a href="/class/${classListArrayElement}" class="btn btn-primary btn-sm">このクラスにログイン</a>
                            <button type="button" class="btn btn-danger btn-sm" onclick="classLogout('${classListArrayElement}')">ログアウト</button>
                        </div>
                    </div>
                </div></div>`);
            $.ajax({
                type: "GET",
                url: "/api/class/get/" + classListArrayElement,
                contentType: 'application/json',
                dataType: "json"
            })
                .done(function (data, textStatus, jqXHR) {
                    $(`#listName_${classListArrayElement}`).text(data.className);
                    $(`#listId_${classListArrayElement}`).text("@" + data.classId);
                })
        }
    } else {
        $("#cookieClassDiv").hide();
    }
    $("#classLoginButton").click(function (event) {
        $("#loading-overlay").fadeIn(300);
        $.ajax({
            type: "POST",
            url: "/api/class/auth",
            data: JSON.stringify({
                classId: $('#classId').val(),
                username: $('#username').val()
            }),
            contentType: 'application/json',
            dataType: "json"
        })
            .done(function (data, textStatus, jqXHR) {
                window.location.href = `/class/${data.classId}`
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                $("#loading-overlay").fadeOut(300);
                $('#errorMsg').text(jqXHR.responseJSON.msg);
            });
    });
    $("#username").keypress(function (e) {
        if (e.which == 13) {
            $("#classLoginButton").click();
        }
    });
    $("#classId").keypress(function (e) {
        if (e.which == 13) {
            $("#classLoginButton").click();
        }
    });
});

function classLogout(classId) {
    let classListArray = String($.cookie("classList")).split(",").filter(f => f != classId);
    $.cookie("classList", classListArray.join(","));
    let classElm = $(`#listElm_${classId}`);
    if (classElm) {
        classElm.remove();
    }
}