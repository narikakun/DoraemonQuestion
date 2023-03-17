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
            let cardHtml = "";
            $("#loading-overlay").fadeOut(300);
            for (const datum of data.boards) {
                let thuImg = null;
                if (datum.data.files) {
                    let showMimeType = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
                    let images = datum.data.files.filter(f => showMimeType.includes(f.mimetype));
                    if (images[0]) {
                        let imgResult = await getImg(classId, datum._id);
                        if (imgResult.files[0]) {
                            thuImg = imgResult.files[0].url;
                        }
                    }
                }
                cardHtml += `
                <div class="col" id="board_${datum._id}">
                    <div class="card shadow-sm card-link" onclick="window.location.href='/class/${datum.classId}/board/${datum._id}'">
                        <img class="bd-placeholder-img card-img-top" width="100%" src="${thuImg?thuImg:""}">
                        <div class="card-body">
                            <h5 class="card-title">${datum.author}</h5>
                            <h6 class="card-subtitle mb-2 text-muted">${new Date(datum.createdAt).toLocaleString("ja")}</h6>
                            <p class="card-text">${datum.data.content||""}</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="btn-group">
                                    <button type="button" class="btn btn-sm btn-outline-secondary">View</button>
                                    <button type="button" class="btn btn-sm btn-outline-secondary">Edit</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
            }
            $("#cardList").html(cardHtml);
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