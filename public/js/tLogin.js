$(function(){
    $("#classAdminLoginButton").click(function(event){
        $.ajax({
            type: "POST",
            url: "/api/class/teacherAuth",
            data: JSON.stringify({
                classId: $('#classId').val(),
                tPassword: $('#adminPassword').val()
            }),
            contentType: 'application/json',
            dataType: "json"
        })
            .done(function(data, textStatus, jqXHR){
                window.location.href = `/admin/${data.classId}`
            })
            .fail(function(jqXHR, textStatus, errorThrown){
                $('#errorMsg').text(jqXHR.responseJSON.msg);
            });
    });
    $("#adminPassword").keypress(function(e){
        if(e.which == 13){
            $("#classAdminLoginButton").click();
        }
    });
    $("#classId").keypress(function(e){
        if(e.which == 13){
            $("#classAdminLoginButton").click();
        }
    });
});