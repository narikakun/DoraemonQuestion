let nowData = null;

function getComment(boardId, pageNum = 1) {
    $("#cardList").html(" ");
    $("#cardList").hide();
    $.ajax({
        type: "GET",
        url: `/api/comment/${boardId}/list?page=${pageNum}`,
        contentType: 'application/json',
        dataType: "json"
    })
        .done(async function (data, textStatus, jqXHR) {
            $("#boardId").text(boardId);
            data.comments.reverse();
            await showCommentList(data.comments);
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

let removeClassId, removeCommentId;

async function removeComment() {
    $.ajax({
        type: "POST",
        url: `/api/admin/${removeClassId}/removeComment/${removeCommentId}`,
        contentType: 'application/json',
        dataType: "json"
    })
        .done(async function (data, textStatus, jqXHR) {
            bootstrap.showToast({body: "削除しました。", toastClass: "text-bg-primary"});
            $(`#comment_${removeCommentId}`).remove();
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            $('#errorMsg').text(jqXHR.responseJSON.msg);
        });
}

async function showRemoveModal(cId, bId, author, content) {
    removeClassId = cId;
    removeCommentId = bId;
    $("#modalId").text(bId);
    $("#modalAuthor").text(author);
    $("#modalContent").text(content);
    $('#deleteCheckModal').modal('show');
}

async function showCommentList(comment) {
    let commentHtml = "";
    commentHtml += `<table class="table">
    <thead>
        <tr>
            <th scope="col">投稿者名</th>
            <th scope="col">内容</th>
            <th scope="col">ファイル数</th>
            <th scope="col">日付</th>
            <th scope="col">操作</th>
        </tr>
    </thead>
  <tbody>`;
    for (const dataKey in comment) {
        let datum = comment[dataKey];
        commentHtml += `
        <tr id="comment_${datum._id}">
                <td>${escapeHTML(datum.author)}${datum.teacher?` <span class="badge bg-secondary">教員</span>`: ""}</td>
                <td>${escapeHTML(truncateString(datum.data.content, 30) || "")}</td>
                <td>${datum.data.files.length}</td>
                <td>${new Date(datum.createdAt).toLocaleString("ja")}</td>
                <td>
                    <button type="button" target="_blank" onclick="showRemoveModal('${datum.classId}', '${datum._id}', '${escapeHTML(datum.author)}', '${escapeHTML(truncateString(datum.data.content, 30) || "")}')" class="btn btn-danger btn-sm">コメントを削除</button>
                </td>
        </tr>`;
    }
    commentHtml += `</tbody></table>`;
    $("#cardList").html(commentHtml);
}

$(function () {
    $("#paginationBack").click(function (event) {
        if (1 >= nowData.pageNumber) return;
        let pageNumber = nowData.pageNumber - 1;
        getBoard(nowData.classId, pageNumber);
    })
    $("#paginationNext").click(function (event) {
        if (nowData.maxPage <= nowData.pageNumber) return;
        let pageNumber = nowData.pageNumber + 1;
        getBoard(nowData.classId, pageNumber);
    })
});