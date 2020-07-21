const showPet = $("#show_pet");
const regForm = $(".reg_form");
const hidePet = $("#hide_pet");

showPet.on("click", (e) => {
    console.log("showPet button clicked");
    $(".reg_form").addClass("reg_form_on");
});

hidePet.on("click", (e) => {
    console.log("hidePet button clicked");
    $(".reg_form").removeClass("reg_form_on");
});
