let nowData = null;

function getLesson(boardId, pageNum = 1) {
    $("#cardList").html(" ");
    $("#cardList").hide();
    $.ajax({
        type: "GET",
        url: `/api/admin/${boardId}/lesson?page=${pageNum}`,
        contentType: 'application/json',
        dataType: "json"
    })
        .done(async function (data, textStatus, jqXHR) {
            data.lessons.reverse();
            await showLessonList(data.lessons);
            nowData = data;
            $("#cardList").show();
            if (data.pageNumber == 1) {
                $("#paginationBack").addClass("disabled");
            } else {
                $("#paginationBack").removeClass("disabled");
            }
            if (data.pageNumber == data.maxPage) {
                $("#paginationNext").addClass("disabled");
            } else {
                $("#paginationNext").removeClass("disabled");
            }
            $("#paginationInfo").text(`　${data.pageNumber} / ${data.maxPage}　`);
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            $('#errorMsg').text(jqXHR.responseJSON.msg);
        });
}

let removeClassId, removeLessonId;

async function removeComment() {
    $.ajax({
        type: "POST",
        url: `/api/admin/${removeClassId}/removeLesson/${removeLessonId}`,
        contentType: 'application/json',
        dataType: "json"
    })
        .done(async function (data, textStatus, jqXHR) {
            bootstrap.showToast({body: "削除しました。", toastClass: "text-bg-primary"});
            $(`#lesson_${removeLessonId}`).remove();
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            $('#errorMsg').text(jqXHR.responseJSON.msg);
        });
}

async function showRemoveModal(cId, bId, lessonName) {
    removeClassId = cId;
    removeLessonId = bId;
    $("#modalLessonId").text(bId);
    $("#modalLessonName").text(lessonName);
    $('#deleteCheckModal').modal('show');
}

async function showLessonList(lesson) {
    let lessonHtml = "";
    lessonHtml += `<table class="table">
    <thead>
        <tr>
            <th scope="col">レッスンID</th>
            <th scope="col">レッスン名</th>
            <th scope="col">日付</th>
            <th scope="col">操作</th>
        </tr>
    </thead>
  <tbody>`;
    for (const dataKey in lesson) {
        let datum = lesson[dataKey];
        lessonHtml += `
        <tr id="lesson_${datum._id}">
                <td>${escapeHTML(datum._id)}</td>
                <td>${escapeHTML(truncateString(datum.name, 30) || "")}</td>
                <td>${new Date(datum.createdAt).toLocaleString("ja")}</td>
                <td>
                    <button type="button" target="_blank" onclick="showRemoveModal('${datum.classId}', '${datum._id}', '${escapeHTML(datum.name)}')" class="btn btn-danger btn-sm" disabled>レッスンを削除</button>
                </td>
        </tr>`;
    }
    lessonHtml += `</tbody></table>`;
    $("#cardList").html(lessonHtml);
}

$(function () {
    $("#paginationBack").click(function (event) {
        if (1 >= nowData.pageNumber) return;
        let pageNumber = nowData.pageNumber - 1;
        getLesson(nowData.classId, pageNumber);
    })
    $("#paginationNext").click(function (event) {
        if (nowData.maxPage <= nowData.pageNumber) return;
        let pageNumber = nowData.pageNumber + 1;
        getLesson(nowData.classId, pageNumber);
    })
});