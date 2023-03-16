let nowPage = 1;
function getBoard (classId) {
    $.ajax({
        type: "GET",
        url: `/api/board/${classId}/list?page=${nowPage}`,
        contentType: 'application/json',
        dataType: "json"
    })
        .done(function(data, textStatus, jqXHR){
            console.log(data);
        })
        .fail(function(jqXHR, textStatus, errorThrown){
            $('#errorMsg').text(jqXHR.responseJSON.msg);
        });
}