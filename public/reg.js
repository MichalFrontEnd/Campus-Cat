const showPet = $("#show_pet");
const regForm = $(".reg_form");
const hidePet = $("#hide_pet");

$(showPet).css("cursor", "pointer");

showPet.on("click", (e) => {
    console.log("showPet button clicked");
    $(".reg_form").addClass("reg_form_on");
});

$(hidePet).css("cursor", "pointer");

hidePet.on("click", (e) => {
    console.log("hidePet button clicked");
    $(".reg_form").removeClass("reg_form_on");
});
