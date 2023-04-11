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
<div class="col" id="board_${board._id}">
    <div class="card mb-3 card-link" onclick="window.location.href='/class/${board.classId}/board/${board._id}'">
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
    </div>
</div>`;
    $("#cardList").html(boardHtml + $("#cardList").html());
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

    connection.onopen = function(event) {
        console.log(`connect`, event.data);
    };

    connection.onerror = function(error) {
        alert("エラーが発生しました。");
        console.error(error);
    };

    connection.onmessage = function(event) {
        console.log("message", event.data);
    };

    connection.onclose = function() {
        alert("サーバーから切断されました。再接続します。");
        setTimeout(() => { connectWebSocket(); }, 5000);
    };
}

function truncateString (str, maxLength) {
    if (!str) return null;
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
}