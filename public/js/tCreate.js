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
            dataType: "json",
        })
            .done(function(data, textStatus, jqXHR){
                console.log(data);
            })
            .fail(function(jqXHR, textStatus, errorThrown){
                console.log(jqXHR.responseJSON);
            });
    });
});