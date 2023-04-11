let nowData = null;

function getBoard (classId, pageNum = 1) {
    $("#cardList").html(" ");
    $.ajax({
        type: "GET",
        url: `/api/board/${classId}/list?page=${pageNum}`,
        contentType: 'application/json',
        dataType: "json"
    })
        .done(async function(data, textStatus, jqXHR){
            $("#loading-overlay").fadeOut(300);
            for (const datum of data.boards.reverse()) {
                await addBoard(datum);
            }
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
            $("#loading-overlay").fadeOut(300);
            $('#errorMsg').text(jqXHR.responseJSON.msg);
        });
}

async function addBoard (board) {
    let boardHtml = "";
    boardHtml += `
<div class="col d-flex" id="board_${board._id}">
    <div class="card mb-3 card-link flex-grow-1" onclick="window.location.href='/class/${board.classId}/board/${board._id}'">
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0">${board.author}</h5>
                <small class="text-muted">${new Date(board.createdAt).toLocaleString("ja")}</small>
            </div>
            <hr>
            <p class="card-text">${truncateString(board.data.content, 70)||""}</p>
            <div class="row row-cols-3 g-3">`;
    if (board.data.files) {
        let showMimeType = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
        let images = board.data.files.filter(f => showMimeType.includes(f.mimetype));
        if (images[0]) {
            let imgResult = await getImg(board.classId, board._id);
            for (const fileElm of imgResult.files) {
                boardHtml += `<div class="col"><img src="${fileElm.url}" class="img-fluid"></div>`;
            }
        }
    }
    boardHtml += `
            </div>
        </div>
        <div id="board_comment_${board._id}">
        </div>
    </div>
</div>`;
    $("#cardList").html(boardHtml + $("#cardList").html());
    $('#cardList .card').matchHeight();
    $.ajax({
        type: "GET",
        url: `/api/comment/${board._id}/list`,
        contentType: 'application/json',
        dataType: "json"
    })
        .done(async function(commentData, textStatus, jqXHR){
            if (commentData.comments[0]) {
                let comment = commentData.comments[0];
                $(`#board_comment_${board._id}`).html(`<div class="card-footer">
                    <div class="comment d-flex justify-content-between align-items-center">
                        <span><strong>${comment.author}</strong> ${truncateString(comment.data.content, 15) || ""}</span>
                        <span class="badge bg-secondary"><span id="board_comment_${board._id}_commentCounter">${commentData.commentCount}</span> コメント</span>
                    </div>`);
                $('#cardList .card').matchHeight();
            }
        })
        .fail(function(jqXHR, textStatus, errorThrown){
            $('#errorMsg').text(jqXHR.responseJSON.msg);
        });
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

async function getImg(classId, boardId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/api/board/${classId}/image/${boardId}`,
            type: "GET",
            async: true,
        }).then(
            function (result) {
                resolve(result);
            },
            function () {
                reject();
            }
        )
        }
    )
}

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