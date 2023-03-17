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
            $("#loading-overlay").fadeOut(300);
            let imgHtml = "";
            let imgResult = [];
            if (data.data.data.files) {
                imgResult = await getImg(classId, boardId);
            }
            for (const imgKey in imgResult.files) {
                let img = imgResult.files[imgKey];
                let showModalJs = `showModal(['${img.url}'])`;
                if (img.isPdf) {
                    showModalJs = `showPdf('${classId}', '${boardId}', '${imgKey}')`;
                }
                imgHtml += `<div class="col">
                        <div class="card shadow-sm card-link" data-bs-toggle="modal" data-bs-target="#lightboxModal" onclick="${showModalJs}">
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
            $("#loading-overlay").fadeOut(300);
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

async function showPdf (classId, boardId, key) {
    $("#loading-overlay").fadeIn(300);
    let pdfImages = await getPdf(classId, boardId, key);
    showModal(pdfImages.files.map(f => f.url));
    $("#loading-overlay").fadeOut(300);
}

async function getPdf(classId, boardId, key) {
    return new Promise((resolve, reject) => {
            $.ajax({
                url: `/api/board/${classId}/pdf/${boardId}/${key}`,
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