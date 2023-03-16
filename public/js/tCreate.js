$(function(){
    $("#createClassButton").click(function(event){
        $.ajax({
            type: "POST",
            url: "/api/class/create",
            data: JSON.stringify({
                classId: $('#classId').val(),
                tPassword: $('#adminPassword').val()
            }),
            contentType: 'application/json',
            dataType: "json"
        })
            .done(function(data, textStatus, jqXHR){
                $.cookie(`adminPass_${data.data._id}`, $('#adminPassword').val());
                window.location.href = `/admin/${data.data.classId}`
            })
            .fail(function(jqXHR, textStatus, errorThrown){
                $('#errorMsg').text(jqXHR.responseJSON.msg);
            });
    });
    $("#adminPassword").keypress(function(e){
        if(e.which == 13){
            $("#createClassButton").click();
        }
    });
    $("#classId").keypress(function(e){
        if(e.which == 13){
            $("#createClassButton").click();
        }
    });
});