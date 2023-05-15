$(function() {
    $.ajax({
        type: "GET",
        url: `/api/board/${classId}/board/${boardId}`,
        contentType: 'application/json',
        dataType: "json"
    })
        .done(async function(data, textStatus, jqXHR){
            let boardData = data.data;
            let boardObj = boardData.data;
            $("#authorName").text(`投稿者: ${boardData.author}`);
            $("#postTitle").text(boardObj.title);
            $("#createdAt").text(new Date(boardData.createdAt).toLocaleString("ja"));
            $("#content").html(boardObj.content ? boardObj.content.replace(/\r\n/g, '<br />') : "");
            let imgHtml = "";
            for (const fileObj of boardObj.files) {
                let showModalJs = `data-bs-toggle="modal" data-bs-target="#lightboxModal" onclick='showModal(${JSON.stringify([fileObj.key])})'`;
                let pdfList = [];
                if (fileObj.pdf) {
                    for (const pdfKey in fileObj.pdf) {
                        pdfList.push(fileObj.pdf[pdfKey].image);
                    }
                    showModalJs = `onclick='window.open("${serviceUrl}/uploads${String(fileObj.key)}")'`;
                }
                imgHtml += `<div class="col">
                    <div class="card shadow-sm card-link" ` + showModalJs + `>
                        <img src="/uploads${pdfList[0]?pdfList[0] : fileObj.key}" class="bd-placeholder-img card-img-top">
                        <div class="card-body">
                            <p class="card-text">${fileObj.filename}</p>
                        </div>
                    </div>
                </div>`;
            }
            $("#imgList").html(imgHtml);
            if (boardData.author == $.cookie('username')) {
                $("#replyBox").html(`<div class="card mb-3">
                    <div class="card-body">
                        <h4>コメント新規投稿</h4>
                        <p id="errorMsg2" style="color: red;"></p>
                        <div class="mb-3">
                            <label for="exampleInputEmail1" class="form-label">内容</label>
                            <textarea class="form-control" id="contentInput" rows="3"></textarea>
                        </div>
                        <div class="mb-3">
                            <label for="formFileGroup" class="form-label">画像ファイル</label>
                            <div class="input-group mb-3" id="formFileGroup">
                                <input type="file" class="form-control" id="inputFile01">
                                <button class="btn btn-outline-secondary" type="button" id="removeInput01">取消</button>
                            </div>
                            <div id="fileHelp" class="form-text">png, jpg, pdfが利用できます。ファイルは5MBまでアップロードできます。</div>
                        </div>
                        <button type="button" class="btn btn-primary" id="postCommentButton">ボードの中に投稿する</button>
                    </div>
                </div>`);
                $("#postCommentButton").click(function (event) {
                    $('#errorMsg2').text("");
                    $("#loading-overlay").fadeIn(300);
                    let fd = new FormData();
                    for (let i = 1; i <= 1; i++) {
                        let file = $("#inputFile0" + i).prop('files')[0];
                        if (file) {
                            fd.append("files", file, encodeURIComponent(`${file.name}`));
                        }
                    }
                    let content = $("#contentInput").val();
                    if (content) {
                        fd.append("content", content);
                    }
                    $.ajax({
                        type: "POST",
                        url: `/api/comment/${boardId}/post`,
                        data: fd,
                        dataType: "json",
                        cache: false,
                        processData: false,
                        contentType: false,
                    })
                        .done(function (data, textStatus, jqXHR) {
                            $("#loading-overlay").fadeOut(300);
                            $("#contentInput").val("");
                            $("#inputFile01").val("");
                        })
                        .fail(function (jqXHR, textStatus, errorThrown) {
                            $('#errorMsg2').text(jqXHR.responseJSON.msg);
                            $("#loading-overlay").fadeOut(300);
                        });
                });

                $("#removeInput01").click(function (e) {
                    $("#inputFile01").val("");
                });
            }
            $.ajax({
                type: "GET",
                url: `/api/comment/${boardId}/list`,
                contentType: 'application/json',
                dataType: "json"
            })
                .done(async function(data, textStatus, jqXHR){
                    for (const comment of data.comments) {
                        addComment(comment);
                    }
                    await connectWebSocket(classId);
                })
                .fail(function(jqXHR, textStatus, errorThrown){
                    $('#errorMsg').text(jqXHR.responseJSON.msg);
                });
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            $("#loading-overlay").fadeOut(300);
            $('#errorMsg').text(jqXHR.responseJSON.msg);
        });

});

async function addComment (comment) {
    let replyBoxHtml = "";
    let imgCmtResult = null;
    if (comment.data.files) {
        if (comment.data.files[0]) {
            imgCmtResult = await getCmtImg(comment._id);
        }
    }
    replyBoxHtml += `
        <div class="col" id="comment_${comment._id}">
            <div class="card mb-3">
                <div class="row g-0">
                    <div class="col-md-8">
                        <div class="card-body">
                            <h5 class="card-title">${comment.author}</h5>
                            <p class="card-text">${comment.data.content ? comment.data.content.replace(/\r\n/g, '<br />') : ""}</p>
                            <p class="card-text"><small class="text-muted">${new Date(comment.createdAt).toLocaleString("ja")}</small></p>
                        </div>
                    </div>
            `;
    if (imgCmtResult) {
        for (const fileKey in imgCmtResult.files) {
            let file = imgCmtResult.files[fileKey];
            let showModalJs = `showModal(['${file.url}'])`;
            if (file.isPdf) {
                showModalJs = `showCmtPdf('${comment._id}', '${fileKey}')`;
            }
            replyBoxHtml += `
                <div class="col-md-4 card-link" data-bs-toggle="modal" data-bs-target="#lightboxModal" onclick="${showModalJs}">
                    <div class="card bg-dark text-white">
                        <img src="${file.url}" class="bd-placeholder-img card-img-top">
                        <div class="card-img-overlay">
                            <p class="card-text">${file.name}</p>
                        </div>
                    </div>
                </div>`;
        }
    }
    replyBoxHtml += `
            </div>
        </div>
    </div>`;
    $("#replyList").html(replyBoxHtml + $("#replyList").html());
}

async function connectWebSocket (classId) {
    let connection = new WebSocket(`ws://localhost:3000/ws/connect/${classId}`);

    connection.onmessage = function(event) {
        let getWsData = JSON.parse(event.data);
        if (getWsData.type === "postComment") {
            if (getWsData.data.boardId !== boardId) return;
            addComment(getWsData.data);
        }
    };

    connection.onclose = function() {
        bootstrap.showToast({ body: "サーバーから切断されました。再接続します。", toastClass: "text-bg-danger"})
        setTimeout(() => { connectWebSocket(classId); }, 5000);
    };
}