let nowData = null;

function getBoard(classId, pageNum = 1) {
    $("#cardList").html(" ");
    $("#cardList").hide();
    $.ajax({
        type: "GET",
        url: `/api/board/${classId}/list?page=${pageNum}`,
        contentType: 'application/json',
        dataType: "json"
    })
        .done(async function (data, textStatus, jqXHR) {
            data.boards.reverse();
            await showBoardList(data.boards);
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

let removeClassId, removeBoardId;

async function removeBoard() {
    $.ajax({
        type: "POST",
        url: `/api/admin/${removeClassId}/removeBoard/${removeBoardId}`,
        contentType: 'application/json',
        dataType: "json"
    })
        .done(async function (data, textStatus, jqXHR) {
            bootstrap.showToast({body: "削除しました。", toastClass: "text-bg-primary"});
            $(`#board_${removeBoardId}`).remove();
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            $('#errorMsg').text(jqXHR.responseJSON.msg);
        });
}

async function showRemoveModal(cId, bId, title, author, content) {
    removeClassId = cId;
    removeBoardId = bId;
    $("#modalAuthor").text(author);
    $("#modalTitle").text(title);
    $("#modalId").text(bId);
    $("#modalContent").text(content);
    $('#deleteCheckModal').modal('show');
}

async function showBoardList(board) {
    let boardHtml = "";
    boardHtml += `<table class="table">
    <thead>
        <tr>
            <th scope="col">投稿者名</th>
            <th scope="col">タイトル</th>
            <th scope="col">内容</th>
            <th scope="col">ファイル数</th>
            <th scope="col">コメント数</th>
            <th scope="col">日付</th>
            <th scope="col">操作</th>
        </tr>
    </thead>
  <tbody>`;
    let board2 = Object.keys(board).reverse();
    for (const dataKey in board2) {
        let datum = board[board2[dataKey]];
        boardHtml += `
        <tr id="board_${datum._id}">
                <td>${escapeHTML(datum.author)}${datum.teacher?` <span class="badge bg-secondary">教員</span>`: ""}</td>
                <td>${escapeHTML(datum.data.title || "タイトル無し")}</td>
                <td>${escapeHTML(truncateString(datum.data.content, 30) || "")}</td>
                <td>${datum.data.files.length}</td>
                <td>${datum.lastComment?.commentCount || 0}</td>
                <td>${new Date(datum.createdAt).toLocaleString("ja")}</td>
                <td>
                    <a target="_blank" href="/class/${datum.classId}/board/${datum._id}" class="btn btn-info btn-sm">表示</a>
                    <a href="/admin/${datum.classId}/comment/${datum._id}" class="btn btn-secondary btn-sm">コメント管理</a>
                    <button type="button" target="_blank" onclick="showRemoveModal('${datum.classId}', '${datum._id}', '${escapeHTML(datum.data.title || "タイトル無し")}', '${escapeHTML(datum.author)}', '${escapeHTML(truncateString(datum.data.content, 30) || "")}')" class="btn btn-danger btn-sm">削除</button>
                </td>
        </tr>`;
    }
    boardHtml += `</tbody></table>`;
    $("#cardList").html(boardHtml);
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