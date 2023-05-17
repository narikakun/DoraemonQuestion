let nowData = null;
let showListMode = false;

function getBoard (classId, pageNum = 1) {
    $("#cardList").html(" ");
    if ($.cookie("listMode")) showListMode = true;
    if (!showListMode) {
        $("#cardList").attr("class", "row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3 mt-3");
    }
    $("#cardList").hide();
    $.ajax({
        type: "GET",
        url: `/api/board/${classId}/list?page=${pageNum}`,
        contentType: 'application/json',
        dataType: "json"
    })
        .done(async function(data, textStatus, jqXHR){
            await boardRefresh(data);
            nowData = data;
            await connectWebSocket(classId);
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

async function boardRefresh (data) {
    if (showListMode) {
        await showBoardList(data.boards);
    } else {
        for (const datum of data.boards.reverse()) {
            await addBoard(datum);
        }
    }
    $("#cardList").show();
}

async function showBoardList (board) {
    let boardHtml = "";
    boardHtml += `<table class="table">
    <thead>
        <tr>
            <th scope="col">投稿者名</th>
            <th scope="col">タイトル</th>
            <th scope="col">内容</th>
            <th scope="col">日付</th>
        </tr>
    </thead>
  <tbody>`;
    for (const datum of board.reverse()) {
        boardHtml += `<tr id="board_${board._id}"><div onclick="window.location.href='/class/${board.classId}/board/${board._id}'">
<td>${board.author}</td>
<td>${board.data.title || "タイトル無し"}</td>
<td>${truncateString(board.data.content, 30) || ""}</td>
<td>${new Date(board.createdAt).toLocaleString("ja")}</td>
</div></tr>`;
    }
    boardHtml += `</tbody></table>`;
    $("#cardList").html(boardHtml);
}

async function addBoard (board) {
    let boardHtml = "";
    boardHtml += `
<div class="col d-flex" id="board_${board._id}">
<div class="card mb-3 card-link flex-grow-1" onclick="window.location.href='/class/${board.classId}/board/${board._id}'">
    <div class="card-body">
        <div class="d-flex justify-content-between align-items-center">
            <h6 class="card-subtitle mb-2 text-muted">${board.author}</h6>
            <small class="text-muted">${new Date(board.createdAt).toLocaleString("ja")}</small>
        </div>
        <h5 class="card-title mb-0">${board.data.title || "タイトル無し"}</h5>
        <hr>
        <p class="card-text">${truncateString(board.data.content, 70) || ""}</p>
        <div class="row row-cols-3 g-3">`;
    for (const fileObj of board.data.files) {
        let imageType = ["image/jpeg", "image/jpg", "image/png"];
        if (imageType.includes(fileObj.mimetype)) {
            boardHtml += `<div class="col"><img src="/uploads${fileObj.resize || fileObj.key}" class="img-fluid"></div>`;
        }
        if (fileObj.mimetype == "application/pdf") {
            let pdfImg = fileObj.pdf[Object.keys(fileObj.pdf)[0]];
            boardHtml += `<div class="col"><img src="/uploads${pdfImg.resize || pdfImg.image}" class="img-fluid"></div>`;
        }
    }
    boardHtml += `
        </div>
    </div>
    <div id="board_comment_${board._id}">`;
    if (board.lastComment) {
        boardHtml += `<div class="card-footer">
        <div class="comment d-flex justify-content-between align-items-center">
            <span><strong>${board.lastComment.author}</strong> ${truncateString(board.lastComment.data.content, 15) || ""}</span>
            <span class="badge bg-secondary"><span id="board_comment_${board._id}_commentCounter">${board.lastComment.commentCount}</span> コメント</span>
        </div>
</div>`;
    }
    boardHtml += `</div>
    </div>
    </div>`;
    $("#cardList").html(boardHtml + $("#cardList").html());
    $('#cardList .card').matchHeight();
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

async function connectWebSocket (classId) {
    let connection = new WebSocket(`ws://localhost:3000/ws/connect/${classId}`);

    connection.onmessage = function(event) {
        let getWsData = JSON.parse(event.data);
        console.log(getWsData);
        if (getWsData.type === "postComment") {
            let boardElm = $(`#board_${getWsData.data.boardId}`);
            if (!boardElm) return;
            let boardComment = $(`#board_comment_${getWsData.data.boardId}`);
            if (!boardComment) return;
            boardElm.fadeOut('fast', function() {
                let commentCounterC = $(`#board_comment_${getWsData.data.boardId}_commentCounter`);
                let commentCount = 1;
                if (commentCounterC) {
                    commentCount = Number(commentCounterC.text()) + 1;
                }
                boardComment.html(`<div class="card-footer">
                    <div class="comment d-flex justify-content-between align-items-center">
                        <span><strong>${getWsData.data.author}</strong> ${truncateString(getWsData.data.data.content, 15) || ""}</span>
                        <span class="badge bg-success" id="board_comment_${getWsData.data.boardId}_commentCounter">${commentCount} コメント</span>
                    </div>`);
                $('#cardList .card').matchHeight();
                boardElm.fadeIn('fast');
            });
        } else if (getWsData.type === "createBoard") {
            addBoard(getWsData.data);
        }
    };

    connection.onclose = function() {
        bootstrap.showToast({ body: "サーバーから切断されました。再接続します。", toastClass: "text-bg-danger"})
        setTimeout(() => { connectWebSocket(classId); }, 5000);
    };
}

function truncateString (str, maxLength) {
    if (!str) return null;
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
}