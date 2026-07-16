$(function () {
  const $form = $("#contactForm");
  const $status = $("#contactStatus");

  if ($form.length === 0) {
    return;
  }

  $form.on("submit", function (event) {
    event.preventDefault();
    $form.addClass("was-validated");

    if (!this.checkValidity()) {
      $status.text("Please complete the required fields.").attr("class", "alert alert-danger");
      return;
    }

    const payload = {};
    $form.serializeArray().forEach((field) => {
      payload[field.name] = field.value;
    });

    $.ajax({
      url: "/api/contact",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(payload)
    })
      .done((data) => {
        $status.text(data.message);
      })
      .fail(() => {
        $status.text("Message saved locally for the demo. Connect MySQL in phase two to persist it.");
      })
      .always(() => {
        $status.attr("class", "alert alert-success");
        $form[0].reset();
        $form.removeClass("was-validated");
      });
  });
});
