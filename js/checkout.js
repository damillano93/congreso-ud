
var taxRate = 0.00;
var shipping = 0.00;
var grandTotal = 0.00
var jsonData = []
var WildRydes = window.WildRydes || {};
WildRydes.map = WildRydes.map || {};

$(function () {
  jsonData = [
    {
      title: "Item 1",
      price: 38,
      quantity: 0,
      total: 0
    },
    {
      title: "Item 2",
      price: 23.5,
      quantity: 0,
      total: 0
    },
    {
      title: "Item 3",
      price: 100,
      quantity: 0,
      total: 0
    },
    {
      title: "Item 4",
      price: 45,
      quantity: 0,
      total: 0
    },
    {
      title: "Item 5",
      price: 66,
      quantity: 0,
      total: 0
    },
    {
      title: "Item 6",
      price: 199,
      quantity: 0,
      total: 0
    }
  ];
  var html = "<tbody>";
  $.each(jsonData, function () {
    html +=
      '<tr class="cart-item">' +
      "        <td>" +
      '          <input type="checkbox" class="cart-item-check" checked />' +
      "        </td>" +
      '        <td title="'+ this.title +'">' +
      "          " +
      this.title +
      "        </td>" +
      "        <td>$" +
      this.price +
      "</td>" +
      "        <td>" +
      '          <input class="input is-primary cart-item-qty" style="width:100px" type="number" min="1" value="' +
      this.quantity +
      '" data-price="' +
      this.price +
      '">' +
      "        </td>" +
      '        <td class="cart-item-total">$' +
      this.total +
      "</td>" +
      "        <td>" +
      '          <a class="button is-small">Remove</a>' +
      "        </td>" +
      "      </tr>";
  });
  html += "</tbody>";
  $(".shopping-cart").append(html);

  recalculateCart();

  $(".cart-item-check").change(function () {
    recalculateCart();
  });

  $(".cart-item-qty").change(function () {
    var $this = $(this);
    var parent = $this.parent().parent();
    parent.find(".cart-item-check").prop("checked", "checked");
    var price = $this.attr("data-price");
    var quantity = $this.val();
    var total = price * quantity;
    parent.find(".cart-item-total").html(total.toFixed(2));
    recalculateCart();
  });

  $(".button").click(function () {
    var parent = $(this)
      .parent()
      .parent();
    parent.remove();
    recalculateCart();
  });
});

function saveResponse(paypalResponse) {
  let authToken = localStorage.getItem("token")
  $.ajax({
    method: 'POST',
    url: _config.api.invokeUrl + '/ride',
    headers: {
      Authorization: authToken
    },
    data: JSON.stringify({
      paypalResponse: paypalResponse,
      orderDetail: {
        shoppingCart: jsonData,
        total: grandTotal
      }
    }),
    contentType: 'application/json',
    success: completePayment(),
    error: function ajaxError(jqXHR, textStatus, errorThrown) {
      alert('An error occured when requesting your unicorn:\n' + jqXHR.responseText);
    }
  });

}

function completePayment(result) {
  window.location.href = "success.html";
}

function recalculateCart() {
  var subTotal = 0;
  var tax = 0;
  var items = $(".cart-item");
  $.each(items, function () {
    var itemCheck = $(this).find(".cart-item-check");
    var itemQuantity = $(this).find(".cart-item-qty");
    if (itemCheck.prop("checked")) {
      var itemTotal = itemQuantity.val() * itemQuantity.attr("data-price");
      subTotal += itemTotal;
    }
  });
  if (subTotal > 0) {
    tax = subTotal * taxRate;
    grandTotal = subTotal + tax + shipping;
    $(".totals,.checkout").show();
  } else {
    $(".totals,.checkout").hide();
  }
  $("#cart-subtotal").html(subTotal.toFixed(2));
  $("#cart-total").html(grandTotal.toFixed(2));
  $("#cart-tax").html(tax.toFixed(2));
  $("#cart-shipping").html(shipping.toFixed(2));
}

// Render the PayPal button into #paypal-button-container
paypal
  .Buttons({
    // Set up the transaction
    createOrder: function (data, actions) {
      return actions.order.create({
        purchase_units: [
          {
            amount: {
              value: grandTotal,
            },
          },
        ],
      });
    },

    // Finalize the transaction
    onApprove: function (data, actions) {
      return actions.order.capture().then(function (orderData) {
        saveResponse(orderData)
actions.redirect('success.html');
      });
    },
  })
  .render('#paypal-button-container');