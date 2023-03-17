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
                        </div>`;
                if ($.cookie(`adminPass_${classId}`)) {
                    imgHtml += `
                        <div class="card shadow-sm mt-2">
                            <div class="card-body">
                                <div class="d-flex">
                                    <a href="${img.url}" download="${img.name}" target="_blank" class="btn btn-sm btn-outline-secondary">画像をダウンロード</a>
                                    ${img.isPdf?`<a href="${img.pdfUrl}" download="${img.name}" target="_blank" class="btn btn-sm btn-outline-secondary mx-3">PDFをダウンロード</a>`:""}
                                </div>
                            </div>
                        </div>`;
                }
                imgHtml += `</div>`;
            }
            $("#imgList").html(imgHtml);
            if ($.cookie(`adminPass_${classId}`) || data.data.author == $.cookie('username')) {
                $("#replyBox").html(`<div class="card">
                    <div class="card-body">
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
                        <button type="button" class="btn btn-primary">ボードの中に投稿する</button>
                    </div>
                </div>`);
            }
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