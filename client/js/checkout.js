window.addEventListener("load", () => {
    const summedProducts = document.querySelector(".summed-products");
    const discountValueSpan = document.querySelector(".discount-value span");
    const subtotalValueSpan = document.querySelector(".subtotal span");
    const allDiscountsValueSpan = document.querySelector(".all-discounts span");
    const shippingValueSpan = document.querySelector(".shipping span");
    const completeOrderButton = document.querySelector(".nav-buttons button");
    const couponsWrapper = document.querySelector(".coupons");

    document.getElementById("ephone").value = "voucherify@sample.io";
    document.getElementById("fullname").value = "Jack Smith";
    document.getElementById("company").value = "Voucherify";
    document.getElementById("adress").value = "Magic Street 10";
    document.getElementById("postal").value = "11-130";
    document.getElementById("city").value = "Warsaw";

    const customer = {
        "id": "test_customer_id_1"
    };

    const stackObject = {
        order: {
            amount: null
        },
        customer   : customer,
        redeemables: []
    };

    const innerSummedValues = (discountValueSpan, subtotalValueSpan, allDiscountsValueSpan, shippingValueSpan, couponsWrapper) => {
        const values = JSON.parse(sessionStorage.getItem("values") || "[]");
        couponsWrapper.innerHTML = `${values.promoItems.map((item, index) => {
            return `<h5 class="coupon" index=${index}">${item.name}&nbsp;<span class="coupon-value">(-$${item.discount})</span></h5>`;
        }).join("")}`;
        discountValueSpan.innerHTML = values.discount && `-$${(values.discount).toFixed(2)}`;
        allDiscountsValueSpan.innerHTML = values.discount ? `-$${(values.discount).toFixed(2)}` : "n/a";
        subtotalValueSpan.innerHTML = `$${values.subtotal}`;
        values.promoItems.map(item => {
            shippingValueSpan.innerHTML = `${item.id === "FREE SHIPPING" ? item.discount : shippingValueSpan.innerHTML}`;
        });
        const grandTotalValueSpan = document.querySelector(".grand-total span");
        grandTotalValueSpan.innerHTML = `$${(values.subtotal - values.discount + parseFloat(shippingValueSpan.innerHTML)).toFixed(2)}`;
        shippingValueSpan.innerHTML = "$" + shippingValueSpan.innerHTML;
    };

    const innerSummedProducts = summedProducts => {
        const products = JSON.parse(sessionStorage.getItem("products") || "[]");
        summedProducts.innerHTML = `${products.map((item, index) => {
            if (item.quantity === 0) {
                return;
            } else {
                return `<div class="each-product" key=${index}>
                    <img src="${item.src}" />
                    <div class="each-product-name">
                        <h6>${item.productName}</h6>
                        <p>Quantity ${item.quantity}</p>
                    </div>
                    <span>$${item.price}</span>
                </div>`;
            }
        }).join("")}`;
    };

    const values = JSON.parse(sessionStorage.getItem("values") || "[]");
    stackObject.order.amount = values.subtotal * 100;
    stackObject.redeemables = values.promoItems;

    innerSummedValues(discountValueSpan, subtotalValueSpan, allDiscountsValueSpan, shippingValueSpan, couponsWrapper);
    innerSummedProducts(summedProducts);


    const redeemCode = async stackObject => {
        const response = await fetch("/redeem-stackable", {
            method : "POST",
            headers: {
                //prettier-ignore
                "Accept"      : "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ stackObject }),
        });

        const data = await response.json();
        if (response.status === 200) {
            return data;
        }

        if (response.status === 404) {
            return Promise.reject(data);
        }

        if (response.status === 400) {
            return Promise.reject(data);
        }
    };

    completeOrderButton.addEventListener("click", e => {
        e.preventDefault();
        redeemCode(stackObject)
            .then(result => {
                if (result.status === "success") {
                    setTimeout(() => {
                        completeOrderButton.innerHTML = "Order completed";
                    }, 1000);
                }
            })
            .catch(error => {
                completeOrderButton.innerHTML = `<h5 style="font-size: 16px; text-align:center" id="error-message">${error.message}</h5>`;
            });
    });
});