(function () {
    const CART_KEY = 'cart';

    /**
     * Получить корзину из LocalStorage.
     * @returns {Array} Массив товаров.
     */
    function getCart() {
        const cartString = localStorage.getItem(CART_KEY);
        return cartString ? JSON.parse(cartString) : [];
    }

    /**
     * Сохранить корзину в LocalStorage.
     * @param {Array} cart - массив товаров
     */
    function saveCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }

    /**
     * Обновить счётчик товаров в шапке.
     */
    function updateCartCount() {
        const cart = getCart();
        let totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        $('.cart-box a span').text(totalCount);
    }

    /**
     * Добавить товар в корзину.
     * @param {Object} product - { id, name, price, quantity, image }
     */
    function addToCart(product) {
        let cart = getCart();
        let existingProduct = cart.find(item => item.id === product.id);

        if (existingProduct) {
            existingProduct.quantity += 1; // Увеличиваем количество
        } else {
            cart.push(product);
        }

        saveCart(cart);
        updateCartCount();
        renderCartItems();
    }

    /**
     * Очистить корзину (удаляет всё из LocalStorage).
     */
    function clearCart() {
        localStorage.removeItem(CART_KEY);
        renderCartItems();
        updateCartCount();
        updateCartTotals();
    }

    /**
     * Отрисовать товары из LocalStorage на странице cart.html.
     */
    function renderCartItems() {
        const cart = getCart();
        const $cartItems = $('.cart-table tbody'); // Используем класс cart-table
        $cartItems.empty();

        if (cart.length === 0) {
            $cartItems.html(`
                <tr>
                    <td colspan="7" class="prod-column">
                        <div class="column-box">
                            <div class="prod-title"><h2>Ваша корзина пуста.</h2></div>
                        </div>
                    </td>
                </tr>`);
            updateCartTotals();
            return;
        }

        cart.forEach(function (item) {
            if (!item.id || !item.name || !item.price || !item.quantity) return;

            let price = parseFloat(item.price) || 0;
            let quantity = item.quantity || 1;
            let imageSrc = item.image ? item.image : 'assets/images/resource/shop/cart-placeholder.jpg';
            let subTotal = price * quantity;

            let row = `
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
                <td class="price">${formatPrice(price)} сом</td>
                <td class="qty">
                    <div class="item-quantity">
                        <input class="quantity-spinner" type="text" value="${quantity}" name="quantity" data-id="${item.id}">
                    </div>
                </td>
                <td class="sub-total">${formatPrice(subTotal)} сом</td>
            </tr>`;
            $cartItems.append(row);
        });

        updateCartTotals();

    }

    /**
     * Обновить итоговые суммы (subtotal и order total).
     */
    function updateCartTotals() {
        const cart = getCart();
        let total = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

        $('.cart-total .list li:nth-child(1) span').text(formatPrice(total) + ' сом');
        $('.cart-total .list li:nth-child(2) span').text(formatPrice(total) + ' сом');
    }

    /**
     * Форматирование чисел (пример: 58 800.00 сом).
     */
    function formatPrice(price) {
        return new Intl.NumberFormat('ru-RU', {
            maximumFractionDigits: 0 // Убираем дробную часть
        }).format(price);
    }
    
    /**
     * Удалить товар (по клику на крестик).
     */
    $(document).on('click', '.remove-btn', function () {
        const productId = $(this).data('id');
        let cart = getCart().filter(item => item.id != productId);
        saveCart(cart);
        renderCartItems();
        updateCartCount();
    });

    /**
     * Обновить корзину на основе полей `quantity-spinner`.
     */
    $(document).on('input', '.quantity-spinner', function () {
        let newQuantity = parseInt($(this).val()) || 1;
        let prodId = $(this).data('id');

        let cart = getCart();
        let product = cart.find(item => item.id == prodId);
        if (product) {
            product.quantity = newQuantity;
        }
        saveCart(cart);

        let priceText = $(this).closest('tr').find('.price').text();
        let price = parseFloat(priceText.replace(/[^\d.]/g, '')) || 0;
        let subTotal = price * newQuantity;
        $(this).closest('tr').find('.sub-total').text(formatPrice(subTotal) + ' сом');

        updateCartTotals();
        updateCartCount();
    });

    /**
     * Кнопка "Обновить корзину"
     */
    $(document).on('click', '.update-cart', function () {
        let cart = getCart();
        let updatedCart = [];

        $('.quantity-spinner').each(function () {
            let newQuantity = parseInt($(this).val()) || 1;
            let prodId = $(this).data('id');

            let product = cart.find(item => item.id == prodId);
            if (product) {
                product.quantity = newQuantity;
                updatedCart.push(product);
            }
        });

        if (updatedCart.length === 0) return;

        saveCart(updatedCart);
        renderCartItems();
        updateCartCount();
    });

    /**
     * При загрузке страницы обновляем корзину и счётчик.
     */
    $(document).ready(function () {
        renderCartItems();
        updateCartCount();

        // Кнопка "Очистить корзину"
        $('.clear-cart').on('click', function () {
            clearCart();
        });

        // Добавление товара в корзину при клике на кнопку
        $(document).on('click', '.btn-two', function (e) {
            e.preventDefault();

            let productId = $(this).data('id');
            let productName = $(this).data('name');
            let productPrice = parseFloat($(this).data('price')) || 0;
            let productImage = $(this).data('image');

            if (!productId || !productName || !productPrice) {
                console.error("Ошибка: Некорректные данные товара.");
                return;
            }

            let product = {
                id: productId,
                name: productName,
                price: productPrice,
                quantity: 1,
                image: productImage
            };

            addToCart(product);
        });
    });

})();
