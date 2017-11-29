$(document).ready(function () {
    $(".ui-dialog-titlebar").hide();
    if ($('.custom-scroll')[0] != undefined) {
        $('.custom-scroll').perfectScrollbar();
    }
    if (document.location.pathname.indexOf("MentorArea") >= 0) {
        ReloadNumberUnreadStudentsAnswers();
    }

    $(this).on("click", ".modal-close", function () {
        if ($(this).closest(".dialog").length == 1) {
            $(this).closest(".dialog").dialog("close");
        }
        else {
            $(this).closest(".fixed-overlay").addClass("hide");
        }

    });
    InitBackHref();
    InitSearchForm();
    InitTables();
});

$(window).bind("beforeunload", function () {
    if ($(".purchase-assigned[data-ischanged='true']").length > 0) {
        return "Остались не сохранённые изменения!";
    }
});

function OpenDialog(e, ui) {
    $(".modal-close").each(function () {
        if ($(this).closest(".dialog").attr("id") != $(e.target).attr("id"))
            $(this).click();
    });
}

function OpenModalWindow(itemAt, modal, overItemAt) {
    modal.removeClass('hide');
    modal.offset({ left: 0, top: 0 });
    var top = $(itemAt).offset().top + (overItemAt ? 0 : $(itemAt)[0].clientHeight);
    top += parseInt(modal.css("margin-top").split("px")[0]);
    top -= parseInt(modal.css("margin-bottom").split("px")[0]);
    var left = $(itemAt).offset().left - modal[0].clientWidth / 2;
    left += parseInt(modal.css("margin-left").split("px")[0]);
    left -= parseInt(modal.css("margin-right").split("px")[0]);
    var clientWindowRightPoint = $("body").scrollLeft() + $("body")[0].clientWidth - modal[0].clientWidth;
    if (left > clientWindowRightPoint) {
        if (clientWindowRightPoint > 0) {
            left = clientWindowRightPoint - 10;
        } else {
            left = 0;
        }
    }
    if (left < 0) {
        left = 0;
    }
    var clientWindowTopPoint = $("body").scrollTop() + document.documentElement.clientHeight;
    var modalBottomPoint = modal[0].clientHeight + top;
    if (modalBottomPoint > clientWindowTopPoint) {
        if (!$(itemAt).hasClass("aul_item"))
            top = $(itemAt).offset().top - modal[0].clientHeight - (overItemAt ? 0 : $(itemAt)[0].clientHeight);
    }
    if (top < 0) {
        top = $(itemAt).offset().top + (overItemAt ? 0 : $(itemAt)[0].clientHeight);
        top += parseInt(modal.css("margin-top").split("px")[0]);
        top -= parseInt(modal.css("margin-bottom").split("px")[0]);
    }
    modal.offset({ left: left, top: top });
}
function ReloadNumberUnreadStudentsAnswers() {
    $.ajax({
        url: "/Creatime.Profile/Answers/GetNumberUnreadAnswers",
        cache: false,
        success: function (result) {
            var counterSpan = $("#aside-first").find("a[href='/MentorArea/StudentAnswers']").find(".lb_counter");
            if (result > 0) {
                if (counterSpan[0] != undefined) {
                    counterSpan.text(result);
                } else {
                    $("#aside-first").find("a[href='/MentorArea/StudentAnswers']").append("<span class='lb_counter'>" + result + "</span>");
                    $(".lb_answers").find('.lb_counter').removeClass('hide').text(result.toString());
                }
            }
            else {
                counterSpan.addClass("hide");
                $(".lb_answers").find('.lb_counter').addClass('hide');
            }
        }
   });
}
function InitHomePageCarousel() {
    var backgroundContainer = document.createElement("div");
    backgroundContainer.className = "background-container";
    $('#engage-courusel').find(".owl-wrapper-outer").append(backgroundContainer);
    $('#engage-courusel').find(".owl-wrapper-outer").append("<a href='AboutProject/Guide' class=owo-text><p>путеводитель</p><p>по проекту</p></a>");
}

function InitBackHref() {
    var backHref = $('#generalBackRef');
    if (!($(backHref).hasClass("back-href-content")))
        $('#generalBackRef').prop('href', $('.breadcrumb li').eq(-2).find('a').prop('href'));
    if ($("#caseBackRef").length) {
        $("#caseBackRef").removeClass("hide");
        $("#generalBackRef").addClass("hide");
    }

    var mBackHref = $('.back-href.back-media');
    if(mBackHref.length > 0)
        $('.back-href.back-media').prop('href', $('.breadcrumb li').eq(-2).find('a').prop('href'));
}

//document.addEventListener("DOMNodeInserted", function (ev) {
//    webshims.setOptions('forms-ext', { types: 'date' });
//    webshims.polyfill('forms forms-ext');
//}, false);
$(function () {
    $(".personal-area-helicopter-wrapper").click(
        function () {
            window.location.href = $(this).find("a").attr("href");
        });
    $(".mediateka-wrapper .article-wrapper").click(
    function () {
        window.location.href = $(this).find("a").attr("href");
    });
});

function InitSearchForm() {
    $('.search-form').attr("title", "Поиск");
    var searchButton = $('<button class="search-button"></button>');
    $('.search-form').find('.header-search-img').append(searchButton);

    //add button to search search and search result form
    var target = $('.zone-content').find('.search-img');
    if (target[0] != undefined) {
        var btn = $('<button class="search-form-button">');
        target.append(btn);
    }
}
function InitTables() {
    $("table").each(function () {
        var target = $(this)[0];
        target.style.maxWidth = target.style.width;
        target.style.width = "";
    });

}

