let nowData = null;

function getBoard (classId, pageNum = 1) {
    $("#cardList").html(" ");
    $.ajax({
        type: "GET",
        url: `/api/board/${classId}/list?page=${pageNum}`,
        contentType: 'application/json',
        dataType: "json"
    })
        .done(function(data, textStatus, jqXHR){
            let cardHtml = "";
            for (const datum of data.boards) {
                cardHtml += `
                <div class="col" id="board_${datum._id}">
                    <div class="card shadow-sm">
                        <img class="bd-placeholder-img card-img-top" width="100%" src="https://cdn.discordapp.com/attachments/1070991874120237076/1071073977134481468/discord.png">
                        <div class="card-body">
                            <h5 class="card-title">${datum.author}</h5>
                            <h6 class="card-subtitle mb-2 text-muted">${new Date(datum.createdAt).toLocaleString("ja")}</h6>
                            <p class="card-text">${datum.data.content}</p>
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
            console.log(data);
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