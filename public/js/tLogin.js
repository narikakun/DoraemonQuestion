$(function(){
    $("#classAdminLoginButton").click(function(event){
        $("#loading-overlay").fadeIn(300);
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
                $("#loading-overlay").fadeOut(300);
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