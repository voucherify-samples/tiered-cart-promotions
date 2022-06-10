const cartSummary = document.getElementById("cart-summary");
const checkoutButton = document.getElementById("checkout-button");
const promotionHolder = document.getElementById("promotion-holder");
const voucherValue = document.getElementById("voucher-code");
const subtotal = document.getElementById("subtotal");
const allDiscountsSpan = document.getElementById("all-discounts");
const grandTotalSpan = document.getElementById("grand-total");
const progressTier = document.querySelector(".progress-tier");
const rewardBanner = document.querySelector(".reward-banner");
const progressBarNumbers = document.querySelectorAll(".progress-bar-numbers span");
const promotionsWrapper = document.querySelector(".promotions-holder");
const rewardIcons = document.querySelectorAll(".reward-titles p img");

let items = [
    {
        productName       : "Johan & Nystrom Caravan",
        productDescription: "20 oz bag",
        quantity          : 0,
        price             : "26.99",
        src               : "./images/johan2.jpeg",
    },
    {
        productName       : "Illy Arabica",
        productDescription: "Bestseller 18 oz bag",
        quantity          : 0,
        price             : "21.02",
        src               : "./images/illy_arabica.jpeg",
    },
    {
        productName       : "Hard Beans Etiopia",
        productDescription: "6 oz bag",
        quantity          : 0,
        price             : "3.88",
        src               : "./images/hardbean.jpeg",
    },
    {
        productName       : "Johan & Nystrom Bourbon",
        productDescription: "20 oz bag",
        quantity          : 0,
        price             : "41.98",
        src               : "./images/johan2.jpeg",
    },
];

let promotions = 0;
let grandTotal = 0;

const customer = {
    source_id: "test_customer_id_1"
};

const stackObject = {
    options: {
        "include_order"       : true,
        "extended_redemptions": true
    },
    order: {
        amount: null
    },
    customer   : customer,
    redeemables: [
        {
            object: "promotion_stack",
            id    : "stack_625PotU2hP22xrgNxMNDzp8P"
        }
    ]
};

const summaryInnerText = () => {
    cartSummary.innerHTML = `${items
        .map(
            (item, index) =>
                `<div class='item' key=${index}>
                      <img src='${item.src}' alt="product ${item.productName}"/>
                      <div class='name-and-description'>
                        <span>${item.productName}</span>
                        <span>${item.productDescription}</span>
                      </div>
                      <div class="form-and-button-holder">
                        <button class='decrement' id="decrementQuantity-${index}">-</button>
                        <form>
                        <input class='increment-input' type="number" value="${item.quantity}"/>
                        </form>
                        <button class='increment' id="incrementQuantity-${index}">+</button>
                      </div>
                      <span class="price">$${item.price}</span>
                      <button class="remove-button">Remove</button>
                     </div>`
        )
        .join("")}`;
};

cartSummary ? summaryInnerText() : "";

const quantityInputs = document.querySelectorAll(".increment-input");
const incrementButtons = document.querySelectorAll(".increment");
const decrementButtons = document.querySelectorAll(".decrement");

const incrementQuantity = () => {
    incrementButtons.forEach((button, index) => {
        button.addEventListener("click", () => {
            button.disabled = true;
            items[index].quantity = items[index].quantity + 1;
            quantityInputs[index].value = items[index].quantity;
            summaryPrices();
            voucherValue.value = "";
            grandTotalSpan.innerHTML = `$${(grandTotal + promotions).toFixed(2)}`;
            const orderAmount = grandTotalSpan.innerHTML.replace("$", " ");
            stackObject.order.amount = orderAmount * 100;
            stackPromotion(stackObject).then(response => {
                if (response.promotions.length === 0) {
                    return;
                }
                const filteredCampaigns = response.promotions.filter(item => item.campaign.id.includes("camp_jIPRv622D2MVbN77J1fkX66y")).sort((a, b) => { return a.hierarchy - b.hierarchy; });
                filteredCampaigns.forEach((item, index) => {
                    if (item?.valid) {
                        const hierarchy = filteredCampaigns[index].hierarchy;
                        const bannerText = filteredCampaigns[index].banner;
                        rewardBanner.innerHTML = `${bannerText}`;
                        incrementProgressTier(progressTier, hierarchy, 20);
                        const promotions = filteredCampaigns.reduce((sum, item) => {
                            sum += item.order.total_applied_discount_amount / 100;
                            return sum;
                        }, 0);
                        summedValuesToCheckout.discount = promotions;
                        promotionsWrapper.innerHTML = `<h4>Promotions:</h4> ${filteredCampaigns.map((item, index) => {
                            const promoTierObject = { id: item.id, name: item.name, discount: item.order.total_applied_discount_amount / 100, object: item.object };
                            summedValuesToCheckout.promoItems.push(promoTierObject);
                            return `<div class="promotion-holder" index=${index}><h5>${item.name}</h5><span>$${(item.order.total_applied_discount_amount / 100).toFixed(2)}</span></div>`;
                        }).join("")}`;
                        allDiscountsSpan.innerHTML = `-$${promotions.toFixed(2)}`;
                        grandTotal = addProductPrices(items) - promotions;
                        grandTotalSpan.innerHTML = `$${grandTotal.toFixed(2)}`;
                    }
                });
            }).catch(error => {
                promotionHolder.innerHTML = `<h5 id="error-message">${error.message}</h5>`;
            }).finally(() => {
                button.disabled = false;
            });
        });
    });
};
incrementQuantity();

const decrementQuantity = () => {
    decrementButtons.forEach((button, index) => {
        button.addEventListener("click", () => {
            if (items[index].quantity < 1) { return; }
            items[index].quantity = items[index].quantity - 1;
            quantityInputs[index].value = items[index].quantity;
            summaryPrices();
            voucherValue.value = "";
            grandTotalSpan.innerHTML = `$${(grandTotal + promotions).toFixed(2)}`;
            const orderAmount = grandTotalSpan.innerHTML.replace("$", " ");
            stackObject.order.amount = orderAmount * 100;
            stackPromotion(stackObject).then(response => {
                const filteredCampaigns = response.promotions.filter(item => item.campaign.id.includes("camp_jIPRv622D2MVbN77J1fkX66y")).sort((a, b) => { return a.hierarchy - b.hierarchy; });
                if (filteredCampaigns.length === 0) {
                    promotionsWrapper.innerHTML = "<h4>Promotions:</h4>";
                    allDiscountsSpan.innerHTML = "n/a";
                    decrementProgressTier(progressTier, 0, 40);
                    rewardBanner.innerHTML = "Spend $100 more to get FREE SHIPPING";
                    return;
                }
                filteredCampaigns.forEach((item, index) => {
                    if (item?.valid) {
                        const hierarchy = filteredCampaigns[index].hierarchy;
                        const bannerText = filteredCampaigns[index].banner;
                        rewardBanner.innerHTML = `${bannerText}`;
                        decrementProgressTier(progressTier, hierarchy, 20);
                        const promotions = filteredCampaigns.reduce((sum, item) => {
                            sum += item.order.total_applied_discount_amount / 100;
                            return sum;
                        }, 0);
                        summedValuesToCheckout.discount = promotions;
                        promotionsWrapper.innerHTML = `<h4>Promotions:</h4> ${filteredCampaigns.map((item, index) => {
                            const promoTierObject = { id: item.id, name: item.name, discount: item.order.total_applied_discount_amount / 100, object: item.object };
                            summedValuesToCheckout.promoItems.push(promoTierObject);
                            return `<div class="promotion-holder" index=${index}><h5>${item.name}</h5><span>$${(item.order.total_applied_discount_amount / 100).toFixed(2)}</span></div>`;
                        }).join("")}`;
                        allDiscountsSpan.innerHTML = `-$${promotions.toFixed(2)}`;
                        grandTotal = addProductPrices(items) - promotions;
                        grandTotalSpan.innerHTML = `$${grandTotal.toFixed(2)}`;
                    }
                });
            });
        });
    });
};
decrementQuantity();

const incrementProgressTier = (progressTier, hierarchy, width) => {
    progressBarNumbers.forEach(() => {
        const rect = progressBarNumbers[hierarchy].getBoundingClientRect();
        progressTier.style.width = `${((rect.left - width).toFixed(1))}px`;
        progressTier.style.transition = ".6s";
    });
    rewardIcons.forEach(() => {
        rewardIcons[hierarchy - 1].src="../images/reward-achieved.svg";
    });
};

const decrementProgressTier = (progressTier, hierarchy, width) => {
    progressBarNumbers.forEach(() => {
        const rect = progressBarNumbers[hierarchy].getBoundingClientRect();
        progressTier.style.width = `${((rect.left - width).toFixed(1))}px`;
        progressTier.style.transition = ".6s";
    });
    rewardIcons.forEach(() => {
        rewardIcons[hierarchy].src="../images/blocked-icon.svg";
    });
};

const addProductPrices = items => {
    return items
        .map(item => {
            return parseFloat(item.price) * parseInt(item.quantity);
        })
        .reduce((partialSum, a) => partialSum + a, 0)
        .toFixed(2);
};

const summedValuesToCheckout = {
    discount  : null,
    subtotal  : null,
    promoItems: []
};

const summaryPrices = () => {
    const summedUpPrices = addProductPrices(items);
    subtotal.innerHTML = `$${summedUpPrices}`;
    grandTotal = summedUpPrices - promotions;
    grandTotalSpan.innerHTML = `$${grandTotal.toFixed(2)}`;
};

const stackPromotion = async stackObject => {
    const response = await fetch("/stack-validate", {
        method : "POST",
        headers: {
            "Accept"      : "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ stackObject })
    });

    const data = await response.json();

    if (response.status === 200) {
        return data;
    }

    if (response.status === 400) {
        return Promise.reject(data);
    }

    if (response.status === 404) {
        return Promise.reject(data);
    }
};

if (checkoutButton) {
    checkoutButton.addEventListener("click", e => {
        if (subtotal.innerHTML.replace("$", "") === "0.00") {
            e.preventDefault();
            promotionHolder.innerHTML = "<h5 id=\"error-message\">Please add products to basket</h5>";
            return;
        } else {
            setTimeout(() => {
                productsToSessionStorage();
                window.location.href = "/checkout.html";
                voucherValue.value = "";
                grandTotalSpan.innerHTML = `$${(grandTotal + promotions).toFixed(2)}`;
            }, 1000);
        }
    });
}

const productsToSessionStorage = () => {
    summedValuesToCheckout.subtotal = parseInt(subtotal.innerHTML.replace("$", ""));
    const filtered = summedValuesToCheckout.promoItems.filter((item, index, array) => array.findIndex(t => t.id === item.id) === index);
    summedValuesToCheckout.promoItems = filtered;
    window.sessionStorage.setItem("values", JSON.stringify(summedValuesToCheckout));
    window.sessionStorage.setItem("products", JSON.stringify(items));
};

window.addEventListener("load", () => {
    window.sessionStorage.clear();
});
