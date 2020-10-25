const API =
  "https://raw.githubusercontent.com/GeekBrainsTutorial/online-store-api/master/responses";

/* let getRequest = (url, cb) => {
  let xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      if (xhr.status !== 200) {
        console.log('Error');
      } else {
        cb(xhr.responseText);
      }
    }
  };
  xhr.send();
}; */

function getRequest(url) {
  new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onload = () => resolve(xhr.responseText);
    xhr.onerror = () => reject(xhr.statusText);
    xhr.send();
    this.addProductInBascet();
  });
}

class ProductList {
  #goods;

  constructor(container = ".products") {
    this.container = container;
    this.#goods = [];
    this.allProducts = [];

    this.#getGoods().then((data) => {
      this.#goods = [...data];
      this.#render();
    });
  }

  #getGoods() {
    return fetch(`${API}/catalogData.json`)
      .then((response) => response.json())
      .catch((err) => console.log(err));
  }

  #render() {
    const block = document.querySelector(this.container);

    for (let product of this.#goods) {
      const productObject = new ProductItem(product);

      this.allProducts.push(productObject);

      block.insertAdjacentHTML("beforeend", productObject.getHTMLString());
    }
  }

  addProductInBascet() {
    return false;
  }
}

class ProductItem {
  constructor(product, img = "https://placehold.it/200x150") {
    this.productName = product.product_name;
    this.price = product.price;
    this.id = product.id_product;
    this.img = img;
  }
  getHTMLString() {
    return `<div class="product-item" data-id="${this.id}">
              <img src="${this.img}" alt="Some img">
              <div class="desc">
                  <h3>${this.productName}</h3>
                  <p>${this.price} \u20bd</p>
                  <button class="buy-btn" data-id =${this.id} data-name =${this.productName} data-price=${this.price} data-img=${this.img}>Купить</button>
              </div>
          </div>`;
  }
}

class BascetList {
  constructor() {
    this.bascetBoxXML = [];
    this.bascetBox = [];
    this.#getBascetGoods().then((data) => {
      this.bascetBoxXML = [...data];
      this.#render();
      this.sumPrice();
    });
    this.invisebleBascet();
    this.addProductInBascet();
    this.remove();
  }

  #getBascetGoods() {
    return fetch(`${API}/catalogData.json`)
      .then((response) => response.json())
      .catch((err) => console.log(err));
  }

  #render() {
    const bascet = document.querySelector(".renderBascet");
    for (let product of this.bascetBoxXML) {
      const bascetObject = new BascetItem(product);
      this.bascetBox.push(bascetObject);
      bascet.insertAdjacentHTML(
        "afterbegin",
        bascetObject.renderProductBascet()
      );
    }
  }
  //скрывает корзину
  invisebleBascet() {
    document
      .querySelector(".btn-cart")
      .addEventListener("click", () =>
        document.querySelector(".bascet").classList.toggle("bascetInvis")
      );
  }

  // метод добавления товаров в корзину
  // в качестве буффера использую массив this.bascetBox  и из него произвожу отрисовку разметки в корзину
  addProductInBascet() {
    document.querySelector(".products").addEventListener("click", (e) => {
      //ищу соответствующий  объект в массиве по id
      let product = this.bascetBox.find(
        (prod) => prod.id == e.target.dataset.id
      );
      if (product) {
        //если найден объект передаю в метод значение event
        this.repite(e);
      } else {
        let newProd = {
          id: e.target.dataset.id,
          name: e.target.dataset.name,
          price: e.target.dataset.price,
          quantity: 1,
          sumPrise: e.target.dataset.price,
        };
        this.bascetBox.push(newProd);
        this.newProdRender(newProd);
      }
      this.sumPrice();
    });
  }
  //при тесли повторяетс прод увеличевается колличество и сумма
  repite(e) {
    this.bascetBox.find((prod) => {
      if (prod.id == e.target.dataset.id) {
        prod.quantity++;
        prod.sumPrice = prod.quantity * prod.price;
        this.updateCart();
      }
    });
  }
  // метод удаления из корзины
  remove() {
    document.querySelector(".bascet").addEventListener("click", (e) => {
      let product = this.bascetBox.find(
        (prod) => prod.id == e.target.dataset.id
      );
      if (product) {
        this.repiteRemove(product);
      }
      this.sumPrice();
    });
  }

  repiteRemove(prod) {
    if (prod.quantity > 1) {
      prod.quantity--;
      prod.sumPrice = prod.quantity * prod.price;
    } else {
      this.bascetBox.splice(this.bascetBox.indexOf(prod), 1);
    }
    this.updateCart();
  }

  newProdRender(product) {
    let bascet = document.querySelector(".renderBascet");
    let bascetObject = new BascetNewItem(product).renderProductBascet(product);
    bascet.insertAdjacentHTML("afterbegin", bascetObject);
  }
  //очищает корзину и заново отрисовывает продукты в корзине
  //не понимаю почему не работает for ( of ), не передает объеты массива.
  updateCart() {
    document.querySelector(`.renderBascet`).innerHTML = "";
    this.bascetBox.forEach((product) => {
      let bascet = document.querySelector(".renderBascet");
      let productUpdateInBascet = new BascetNewItem(
        product
      ).renderProductBascet(product);
      bascet.insertAdjacentHTML("afterbegin", productUpdateInBascet);
    });
  }
  //считает общую сумму продуктов в корзине
  sumPrice() {
    let sum = this.bascetBox.reduce((sum, { sumPrice }) => sum + sumPrice, 0);
    document.querySelector(".finalPrice").querySelector("span").innerText = sum;
  }
}
class BascetItem {
  constructor(product, img = "https://placehold.it/50x50", quantity = 1) {
    this.img = img;
    this.id = product.id_product;
    this.name = product.product_name;
    this.price = product.price;
    this.quantity = quantity;
    this.sumPrice = product.price;
  }
  renderProductBascet() {
    return `<div class="bascetProduct data-id="${this.id}">
              <img src="${this.img}" alt="Prod img">
              <div class="productTitleInBascet">${this.name}</div>
              <div class="productPriceInBascet">${this.price} ₽</div>
              <div class="quantity">  ${this.quantity} </div>
              <div class="sumPrise"> ${this.sumPrice} ₽ </div>
              <button class = "btnRemove" data-id="${this.id}"> <i class="fas fa-minus-circle"></i></button>
           </div>`;
  }
}
class BascetNewItem {
  constructor(product, img = "https://placehold.it/50x50") {
    this.img = img;
    this.id = product.id;
    this.name = product.name;
    this.price = product.price;
    this.quantity = product.quantity;
    this.sumPrice = product.price;
  }
  renderProductBascet() {
    return `<div class="bascetProduct data-id="${this.id}">
              <img src="${this.img}" alt="Prod img">
              <div class="productTitleInBascet">${this.name}</div>
              <div class="productPriceInBascet">${this.price} ₽</div>
              <div class="quantity">  ${this.quantity} </div>
              <div class="sumPrise"> ${this.sumPrice} ₽</div>
              <button class = "btnRemove" data-id="${this.id}"> <i class="fas fa-minus-circle"></i></button>
           </div>`;
  }
}

new ProductList();
new BascetList();
