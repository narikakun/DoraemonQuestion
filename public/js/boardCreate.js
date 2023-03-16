$(function(){
    $("#createBoardButton").click(function(event){
        let fd = new FormData();
        let file01 = $("#inputFile01").prop('files')[0];
        if (file01) {
            fd.append("files[]", file01);
        }
        let file02 = $("#inputFile02").prop('files')[0];
        if (file02) {
            fd.append("files[]", file02);
        }
        let file03 = $("#inputFile03").prop('files')[0];
        if (file03) {
            fd.append("files[]", file03);
        }
        let content = $("contentInput").val();
        if (content) {
            fd.append("content", content);
        }
        $.ajax({
            type: "POST",
            url: `/api/board/${classId}/create`,
            data: fd,
            dataType: "json",
            cache: false,
            processData: false,
            contentType: false,
        })
            .done(function(data, textStatus, jqXHR){
                console.log(data);
            })
            .fail(function(jqXHR, textStatus, errorThrown){
                $('#errorMsg').text(jqXHR.responseJSON.msg);
            });
    });

    $("#removeInput01").click(function (e) {
        $("#inputFile01").val("");
    });
    $("#removeInput02").click(function (e) {
        $("#inputFile02").val("");
    })
    $("#removeInput03").click(function (e) {
        $("#inputFile03").val("");
    })
});