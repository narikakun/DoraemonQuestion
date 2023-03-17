$(function(){
    let cookieUsername = $.cookie("username");
    if (cookieUsername) {
        $("#username").val(cookieUsername);
    }
    $("#classLoginButton").click(function(event){
        $("#loading-overlay").fadeIn(300);
        $.ajax({
            type: "POST",
            url: "/api/class/auth",
            data: JSON.stringify({
                classId: $('#classId').val(),
                username: $('#username').val()
            }),
            contentType: 'application/json',
            dataType: "json"
        })
            .done(function(data, textStatus, jqXHR){
                window.location.href = `/class/${data.classId}`
            })
            .fail(function(jqXHR, textStatus, errorThrown){
                $("#loading-overlay").fadeOut(300);
                $('#errorMsg').text(jqXHR.responseJSON.msg);
            });
    });
    $("#username").keypress(function(e){
        if(e.which == 13){
            $("#classLoginButton").click();
        }
    });
    $("#classId").keypress(function(e){
        if(e.which == 13){
            $("#classLoginButton").click();
        }
    });
});