if (!window.location.origin) {
    window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
}
String.prototype.endsWith = function (s) {
    return this.length >= s.length && this.substr(this.length - s.length) === s;
};
$(document).ready(function () {
    PopulateUserNavigation();
    $('.login-form').parent().submit(function (event) {
        $('#submit-login-form').addClass('loading');
        event.preventDefault();
        $.ajax({
            type: "POST",
            url: "/Creatime.Profile/User/LogOn",
            data: $(this).serialize(),
            success: function (data) {
                switch (data) {
                    case "notApproved":
                        {
                            $('#login-form-errors-container')[0].innerHTML = "";
                            $('#login-form-errors-container').append("<li>Для входа необходимо подтверждение Email</li>");
                            $('#submit-login-form').removeClass('loading');
                            break;
                        }
                    case "success":
                        {
                            setCookie('needVerificationEmail', false);
                            window.location.reload();
                            break;
                        }
                    default:
                        {
                            $('#login-form-errors-container')[0].innerHTML = "";
                            $('#login-form-errors-container').append("<li>Неверные учетные данные</li>");
                            $('#submit-login-form').removeClass('loading');
                        }
                }
            }
        });
    });
    $('.reg-form').parent().submit(function (event) {
        event.preventDefault();
        $('#reg-form-errors-container')[0].innerHTML = "";
        var emailInput = $('.reg-form').find('#reg-email')[0];
        emailInput.value = emailInput.value.trim();
        var regEmail = emailInput.value;
        var regFirstname = $('.reg-form').find('#reg-firstname')[0].value;
        var regLastName = $('.reg-form').find('#reg-lastName')[0].value;
        var regPsw = $('.reg-form').find('#password')[0].value;
        var regConfirmPsw = $('.reg-form').find('#confirmPassword')[0].value;
        var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        var isEmailValid = re.test(regEmail);
        var isFirstnameValid = regFirstname !== "";
        var isPasswordValid = (regPsw.length >= 7 && regConfirmPsw.length >= 7 && regPsw === regConfirmPsw);
        var isLastNameValid = regLastName !== "";
        if (isEmailValid && isFirstnameValid && isPasswordValid && isLastNameValid) {
            $('#submit-reg-form').addClass('loading');
            $.ajax({
                type: "POST",
                url: "/Creatime.Profile/User/Register",
                data: $(this).serialize(),
                success: function (data) {
                    // $('#submit-reg-form').removeClass('loading');
                    if (data === "ChallengeEmailSent") {
                        // window.location.replace(document.location.origin);
                        //window.location.reload();
                        //window.location.href = document.location.origin + "/Creatime.Profile/User/ChallengeEmailSent";
                        setCookie('needVerificationEmail', true);
                        location.reload();
                    }
                    else {
                        $('#reg-form-errors-container').append("<li>Пользователь с таким Email уже существует</li>");
                        $('#submit-reg-form').removeClass('loading');
                    }
                },
                error: function (data) {
                    if (data !== null) {
                        alert(data);
                    }
                }
            });
        }
        else {
            if (!isEmailValid) {
                $('#reg-form-errors-container').append("<li>Неверный адрес электронной почты</li>");
            }
            if (!isPasswordValid) {
                $('#reg-form-errors-container').append("<li>Длина пароля должна превышать 7 символов. Пароли должны совпадать</li>");
            }
            if (!isFirstnameValid) {
                $('#reg-form-errors-container').append("<li>Введите имя пользователя</li>");
            }
            if (!isLastNameValid) {
                $('#reg-form-errors-container').append("<li>Введите фамилию</li>");
            }
        }
    });
    $('#rec-psw-fields').parent().submit(function (event) {
        event.preventDefault();
        var email = $('#rec-username-container').find('#username')[0].value;
        var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        if (re.test(email)) {
            $('#submit-recover-form').addClass('loading');
            $.ajax({
                type: "POST",
                url: "/Creatime.Profile/User/RequestLostPassword",
                data: $(this).serialize(),
                success: function (data) {
                    //$('#submit-recover-form').removeClass('loading');
                    if (data !== "") {
                        window.location.replace(document.location.origin);
                    }
                    else {
                        $('#submit-recover-form').removeClass('loading');
                        $('#rec-form-errors-container')[0].innerHTML = "";
                        $('#rec-form-errors-container').append("<li>Неверные адрес электронной почты</li>");
                    }
                }
            });
        }
        else {
            $('#rec-form-errors-container')[0].innerHTML = "";
            $('#rec-form-errors-container').append("<li>Неверные адрес электронной почты</li>");
        }
    });
    if (getCookie("timezone") === undefined) {
        setCookie("timezone", new Date().getTimezoneOffset());
    }
    if (getCookie('needVerificationEmail') === "true") {
        showNeedVerificationMessage();
    }
    else {
        hideNeedVerificationMessage();
    }
    ManageExternalReg();
    $('#accept-reg').change(function () {
        $('#submit-reg-form').prop("disabled", !this.checked);
        if (this.checked) {
            $('#submit-reg-form').removeClass("disabled");
        }
        else {
            $('#submit-reg-form').addClass("disabled");
        }
    });
});
$(document).on("click", "#reg-dialog-link", OpenRegWindow);
$(document).on("click", "#open-reg-window", OpenRegWindow);
$(document).on("click", "#open-login-window", OpenLoginWindow);
$(document).on("click", "#noautorized-open-reg-window", OpenRegWindow);
$(document).on("click", "#noautorized-open-login-window", OpenLoginWindow);
$(document).on("click", "#recover-psw-link", OpenRecoverPswWindow);
$(document).on("click", ".close-login-modal", CloseLoginModal);
$(document).on("click", ".close-registration-modal", CloseRegistrationModal);
$(document).on("click", ".close-recover-password-modal", CloseRecoveryPasswordModal);
$(document).on("click", "#submit-login-form", Login);
function ManageExternalReg() {
    if (getCookie('external-reg-data') !== undefined && getCookie('external-reg-data') !== "") {
        var extRegData = getCookie('external-reg-data');
        setCookie('external-reg-data', '');
        if (extRegData.indexOf('vk.com') !== -1) {
            $('#reg-firstname').val(extRegData.split('@')[0].split('.')[0]);
            $('#reg-lastName').val(extRegData.split('@')[0].split('.')[1]);
            $('#reg-vkId').val(extRegData);
        }
        else {
            $('#reg-email').val(extRegData.replace("facebook-", ""));
            $('#reg-vkId').val(extRegData);
        }
        $('#open-reg-window').trigger('click');
    }
}
//function clearData() {
//    if (!window.location.pathname.endsWith("Thinks")) {
//        return false;   // cancels the default copy operation
//    }
//}
//function OpenRegWindow() {
//    var isOpen = $("#reg-dialog").is(':visible');
//    if (!isOpen) {
//        if ($("#login-dialog").is(':visible')) {
//            $("#login-dialog").dialog('close');
//        }
//        if ($('.fixed-overlay')[0] === undefined) {
//            $("#reg-dialog").dialog({
//                width: 355, beforeClose: function (event) {
//                    $('.fixed-overlay').css({ 'display': 'none' });
//                }
//    , create:
//        $(document).click(function (event) {
//            if ($(event.target.offsetParent)[0] === undefined && !$(event.target).is('#open-reg-window')) {
//                $("#reg-dialog").dialog('close');
//            }
//        })
//            });
//            $("#reg-dialog")[0].parentNode.classList.add('modal-registration');
//            $('.modal-registration').css({ 'display': 'inline-block', 'position': 'static', 'vertical-align': 'middle' });
//            $('.modal-registration').wrapAll('<div class="fixed-overlay">');
//        } else {
//            $("#reg-dialog").dialog({
//                width: 355, beforeClose: function (event) {
//                    $('.fixed-overlay').css({ 'display': 'none' });
//                },
//                appendTo: ".fixed-overlay"
//    , create:
//        $(document).click(function (event) {
//            if ($(event.target.offsetParent)[0] === undefined && !$(event.target).is('#open-reg-window')) {
//                $("#reg-dialog").dialog('close');
//            }
//        })
//            });
//            $("#reg-dialog")[0].parentNode.classList.add('modal-registration');
//            $('.modal-registration').css({ 'display': 'inline-block', 'position': 'static', 'vertical-align': 'middle' });
//            $('.fixed-overlay').css({ 'display': 'block' });
//        }
//        $(".ui-dialog-titlebar-close").html("✖");
//    }
//    else {
//        $("#reg-dialog").dialog('close');
//    }
//}
function OpenRegWindow() {
    if ($("#login-dialog").is(':visible')) {
        CloseLoginModal();
    }
    $("#reg-dialog").removeClass("hide");
    $(".fixed-overlay").removeClass("hide");
    $(document).bind('click.closedRegistrationModal', function (event) {
        if ($(event.target.offsetParent)[0] === undefined && !$(event.target).is('#open-reg-window') || $(event.target).hasClass('fixed-overlay')) {
            CloseRegistrationModal();
        }
    });
}
//function OpenLoginWindow() {
//    var isOpen = $("#login-dialog").is(':visible');
//    if (!isOpen) {
//        if ($("#reg-dialog").is(':visible')) {
//            $("#reg-dialog").dialog('close');
//        }       
//        $("#login-dialog").dialog({ width: 355});
//        var target = $('#open-login-window');
//        $("#login-dialog").dialog("widget").position({
//            my: 'right bottom',
//            at: 'top-10',
//            of: target
//        });
//        $("#login-dialog")[0].parentNode.classList.add('modal-login');
//        $(".ui-dialog-titlebar-close").html("✖");
//    }
//    else {
//        $("#login-dialog").dialog('close');
//    }
//    return false;
//}
function OpenLoginWindow() {
    var isOpen = $("#login-dialog").is(':visible');
    if (!isOpen) {
        OpenModalWindow($('.login-box')[0], $('#login-dialog'), false);
    }
    else {
        CloseLoginModal();
    }
}
//function OpenRecoverPswWindow() {
//    $("#login-dialog").dialog('close');
//    if ($('.fixed-overlay')[0] === undefined) {
//        $("#recover-psw-dialog").dialog({
//            width: 355, beforeClose: function (event) {
//                $('.fixed-overlay').css({ 'display': 'none' });
//            }
//        , create:
//            $(document).click(function (event) {
//                if ($(event.target.offsetParent)[0] === undefined && !$(event.target).is('#recover-psw-link')) {
//                    $("#recover-psw-dialog").dialog('close');
//                }
//            })
//        });
//        $("#recover-psw-dialog")[0].parentNode.classList.add('modal-recover-password');
//        $('.modal-recover-password').css({ 'display': 'inline-block', 'position': 'static', 'vertical-align': 'middle' });
//        $('.modal-recover-password').wrapAll('<div class="fixed-overlay">');
//    } else {
//        $("#recover-psw-dialog").dialog({
//            width: 355, beforeClose: function (event) {
//                $('.fixed-overlay').css({ 'display': 'none' });
//            }, appendTo: ".fixed-overlay"
//        , create:
//            $(document).click(function (event) {
//                if ($(event.target.offsetParent)[0] === undefined && !$(event.target).is('#recover-psw-link')) {
//                    $("#recover-psw-dialog").dialog('close');
//                }
//            })
//        });
//        $("#recover-psw-dialog")[0].parentNode.classList.add('modal-recover-password');
//        $('.modal-recover-password').css({ 'display': 'inline-block', 'position': 'static', 'vertical-align': 'middle' });
//        $('.fixed-overlay').css({ 'display': 'block' });
//    }
//    $(".ui-dialog-titlebar-close").html("✖");
//}
function OpenRecoverPswWindow() {
    CloseLoginModal();
    $("#recover-psw-dialog").removeClass("hide");
    $(".fixed-overlay").removeClass("hide");
    $(document).bind('click.closedRecPassModal', function (event) {
        if ($(event.target.offsetParent)[0] === undefined || $(event.target).hasClass('fixed-overlay')) {
            CloseRecoveryPasswordModal();
        }
    });
}
function PopulateUserNavigation() {
    $.ajax({
        url: "/Creatime.Profile/User/GetUserVM",
        type: 'GET',
        traditional: true,
        contentType: 'application/x-www-form-urlencoded',
        cache: false,
        success: function (data) {
            if (data !== null && data.length > 0) {
                d = JSON.parse(data);
                if (d.IsAuthorized) {
                    setCookie('needVerificationEmail', false);
                    hideNeedVerificationMessage();
                    $('#is_not_logged').remove();
                    $('#is_logged').removeClass('hide');
                    var areaType = d.IsMentor ? "MentorArea" : "PersonalArea";
                    var uniPhoto = "/Media/Default/Images/avatar_male.png";
                    var photoSrc = d.Profile.UserAvatar.Avatar !== null ? d.Profile.UserAvatar.Avatar.MediaUrl : uniPhoto;
                    var displayAppeal = d.Profile.Appeal !== null ? d.Profile.Appeal : d.UserEmail.split('@')[0];
                    var areaLink = window.location.origin + "/" + areaType;
                    var editProfileLink = areaLink + "/EditProfile";
                    if (d.IsMentor) {
                        $('.lb_bookmark').remove();
                        //for contacts page
                        $('.student-contact-links').addClass('hide');
                    }
                    else {
                        $('.lb_answers').remove();
                        if (d.IsAuthorized) {
                            $('.student-contact-links').removeClass('hide');
                        }
                    }
                    $('.lb-profile-link')[0].href = areaLink;
                    var patternFB = /scontent.xx.fbcdn.net/;
                    if (patternFB.test(photoSrc))
                        $('.lb_avatar')[0].src = photoSrc;
                    else
                        $('.lb_avatar')[0].src = photoSrc + "?dummy=" + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
                    $('.lb_name')[0].innerHTML = displayAppeal;
                    $('.lb_settings')[0].href = editProfileLink;
                    //unread count START
                    var dialogsUrl = "/" + (d.IsMentor ? "MentorArea/Messages" : "PersonalArea/dialogs");
                    $(".lb_messages").append("<span class='lb_counter hide'>0</span>");
                    $("a[href='"+dialogsUrl+"']").append("<span class='lb_counter hide'>0</span>");
                    //unread badges in user navigation START
                    ManageUnreadBadgesInUserNavigation(d.Profile.UnreadCount, d.HasMentor, d.IsMentor);
                    //unread badges in user navigation END
                    $('.lb_messages')[0].href = dialogsUrl;
                }
                else {
                    $('#is_not_logged').removeClass('hide');
                    $('#is_logged').remove();
                    ManageOpenReg();
                }
            }
            else {
                $('#is_not_logged').removeClass('hide');
                $('#is_logged').remove();
                ManageOpenReg();
            }
        }
    });
}
function ManageOpenReg() {
    if (document.location.href.indexOf('#Register') !== -1) {
        $('#open-reg-window').trigger('click');
    }
}
function ManageUnreadBadgesInUserNavigation(unreadCount, hasMentor, isMentor) {
    if (!isMentor) {
        if (d.HasMentor) {
            UpdateMessagesCounters(unreadCount);
        }
        else {
            UpdateUnreadCountNoMentor(unreadCount, isMentor);
            $('.lb_counter').removeClass('hide');
        }
    }
    else {
        UpdateStudentsAnswersCounters();
        UpdateUnreadCountNoMentor(unreadCount, isMentor);
    }
}
function UpdateStudentsAnswersCounters() {
    $.ajax({
        url: "/Creatime.Profile/Answers/GetNumberUnreadAnswers",
        cache: false,
        success: function (result) {
            if (result > 0 && d.IsMentor) {
                $(".lb_answers").append("<span class='lb_counter'>" + result + "</span>");
            }
        }
    });
}
function UpdateUnreadCountNoMentor(unreadCount, isMentor) {
    $.ajax({
        type: "GET",
        url: "/Creatime.Messages/Dialogs/GetSignsReading",
        traditional: true,
        contentType: 'application/x-www-form-urlencoded',
        cache: false,
        success: function (data) {
            if (data && data.length > 0) {
                var dials = JSON.parse(data);
                var uCount = 0;
                for (var i = 0; i < dials.length; i++) {
                    if (!dials[i].Value) {
                        uCount++;
                    }
                }
                if (isMentor) {
                    uCount = unreadCount;
                }
                UpdateMessagesCounters(uCount);
                UpdateStudentsAnswersCounters();
            }
        },
        error: function (error) {
        }
    });
}
function UpdateMessagesCounters(messagesNumber) {
    UpdateNavMessagesCounter(messagesNumber);
    UpdateTopMessagesCounter(messagesNumber);
}
function UpdateNavMessagesCounter(messagesNumber) {
    if (messagesNumber > 0) {
        if (d.IsMentor && $(".navbar-nav").find("a[href='/MentorArea/Messages']").length > 0) {
            $(".navbar-nav").find("a[href='/MentorArea/Messages']").find('.lb_counter').removeClass('hide').text(messagesNumber.toString());
        }
        else if ($(".navbar-nav").find("a[href='/PersonalArea/dialogs']").length > 0) {
            $(".navbar-nav").find("a[href='/PersonalArea/dialogs']").find('.lb_counter').removeClass('hide').text(messagesNumber.toString());
        }
    }
    else {
        $(".navbar-nav").find("a[href='/MentorArea/Messages']").find('.lb_counter').addClass('hide');
        $(".navbar-nav").find("a[href='/PersonalArea/dialogs']").find('.lb_counter').addClass('hide');
    }
}
function UpdateTopMessagesCounter(messagesNumber) {
    if (messagesNumber > 0) {
        $(".lb_messages").find('.lb_counter').removeClass('hide').text(messagesNumber.toString());
    }
    else {
        $(".lb_messages").find('.lb_counter').addClass('hide');
    }
}
function CloseLoginModal() {
    $('#login-dialog').addClass("hide");
}
function CloseRegistrationModal() {
    $('#reg-dialog').addClass("hide");
    $(".fixed-overlay").addClass("hide");
    $(document).unbind("click.closedRegistrationModal");
}
function CloseRecoveryPasswordModal() {
    $('#recover-psw-dialog').addClass("hide");
    $(".fixed-overlay").addClass("hide");
    $(document).unbind("click.closedRecPassModal");
}
function Login() {
    var errors = $('#login-form-errors-container')[0];
    while (errors.hasChildNodes()) {
        errors.removeChild(errors.lastChild);
    }
}
function setCookie(name, value, options) {
    options = options || {};
    var expires = options.expires;
    if (typeof expires === "number" && expires) {
        var d = new Date();
        d.setTime(d.getTime() + expires * 1000);
        expires = options.expires = d;
    }
    if (expires && expires.toUTCString) {
        options.expires = expires.toUTCString();
    }
    value = encodeURIComponent(value);
    var updatedCookie = name + "=" + value;
    for (var propName in options) {
        updatedCookie += "; " + propName;
        var propValue = options[propName];
        if (propValue !== true) {
            updatedCookie += "=" + propValue;
        }
    }
    document.cookie = updatedCookie;
}
function getCookie(name) {
    var matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}
function showNeedVerificationMessage() {
    $('#layout-wrapper').before($('.need-verification-container'));
    $('.need-verification-container').removeClass('hide');
}
function hideNeedVerificationMessage() {
    $('.need-verification-container').addClass('hide');
}