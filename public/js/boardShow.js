function getBoard (classId, boardId) {
    $.ajax({
        type: "GET",
        url: `/api/board/${classId}/board/${boardId}`,
        contentType: 'application/json',
        dataType: "json"
    })
        .done(async function(data, textStatus, jqXHR){
            $("#authorName").text(data.data.author);
            $("#content").text(data.data.data.content);
            let imgHtml = "";
            let imgResult = [];
            if (data.data.data.files) {
                imgResult = await getImg(classId, boardId);
            }
            for (const img of imgResult.files) {
                imgHtml += `<div class="col">
                        <div class="card shadow-sm card-link" data-bs-toggle="modal" data-bs-target="#lightboxModalFullscreen" data-bs-lightbox="${img.url}">
                            <img src="${img.url}" class="bd-placeholder-img card-img-top">
                            <div class="card-body">
                                <p class="card-text">${img.name}</p>
                            </div>
                        </div>
                    </div>`;
            }
            $("#imgList").html(imgHtml);
        })
        .fail(function(jqXHR, textStatus, errorThrown){
            $('#errorMsg').text(jqXHR.responseJSON.msg);
        });
}

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