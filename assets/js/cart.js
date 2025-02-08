(function() {
    const CART_KEY = 'cart';

    // Получаем корзину из LocalStorage (если она есть)
    function getCart() {
        const cart = localStorage.getItem(CART_KEY);
        return cart ? JSON.parse(cart) : [];
    }

    // Сохраняем корзину в LocalStorage
    function saveCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }

    // Функция для обновления счётчика корзины в шапке
    function updateCartCount() {
        let cart = getCart();
        let totalCount = 0;
        cart.forEach(item => {
            totalCount += item.quantity;
        });
        $('.cart-box a span').text(totalCount);
    }

    // Добавляем товар в корзину (вызывается, например, при клике на "Добавить в корзину")
    function addToCart(product) {
        let cart = getCart();
        let existingProduct = cart.find(item => item.id === product.id);
        if (existingProduct) {
            existingProduct.quantity += product.quantity;
        } else {
            cart.push(product);
        }
        saveCart(cart);
        updateCartCount();
        // Убираем alert (если он был):
        // alert('Товар добавлен в корзину!');
    }

    // Делаем функции доступными глобально (если потребуется использование вне этого файла)
    window.Cart = {
        getCart: getCart,
        addToCart: addToCart,
        updateCartCount: updateCartCount,
        saveCart: saveCart
    };

    // Обработчик клика для кнопок "Добавить в корзину" (на других страницах)
    $(document).ready(function() {
        updateCartCount();
        $('.btn-two').on('click', function(e) {
            e.preventDefault();
            var productId    = $(this).data('id');
            var productName  = $(this).data('name');
            var productPrice = $(this).data('price');
            var product = {
                id: productId,
                name: productName,
                price: productPrice,
                quantity: 1
            };
            addToCart(product);
        });
    });
})();

// Функция для отрисовки товаров в корзине на странице cart.html
function renderCartItems() {
    var cart = Cart.getCart();
    var $cartItems = $('#cart-items');
    $cartItems.empty(); // очищаем содержимое

    if (cart.length === 0) {
        $cartItems.html('<tr><td colspan="7">Ваша корзина пуста.</td></tr>');
        updateCartTotals();
        return;
    }

    cart.forEach(function(item) {
        // Вычисляем сумму за товар (цена * количество)
        var subtotal = parseFloat(item.price) * item.quantity;
        // Если у товара нет изображения, используем заглушку (либо оставьте пустым)
        var imageSrc = item.image ? item.image : 'assets/images/resource/shop/cart-placeholder.jpg';

        // Формируем HTML для строки корзины
        var row = `
        <tr>
            <td colspan="4" class="prod-column">
                <div class="column-box">
                    <div class="remove-btn" data-id="${item.id}">
                        <i class="fal fa-times"></i>
                    </div>
                    <div class="prod-thumb">
                        <img src="${imageSrc}" alt="">
                    </div>
                    <div class="prod-title">
                        ${item.name}
                    </div>
                </div>
            </td>
            <td class="price">$${parseFloat(item.price).toFixed(2)}</td>
            <td class="qty">
                <div class="item-quantity">
                    <input class="quantity-spinner" type="text" value="${item.quantity}" name="quantity" data-id="${item.id}">
                </div>
            </td>
            <td class="sub-total">$${subtotal.toFixed(2)}</td>
        </tr>
        `;
        $cartItems.append(row);
    });

    updateCartTotals();
}

// Функция для пересчёта итоговых сумм (subtotal и order total)
function updateCartTotals() {
    var cart = Cart.getCart();
    var total = 0;
    cart.forEach(function(item) {
        total += parseFloat(item.price) * item.quantity;
    });
    $('#cart-subtotal').text('$' + total.toFixed(2));
    $('#order-total').text('$' + total.toFixed(2));
}

// Вызываем отрисовку товаров после загрузки страницы cart.html
$(document).ready(function() {
    renderCartItems();
});

// Обработчик удаления товара (по клику на крестик)
$(document).on('click', '.remove-btn', function() {
    var productId = $(this).data('id');
    var cart = Cart.getCart();
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCartItems();
    Cart.updateCartCount();
});

// Обработчик кнопки "Update Cart" для обновления количества
$(document).on('click', '.update-btn button', function() {
    var cart = Cart.getCart();
    // Обновляем количество для каждого товара, основываясь на значении поля ввода
    $('.quantity-spinner').each(function() {
        var newQuantity = parseInt($(this).val());
        var prodId = $(this).data('id');
        cart.forEach(function(item) {
            if (item.id == prodId) {
                item.quantity = newQuantity;
            }
        });
    });
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCartItems();
    Cart.updateCartCount();
});
