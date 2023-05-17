let nowData = null;

function getBoard (classId, pageNum = 1) {
    $("#cardList").html(" ");
    $("#cardList").hide();
    $.ajax({
        type: "GET",
        url: `/api/board/${classId}/list?page=${pageNum}`,
        contentType: 'application/json',
        dataType: "json"
    })
        .done(async function(data, textStatus, jqXHR){
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
        .fail(function(jqXHR, textStatus, errorThrown){
            $('#errorMsg').text(jqXHR.responseJSON.msg);
        });
}

async function showBoardList (board) {
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
                <td>${datum.author}</td>
                <td>${datum.data.title || "タイトル無し"}</td>
                <td>${truncateString(datum.data.content, 30) || ""}</td>
                <td>${datum.data.files.length}</td>
                <td>${datum.lastComment?.commentCount || 0}</td>
                <td>${new Date(datum.createdAt).toLocaleString("ja")}</td>
                <td>
                    <a target="_blank" href="/class/${datum.classId}/board/${datum._id}" class="btn btn-info btn-sm">投稿を表示</a>
                    <a target="_blank" href="/class/${datum.classId}/board/${datum._id}" class="btn btn-danger btn-sm">投稿を削除</a>
                </td>
        </tr>`;
    }
    boardHtml += `</tbody></table>`;
    $("#cardList").html(boardHtml);
}

$(function() {
    $("#paginationBack").click(function(event){
        if (1 >= nowData.pageNumber) return;
        let pageNumber = nowData.pageNumber - 1;
        getBoard(nowData.classId, pageNumber);
    })
    $("#paginationNext").click(function(event){
        if (nowData.maxPage <= nowData.pageNumber) return;
        let pageNumber = nowData.pageNumber + 1;
        getBoard(nowData.classId, pageNumber);
    })
});

function truncateString (str, maxLength) {
    if (!str) return null;
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
}